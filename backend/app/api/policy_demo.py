from fastapi import APIRouter

from app.services.policy_engine import evaluate_policy

router = APIRouter(
    prefix="/api",
    tags=["Policy Demo"],
)


@router.get("/policy-check")
def policy_check(agent_type: str):
    decision = evaluate_policy(agent_type)

    return {
        "agent_type": agent_type,
        "decision": decision.action,
        "price_usd": decision.price_usd,
        "reason": decision.reason,
    }