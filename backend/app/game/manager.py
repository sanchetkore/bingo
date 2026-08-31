import asyncio
import secrets
import time
from typing import Dict, List, Optional, Set, Tuple
from app.config import settings
from app.game.models import (
    BingoCard,
    CardCommitment,
    GameStatus,
    GameStatePublic,
    Player,
    PlayerPublic,
    WinnerInfo,
    WinningPattern,
)
from app.game.randomness import (
    derive_player_seed,
    generate_deterministic_card,
    create_card_commitment,
    verify_card_commitment,
)
from app.game.cards import validate_bingo_card_structure
from app.game.bingo import verify_claimed_pattern, find_all_valid_patterns
from app.security import (
    generate_secure_id,
    generate_session_token,
    generate_game_code,
    generate_server_seed,
    sha256_hash,
)


class GameInstance:
    def __init__(self, game_id: str, game_code: str, host_player: Player, server_seed: str):
        self.game_id = game_id
        self.game_code = game_code
        self.host_player_id = host_player.player_id
        self.status = GameStatus.LOBBY
        self.server_seed = server_seed
        self.server_seed_hash = sha256_hash(server_seed)
        self.created_at = time.time()
        self.max_number: int = 75

        # Players ordered by join order
        self.players: Dict[str, Player] = {host_player.player_id: host_player}
        self.player_order: List[str] = [host_player.player_id]

        # Active gameplay state
        self.current_turn_index: int = 0
        self.called_numbers: List[int] = []
        self.called_set: Set[int] = set()
        self.last_number: Optional[int] = None
        self.winner: Optional[WinnerInfo] = None

        # Lock for atomic game operations
        self.lock = asyncio.Lock()

    @property
    def current_turn_player_id(self) -> Optional[str]:
        if self.status != GameStatus.ACTIVE or not self.player_order:
            return None
        if 0 <= self.current_turn_index < len(self.player_order):
            return self.player_order[self.current_turn_index]
        return None

    def get_public_state(self) -> GameStatePublic:
        public_players = [
            PlayerPublic(
                player_id=p.player_id,
                name=p.name,
                is_host=p.is_host,
                is_connected=p.is_connected,
                has_entropy=bool(p.entropy),
            )
            for p in self.players.values()
        ]

        return GameStatePublic(
            game_id=self.game_id,
            game_code=self.game_code,
            status=self.status,
            host_player_id=self.host_player_id,
            players=public_players,
            current_turn=self.current_turn_player_id,
            called_numbers=list(self.called_numbers),
            last_number=self.last_number,
            server_seed_hash=self.server_seed_hash,
            winner=self.winner,
            max_number=self.max_number,
            server_seed=self.server_seed if self.status == GameStatus.FINISHED else None,
        )


class GameManager:
    def __init__(self):
        self.games: Dict[str, GameInstance] = {}
        self.code_to_game_id: Dict[str, str] = {}
        self.global_lock = asyncio.Lock()

    async def create_game(self, host_name: str) -> Tuple[str, str, str, str, str]:
        """
        Creates a new game.
        Returns (game_id, game_code, host_player_id, session_token, server_seed_hash).
        """
        async with self.global_lock:
            game_id = generate_secure_id("g")
            
            # Ensure unique 6-digit code
            for _ in range(100):
                game_code = generate_game_code(settings.DEFAULT_CODE_LENGTH)
                if game_code not in self.code_to_game_id:
                    break
            else:
                game_code = generate_secure_id()[:6]

            host_player_id = generate_secure_id("p")
            session_token = generate_session_token()
            server_seed = generate_server_seed()

            host_player = Player(
                player_id=host_player_id,
                name=host_name.strip() or "Host",
                is_host=True,
                session_token=session_token,
                joined_at=time.time(),
            )

            game = GameInstance(
                game_id=game_id,
                game_code=game_code,
                host_player=host_player,
                server_seed=server_seed,
            )

            self.games[game_id] = game
            self.code_to_game_id[game_code] = game_id

            return game_id, game_code, host_player_id, session_token, game.server_seed_hash

    async def join_game(self, game_code: str, player_name: str) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
        """
        Join an existing game by code in LOBBY status.
        Returns (game_id, player_id, session_token, error_message).
        """
        cleaned_code = game_code.strip().replace(" ", "").upper()
        game_id = self.code_to_game_id.get(cleaned_code)
        if not game_id or game_id not in self.games:
            return None, None, None, "Game not found. Please verify the 6-digit game code."

        game = self.games[game_id]
        async with game.lock:
            if game.status != GameStatus.LOBBY:
                return None, None, None, "Game has already started or finished."

            if len(game.players) >= 8:
                return None, None, None, "Game is full. Maximum 8 players allowed."

            player_id = generate_secure_id("p")
            session_token = generate_session_token()

            player = Player(
                player_id=player_id,
                name=player_name.strip() or f"Player {len(game.players) + 1}",
                is_host=False,
                session_token=session_token,
                joined_at=time.time(),
            )

            game.players[player_id] = player
            game.player_order.append(player_id)

            return game_id, player_id, session_token, None

    def get_game(self, game_id: str) -> Optional[GameInstance]:
        return self.games.get(game_id)

    def get_game_by_code(self, game_code: str) -> Optional[GameInstance]:
        cleaned_code = game_code.strip().replace(" ", "").upper()
        game_id = self.code_to_game_id.get(cleaned_code)
        return self.games.get(game_id) if game_id else None

    async def set_player_entropy(self, game_id: str, player_id: str, entropy: str) -> Tuple[bool, Optional[str]]:
        game = self.get_game(game_id)
        if not game:
            return False, "Game not found."
        async with game.lock:
            if game.status != GameStatus.LOBBY:
                return False, "Cannot modify entropy after game starts."
            player = game.players.get(player_id)
            if not player:
                return False, "Player not found."
            player.entropy = entropy.strip()
            return True, None

    async def start_game(self, game_id: str, host_player_id: str) -> Tuple[bool, Optional[str], Dict[str, BingoCard]]:
        """
        Starts the game:
        - Verifies host identity and LOBBY status.
        - Generates cards and commitments for all players.
        - Randomly selects starting player using cryptographically secure secrets.choice.
        - Changes status to ACTIVE.
        Returns (success, error_msg, {player_id: card}).
        """
        game = self.get_game(game_id)
        if not game:
            return False, "Game not found.", {}

        async with game.lock:
            if game.host_player_id != host_player_id:
                return False, "Only the host can start the game.", {}

            if game.status != GameStatus.LOBBY:
                return False, f"Game cannot be started in '{game.status.value}' state.", {}

            if len(game.players) < 1:
                return False, "Need at least 1 player to start.", {}

            num_players = len(game.players)
            if num_players <= 3:
                game.max_number = 25
            elif num_players <= 5:
                game.max_number = 50
            else:
                game.max_number = 75

            game.status = GameStatus.STARTING
            player_cards: Dict[str, BingoCard] = {}

            # Generate cards for each player
            for pid, player in game.players.items():
                derived_seed = derive_player_seed(
                    server_seed=game.server_seed,
                    game_id=game.game_id,
                    player_id=pid,
                    player_entropy=player.entropy or secrets.token_hex(8),
                )
                card = generate_deterministic_card(derived_seed, game.max_number)
                commitment, _ = create_card_commitment(card.canonical_repr)

                player.card = card
                player.commitment = commitment
                player_cards[pid] = card

            # Securely randomize starting player
            starting_index = secrets.randbelow(len(game.player_order))
            game.current_turn_index = starting_index
            game.status = GameStatus.ACTIVE

            return True, None, player_cards

    async def select_number(
        self, game_id: str, player_id: str, number: int
    ) -> Tuple[bool, Optional[str], Optional[int], Optional[str]]:
        """
        Processes a player's number selection.
        Returns (success, error_msg, called_number, next_turn_player_id).
        """
        game = self.get_game(game_id)
        if not game:
            return False, "Game not found.", None, None

        async with game.lock:
            if game.status != GameStatus.ACTIVE:
                return False, f"Game is not active (current status: {game.status.value}).", None, None

            if game.current_turn_player_id != player_id:
                current_player = game.players.get(game.current_turn_player_id or "")
                current_name = current_player.name if current_player else "Another player"
                return False, f"It isn't your turn. Waiting for {current_name}.", None, None

            if not (1 <= number <= game.max_number):
                return False, f"Invalid number {number}. Must be between 1 and {game.max_number}.", None, None

            if number in game.called_set:
                return False, f"Number {number} has already been called.", None, None

            # Add to called numbers
            game.called_numbers.append(number)
            game.called_set.add(number)
            game.last_number = number

            # Advance turn to next connected active player
            next_turn_pid = self._advance_turn_internal(game)

            return True, None, number, next_turn_pid

    def _advance_turn_internal(self, game: GameInstance) -> str:
        """Internal helper to rotate turn to next connected player."""
        n = len(game.player_order)
        if n == 0:
            return ""

        for _ in range(n):
            game.current_turn_index = (game.current_turn_index + 1) % n
            pid = game.player_order[game.current_turn_index]
            player = game.players.get(pid)
            if player and player.is_connected:
                return pid

        # Fallback to current index if all are disconnected
        return game.player_order[game.current_turn_index]

    async def pass_turn_if_timeout(self, game_id: str, player_id: str) -> Optional[str]:
        """If player is disconnected on their turn, advance turn."""
        game = self.get_game(game_id)
        if not game:
            return None
        async with game.lock:
            if game.status == GameStatus.ACTIVE and game.current_turn_player_id == player_id:
                player = game.players.get(player_id)
                if player and not player.is_connected:
                    return self._advance_turn_internal(game)
        return None

    async def claim_bingo(
        self, game_id: str, player_id: str, pattern: Optional[WinningPattern] = None
    ) -> Tuple[bool, Optional[str], Optional[WinnerInfo]]:
        """
        Independently validates a player's Bingo claim against the server-authoritative card
        and called numbers. First valid claim wins.
        """
        game = self.get_game(game_id)
        if not game:
            return False, "Game not found.", None

        async with game.lock:
            if game.status == GameStatus.FINISHED:
                return False, "GAME_ALREADY_FINISHED: Another player has already claimed Bingo.", None

            if game.status != GameStatus.ACTIVE:
                return False, f"Game is not active (current status: {game.status.value}).", None

            player = game.players.get(player_id)
            if not player or not player.card:
                return False, "Player card not found.", None

            # If specific pattern was claimed, verify it
            valid_pattern: Optional[WinningPattern] = None
            if pattern:
                is_valid, err = verify_claimed_pattern(player.card, game.called_set, pattern)
                if is_valid:
                    valid_pattern = pattern
                else:
                    return False, f"Invalid claim: {err}", None
            else:
                # Search for any valid pattern on the player's card
                patterns = find_all_valid_patterns(player.card, game.called_set)
                if patterns:
                    valid_pattern = patterns[0]
                else:
                    return False, "No valid Bingo pattern completed on your card.", None

            # Mark game as FINISHED and declare winner
            game.status = GameStatus.FINISHED
            winner_info = WinnerInfo(
                player_id=player.player_id,
                name=player.name,
                winning_pattern=valid_pattern,
                winning_number=game.last_number,
                canonical_card=player.card.canonical_repr,
                claimed_at=time.time(),
            )
            game.winner = winner_info

            return True, None, winner_info

    async def handle_disconnect(self, game_id: str, player_id: str) -> None:
        game = self.get_game(game_id)
        if not game:
            return
        async with game.lock:
            player = game.players.get(player_id)
            if player:
                player.is_connected = False

    async def handle_reconnect(
        self, game_id: str, player_id: str, session_token: str
    ) -> Tuple[bool, Optional[str], Optional[Player]]:
        game = self.get_game(game_id)
        if not game:
            return False, "Game not found.", None

        async with game.lock:
            player = game.players.get(player_id)
            if not player:
                return False, "Player not found.", None

            if player.session_token != session_token:
                return False, "Invalid session token.", None

            player.is_connected = True
            return True, None, player

    async def verify_game_audit(self, game_id: str) -> Tuple[bool, Optional[str], Optional[dict]]:
        """
        Public cryptographic audit for finished games:
        Provides server_seed, verifies all player cards, derived seeds, and commitments.
        """
        game = self.get_game(game_id)
        if not game:
            return False, "Game not found.", None

        async with game.lock:
            if game.status != GameStatus.FINISHED:
                return False, "Game must be finished to view the full audit reveal.", None

            audit_players = []
            for pid, player in game.players.items():
                derived_seed = derive_player_seed(
                    server_seed=game.server_seed,
                    game_id=game.game_id,
                    player_id=pid,
                    player_entropy=player.entropy,
                )
                reproduced_card = generate_deterministic_card(derived_seed, game.max_number)
                canonical_repr = player.card.canonical_repr if player.card else ""
                nonce = player.commitment.nonce if player.commitment else ""
                card_hash = player.commitment.card_hash if player.commitment else ""
                is_commitment_valid = verify_card_commitment(canonical_repr, nonce, card_hash)

                audit_players.append({
                    "player_id": pid,
                    "name": player.name,
                    "entropy": player.entropy,
                    "derived_seed": derived_seed,
                    "reproduced_canonical": reproduced_card.canonical_repr,
                    "actual_canonical": canonical_repr,
                    "card_hash": card_hash,
                    "nonce": nonce,
                    "is_card_reproduced_identically": (reproduced_card.canonical_repr == canonical_repr),
                    "is_commitment_valid": is_commitment_valid,
                })

            return True, None, {
                "game_id": game.game_id,
                "server_seed": game.server_seed,
                "server_seed_hash": game.server_seed_hash,
                "called_numbers": game.called_numbers,
                "winner": game.winner.model_dump() if game.winner else None,
                "players": audit_players,
            }


# Singleton instance of GameManager
game_manager = GameManager()
