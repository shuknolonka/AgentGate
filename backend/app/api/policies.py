from fastapi import APIRouter

from app.services.policy_engine import POLICIES


router = APIRouter(
    prefix="/api/policies",
    tags=["Policies"],
)


@router.get("")
def get_policies():
    """
    Return the current AgentGate access policies.
    """

    return {
        "policies": POLICIES
    }
