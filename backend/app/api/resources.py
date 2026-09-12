from fastapi import APIRouter, Request

from app.services.identity import identify_agent
from app.services.policy_engine import evaluate_policy
from app.services.rate_limit import check_rate_limit
from app.services.verification import verify_agent_identity


router = APIRouter(
    prefix="/api",
    tags=["Resources"],
)


RESEARCH_DATA = {
    "dataset": "AI Market Intelligence",
    "records": [
        {
            "company": "NovaAI",
            "sector": "AI Infrastructure",
            "growth": "32%",
        },
        {
            "company": "DataForge",
            "sector": "Data Analytics",
            "growth": "21%",
        },
        {
            "company": "RoboCore",
            "sector": "Robotics",
            "growth": "27%",
        },
    ],
}


@router.get("/research")
async def access_research_data(
    request: Request,
):
    """
    Protected AgentGate research resource.

    x402 middleware handles:
        1. 402 Payment Required
        2. payment verification
        3. payment settlement

    This route executes only after the payment layer
    has allowed the request.
    """

    # ---------------------------------------
    # 1. Identify agent
    # ---------------------------------------

    agent = identify_agent(request)


    # ---------------------------------------
    # 2. Verify wallet identity
    # ---------------------------------------

    verification = verify_agent_identity(
        wallet_address=agent["wallet_address"],
        signature=agent["signature"],
        challenge=agent["challenge"],
        agent_id=agent["agent_id"],
    )

    agent["verified"] = verification.verified
    agent["verification_reason"] = (
        verification.reason
    )


    # ---------------------------------------
    # 3. Rate limiting
    # ---------------------------------------

    rate_result = check_rate_limit(
        agent_id=agent["agent_id"],
        limit=100,
        window_seconds=60,
    )

    if not rate_result["allowed"]:
        return {
            "status": "blocked",
            "reason": "Rate limit exceeded",
            "agent": agent,
        }


    # ---------------------------------------
    # 4. Determine effective agent type
    # ---------------------------------------

    effective_agent_type = agent["agent_type"]

    # A research claim without a valid wallet
    # signature is downgraded to unknown.
    if (
        agent["agent_type"] == "research"
        and not agent["verified"]
    ):
        effective_agent_type = "unknown"


    # ---------------------------------------
    # 5. Apply AgentGate policy
    # ---------------------------------------

    decision = evaluate_policy(
        agent_type=effective_agent_type
    )


    # ---------------------------------------
    # 6. BLOCK
    # ---------------------------------------

    if decision.action == "BLOCK":
        return {
            "status": "blocked",
            "agent": agent,
            "decision": "BLOCK",
            "reason": decision.reason,
        }


    # ---------------------------------------
    # 7. FREE
    # ---------------------------------------

    if decision.action == "FREE":
        return {
            "status": "allowed",
            "agent": agent,
            "decision": "FREE",
            "price_usd": 0.0,
            "data": RESEARCH_DATA,
        }


    # ---------------------------------------
    # 8. PAID REQUEST
    # ---------------------------------------

    # If this code executes for a paid request,
    # x402 has already verified/settled the payment.
    return {
        "status": "allowed",
        "agent": agent,
        "decision": "CHARGE",
        "price_usd": decision.price_usd,
        "payment": {
            "status": "settled",
            "protocol": "x402",
            "network": "Algorand TestNet",
        },
        "data": RESEARCH_DATA,
    }
