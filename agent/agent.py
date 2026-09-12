import base64
import json
from pathlib import Path

import algosdk
import requests

from wallet import sign_challenge

from x402 import x402ClientSync
from x402.http import x402HTTPClientSync
from x402.mechanisms.avm.exact import register_exact_avm_client


BASE_URL = "http://127.0.0.1:8000"
RESOURCE_URL = f"{BASE_URL}/api/research"
AGENT_ID = "research-agent-001"

WALLET_FILE = Path(__file__).parent / ".agent_wallet.json"

NETWORK = (
    "algorand:"
    "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
)


class AlgorandSigner:

    def __init__(self, private_key, address):
        self.private_key = private_key
        self.address = address

    def sign_transactions(
        self,
        unsigned_txns,
        indexes_to_sign,
    ):
        result = []

        for i, txn_bytes in enumerate(unsigned_txns):

            if i in indexes_to_sign:

                txn = algosdk.encoding.msgpack_decode(
                    base64.b64encode(txn_bytes).decode()
                )

                signed = txn.sign(self.private_key)

                signed_bytes = base64.b64decode(
                    algosdk.encoding.msgpack_encode(signed)
                )

                result.append(signed_bytes)

            else:
                result.append(None)

        return result


def load_wallet():

    if not WALLET_FILE.exists():
        raise RuntimeError(
            "Agent wallet not found. "
            "Run: python agent/wallet.py"
        )

    with open(WALLET_FILE, "r") as file:
        wallet = json.load(file)

    return wallet["private_key"], wallet["address"]


def main():

    print("=" * 60)
    print("AgentGate x402 PAYMENT AGENT")
    print("=" * 60)

    private_key, address = load_wallet()

    print()
    print("Agent ID:")
    print(AGENT_ID)

    print()
    print("Payer wallet:")
    print(address)

    signer = AlgorandSigner(
        private_key=private_key,
        address=address,
    )

    client = x402ClientSync()

    register_exact_avm_client(
        client,
        signer,
        networks=[NETWORK],
    )

    http_client = x402HTTPClientSync(client)

    print()
    print("x402 client:")
    print("Ready")

    # --------------------------------------------------------
    # FIRST REQUEST
    # --------------------------------------------------------

    print()
    print("Requesting AgentGate verification challenge...")

    challenge_response = requests.post(
        f"{BASE_URL}/api/agents/challenge",
        params={
            "agent_id": AGENT_ID,
        },
        timeout=30,
    )

    challenge_response.raise_for_status()

    challenge = challenge_response.json()["challenge"]

    print("Challenge received.")

    # Sign challenge using the agent wallet
    signed_address, signature = sign_challenge(
        AGENT_ID,
        challenge,
    )

    print("Challenge signed.")

    # Verify identity with AgentGate
    verification_response = requests.post(
        f"{BASE_URL}/api/agents/verify",
        json={
            "agent_id": AGENT_ID,
            "wallet_address": signed_address,
            "signature": signature,
            "challenge": challenge,
        },
        timeout=30,
    )

    verification_response.raise_for_status()

    verification = verification_response.json()

    print()
    print("Identity verification:")
    print(json.dumps(verification, indent=2))

    if not verification["verified"]:
        print("\n❌ Agent verification failed.")
        return

    print("\n✅ Agent identity verified.")

    # --------------------------------------------------------
    # NOW REQUEST PROTECTED DATA
    # --------------------------------------------------------

    print()
    print("Requesting protected research data...")

    response = requests.get(
        RESOURCE_URL,
        headers={
            "X-Agent-ID": AGENT_ID,
            "X-Agent-Type": "research",
            "X-Agent-Wallet": address,
            "X-Agent-Signature": signature,
            "X-Agent-Challenge": challenge,
        },
        timeout=30,
    )

    print()
    print("First response:", response.status_code)

    # --------------------------------------------------------
    # HANDLE 402
    # --------------------------------------------------------

    if response.status_code == 402:

        print()
        print("💰 Payment required.")
        print("Creating x402 USDC payment...")

        payment_headers, _ = (
            http_client.handle_402_response(
                dict(response.headers),
                response.content,
            )
        )

        print("Payment created and signed.")

        # ----------------------------------------------------
        # RETRY REQUEST WITH PAYMENT
        # ----------------------------------------------------

        response = requests.get(
            RESOURCE_URL,
            headers={
                "X-Agent-ID": AGENT_ID,
                "X-Agent-Type": "research",
                "X-Agent-Wallet": address,
                **payment_headers,
            },
            timeout=60,
        )

    print()
    print("Final HTTP status:")
    print(response.status_code)

    print()
    print("Response:")

    try:
        print(
            json.dumps(
                response.json(),
                indent=2,
            )
        )
    except Exception:
        print(response.text)

    if response.status_code == 200:

        print()
        print("=" * 60)
        print("✅ REAL x402 PAYMENT FLOW SUCCESSFUL")
        print("=" * 60)

    else:

        print()
        print("=" * 60)
        print("❌ PAYMENT FAILED")
        print("=" * 60)


if __name__ == "__main__":
    main()