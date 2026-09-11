from dataclasses import dataclass


@dataclass
class PaymentResult:
    required: bool
    amount_usd: float
    status: str
    payment_reference: str | None = None


def create_payment_requirement(
    amount_usd: float,
) -> PaymentResult:
    """
    Create a payment requirement.

    Actual x402 payment integration will be added here.
    """

    if amount_usd <= 0:
        return PaymentResult(
            required=False,
            amount_usd=0.0,
            status="not_required",
        )

    return PaymentResult(
        required=True,
        amount_usd=amount_usd,
        status="payment_required",
    )