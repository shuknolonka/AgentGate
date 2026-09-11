from dataclasses import dataclass


@dataclass
class PolicyDecision:
    action: str
    price_usd: float
    reason: str


POLICIES = {
    "human": {
        "action": "FREE",
        "price_usd": 0.0,
    },
    "research": {
        "action": "CHARGE",
        "price_usd": 0.001,
    },
    "unknown": {
        "action": "CHARGE",
        "price_usd": 0.01,
    },
    "training": {
        "action": "BLOCK",
        "price_usd": 0.0,
    },
}


def evaluate_policy(agent_type: str) -> PolicyDecision:
    """
    Decide what AgentGate should do with an agent request.
    """

    policy = POLICIES.get(
        agent_type,
        POLICIES["unknown"],
    )

    return PolicyDecision(
        action=policy["action"],
        price_usd=policy["price_usd"],
        reason=f"Policy applied for agent type: {agent_type}",
    )