from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    agent_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    # Agent's claimed category.
    # Example: research, training, unknown
    agent_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    # Algorand wallet associated with the agent.
    wallet_address: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
        index=True,
    )

    # True only after cryptographic verification.
    verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    # Trust/reputation score.
    reputation_score: Mapped[float] = mapped_column(
        Float,
        default=50.0,
    )

    # Number of successful payments.
    successful_payments: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    # Number of failed/suspicious requests.
    failed_requests: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )