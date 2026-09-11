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
        "unknown-agent"
    )

    agent_type = request.headers.get(
        "X-Agent-Type",
        "unknown"
    )

    return {
        "agent_id": agent_id,
        "agent_type": agent_type,
    }