import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router as api_router
from app.websocket.handlers import handle_websocket_connection
from app.game.manager import game_manager
from app.rate_limit import api_rate_limiter, ws_message_limiter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("bingo.main")


async def cleanup_task():
    while True:
        await asyncio.sleep(300) # Every 5 minutes
        await game_manager.cleanup_stale_games()
        await api_rate_limiter.cleanup()
        await ws_message_limiter.cleanup()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Bingo Backend starting up in {settings.ENVIRONMENT} mode on port {settings.PORT}...")
    task = asyncio.create_task(cleanup_task())
    yield
    task.cancel()
    logger.info("Bingo Backend shutting down...")


app = FastAPI(
    title="Multiplayer Bingo Server",
    description="Authoritative real-time multiplayer 75-ball Bingo backend with cryptographically secure verifiable randomness.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for development and production web clients
cors_origins = settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST routes
app.include_router(api_router)


# WebSocket endpoint
@app.websocket("/ws/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    # Origin validation for WebSocket
    origin = websocket.headers.get("origin")
    if cors_origins and "*" not in cors_origins:
        if not origin or origin not in cors_origins:
            await websocket.close(code=1008, reason="Origin not allowed")
            return

    await handle_websocket_connection(websocket, game_id)

