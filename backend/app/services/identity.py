from fastapi import Request


def identify_agent(request: Request) -> dict:
    """
    Identify an agent from request headers.

    For the MVP we use:
    X-Agent-ID
    X-Agent-Type
    """

    agent_id = request.headers.get(
        "X-Agent-ID",
        "unknown-agent",
    )

    agent_type = request.headers.get(
        "X-Agent-Type",
        "unknown",
    )

    wallet_address = request.headers.get(
        "X-Agent-Wallet",
    )

    signature = request.headers.get(
        "X-Agent-Signature",
    )

    challenge = request.headers.get(
        "X-Agent-Challenge",
    )

    return {
        "agent_id": agent_id,
        "agent_type": agent_type,
        "wallet_address": wallet_address,
        "signature": signature,
        "challenge": challenge,
    }