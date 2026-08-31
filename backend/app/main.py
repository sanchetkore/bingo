import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router as api_router
from app.websocket.handlers import handle_websocket_connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("bingo.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Bingo Backend starting up in {settings.ENVIRONMENT} mode on port {settings.PORT}...")
    yield
    logger.info("Bingo Backend shutting down...")


app = FastAPI(
    title="Multiplayer Bingo Server",
    description="Authoritative real-time multiplayer 75-ball Bingo backend with cryptographically secure verifiable randomness.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for development and production web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST routes
app.include_router(api_router)


# WebSocket endpoint
@app.websocket("/ws/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    await handle_websocket_connection(websocket, game_id)
