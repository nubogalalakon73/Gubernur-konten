"""
Backend API regression tests for Gubernur Konten landing page.
Covers: health, stats, lead CRUD, CSV export, CTA tracking.
"""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend .env file
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def created_ids():
    return []


# -------- Health & stats --------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        assert "message" in data

    def test_stats(self, client):
        r = client.get(f"{API}/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("readers", "downloads", "rating", "leads", "cta_clicks"):
            assert k in d, f"missing {k}"
        assert isinstance(d["readers"], int)
        assert isinstance(d["downloads"], int)
        assert isinstance(d["leads"], int)
        assert isinstance(d["cta_clicks"], int)
        assert d["rating"] == 4.9


# -------- Leads CRUD --------
class TestLeads:
    def test_create_lead(self, client, created_ids):
        payload = {
            "name": f"TEST_User_{uuid.uuid4().hex[:6]}",
            "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
            "whatsapp": "08123456789",
            "profession": "Mahasiswa",
            "city": "Bandung",
            "interest": "PDF Only — Rp 79.000",
        }
        r = client.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d and isinstance(d["id"], str) and len(d["id"]) > 0
        assert "created_at" in d
        assert d["name"] == payload["name"]
        assert d["email"] == payload["email"]
        assert d["whatsapp"] == payload["whatsapp"]
        assert d["profession"] == payload["profession"]
        assert d["city"] == payload["city"]
        assert d["interest"] == payload["interest"]
        assert d.get("source") == "landing"
        created_ids.append(d["id"])

    def test_list_leads_persistence(self, client, created_ids):
        assert created_ids, "no lead created"
        r = client.get(f"{API}/leads")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        ids = [i.get("id") for i in items]
        assert created_ids[0] in ids
        # ensure no Mongo _id leak
        for it in items:
            assert "_id" not in it

    def test_export_csv(self, client, created_ids):
        r = client.get(f"{API}/leads/export.csv")
        assert r.status_code == 200
        ct = r.headers.get("content-type", "")
        assert "text/csv" in ct
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd and ".csv" in cd
        body = r.text
        first = body.splitlines()[0]
        for col in ["id", "name", "email", "whatsapp", "profession", "city", "interest", "source", "created_at"]:
            assert col in first
        # the created lead id should appear in rows
        assert created_ids[0] in body

    def test_delete_lead(self, client, created_ids):
        lid = created_ids[0]
        r = client.delete(f"{API}/leads/{lid}")
        assert r.status_code == 200
        d = r.json()
        assert d.get("deleted") is True
        assert d.get("id") == lid
        # verify removed
        r2 = client.get(f"{API}/leads")
        ids = [i.get("id") for i in r2.json()]
        assert lid not in ids

    def test_delete_nonexistent_lead(self, client):
        r = client.delete(f"{API}/leads/does-not-exist-{uuid.uuid4().hex}")
        assert r.status_code == 404


# -------- CTA tracking --------
class TestCta:
    def test_track_cta(self, client):
        payload = {"label": "TEST_cta_label", "section": "test"}
        r = client.post(f"{API}/cta", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d.get("label") == payload["label"]
        assert d.get("section") == payload["section"]
        assert "id" in d and "created_at" in d

    def test_stats_reflects_cta_increment(self, client):
        before = client.get(f"{API}/stats").json()["cta_clicks"]
        client.post(f"{API}/cta", json={"label": "TEST_inc", "section": "test"})
        after = client.get(f"{API}/stats").json()["cta_clicks"]
        assert after >= before + 1
