from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import io
import csv
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage
from chat_prompt import SYSTEM_PROMPT


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Gubernur Konten API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    whatsapp: str
    profession: Optional[str] = ""
    city: Optional[str] = ""
    interest: Optional[str] = ""
    source: Optional[str] = "landing"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LeadCreate(BaseModel):
    name: str
    email: str
    whatsapp: str
    profession: Optional[str] = ""
    city: Optional[str] = ""
    interest: Optional[str] = ""
    source: Optional[str] = "landing"


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
    total_leads = await db.leads.count_documents({})
    total_cta = await db.cta_events.count_documents({})
    # Friendly baseline for new microsite social proof
    return {
        "readers": 4280 + total_leads,
        "downloads": 1742 + total_leads,
        "rating": 4.9,
        "leads": total_leads,
        "cta_clicks": total_cta,
    }


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    # Basic dedupe by email within last day not enforced; allow re-submit but track
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    logger.info(f"New lead captured: {lead.email}")
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(limit: int = 500):
    cursor = db.leads.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    return items


@api_router.get("/leads/export.csv")
async def export_leads_csv():
    cursor = db.leads.find({}, {"_id": 0}).sort("created_at", -1)
    rows = await cursor.to_list(length=10000)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["id", "name", "email", "whatsapp", "profession", "city", "interest", "source", "created_at"])
    for r in rows:
        writer.writerow([
            r.get("id", ""),
            r.get("name", ""),
            r.get("email", ""),
            r.get("whatsapp", ""),
            r.get("profession", ""),
            r.get("city", ""),
            r.get("interest", ""),
            r.get("source", ""),
            r.get("created_at", ""),
        ])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=gubernur-konten-leads.csv"},
    )


@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str):
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"deleted": True, "id": lead_id}


@api_router.post("/cta", response_model=CtaEvent)
async def track_cta(payload: CtaEventCreate):
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
async def chat_endpoint(payload: ChatRequest):
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
async def chat_sessions(limit: int = 200):
    """Admin: list latest chat sessions with sample message."""
    pipeline = [
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$session_id", "last": {"$first": "$text"}, "last_at": {"$first": "$created_at"}, "count": {"$sum": 1}}},
        {"$sort": {"last_at": -1}},
        {"$limit": limit},
    ]
    items = await db.chat_messages.aggregate(pipeline).to_list(length=limit)
    return [{"session_id": x["_id"], "last_message": x["last"], "last_at": x["last_at"], "count": x["count"]} for x in items]


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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
