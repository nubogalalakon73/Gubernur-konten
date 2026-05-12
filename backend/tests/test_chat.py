"""
Backend tests for new /api/chat and /api/chat/sessions endpoints (Claude Sonnet 4.5 via emergentintegrations).
"""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"
TIMEOUT = 60  # LLM can be slow


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Chat ----------
class TestChat:
    def test_chat_bab4_summary(self, client):
        """Ringkas isi bab 4 dalam 3 poin — should mention dakwaan / monetisasi / 95,5% / sentralisasi."""
        r = client.post(
            f"{API}/chat",
            json={"message": "Ringkas isi bab 4 dalam 3 poin", "history": []},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert "session_id" in d and isinstance(d["session_id"], str) and len(d["session_id"]) > 0
        assert "response" in d and isinstance(d["response"], str) and len(d["response"]) > 30
        low = d["response"].lower()
        # Accept at least one of these Bab-4 markers (LLM non-deterministic)
        markers = ["dakwaan", "monetisasi", "kemiskinan", "95,5", "95.5", "sentralisasi", "populisme", "kebijakan tanpa kajian"]
        assert any(m in low for m in markers), f"No bab4 marker in: {d['response'][:300]}"

    def test_chat_session_context(self, client):
        """Two-turn conversation with same session_id — second should answer or politely deflect (context-aware)."""
        r1 = client.post(
            f"{API}/chat",
            json={"message": "Siapa penulis buku ini?", "history": []},
            timeout=TIMEOUT,
        )
        assert r1.status_code == 200
        d1 = r1.json()
        sid = d1["session_id"]
        resp1 = d1["response"]
        # authors should be mentioned
        low1 = resp1.lower()
        assert "didi" in low1 or "yully" in low1, f"Author not mentioned: {resp1[:300]}"

        history = [
            {"role": "user", "text": "Siapa penulis buku ini?"},
            {"role": "assistant", "text": resp1},
        ]
        r2 = client.post(
            f"{API}/chat",
            json={"session_id": sid, "message": "Usia mereka berapa?", "history": history},
            timeout=TIMEOUT,
        )
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["session_id"] == sid
        # Just check it responds coherently (non-empty, not crash). Accept deflection.
        assert len(d2["response"]) > 10

    def test_chat_empty_message(self, client):
        """Empty message: must NOT crash. Accept 200 or 4xx."""
        r = client.post(
            f"{API}/chat",
            json={"message": "", "history": []},
            timeout=TIMEOUT,
        )
        assert r.status_code in (200, 400, 422, 502), f"unexpected: {r.status_code} {r.text[:200]}"

    def test_chat_persists_mongo(self, client):
        """After /chat call, /chat/sessions should reflect the new session with count >= 2."""
        unique_msg = f"TEST_persist_{uuid.uuid4().hex[:8]} apa itu modal rasa?"
        r = client.post(
            f"{API}/chat",
            json={"message": unique_msg, "history": []},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        sid = r.json()["session_id"]

        # small wait for the insert_many to settle
        time.sleep(1.0)
        r2 = client.get(f"{API}/chat/sessions", timeout=30)
        assert r2.status_code == 200
        sessions = r2.json()
        assert isinstance(sessions, list)
        match = [s for s in sessions if s.get("session_id") == sid]
        assert match, f"session {sid} not found in /chat/sessions"
        s = match[0]
        assert s["count"] >= 2, f"expected >=2 messages, got {s['count']}"
        assert "last_message" in s
        assert "_id" not in s  # ensure mongo _id not leaking

    def test_chat_sessions_schema(self, client):
        """/api/chat/sessions returns list with expected keys."""
        r = client.get(f"{API}/chat/sessions", timeout=30)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        if items:
            it = items[0]
            for k in ("session_id", "last_message", "last_at", "count"):
                assert k in it, f"missing {k}"
            assert "_id" not in it
