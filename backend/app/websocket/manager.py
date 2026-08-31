import asyncio
import json
import logging
from typing import Dict, Optional, Set
from fastapi import WebSocket
from pydantic import BaseModel

logger = logging.getLogger("bingo.websocket")


class ConnectionManager:
    def __init__(self):
        # game_id -> {player_id: WebSocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def connect(self, game_id: str, player_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            if game_id not in self.active_connections:
                self.active_connections[game_id] = {}
            self.active_connections[game_id][player_id] = websocket
        logger.info(f"Player {player_id} connected to game {game_id}")

    async def disconnect(self, game_id: str, player_id: str):
        async with self.lock:
            if game_id in self.active_connections:
                self.active_connections[game_id].pop(player_id, None)
                if not self.active_connections[game_id]:
                    self.active_connections.pop(game_id, None)
        logger.info(f"Player {player_id} disconnected from game {game_id}")

    async def send_personal_message(self, message: BaseModel, game_id: str, player_id: str):
        ws: Optional[WebSocket] = None
        async with self.lock:
            if game_id in self.active_connections:
                ws = self.active_connections[game_id].get(player_id)

        if ws:
            try:
                payload = message.model_dump_json() if hasattr(message, "model_dump_json") else message.json()
                await ws.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message to player {player_id} in game {game_id}: {e}")

    async def broadcast_to_game(
        self, message: BaseModel, game_id: str, exclude_player_id: Optional[str] = None
    ):
        sockets_to_send = []
        async with self.lock:
            if game_id in self.active_connections:
                for pid, ws in self.active_connections[game_id].items():
                    if exclude_player_id and pid == exclude_player_id:
                        continue
                    sockets_to_send.append((pid, ws))

        if not sockets_to_send:
            return

        payload = message.model_dump_json() if hasattr(message, "model_dump_json") else message.json()
        
        # Broadcast concurrently
        tasks = []
        for pid, ws in sockets_to_send:
            tasks.append(self._safe_send(ws, payload, pid, game_id))
        
        await asyncio.gather(*tasks, return_exceptions=True)

    async def _safe_send(self, ws: WebSocket, payload: str, player_id: str, game_id: str):
        try:
            await ws.send_text(payload)
        except Exception as e:
            logger.warning(f"Broadcast failed to player {player_id} in game {game_id}: {e}")


connection_manager = ConnectionManager()
