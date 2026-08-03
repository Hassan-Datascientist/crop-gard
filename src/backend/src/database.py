from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from .config import settings

engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def init_db() -> None:
    """Create tables and indexes on startup (idempotent)."""
    # Import models so they register on Base.metadata before create_all.
    from . import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_ensure_columns)


def _ensure_columns(sync_conn) -> None:
    """Lightweight migration for columns added after a table already exists."""
    existing = {
        row[0]
        for row in sync_conn.exec_driver_sql(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
        ).fetchall()
    }
    if "avatar_key" not in existing:
        sync_conn.exec_driver_sql(
            "ALTER TABLE users ADD COLUMN avatar_key VARCHAR(64)"
        )


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
