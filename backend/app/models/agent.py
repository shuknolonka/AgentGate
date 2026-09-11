from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    agent_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    agent_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    reputation_score: Mapped[float] = mapped_column(
        default=50.0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )