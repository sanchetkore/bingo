import asyncio
import json
import logging
from typing import Any, Dict
from fastapi import WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from app.config import settings
from app.game.manager import game_manager
from app.game.models import GameStatus, WinningPattern
from app.websocket.manager import connection_manager
from app.websocket.schemas import (
    BingoClaimMessage,
    BingoInvalidMessage,
    CardAssignedMessage,
    ClientMessageType,
    ConnectedMessage,
    EntropyUpdatedMessage,
    ErrorMessage,
    GameStartedMessage,
    GameStateMessage,
    GameWonMessage,
    JoinGameMessage,
    NumberCalledMessage,
    PlayerDisconnectedMessage,
    PlayerJoinedMessage,
    PlayerPublic,
    PlayerReconnectedMessage,
    PongMessage,
    ReconnectMessage,
    SelectNumberMessage,
    SetEntropyMessage,
    StartGameMessage,
    TurnChangedMessage,
)

logger = logging.getLogger("bingo.handlers")


async def handle_websocket_connection(websocket: WebSocket, game_id: str):
    """
    Main WebSocket endpoint loop for a game.
    """
    current_player_id: str = ""
    is_authenticated: bool = False

    try:
        # Initially accept the raw connection
        await websocket.accept()

        while True:
            raw_text = await websocket.receive_text()
            try:
                data: Dict[str, Any] = json.loads(raw_text)
            except json.JSONDecodeError:
                await websocket.send_text(
                    ErrorMessage(code="INVALID_JSON", message="Payload must be valid JSON.").model_dump_json()
                )
                continue

            msg_type = data.get("type")
            if not msg_type:
                await websocket.send_text(
                    ErrorMessage(code="MISSING_TYPE", message="Message missing 'type' field.").model_dump_json()
                )
                continue

            # Handle PING immediately without authentication requirement
            if msg_type == ClientMessageType.PING:
                await websocket.send_text(PongMessage().model_dump_json())
                continue

            # 1. JOIN GAME
            if msg_type == ClientMessageType.JOIN_GAME:
                try:
                    join_msg = JoinGameMessage(**data)
                except ValidationError as e:
                    await websocket.send_text(
                        ErrorMessage(code="INVALID_SCHEMA", message=str(e)).model_dump_json()
                    )
                    continue

                game = game_manager.get_game(game_id)
                if not game:
                    await websocket.send_text(
                        ErrorMessage(code="GAME_NOT_FOUND", message="Game not found.").model_dump_json()
                    )
                    continue

                player = game.players.get(join_msg.player_id)
                if not player or player.session_token != join_msg.session_token:
                    await websocket.send_text(
                        ErrorMessage(code="AUTH_FAILED", message="Invalid player ID or session token.").model_dump_json()
                    )
                    continue

                current_player_id = player.player_id
                is_authenticated = True
                player.is_connected = True

                # Register connection with manager
                async with connection_manager.lock:
                    if game_id not in connection_manager.active_connections:
                        connection_manager.active_connections[game_id] = {}
                    connection_manager.active_connections[game_id][current_player_id] = websocket

                # Send connection confirmation and complete game state to this player
                await websocket.send_text(
                    ConnectedMessage(player_id=current_player_id, game_id=game_id).model_dump_json()
                )
                await websocket.send_text(
                    GameStateMessage(state=game.get_public_state()).model_dump_json()
                )

                # If card already exists (reconnected/started), send card privately
                if player.card and player.commitment:
                    await websocket.send_text(
                        CardAssignedMessage(
                            card=player.card,
                            commitment_hash=player.commitment.card_hash,
                        ).model_dump_json()
                    )

                # Broadcast player joined to everyone else
                await connection_manager.broadcast_to_game(
                    PlayerJoinedMessage(
                        player=PlayerPublic(
                            player_id=player.player_id,
                            name=player.name,
                            is_host=player.is_host,
                            is_connected=True,
                            has_entropy=bool(player.entropy),
                        ),
                        total_players=len(game.players),
                    ),
                    game_id=game_id,
                    exclude_player_id=current_player_id,
                )
                continue

            # 2. RECONNECT
            elif msg_type == ClientMessageType.RECONNECT:
                try:
                    reconn_msg = ReconnectMessage(**data)
                except ValidationError as e:
                    await websocket.send_text(
                        ErrorMessage(code="INVALID_SCHEMA", message=str(e)).model_dump_json()
                    )
                    continue

                success, err, player = await game_manager.handle_reconnect(
                    game_id, reconn_msg.player_id, reconn_msg.session_token
                )
                if not success or not player:
                    await websocket.send_text(
                        ErrorMessage(code="RECONNECT_FAILED", message=err or "Reconnection failed.").model_dump_json()
                    )
                    continue

                current_player_id = player.player_id
                is_authenticated = True

                async with connection_manager.lock:
                    if game_id not in connection_manager.active_connections:
                        connection_manager.active_connections[game_id] = {}
                    connection_manager.active_connections[game_id][current_player_id] = websocket

                game = game_manager.get_game(game_id)
                if game:
                    await websocket.send_text(
                        GameStateMessage(state=game.get_public_state()).model_dump_json()
                    )
                    if player.card and player.commitment:
                        await websocket.send_text(
                            CardAssignedMessage(
                                card=player.card,
                                commitment_hash=player.commitment.card_hash,
                            ).model_dump_json()
                        )

                    await connection_manager.broadcast_to_game(
                        PlayerReconnectedMessage(player_id=player.player_id, player_name=player.name),
                        game_id=game_id,
                        exclude_player_id=current_player_id,
                    )
                continue

            # Require authentication for remaining game actions
            if not is_authenticated or not current_player_id:
                await websocket.send_text(
                    ErrorMessage(code="UNAUTHENTICATED", message="Must join/reconnect before performing game actions.").model_dump_json()
                )
                continue

            # 3. SET ENTROPY
            if msg_type == ClientMessageType.SET_ENTROPY:
                try:
                    entropy_msg = SetEntropyMessage(**data)
                except ValidationError as e:
                    await websocket.send_text(
                        ErrorMessage(code="INVALID_SCHEMA", message=str(e)).model_dump_json()
                    )
                    continue

                success, err = await game_manager.set_player_entropy(
                    game_id, current_player_id, entropy_msg.entropy
                )
                if not success:
                    await websocket.send_text(
                        ErrorMessage(code="ENTROPY_FAILED", message=err or "Failed to set entropy.").model_dump_json()
                    )
                else:
                    await connection_manager.broadcast_to_game(
                        EntropyUpdatedMessage(player_id=current_player_id, has_entropy=bool(entropy_msg.entropy.strip())),
                        game_id=game_id,
                    )

            # 4. START GAME
            elif msg_type == ClientMessageType.START_GAME:
                try:
                    start_msg = StartGameMessage(**data)
                except ValidationError as e:
                    await websocket.send_text(
                        ErrorMessage(code="INVALID_SCHEMA", message=str(e)).model_dump_json()
                    )
                    continue

                success, err, player_cards = await game_manager.start_game(
                    game_id, current_player_id
                )
                if not success:
                    await websocket.send_text(
                        ErrorMessage(code="START_FAILED", message=err or "Failed to start game.").model_dump_json()
                    )
                    continue

                game = game_manager.get_game(game_id)
                if not game:
                    continue

                # 1. Privately distribute each player's authoritative card & commitment
                for pid, card in player_cards.items():
                    player_obj = game.players.get(pid)
                    if player_obj and player_obj.commitment:
                        card_msg = CardAssignedMessage(
                            card=card,
                            commitment_hash=player_obj.commitment.card_hash,
                        )
                        await connection_manager.send_personal_message(card_msg, game_id, pid)

                # 2. Broadcast game started to everyone with turn information
                pub_state = game.get_public_state()
                await connection_manager.broadcast_to_game(
                    GameStartedMessage(
                        current_turn=game.current_turn_player_id or "",
                        players=pub_state.players,
                    ),
                    game_id=game_id,
                )

                # Also broadcast complete game state to sync all fields
                await connection_manager.broadcast_to_game(
                    GameStateMessage(state=pub_state),
                    game_id=game_id,
                )

            # 5. SELECT NUMBER
            elif msg_type == ClientMessageType.SELECT_NUMBER:
                try:
                    sel_msg = SelectNumberMessage(**data)
                except ValidationError as e:
                    await websocket.send_text(
                        ErrorMessage(code="INVALID_SCHEMA", message=str(e)).model_dump_json()
                    )
                    continue

                success, err, called_num, next_turn_pid = await game_manager.select_number(
                    game_id, current_player_id, sel_msg.number
                )
                if not success:
                    await websocket.send_text(
                        ErrorMessage(
                            code="NUMBER_SELECTION_FAILED" if "already" not in (err or "") else "NUMBER_ALREADY_CALLED",
                            message=err or "Could not call number.",
                        ).model_dump_json()
                    )
                    continue

                game = game_manager.get_game(game_id)
                if not game:
                    continue

                calling_player = game.players.get(current_player_id)
                calling_name = calling_player.name if calling_player else "Player"

                # Broadcast called number to all connected devices
                await connection_manager.broadcast_to_game(
                    NumberCalledMessage(
                        number=called_num,  # type: ignore
                        called_count=len(game.called_numbers),
                        selected_by=current_player_id,
                        selected_by_name=calling_name,
                        next_turn=next_turn_pid or "",
                    ),
                    game_id=game_id,
                )

            # 6. BINGO CLAIM
            elif msg_type == ClientMessageType.BINGO_CLAIM:
                try:
                    claim_msg = BingoClaimMessage(**data)
                except ValidationError as e:
                    await websocket.send_text(
                        ErrorMessage(code="INVALID_SCHEMA", message=str(e)).model_dump_json()
                    )
                    continue

                success, err, winner_info = await game_manager.claim_bingo(
                    game_id, current_player_id, claim_msg.winning_pattern
                )

                if not success or not winner_info:
                    await websocket.send_text(
                        BingoInvalidMessage(
                            player_id=current_player_id,
                            message=err or "Bingo claim could not be verified by the server.",
                        ).model_dump_json()
                    )
                    continue

                # Valid claim! First valid claim wins.
                game = game_manager.get_game(game_id)
                if game:
                    # Broadcast game won event
                    await connection_manager.broadcast_to_game(
                        GameWonMessage(
                            winner=winner_info,
                            winning_pattern=winner_info.winning_pattern,
                            winning_number=winner_info.winning_number,
                        ),
                        game_id=game_id,
                    )
                    # Broadcast finalized public game state revealing server_seed
                    await connection_manager.broadcast_to_game(
                        GameStateMessage(state=game.get_public_state()),
                        game_id=game_id,
                    )

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnect: player {current_player_id} in game {game_id}")
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket loop: {e}", exc_info=True)
    finally:
        if current_player_id:
            await game_manager.handle_disconnect(game_id, current_player_id)
            await connection_manager.disconnect(game_id, current_player_id)
            
            game = game_manager.get_game(game_id)
            if game:
                player = game.players.get(current_player_id)
                pname = player.name if player else "A player"
                await connection_manager.broadcast_to_game(
                    PlayerDisconnectedMessage(player_id=current_player_id, player_name=pname),
                    game_id=game_id,
                )

                # If disconnected on active turn, launch async timer to advance turn if not reconnected
                if game.status == GameStatus.ACTIVE and game.current_turn_player_id == current_player_id:
                    asyncio.create_task(
                        _handle_disconnect_turn_timeout(game_id, current_player_id)
                    )


async def _handle_disconnect_turn_timeout(game_id: str, player_id: str):
    """Wait for disconnect timeout; if player is still disconnected on their turn, skip turn."""
    await asyncio.sleep(settings.DISCONNECT_TIMEOUT_SECONDS)
    next_pid = await game_manager.pass_turn_if_timeout(game_id, player_id)
    if next_pid:
        game = game_manager.get_game(game_id)
        if game:
            next_player = game.players.get(next_pid)
            pname = next_player.name if next_player else "Next Player"
            await connection_manager.broadcast_to_game(
                TurnChangedMessage(current_turn=next_pid, player_name=pname),
                game_id=game_id,
            )
