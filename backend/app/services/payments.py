import os
from pathlib import Path

from dotenv import load_dotenv


# Load .env from the AgentGate project root
BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BASE_DIR / ".env")


from x402.http import (
    FacilitatorConfig,
    HTTPFacilitatorClient,
    PaymentOption,
)
from x402.http.types import RouteConfig
from x402.mechanisms.avm.exact import ExactAvmServerScheme
from x402.server import x402ResourceServer


# Algorand TestNet CAIP-2 identifier
ALGORAND_TESTNET_NETWORK = (
    "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
)

# Algorand TestNet USDC ASA
USDC_TESTNET_ASA_ID = 10458941

# Your receiving wallet.
# We will put this into .env shortly.
PAY_TO = os.getenv("AGENTGATE_PAY_TO")

# x402 facilitator
FACILITATOR_URL = os.getenv(
    "X402_FACILITATOR_URL",
    "https://x402.org/facilitator",
)


if not PAY_TO:
    raise RuntimeError(
        "AGENTGATE_PAY_TO is not configured. "
        "Add your Algorand receiver address to .env."
    )


# Create facilitator client
facilitator = HTTPFacilitatorClient(
    FacilitatorConfig(
        url=FACILITATOR_URL
    )
)


# Create x402 resource server
x402_server = x402ResourceServer(
    facilitator
)


# Register Algorand exact-payment scheme
x402_server.register(
    ALGORAND_TESTNET_NETWORK,
    ExactAvmServerScheme(),
)


def create_payment_route(
    price_usd: float,
) -> RouteConfig:
    """
    Create an x402 payment route configuration.

    price_usd is supplied by AgentGate's policy engine.
    """

    return RouteConfig(
        accepts=PaymentOption(
            scheme="exact",
            network=ALGORAND_TESTNET_NETWORK,
            pay_to=PAY_TO,
            price=f"${price_usd:.6f}",
            extra={
                "asset": USDC_TESTNET_ASA_ID,
                "name": "USDC",
                "decimals": 6,
            },
        ),
        mime_type="application/json",
        description="AgentGate protected research data",
    )