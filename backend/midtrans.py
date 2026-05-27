"""Midtrans Snap integration — REST API + webhook signature verification."""
import os
import base64
import hashlib
import httpx
from typing import Optional


def _is_production() -> bool:
    return os.environ.get("MIDTRANS_IS_PRODUCTION", "false").strip().lower() in ("1", "true", "yes")


def _snap_base_url() -> str:
    return "https://app.midtrans.com" if _is_production() else "https://app.sandbox.midtrans.com"


def _auth_header() -> str:
    server_key = os.environ.get("MIDTRANS_SERVER_KEY", "")
    raw = f"{server_key}:".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


# ---------- Pricing ----------
PACKAGE_PRICES = {
    "full": (55_000, "Full Buku Gubernur Konten (Bab 1-7, PDF+EPUB+Flipbook)"),
    "bab-2": (10_000, "Bab 2 — Sang Pionir: Dedi Mulyadi dan Kelahiran Genre"),
    "bab-3": (10_000, "Bab 3 — Gelombang Kedua: Tipologi Respons"),
    "bab-4": (10_000, "Bab 4 — Dakwaan: Tujuh Dakwaan terhadap Model Gubernur Konten"),
    "bab-5": (10_000, "Bab 5 — Pembelaan: Epistemologi Lokal dan Restorasi Otoritas"),
    "bab-6": (10_000, "Bab 6 — Sintesis: Hibriditas yang Mengganggu"),
    "bab-7": (10_000, "Bab 7 — Penutup: Setelah Panggung Ditutup"),
}


def price_for(paket: str) -> Optional[tuple]:
    return PACKAGE_PRICES.get(paket)


def is_valid_package(paket: str) -> bool:
    return paket in PACKAGE_PRICES


def _finish_url(order_id: str, email: str) -> str:
    """URL Midtrans redirect ke setelah pembayaran selesai (hosted payment page)."""
    import urllib.parse
    base = os.environ.get("FRONTEND_URL", "https://gubernur-konten.vercel.app").rstrip("/")
    params = urllib.parse.urlencode({"order_id": order_id, "email": email})
    return f"{base}/download?{params}"


def _notification_url() -> str:
    """URL backend untuk Midtrans mengirim webhook status pembayaran."""
    base = os.environ.get("RAILWAY_URL", "").rstrip("/")
    if not base:
        return ""
    return f"{base}/api/midtrans-webhook"


# ---------- Snap API ----------
async def create_snap_transaction(order_id: str, gross_amount: int, item_name: str,
                                   nama: str, email: str, whatsapp: str) -> dict:
    """Create a Snap transaction. Returns {token, redirect_url} on success.
    Raises RuntimeError on Midtrans error.
    """
    if not os.environ.get("MIDTRANS_SERVER_KEY"):
        raise RuntimeError("MIDTRANS_SERVER_KEY belum dikonfigurasi")

    payload = {
        "transaction_details": {"order_id": order_id, "gross_amount": gross_amount},
        "customer_details": {
            "first_name": nama,
            "email": email,
            "phone": whatsapp,
        },
        "item_details": [
            {"id": order_id, "price": gross_amount, "quantity": 1, "name": item_name[:50]}
        ],
        "credit_card": {"secure": True},
        "callbacks": {
            "finish": _finish_url(order_id, email),
        },
    }
    notif_url = _notification_url()
    if notif_url:
        payload["notification_url"] = notif_url
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": _auth_header(),
    }
    url = f"{_snap_base_url()}/snap/v1/transactions"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(url, json=payload, headers=headers)
    if r.status_code >= 400:
        raise RuntimeError(f"Midtrans error {r.status_code}: {r.text[:300]}")
    data = r.json()
    return {"token": data["token"], "redirect_url": data.get("redirect_url")}


# ---------- Webhook signature verification ----------
def verify_signature(order_id: str, status_code: str, gross_amount: str, signature_key: str) -> bool:
    """Per Midtrans docs: SHA512(order_id + status_code + gross_amount + server_key)."""
    server_key = os.environ.get("MIDTRANS_SERVER_KEY", "")
    if not server_key or not signature_key:
        return False
    raw = f"{order_id}{status_code}{gross_amount}{server_key}".encode("utf-8")
    expected = hashlib.sha512(raw).hexdigest()
    # constant-time compare
    if len(expected) != len(signature_key):
        return False
    return all(a == b for a, b in zip(expected, signature_key))


def map_status(transaction_status: str, fraud_status: Optional[str] = None) -> str:
    """Convert Midtrans transaction_status → our internal status."""
    t = (transaction_status or "").lower()
    f = (fraud_status or "").lower()
    if t in ("capture",):
        if f == "challenge":
            return "pending"
        return "success" if f == "accept" else "failure"
    if t in ("settlement",):
        return "success"
    if t in ("pending",):
        return "pending"
    if t in ("deny",):
        return "deny"
    if t in ("cancel", "expire"):
        return t
    if t in ("failure",):
        return "failure"
    return t or "unknown"
async def get_transaction_status(order_id: str) -> dict:
    """Cek status transaksi langsung ke Midtrans (bypass webhook)."""
    base = "https://api.midtrans.com" if _is_production() else "https://api.sandbox.midtrans.com"
    url = f"{base}/v2/{order_id}/status"
    headers = {"Authorization": _auth_header(), "Accept": "application/json"}
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, headers=headers)
    if r.status_code == 404:
        return {}
    if r.status_code >= 400:
        return {}
    return r.json()
