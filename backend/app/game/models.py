from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel, Field


class GameStatus(str, Enum):
    LOBBY = "LOBBY"
    STARTING = "STARTING"
    ACTIVE = "ACTIVE"
    BINGO_CLAIMED = "BINGO_CLAIMED"
    FINISHED = "FINISHED"


class WinningPatternType(str, Enum):
    ROW = "row"
    COLUMN = "column"
    DIAGONAL = "diagonal"


class WinningPattern(BaseModel):
    type: WinningPatternType
    index: int = Field(..., ge=0, le=4, description="0-4 for row/column, 0 (main) or 1 (anti) for diagonal")


class CardCell(BaseModel):
    value: Union[int, str]
    row: int = Field(..., ge=0, le=4)
    col: int = Field(..., ge=0, le=4)


class BingoCard(BaseModel):
    # 5x5 matrix of cells
    grid: List[List[CardCell]]
    canonical_repr: str


class CardCommitment(BaseModel):
    card_hash: str
    nonce: str


class Player(BaseModel):
    player_id: str
    name: str
    is_host: bool = False
    session_token: str
    entropy: str = ""
    is_connected: bool = True
    joined_at: float
    card: Optional[BingoCard] = None
    commitment: Optional[CardCommitment] = None


class PlayerPublic(BaseModel):
    player_id: str
    name: str
    is_host: bool
    is_connected: bool
    has_entropy: bool


class WinnerInfo(BaseModel):
    player_id: str
    name: str
    winning_pattern: WinningPattern
    winning_number: Optional[int] = None
    canonical_card: Optional[str] = None
    claimed_at: float


class GameStatePublic(BaseModel):
    game_id: str
    game_code: str
    status: GameStatus
    host_player_id: str
    players: List[PlayerPublic]
    call_mode: str = "player"  # "player" or "server"
    draw_speed: int = 5
    current_turn: Optional[str] = None
    called_numbers: List[int] = []
    last_number: Optional[int] = None
    server_seed_hash: str
    winner: Optional[WinnerInfo] = None
    max_number: int = 75
    server_seed: Optional[str] = None  # Revealed only when FINISHED
