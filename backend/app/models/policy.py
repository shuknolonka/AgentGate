from sqlalchemy import Boolean, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
    )

    agent_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(20)
    )

    price_usd: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )

    rate_limit: Mapped[int] = mapped_column(
        default=100,
    )

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )