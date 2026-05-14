"""SQLite database setup for orders (Midtrans transactions).
Kept separate from MongoDB (which still handles chat/admin tokens).
"""
import os
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

ROOT = Path(__file__).parent
DB_FILE = os.environ.get("SQLITE_PATH", str(ROOT / "data" / "orders.db"))
Path(DB_FILE).parent.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite+aiosqlite:///{DB_FILE}"

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True)            # order_id sent to Midtrans
    nama = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    whatsapp = Column(String, nullable=False)
    paket = Column(String, nullable=False)            # "full" or "bab-2".."bab-7"
    harga = Column(Integer, nullable=False)           # IDR integer
    status = Column(String, nullable=False, default="pending", index=True)
    # pending | settlement | success | failure | expire | cancel | deny
    access_token = Column(String, nullable=True, unique=True, index=True)
    payment_type = Column(String, nullable=True)
    midtrans_transaction_id = Column(String, nullable=True)
    raw_notification = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    paid_at = Column(DateTime, nullable=True)


Index("ix_orders_status_created", Order.status, Order.created_at)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def order_to_dict(o: Order) -> dict:
    return {
        "id": o.id,
        "nama": o.nama,
        "email": o.email,
        "whatsapp": o.whatsapp,
        "paket": o.paket,
        "harga": o.harga,
        "status": o.status,
        "access_token": o.access_token,
        "payment_type": o.payment_type,
        "midtrans_transaction_id": o.midtrans_transaction_id,
        "created_at": o.created_at.isoformat() if o.created_at else None,
        "paid_at": o.paid_at.isoformat() if o.paid_at else None,
    }
