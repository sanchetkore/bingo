from typing import List, Set, Tuple
from app.game.models import BingoCard, WinningPattern, WinningPatternType


def get_pattern_coordinates(pattern: WinningPattern) -> List[Tuple[int, int]]:
    """
    Returns the 5 (row, col) coordinates for a given pattern.
    - ROW: (pattern.index, c) for c in 0..4
    - COLUMN: (r, pattern.index) for r in 0..4
    - DIAGONAL:
        - index 0: Main diagonal (top-left to bottom-right: (0,0), (1,1), (2,2), (3,3), (4,4))
        - index 1: Anti-diagonal (top-right to bottom-left: (0,4), (1,3), (2,2), (3,1), (4,0))
    """
    if pattern.type == WinningPatternType.ROW:
        return [(pattern.index, c) for c in range(5)]
    elif pattern.type == WinningPatternType.COLUMN:
        return [(r, pattern.index) for r in range(5)]
    elif pattern.type == WinningPatternType.DIAGONAL:
        if pattern.index == 0:
            return [(i, i) for i in range(5)]
        elif pattern.index == 1:
            return [(i, 4 - i) for i in range(5)]
        else:
            raise ValueError(f"Invalid diagonal index: {pattern.index}. Must be 0 or 1.")
    else:
        raise ValueError(f"Unknown pattern type: {pattern.type}")


def validate_bingo_card_structure(card: BingoCard) -> bool:
    """
    Validates that a BingoCard strictly conforms to the traditional 75-ball rules:
    - 5 rows by 5 columns
    - B (col 0): numbers 1-15, all unique
    - I (col 1): numbers 16-30, all unique
    - N (col 2): numbers 31-45, center (2,2) is "FREE", all unique
    - G (col 3): numbers 46-60, all unique
    - O (col 4): numbers 61-75, all unique
    - No duplicate numbers across the entire card
    """
    if len(card.grid) != 5:
        return False

    seen_numbers: Set[int] = set()

    for r in range(5):
        if len(card.grid[r]) != 5:
            return False
        for c in range(5):
            cell = card.grid[r][c]
            val = cell.value

            if r == 2 and c == 2:
                if val != "FREE":
                    return False
                continue

            if not isinstance(val, int):
                return False

            # Check column ranges
            if c == 0 and not (1 <= val <= 15):
                return False
            elif c == 1 and not (16 <= val <= 30):
                return False
            elif c == 2 and not (31 <= val <= 45):
                return False
            elif c == 3 and not (46 <= val <= 60):
                return False
            elif c == 4 and not (61 <= val <= 75):
                return False

            if val in seen_numbers:
                return False
            seen_numbers.add(val)

    # 24 numbers + 1 FREE = 25 cells
    return len(seen_numbers) == 24
