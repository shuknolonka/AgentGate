from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine

from app.api.agents import router as agents_router
from app.api.policies import router as policies_router
from app.api.resources import router as resources_router
from app.api.transactions import router as transactions_router
from app.api.policy_demo import router as policy_demo_router

from app.services.payments import (
    x402_server,
    ALGORAND_TESTNET_NETWORK,
    PAY_TO,
)

from x402.http import PaymentOption
from x402.http.middleware.fastapi import PaymentMiddlewareASGI
from x402.http.types import RouteConfig


app = FastAPI(
    title="AgentGate",
    description="Programmable paid access for the Agentic Web",
    version="0.1.0",
)


# ============================================================
# x402 PAYMENT ROUTE
# ============================================================

x402_routes = {
    "GET /api/research": RouteConfig(
        accepts=[
            PaymentOption(
                scheme="exact",
                network=ALGORAND_TESTNET_NETWORK,
                pay_to=PAY_TO,
                price="$0.001",
                extra={
                    "asset": 10458941,
                    "name": "USDC",
                    "decimals": 6,
                },
            ),
        ],
        mime_type="application/json",
        description="AgentGate AI Market Intelligence",
    ),
}


# ============================================================
# x402 PAYMENT MIDDLEWARE
# ============================================================

app.add_middleware(
    PaymentMiddlewareASGI,
    routes=x402_routes,
    server=x402_server,
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(agents_router)
app.include_router(policies_router)
app.include_router(resources_router)
app.include_router(transactions_router)
app.include_router(policy_demo_router)


# ============================================================
# BASIC ENDPOINTS
# ============================================================

@app.get("/")
def root():
    return {
        "name": "AgentGate",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/health/database")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "database": "connected"
        }

    except Exception as error:
        return {
            "database": "error",
            "details": str(error),
        }