import requests

from wallet import sign_challenge


BASE_URL = "http://127.0.0.1:8000"
AGENT_ID = "research-agent-001"


def main():
    print("=== AgentGate Agent Test ===")

    # --------------------------------------------------
    # 1. Ask AgentGate for a challenge
    # --------------------------------------------------

    response = requests.post(
        f"{BASE_URL}/api/agents/challenge",
        params={"agent_id": AGENT_ID},
    )

    response.raise_for_status()

    challenge_data = response.json()
    challenge = challenge_data["challenge"]

    print("\nChallenge received:")
    print(challenge)

    # --------------------------------------------------
    # 2. Sign the challenge using the agent wallet
    # --------------------------------------------------

    wallet_address, signature = sign_challenge(
        AGENT_ID,
        challenge,
    )

    print("\nWallet:")
    print(wallet_address)

    print("\nChallenge signed successfully.")

    # --------------------------------------------------
    # 3. Verify wallet ownership
    # --------------------------------------------------

    response = requests.post(
        f"{BASE_URL}/api/agents/verify",
        json={
            "agent_id": AGENT_ID,
            "wallet_address": wallet_address,
            "signature": signature,
            "challenge": challenge,
        },
    )

    response.raise_for_status()

    verification = response.json()

    print("\nVerification response:")
    print(verification)

    # --------------------------------------------------
    # 4. Stop if verification failed
    # --------------------------------------------------

    if not verification["verified"]:
        print("\n❌ Agent verification failed.")
        return

    print("\n✅ Agent verified successfully.")

    # --------------------------------------------------
    # 5. Request protected research data
    # --------------------------------------------------

    print("\nRequesting protected research data...")

    response = requests.get(
        f"{BASE_URL}/api/research",
        headers={
            "X-Agent-ID": AGENT_ID,
            "X-Agent-Type": "research",
            "X-Agent-Wallet": wallet_address,
            "X-Agent-Signature": signature,
            "X-Agent-Challenge": challenge,
        },
    )

    print("\nResearch endpoint response:")
    print("HTTP status:", response.status_code)
    print(response.json())


if __name__ == "__main__":
    main()