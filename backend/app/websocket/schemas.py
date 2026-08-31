from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from app.game.models import (
    BingoCard,
    CardCommitment,
    GameStatePublic,
    PlayerPublic,
    WinnerInfo,
    WinningPattern,
)


class ClientMessageType(str, Enum):
    JOIN_GAME = "join_game"
    SET_ENTROPY = "set_entropy"
    START_GAME = "start_game"
    SELECT_NUMBER = "select_number"
    BINGO_CLAIM = "bingo_claim"
    RECONNECT = "reconnect"
    PING = "ping"


class ServerMessageType(str, Enum):
    CONNECTED = "connected"
    GAME_STATE = "game_state"
    PLAYER_JOINED = "player_joined"
    PLAYER_LEFT = "player_left"
    ENTROPY_UPDATED = "entropy_updated"
    GAME_STARTED = "game_started"
    CARD_ASSIGNED = "card_assigned"
    NUMBER_CALLED = "number_called"
    TURN_CHANGED = "turn_changed"
    BINGO_VALID = "bingo_valid"
    BINGO_INVALID = "bingo_invalid"
    GAME_WON = "game_won"
    GAME_FINISHED = "game_finished"
    PLAYER_DISCONNECTED = "player_disconnected"
    PLAYER_RECONNECTED = "player_reconnected"
    ERROR = "error"
    PONG = "pong"


# Client Message Models
class ClientBaseMessage(BaseModel):
    type: ClientMessageType


class JoinGameMessage(ClientBaseMessage):
    type: ClientMessageType = ClientMessageType.JOIN_GAME
    player_id: str
    session_token: str


class SetEntropyMessage(ClientBaseMessage):
    type: ClientMessageType = ClientMessageType.SET_ENTROPY
    player_id: str
    entropy: str


class StartGameMessage(ClientBaseMessage):
    type: ClientMessageType = ClientMessageType.START_GAME
    player_id: str


class SelectNumberMessage(ClientBaseMessage):
    type: ClientMessageType = ClientMessageType.SELECT_NUMBER
    player_id: str
    number: int = Field(..., ge=1, le=75)


class BingoClaimMessage(ClientBaseMessage):
    type: ClientMessageType = ClientMessageType.BINGO_CLAIM
    player_id: str
    winning_pattern: Optional[WinningPattern] = None


class ReconnectMessage(ClientBaseMessage):
    type: ClientMessageType = ClientMessageType.RECONNECT
    player_id: str
    session_token: str


class PingMessage(ClientBaseMessage):
    type: ClientMessageType = ClientMessageType.PING


# Server Message Models
class ServerBaseMessage(BaseModel):
    type: ServerMessageType


class ConnectedMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.CONNECTED
    player_id: str
    game_id: str
    message: str = "Connected to Bingo game server"


class GameStateMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.GAME_STATE
    state: GameStatePublic


class CardAssignedMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.CARD_ASSIGNED
    card: BingoCard
    commitment_hash: str


class PlayerJoinedMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.PLAYER_JOINED
    player: PlayerPublic
    total_players: int


class EntropyUpdatedMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.ENTROPY_UPDATED
    player_id: str
    has_entropy: bool


class GameStartedMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.GAME_STARTED
    current_turn: str
    players: List[PlayerPublic]


class NumberCalledMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.NUMBER_CALLED
    number: int
    called_count: int
    selected_by: str
    selected_by_name: str
    next_turn: str


class TurnChangedMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.TURN_CHANGED
    current_turn: str
    player_name: str


class BingoInvalidMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.BINGO_INVALID
    player_id: str
    message: str


class GameWonMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.GAME_WON
    winner: WinnerInfo
    winning_pattern: WinningPattern
    winning_number: Optional[int]


class PlayerDisconnectedMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.PLAYER_DISCONNECTED
    player_id: str
    player_name: str


class PlayerReconnectedMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.PLAYER_RECONNECTED
    player_id: str
    player_name: str


class ErrorMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.ERROR
    code: str
    message: str


class PongMessage(ServerBaseMessage):
    type: ServerMessageType = ServerMessageType.PONG
