from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.services.identity import identify_agent
from app.services.policy_engine import evaluate_policy
from app.services.rate_limit import check_rate_limit
from app.services.payments import create_payment_requirement
from app.services.verification import verify_agent_identity


router = APIRouter(
    prefix="/api",
    tags=["Resources"],
)


@router.get("/research")
def access_research_data(request: Request):
    """
    Protected research data endpoint.

    AgentGate:
    1. Identifies the requesting agent
    2. Checks rate limit
    3. Evaluates access policy
    4. Returns FREE / CHARGE / BLOCK
    """

    # 1. Identify agent
    agent = identify_agent(request)

    # 1.5 Verify wallet identity
    verification = verify_agent_identity(
        wallet_address=agent["wallet_address"],
        signature=agent["signature"],
        challenge=agent["challenge"],
        agent_id=agent["agent_id"],
    )

    agent["verified"] = verification.verified
    agent["verification_reason"] = verification.reason

    # 2. Rate limit
    rate_result = check_rate_limit(
        agent_id=agent["agent_id"],
        limit=100,
        window_seconds=60,
    )

    if not rate_result["allowed"]:
        return JSONResponse(
            status_code=429,
            content={
                "status": "blocked",
                "reason": "Rate limit exceeded",
                "agent": agent,
            },
        )

    # 3. Evaluate policy
    effective_agent_type = agent["agent_type"]

    # A research claim is only treated as "research"
    # when the wallet identity has been verified.
    if (
        agent["agent_type"] == "research"
        and not agent["verified"]
    ):
        effective_agent_type = "unknown"

    decision = evaluate_policy(
        agent_type=effective_agent_type
    )

    # 4. BLOCK
    if decision.action == "BLOCK":
        return JSONResponse(
            status_code=403,
            content={
                "status": "blocked",
                "agent": agent,
                "decision": decision.action,
                "reason": decision.reason,
            },
        )

    # 5. FREE
    if decision.action == "FREE":
        return {
            "status": "allowed",
            "agent": agent,
            "decision": "FREE",
            "price_usd": 0.0,
            "data": {
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
            },
        }

    # 6. CHARGE
    payment = create_payment_requirement(
        decision.price_usd
    )

    return JSONResponse(
        status_code=402,
        content={
            "status": "payment_required",
            "agent": agent,
            "decision": decision.action,
            "price_usd": decision.price_usd,
            "payment": {
                "required": payment.required,
                "amount_usd": payment.amount_usd,
                "status": payment.status,
            },
            "message": (
                "Payment is required to access this resource."
            ),
        },
    )