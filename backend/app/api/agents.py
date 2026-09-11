import secrets
import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.identity import identify_agent
from app.services.verification import verify_agent_identity


router = APIRouter(
    prefix="/api/agents",
    tags=["Agents"],
)


# Temporary in-memory challenge storage.
# Good enough for our hackathon MVP.
CHALLENGES = {}


class VerificationRequest(BaseModel):
    agent_id: str
    wallet_address: str
    signature: str
    challenge: str


@router.get("/identify")
def identify():
    """
    Basic identity endpoint.

    The identity supplied by an agent is only a claim.
    It is not considered verified.
    """

    return {
        "message": (
            "Use the verification endpoint to prove "
            "wallet ownership."
        )
    }


@router.post("/challenge")
def create_challenge(agent_id: str):
    """
    Generate a one-time challenge for an agent.

    The agent must sign this challenge with its wallet.
    """

    challenge = secrets.token_urlsafe(32)

    CHALLENGES[challenge] = {
        "agent_id": agent_id,
        "created_at": time.time(),
        "expires_at": time.time() + 60,
    }

    return {
        "agent_id": agent_id,
        "challenge": challenge,
        "expires_in": 60,
    }


@router.post("/verify")
def verify_agent(data: VerificationRequest):
    """
    Verify that an agent controls the supplied wallet.

    The actual Algorand signature verification is handled
    by verification.py.
    """

    stored_challenge = CHALLENGES.get(data.challenge)

    if stored_challenge is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid or unknown challenge.",
        )

    if time.time() > stored_challenge["expires_at"]:
        del CHALLENGES[data.challenge]

        raise HTTPException(
            status_code=400,
            detail="Challenge has expired.",
        )

    if stored_challenge["agent_id"] != data.agent_id:
        raise HTTPException(
            status_code=400,
            detail="Challenge does not belong to this agent.",
        )

    result = verify_agent_identity(
        wallet_address=data.wallet_address,
        signature=data.signature,
        challenge=data.challenge,
        agent_id=data.agent_id,
    )

    # Challenge is one-time use.
    del CHALLENGES[data.challenge]

    return {
        "agent_id": data.agent_id,
        "wallet_address": data.wallet_address,
        "verified": result.verified,
        "reason": result.reason,
    }