import base64
from dataclasses import dataclass
from typing import Optional

from algosdk import encoding
from nacl.signing import VerifyKey


@dataclass
class VerificationResult:
    verified: bool
    reason: str
    wallet_address: Optional[str] = None


def build_auth_message(
    agent_id: str,
    challenge: str,
) -> bytes:
    """
    Build the exact message that the agent must sign.

    This prevents the signature from being reusable
    for a different purpose.
    """

    message = (
        "AgentGate authentication\n"
        f"Agent: {agent_id}\n"
        f"Challenge: {challenge}"
    )

    return message.encode("utf-8")


def verify_agent_identity(
    wallet_address: Optional[str],
    signature: Optional[str],
    challenge: Optional[str],
    agent_id: Optional[str] = None,
) -> VerificationResult:

    if not wallet_address:
        return VerificationResult(
            verified=False,
            reason="No wallet address provided.",
        )

    if not signature:
        return VerificationResult(
            verified=False,
            reason="No cryptographic signature provided.",
            wallet_address=wallet_address,
        )

    if not challenge:
        return VerificationResult(
            verified=False,
            reason="No verification challenge provided.",
            wallet_address=wallet_address,
        )

    if not agent_id:
        return VerificationResult(
            verified=False,
            reason="No agent ID provided.",
            wallet_address=wallet_address,
        )

    try:
        # Convert Algorand address into its underlying
        # 32-byte Ed25519 public key.
        public_key = encoding.decode_address(wallet_address)

        # Decode the base64 signature sent by the agent.
        signature_bytes = base64.b64decode(
            signature,
            validate=True,
        )

        # Reconstruct the exact message.
        message = build_auth_message(
            agent_id=agent_id,
            challenge=challenge,
        )

        # Verify Ed25519 signature.
        verify_key = VerifyKey(public_key)
        verify_key.verify(
            message,
            signature_bytes,
        )

        return VerificationResult(
            verified=True,
            reason="Wallet signature verified successfully.",
            wallet_address=wallet_address,
        )

    except Exception as error:
        return VerificationResult(
            verified=False,
            reason=f"Invalid wallet signature: {error}",
            wallet_address=wallet_address,
        )