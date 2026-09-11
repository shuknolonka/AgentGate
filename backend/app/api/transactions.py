from fastapi import APIRouter


router = APIRouter(
    prefix="/api/transactions",
    tags=["Transactions"],
)


@router.get("")
def get_transactions():
    """
    Temporary transaction endpoint.

    Real transactions will be stored after x402
    payment integration is added.
    """

    return {
        "transactions": [],
        "message": "Transactions will appear here after x402 integration."
    }