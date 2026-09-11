import time


REQUESTS = {}


def check_rate_limit(
    agent_id: str,
    limit: int = 100,
    window_seconds: int = 60,
) -> dict:
    """
    Check whether an agent has exceeded its request limit.
    """

    now = time.time()

    if agent_id not in REQUESTS:
        REQUESTS[agent_id] = []

    REQUESTS[agent_id] = [
        timestamp
        for timestamp in REQUESTS[agent_id]
        if now - timestamp < window_seconds
    ]

    if len(REQUESTS[agent_id]) >= limit:
        return {
            "allowed": False,
            "remaining": 0,
        }

    REQUESTS[agent_id].append(now)

    return {
        "allowed": True,
        "remaining": limit - len(REQUESTS[agent_id]),
    }