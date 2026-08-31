from typing import List, Optional, Set, Tuple
from app.game.models import BingoCard, WinningPattern, WinningPatternType
from app.game.cards import get_pattern_coordinates


def verify_claimed_pattern(
    card: BingoCard,
    called_numbers: Set[int],
    pattern: WinningPattern,
) -> Tuple[bool, Optional[str]]:
    """
    Independently verifies that the player's authoritative card has a completed Bingo
    for the specific claimed winning pattern given the set of called numbers.
    """
    try:
        coords = get_pattern_coordinates(pattern)
    except ValueError as e:
        return False, str(e)

    for r, c in coords:
        cell_val = card.grid[r][c].value
        if cell_val == "FREE":
            continue
        if isinstance(cell_val, int):
            if cell_val not in called_numbers:
                return (
                    False,
                    f"Cell at row {r}, col {c} with number {cell_val} has not been called yet.",
                )
        else:
            return False, f"Invalid cell value '{cell_val}' on card."

    return True, None


def find_all_valid_patterns(
    card: BingoCard,
    called_numbers: Set[int],
) -> List[WinningPattern]:
    """
    Scans the entire card and returns all currently satisfied winning patterns (rows, cols, diagonals).
    """
    valid_patterns: List[WinningPattern] = []

    # Check 5 rows
    for r in range(5):
        row_pat = WinningPattern(type=WinningPatternType.ROW, index=r)
        is_valid, _ = verify_claimed_pattern(card, called_numbers, row_pat)
        if is_valid:
            valid_patterns.append(row_pat)

    # Check 5 columns
    for c in range(5):
        col_pat = WinningPattern(type=WinningPatternType.COLUMN, index=c)
        is_valid, _ = verify_claimed_pattern(card, called_numbers, col_pat)
        if is_valid:
            valid_patterns.append(col_pat)

    # Check 2 diagonals
    for d in [0, 1]:
        diag_pat = WinningPattern(type=WinningPatternType.DIAGONAL, index=d)
        is_valid, _ = verify_claimed_pattern(card, called_numbers, diag_pat)
        if is_valid:
            valid_patterns.append(diag_pat)

    return valid_patterns
