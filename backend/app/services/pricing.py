from decimal import Decimal


def calculate_price(
    base_price: float,
    requests: int = 1,
) -> Decimal:
    """
    Calculate the total price for a number of requests.
    """

    price = Decimal(str(base_price))
    quantity = Decimal(str(requests))

    return price * quantity