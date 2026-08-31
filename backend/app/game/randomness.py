import hashlib
import struct
from typing import List, Tuple
from app.game.models import BingoCard, CardCell, CardCommitment
from app.security import sha256_hash, generate_nonce


class DeterministicPRNG:
    """
    A cryptographically sound deterministic pseudo-random number generator
    based on SHA-256 counter mode expansion.
    Produces reproducible pseudo-random byte streams and uniform integer selections from a seed.
    """

    def __init__(self, seed_hex: str):
        self.seed = seed_hex.encode("utf-8")
        self.counter = 0
        self.buffer = b""
        self.offset = 0

    def _refill(self):
        # Generate next 32-byte block: SHA256(seed || counter as 4-byte big-endian)
        counter_bytes = struct.pack(">I", self.counter)
        block = hashlib.sha256(self.seed + counter_bytes).digest()
        self.counter += 1
        self.buffer = block
        self.offset = 0

    def get_bytes(self, n: int) -> bytes:
        result = bytearray()
        while len(result) < n:
            if self.offset >= len(self.buffer):
                self._refill()
            available = len(self.buffer) - self.offset
            to_take = min(available, n - len(result))
            result.extend(self.buffer[self.offset : self.offset + to_take])
            self.offset += to_take
        return bytes(result)

    def sample_uniform(self, pool: List[int], count: int) -> List[int]:
        """
        Fisher-Yates shuffle sampling without bias.
        Selects `count` unique items from `pool`.
        """
        items = list(pool)
        n = len(items)
        for i in range(count):
            # Select index j in [i, n - 1]
            remaining = n - i
            # Use 4 bytes (32-bit uint) with rejection sampling for perfect uniformity
            max_val = 0xFFFFFFFF - (0xFFFFFFFF % remaining)
            while True:
                raw_bytes = self.get_bytes(4)
                val = struct.unpack(">I", raw_bytes)[0]
                if val < max_val:
                    j = i + (val % remaining)
                    break
            items[i], items[j] = items[j], items[i]
        return items[:count]


def derive_player_seed(server_seed: str, game_id: str, player_id: str, player_entropy: str) -> str:
    """Derive deterministic seed for card generation: SHA256(server_seed + game_id + player_id + player_entropy)"""
    material = f"{server_seed}:{game_id}:{player_id}:{player_entropy}"
    return sha256_hash(material)


def generate_deterministic_card(derived_seed: str, max_number: int = 75) -> BingoCard:
    """
    Generates a canonical 5x5 Bingo card deterministically using the derived seed:
    B: 5 from 1..(max/5)
    I: 5 from (max/5)+1..(2*max/5)
    N: 4 from (2*max/5)+1..(3*max/5) (center is FREE)
    G: 5 from (3*max/5)+1..(4*max/5)
    O: 5 from (4*max/5)+1..max
    """
    prng = DeterministicPRNG(derived_seed)

    interval = max_number // 5

    b_col = prng.sample_uniform(list(range(1, interval + 1)), 5)
    i_col = prng.sample_uniform(list(range(interval + 1, 2 * interval + 1)), 5)
    n_col = prng.sample_uniform(list(range(2 * interval + 1, 3 * interval + 1)), 4)
    g_col = prng.sample_uniform(list(range(3 * interval + 1, 4 * interval + 1)), 5)
    o_col = prng.sample_uniform(list(range(4 * interval + 1, 5 * interval + 1)), 5)

    # Construct 5x5 grid (row, col)
    grid: List[List[CardCell]] = []
    canonical_items: List[str] = []

    for row_idx in range(5):
        row_cells: List[CardCell] = []
        for col_idx in range(5):
            if col_idx == 0:
                val: CardCell = CardCell(value=b_col[row_idx], row=row_idx, col=col_idx)
            elif col_idx == 1:
                val = CardCell(value=i_col[row_idx], row=row_idx, col=col_idx)
            elif col_idx == 2:
                if row_idx == 2:
                    val = CardCell(value="FREE", row=row_idx, col=col_idx)
                elif row_idx < 2:
                    val = CardCell(value=n_col[row_idx], row=row_idx, col=col_idx)
                else:
                    # row_idx > 2: take index row_idx - 1 (since index 2 is skipped)
                    val = CardCell(value=n_col[row_idx - 1], row=row_idx, col=col_idx)
            elif col_idx == 3:
                val = CardCell(value=g_col[row_idx], row=row_idx, col=col_idx)
            else:  # col_idx == 4
                val = CardCell(value=o_col[row_idx], row=row_idx, col=col_idx)

            row_cells.append(val)
            canonical_items.append(str(val.value))
        grid.append(row_cells)

    canonical_repr = ",".join(canonical_items)
    return BingoCard(grid=grid, canonical_repr=canonical_repr)


def create_card_commitment(canonical_repr: str) -> Tuple[CardCommitment, str]:
    """
    Create a cryptographic commitment to the canonical Bingo card.
    Returns (CardCommitment(card_hash, nonce), secret_nonce).
    """
    secret_nonce = generate_nonce()
    card_hash = sha256_hash(f"{canonical_repr}:{secret_nonce}")
    commitment = CardCommitment(card_hash=card_hash, nonce=secret_nonce)
    return commitment, secret_nonce


def verify_card_commitment(canonical_repr: str, nonce: str, expected_hash: str) -> bool:
    """Verifies that SHA256(canonical_repr + nonce) matches the expected card_hash."""
    computed_hash = sha256_hash(f"{canonical_repr}:{nonce}")
    return computed_hash == expected_hash
