import base64
import json
from pathlib import Path

from algosdk import account
from nacl.signing import SigningKey

WALLET_FILE = Path(__file__).parent / ".agent_wallet.json"


def load_or_create_wallet():
    """
    Create a local Algorand wallet for our demo agent.

    The private key stays on this machine.
    """

    if WALLET_FILE.exists():
        with open(WALLET_FILE, "r") as file:
            wallet = json.load(file)

        return wallet["private_key"], wallet["address"]

    private_key, address = account.generate_account()

    wallet = {
        "private_key": private_key,
        "address": address,
    }

    with open(WALLET_FILE, "w") as file:
        json.dump(wallet, file, indent=2)

    return private_key, address


def build_auth_message(agent_id, challenge):
    return (
        "AgentGate authentication\n"
        f"Agent: {agent_id}\n"
        f"Challenge: {challenge}"
    ).encode("utf-8")


def sign_challenge(agent_id, challenge):
    private_key, address = load_or_create_wallet()

    message = build_auth_message(
        agent_id,
        challenge,
    )

    private_key_bytes = base64.b64decode(private_key)
    signing_key = SigningKey(
         private_key_bytes[:32]
    )

    signature = signing_key.sign(message).signature

    signature_base64 = base64.b64encode(
        signature
    ).decode("utf-8")

    return address, signature_base64


if __name__ == "__main__":
    print("AgentGate test wallet")

    private_key, address = load_or_create_wallet()

    print()
    print("Wallet address:")
    print(address)

    print()
    print("Wallet created/loaded successfully.")
    print("Private key is stored locally.")