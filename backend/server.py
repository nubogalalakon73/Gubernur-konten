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
from typing import List, Optional
import uuid
from datetime import datetime, timezone


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
