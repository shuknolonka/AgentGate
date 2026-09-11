import requests

from wallet import sign_challenge


BASE_URL = "http://127.0.0.1:8000"
AGENT_ID = "research-agent-001"


def main():
    print("=== AgentGate Verification Test ===")

    # 1. Ask AgentGate for a challenge
    response = requests.post(
        f"{BASE_URL}/api/agents/challenge",
        params={"agent_id": AGENT_ID},
    )

    response.raise_for_status()

    challenge_data = response.json()

    challenge = challenge_data["challenge"]

    print("\nChallenge received:")
    print(challenge)

    # 2. Sign the challenge with our wallet
    wallet_address, signature = sign_challenge(
        AGENT_ID,
        challenge,
    )

    print("\nWallet:")
    print(wallet_address)

    print("\nChallenge signed successfully.")

    # 3. Send the proof back to AgentGate
    response = requests.post(
        f"{BASE_URL}/api/agents/verify",
        json={
            "agent_id": AGENT_ID,
            "wallet_address": wallet_address,
            "signature": signature,
            "challenge": challenge,
        },
    )

    print("\nAgentGate response:")
    print(response.status_code)
    print(response.json())


if __name__ == "__main__":
    main()