from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine

from app.api.agents import router as agents_router
from app.api.policies import router as policies_router
from app.api.resources import router as resources_router
from app.api.transactions import router as transactions_router


app = FastAPI(
    title="AgentGate",
    description="Programmable paid access for the Agentic Web",
    version="0.1.0",
)


# Register API routers
app.include_router(agents_router)
app.include_router(policies_router)
app.include_router(resources_router)
app.include_router(transactions_router)


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