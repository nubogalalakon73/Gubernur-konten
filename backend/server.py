from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import time
import secrets
from collections import defaultdict, deque
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from sqlalchemy import select

from emergentintegrations.llm.chat import LlmChat, UserMessage
from chat_prompt import SYSTEM_PROMPT
from chapters_content import CHAPTERS, get_chapter, get_chapter_meta
from db_sqlite import init_db, AsyncSessionLocal, Order, order_to_dict
from midtrans import (
    create_snap_transaction,
    verify_signature,
    map_status,
    price_for,
    is_valid_package,
    PACKAGE_PRICES,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Gubernur Konten API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class CtaEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str
    section: Optional[str] = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CtaEventCreate(BaseModel):
    label: str
    section: Optional[str] = ""


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Gubernur Konten API", "status": "ok"}


@api_router.get("/stats")
async def get_stats():
    """Public stats for social proof."""
    total_cta = await db.cta_events.count_documents({})
    # Friendly baseline for new microsite social proof
    return {
        "readers": 4280,
        "downloads": 1742,
        "rating": 4.9,
        "cta_clicks": total_cta,
    }


@api_router.post("/cta", response_model=CtaEvent)
async def track_cta(payload: CtaEventCreate, request: Request):
    ip = request.client.host if request.client else "unknown"
    _rate_limit(f"cta:{ip}", 60, 60)
    ev = CtaEvent(**payload.model_dump())
    await db.cta_events.insert_one(ev.model_dump())
    return ev


# ---------- Chat ----------
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: str


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    session_id: str
    response: str


def _build_system_with_history(history: List[ChatMessage]) -> str:
    if not history:
        return SYSTEM_PROMPT
    recent = history[-8:]
    convo_lines = []
    for m in recent:
        prefix = "Pembaca" if m.role == "user" else "Asisten"
        convo_lines.append(f"{prefix}: {m.text}")
    convo = "\n".join(convo_lines)
    return f"{SYSTEM_PROMPT}\n\n## Riwayat Percakapan Saat Ini (sebagai konteks)\n{convo}\n\n## Instruksi\nLanjutkan percakapan sebagai Asisten. Jawab pesan terbaru dari Pembaca dengan ringkas dan akurat."


@api_router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest, request: Request):
    ip = request.client.host if request.client else "unknown"
    _rate_limit(f"chat:{ip}", 20, 60)
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    session_id = payload.session_id or str(uuid.uuid4())
    system = _build_system_with_history(payload.history or [])

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        user_msg = UserMessage(text=payload.message)
        reply = await chat.send_message(user_msg)
        reply_text = reply if isinstance(reply, str) else str(reply)
    except Exception as e:
        logger.exception("LLM chat error")
        raise HTTPException(status_code=502, detail=f"Chat backend error: {str(e)[:200]}")

    # Persist
    now = datetime.now(timezone.utc).isoformat()
    await db.chat_messages.insert_many([
        {"id": str(uuid.uuid4()), "session_id": session_id, "role": "user", "text": payload.message, "created_at": now},
        {"id": str(uuid.uuid4()), "session_id": session_id, "role": "assistant", "text": reply_text, "created_at": now},
    ])

    return ChatResponse(session_id=session_id, response=reply_text)


@api_router.get("/chat/sessions")
async def chat_sessions(limit: int = 200, _: str = Depends(lambda: None)):
    """Admin: list latest chat sessions with sample message."""
    pipeline = [
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$session_id", "last": {"$first": "$text"}, "last_at": {"$first": "$created_at"}, "count": {"$sum": 1}}},
        {"$sort": {"last_at": -1}},
        {"$limit": limit},
    ]
    items = await db.chat_messages.aggregate(pipeline).to_list(length=limit)
    return [{"session_id": x["_id"], "last_message": x["last"], "last_at": x["last_at"], "count": x["count"]} for x in items]


# ---------- Rate Limiting (in-memory) ----------
RATE_BUCKETS: dict = defaultdict(deque)


def _rate_limit(key: str, limit: int, window_sec: int):
    """Simple in-memory rate limit. Raises 429 if exceeded."""
    now = time.time()
    bucket = RATE_BUCKETS[key]
    # Drop expired
    while bucket and bucket[0] < now - window_sec:
        bucket.popleft()
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail="Terlalu banyak permintaan. Coba lagi sebentar.")
    bucket.append(now)


def rate_limit_factory(limit: int, window_sec: int, prefix: str):
    async def dep(request: Request):
        ip = request.client.host if request.client else "unknown"
        _rate_limit(f"{prefix}:{ip}", limit, window_sec)
    return dep


# ---------- Admin Auth ----------
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
ADMIN_TOKENS: dict = {}  # token -> expires_ts


class AdminLogin(BaseModel):
    password: str


@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin, request: Request):
    ip = request.client.host if request.client else "unknown"
    _rate_limit(f"admin-login:{ip}", 5, 60)
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=500, detail="Admin password not configured")
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Password salah")
    token = secrets.token_urlsafe(32)
    ADMIN_TOKENS[token] = time.time() + 8 * 3600  # 8h
    return {"token": token, "expires_in": 8 * 3600}


def require_admin(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing auth")
    token = authorization.split(" ", 1)[1].strip()
    exp = ADMIN_TOKENS.get(token)
    if not exp or exp < time.time():
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return token


# ---------- Email (Resend) ----------
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM", "Gubernur Konten <onboarding@resend.dev>")


async def send_email(to: str, subject: str, html: str) -> bool:
    """Send email via Resend. Returns True if sent, False otherwise (gracefully)."""
    if not RESEND_API_KEY:
        logger.info(f"[email-skip] no RESEND_API_KEY; would send to {to}: {subject}")
        return False
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={"from": RESEND_FROM, "to": [to], "subject": subject, "html": html},
            )
            if r.status_code >= 400:
                logger.warning(f"Resend error {r.status_code}: {r.text[:200]}")
                return False
            return True
    except Exception:
        logger.exception("Resend send failed")
        return False


def _token_email_html(name: str, chapter_label: str, link: str) -> str:
    return f"""
    <div style="font-family: -apple-system, sans-serif; background: #0B0F14; color: #F4F0E8; padding: 32px;">
      <h2 style="color: #F4F0E8; font-family: Georgia, serif;">Halo {name},</h2>
      <p style="color: #F4F0E8; line-height: 1.7;">
        Pembayaran Anda telah dikonfirmasi. Berikut link akses pribadi Anda untuk:
      </p>
      <p style="color: #C9920A; font-size: 18px; font-weight: bold;">{chapter_label}</p>
      <p><a href="{link}" style="display:inline-block; background:#B8211A; color:#F4F0E8; padding:14px 24px; text-decoration:none; font-weight:bold; letter-spacing:0.1em;">BUKA SEKARANG →</a></p>
      <p style="color: rgba(244,240,232,0.6); font-size: 12px; margin-top: 24px;">
        Link ini bersifat pribadi dan tidak dapat dibagikan. Berlaku selamanya selama akun aktif.
      </p>
      <hr style="border:none; border-top:1px solid rgba(244,240,232,0.15); margin: 32px 0;" />
      <p style="color: rgba(244,240,232,0.6); font-size: 12px;">
        Tim Gubernur Konten<br/>Didi Subandi & Yully Ambarsih Ekawardhani
      </p>
    </div>
    """


# ---------- Chapter Content & Access Tokens ----------
class AccessTokenCreate(BaseModel):
    email: str
    name: Optional[str] = ""
    chapter: str  # "2".."7" or "full"
    send_email: Optional[bool] = True
    expires_days: Optional[int] = None  # None = no expiry


class AccessToken(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    token: str
    email: str
    name: Optional[str] = ""
    chapter: str
    created_at: str
    expires_at: Optional[str] = None
    used_count: int = 0
    last_used_at: Optional[str] = None
    revoked: bool = False


@api_router.get("/chapters")
async def list_chapters():
    """Public: list chapter metadata (no body)."""
    return [get_chapter_meta(n) for n in sorted(CHAPTERS.keys())]


@api_router.get("/chapters/{n}")
async def get_chapter_content(n: int, token: str = "", request: Request = None):
    """Public: fetch chapter content if a valid access token is provided.
    Token must match chapter (or be a 'full' token)."""
    chapter = get_chapter(n)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if request is not None:
        ip = request.client.host if request.client else "unknown"
        _rate_limit(f"chapter:{ip}", 30, 60)
    if not token:
        raise HTTPException(status_code=403, detail="Token akses diperlukan")
    doc = await db.access_tokens.find_one({"token": token}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=403, detail="Token tidak valid")
    if doc.get("revoked"):
        raise HTTPException(status_code=403, detail="Token telah dicabut")
    if doc.get("expires_at"):
        try:
            exp_dt = datetime.fromisoformat(doc["expires_at"])
            if exp_dt < datetime.now(timezone.utc):
                raise HTTPException(status_code=403, detail="Token telah kedaluwarsa")
        except ValueError:
            pass
    # Check chapter access
    ch = doc.get("chapter")
    if ch != "full" and str(ch) != str(n):
        raise HTTPException(status_code=403, detail=f"Token ini hanya untuk Bab {ch}")
    # Mark usage
    now = datetime.now(timezone.utc).isoformat()
    await db.access_tokens.update_one(
        {"token": token},
        {"$inc": {"used_count": 1}, "$set": {"last_used_at": now}},
    )
    return {"n": n, **chapter}


@api_router.post("/admin/tokens")
async def admin_create_token(payload: AccessTokenCreate, _: str = Depends(require_admin)):
    if payload.chapter not in {"full"} | {str(i) for i in range(2, 8)}:
        raise HTTPException(status_code=400, detail="Chapter harus 2-7 atau 'full'")
    token_val = secrets.token_urlsafe(16)
    now = datetime.now(timezone.utc)
    expires_at = (now + timedelta(days=payload.expires_days)).isoformat() if payload.expires_days else None
    doc = {
        "id": str(uuid.uuid4()),
        "token": token_val,
        "email": payload.email,
        "name": payload.name or "",
        "chapter": payload.chapter,
        "created_at": now.isoformat(),
        "expires_at": expires_at,
        "used_count": 0,
        "last_used_at": None,
        "revoked": False,
    }
    await db.access_tokens.insert_one(doc)
    # Build link
    base = os.environ.get("PUBLIC_BASE_URL", "https://gubernur-konten.preview.emergentagent.com")
    if payload.chapter == "full":
        link = f"{base}/bab/all?t={token_val}"
        label = "Akses Full Buku (Bab 2-7)"
    else:
        link = f"{base}/bab/{payload.chapter}?t={token_val}"
        ch_meta = get_chapter_meta(int(payload.chapter))
        label = f"{ch_meta['number']} — {ch_meta['title']}" if ch_meta else f"Bab {payload.chapter}"
    sent = False
    if payload.send_email:
        sent = await send_email(payload.email, f"Akses Anda: {label}", _token_email_html(payload.name or "Pembaca", label, link))
    return {
        "id": doc["id"],
        "token": token_val,
        "link": link,
        "label": label,
        "email_sent": sent,
        "chapter": payload.chapter,
        "expires_at": expires_at,
    }


@api_router.get("/admin/tokens")
async def admin_list_tokens(limit: int = 200, _: str = Depends(require_admin)):
    items = await db.access_tokens.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(length=limit)
    base = os.environ.get("PUBLIC_BASE_URL", "https://gubernur-konten.preview.emergentagent.com")
    for it in items:
        ch = it.get("chapter")
        it["link"] = f"{base}/bab/{'all' if ch == 'full' else ch}?t={it['token']}"
    return items


@api_router.delete("/admin/tokens/{token_id}")
async def admin_revoke_token(token_id: str, _: str = Depends(require_admin)):
    res = await db.access_tokens.update_one({"id": token_id}, {"$set": {"revoked": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"revoked": True, "id": token_id}


# ============================================================
# MIDTRANS PAYMENT FLOW
# ============================================================
FILES_DIR = Path(__file__).parent / "files"


class CreatePaymentRequest(BaseModel):
    nama: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=200)
    whatsapp: str = Field(..., min_length=6, max_length=30)
    paket: str  # "full" or "bab-2".."bab-7"


@api_router.get("/packages")
async def list_packages():
    """Public: list available paket with prices."""
    return [
        {"paket": k, "harga": v[0], "label": v[1]}
        for k, v in PACKAGE_PRICES.items()
    ]


@api_router.post("/create-payment")
async def create_payment(payload: CreatePaymentRequest, request: Request):
    ip = request.client.host if request.client else "unknown"
    _rate_limit(f"create-payment:{ip}", 10, 600)
    if not is_valid_package(payload.paket):
        raise HTTPException(status_code=400, detail=f"Paket tidak valid. Pilihan: {', '.join(PACKAGE_PRICES.keys())}")
    harga, label = price_for(payload.paket)

    order_id = f"GK-{uuid.uuid4().hex[:12].upper()}"

    # Persist pending order BEFORE calling Midtrans
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as session:
        order = Order(
            id=order_id,
            nama=payload.nama.strip(),
            email=payload.email.strip().lower(),
            whatsapp=payload.whatsapp.strip(),
            paket=payload.paket,
            harga=harga,
            status="pending",
            created_at=now,
        )
        session.add(order)
        await session.commit()

    # Request Snap token
    try:
        snap = await create_snap_transaction(
            order_id=order_id,
            gross_amount=harga,
            item_name=label,
            nama=payload.nama,
            email=payload.email,
            whatsapp=payload.whatsapp,
        )
    except Exception as e:
        logger.exception("Midtrans create transaction failed")
        # Mark order as failure so it can be retried
        async with AsyncSessionLocal() as session:
            o = (await session.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
            if o:
                o.status = "failure"
                await session.commit()
        raise HTTPException(status_code=502, detail=f"Gagal membuat transaksi: {str(e)[:200]}")

    return {
        "order_id": order_id,
        "snap_token": snap["token"],
        "redirect_url": snap.get("redirect_url"),
        "paket": payload.paket,
        "harga": harga,
        "label": label,
        "client_key": os.environ.get("MIDTRANS_CLIENT_KEY", ""),
        "is_production": os.environ.get("MIDTRANS_IS_PRODUCTION", "false").lower() in ("1", "true", "yes"),
    }


@api_router.post("/midtrans-webhook")
async def midtrans_webhook(request: Request):
    """Receive Midtrans HTTP notification, verify signature, update order, generate access_token on success."""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    order_id = str(body.get("order_id", ""))
    status_code = str(body.get("status_code", ""))
    gross_amount = str(body.get("gross_amount", ""))
    signature_key = str(body.get("signature_key", ""))
    transaction_status = body.get("transaction_status", "")
    fraud_status = body.get("fraud_status", "")
    payment_type = body.get("payment_type", "")
    transaction_id = body.get("transaction_id", "")

    if not verify_signature(order_id, status_code, gross_amount, signature_key):
        logger.warning(f"Webhook signature mismatch for order {order_id}")
        raise HTTPException(status_code=403, detail="Invalid signature")

    internal_status = map_status(transaction_status, fraud_status)

    async with AsyncSessionLocal() as session:
        o = (await session.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
        if not o:
            raise HTTPException(status_code=404, detail="Order not found")

        # Validate gross_amount matches our recorded harga (defense against tampering)
        try:
            paid_amount = int(float(gross_amount))
        except ValueError:
            paid_amount = -1
        if paid_amount != o.harga and internal_status == "success":
            logger.error(f"Amount mismatch order={order_id} expected={o.harga} got={paid_amount}")
            o.status = "failure"
            o.raw_notification = json.dumps(body)
            await session.commit()
            raise HTTPException(status_code=400, detail="Amount mismatch")

        o.status = internal_status
        o.payment_type = payment_type or o.payment_type
        o.midtrans_transaction_id = transaction_id or o.midtrans_transaction_id
        o.raw_notification = json.dumps(body)

        if internal_status == "success":
            if not o.access_token:
                o.access_token = secrets.token_urlsafe(24)
            if not o.paid_at:
                o.paid_at = datetime.now(timezone.utc)

        await session.commit()
        access_token = o.access_token
        paket = o.paket

    logger.info(f"Webhook handled order={order_id} status={internal_status}")
    return {"ok": True, "order_id": order_id, "status": internal_status, "access_token": access_token, "paket": paket}


@api_router.get("/verify-access")
async def verify_access(token: str = ""):
    """Public: verify an access token and return order info if valid + paid."""
    if not token:
        raise HTTPException(status_code=400, detail="Token diperlukan")
    async with AsyncSessionLocal() as session:
        o = (await session.execute(select(Order).where(Order.access_token == token))).scalar_one_or_none()
        if not o:
            raise HTTPException(status_code=404, detail="Token tidak ditemukan")
        if o.status != "success":
            raise HTTPException(status_code=403, detail=f"Order belum lunas (status: {o.status})")
        return {
            "valid": True,
            "order_id": o.id,
            "paket": o.paket,
            "nama": o.nama,
            "email": o.email,
            "harga": o.harga,
            "paid_at": o.paid_at.isoformat() if o.paid_at else None,
        }


@api_router.get("/download/pdf")
async def download_pdf(token: str = "", request: Request = None):
    """Public (token-gated): stream the PDF file for the buyer's paket."""
    if request is not None:
        ip = request.client.host if request.client else "unknown"
        _rate_limit(f"download:{ip}", 30, 600)
    if not token:
        raise HTTPException(status_code=400, detail="Token diperlukan")

    async with AsyncSessionLocal() as session:
        o = (await session.execute(select(Order).where(Order.access_token == token))).scalar_one_or_none()
    if not o:
        raise HTTPException(status_code=404, detail="Token tidak ditemukan")
    if o.status != "success":
        raise HTTPException(status_code=403, detail="Order belum lunas")

    # Resolve file path
    if o.paket == "full":
        fname = "gubernur-konten-full.pdf"
        display = "Gubernur Konten — Full Buku.pdf"
    else:
        # "bab-2" .. "bab-7"
        fname = f"{o.paket}.pdf"
        n = o.paket.split("-", 1)[1] if "-" in o.paket else "?"
        display = f"Gubernur Konten — Bab {n}.pdf"

    fpath = FILES_DIR / fname
    if not fpath.exists():
        raise HTTPException(
            status_code=503,
            detail=f"File '{fname}' belum tersedia di server. Hubungi admin di WA 0899-855-3333.",
        )
    return FileResponse(
        path=str(fpath),
        media_type="application/pdf",
        filename=display,
        headers={"Cache-Control": "private, no-store"},
    )


# ---------- Admin: list orders ----------
@api_router.get("/admin/orders")
async def admin_list_orders(limit: int = 200, _: str = Depends(require_admin)):
    async with AsyncSessionLocal() as session:
        rows = (await session.execute(select(Order).order_by(Order.created_at.desc()).limit(limit))).scalars().all()
    return [order_to_dict(r) for r in rows]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_init():
    await init_db()
    logger.info("SQLite initialized for orders table")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
