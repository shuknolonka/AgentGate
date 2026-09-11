#creates fastapi application
from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine


app = FastAPI(
    title="AgentGate",
    description="Programmable paid access for the Agentic Web",
    version="0.1.0",
)


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