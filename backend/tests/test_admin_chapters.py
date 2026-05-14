"""Tests for admin auth, chapter access tokens, gated chapter content, leads regression."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gubernur-konten.preview.emergentagent.com").rstrip("/")
ADMIN_PASSWORD = "gubernur2026"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "expires_in" in data
    return data["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Admin Login ----------
class TestAdminLogin:
    def test_login_correct(self):
        r = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data.get("token"), str) and len(data["token"]) > 10
        assert data.get("expires_in") == 8 * 3600

    def test_login_wrong(self):
        r = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong-xyz"}, timeout=15)
        assert r.status_code == 401
        assert "Password salah" in r.text


# ---------- Chapters Listing & Gated Access ----------
class TestChapters:
    def test_list_chapters(self):
        r = requests.get(f"{BASE_URL}/api/chapters", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) == 6
        # No body sections; only metadata
        for it in items:
            assert "title" in it and "number" in it
            assert "sections" not in it
            assert "_id" not in it

    def test_chapter_2_without_token_forbidden(self):
        r = requests.get(f"{BASE_URL}/api/chapters/2", timeout=15)
        assert r.status_code == 403
        assert "Token akses diperlukan" in r.text


# ---------- Token Generation (requires admin auth) ----------
class TestAdminTokens:
    def test_create_token_unauth(self):
        r = requests.post(f"{BASE_URL}/api/admin/tokens", json={"email": "x@y.com", "chapter": "2"}, timeout=15)
        assert r.status_code == 401

    def test_create_token_ch2(self, admin_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/tokens",
            headers=admin_headers,
            json={"email": "TEST_buyer@example.com", "name": "Test Buyer", "chapter": "2", "send_email": True},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["chapter"] == "2"
        assert data["email_sent"] is False  # RESEND_API_KEY empty
        assert data["token"] and data["link"]
        assert "/bab/2?t=" in data["link"]
        pytest.token_ch2 = data["token"]
        pytest.token_ch2_id = data["id"]

    def test_create_token_invalid_chapter(self, admin_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/tokens",
            headers=admin_headers,
            json={"email": "TEST_x@example.com", "chapter": "9"},
            timeout=15,
        )
        assert r.status_code == 400

    def test_chapter_2_with_valid_token(self, admin_headers):
        token = pytest.token_ch2
        r = requests.get(f"{BASE_URL}/api/chapters/2?token={token}", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["title"].startswith("Sang Pionir")
        assert isinstance(data["sections"], list) and len(data["sections"]) > 0
        sec = data["sections"][0]
        assert "h" in sec and "p" in sec

    def test_chapter_3_with_ch2_token(self):
        token = pytest.token_ch2
        r = requests.get(f"{BASE_URL}/api/chapters/3?token={token}", timeout=15)
        assert r.status_code == 403
        assert "Token ini hanya untuk Bab 2" in r.text

    def test_create_full_token_unlocks_any(self, admin_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/tokens",
            headers=admin_headers,
            json={"email": "TEST_full@example.com", "chapter": "full"},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["chapter"] == "full"
        assert "/bab/all?t=" in data["link"]
        full_token = data["token"]
        # Access chapter 5
        r2 = requests.get(f"{BASE_URL}/api/chapters/5?token={full_token}", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["title"]

    def test_list_tokens_includes_links(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/tokens", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 2
        for it in items:
            assert "link" in it and "token" in it
            assert "_id" not in it

    def test_revoke_token(self, admin_headers):
        tid = pytest.token_ch2_id
        r = requests.delete(f"{BASE_URL}/api/admin/tokens/{tid}", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["revoked"] is True
        # Now token should be unusable
        r2 = requests.get(f"{BASE_URL}/api/chapters/2?token={pytest.token_ch2}", timeout=15)
        assert r2.status_code == 403
        assert "dicabut" in r2.text.lower()

        # Confirm still listed with revoked:true
        r3 = requests.get(f"{BASE_URL}/api/admin/tokens", headers=admin_headers, timeout=15)
        assert r3.status_code == 200
        found = [x for x in r3.json() if x.get("id") == tid]
        assert found and found[0]["revoked"] is True


# ---------- Rate-limit tests (run LAST per instructions) ----------
class TestRateLimitsZ:
    def test_admin_login_rate_limit(self):
        """6 wrong attempts within 60s → 429 on 6th."""
        last = None
        for _ in range(6):
            last = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "WRONG"}, timeout=10)
        assert last.status_code == 429, f"expected 429 got {last.status_code}: {last.text}"
