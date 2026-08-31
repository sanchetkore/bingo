import pytest
from app.game.models import WinningPattern, WinningPatternType
from app.game.randomness import generate_deterministic_card
from app.game.bingo import verify_claimed_pattern, find_all_valid_patterns
from app.security import sha256_hash


@pytest.fixture
def sample_card():
    seed = sha256_hash("fixed_test_card_seed")
    return generate_deterministic_card(seed)


def test_row_bingo_validation(sample_card):
    # Row 0 values
    row0_values = {sample_card.grid[0][c].value for c in range(5)}
    pattern = WinningPattern(type=WinningPatternType.ROW, index=0)

    # Incomplete set (only 4 numbers)
    incomplete_set = set(list(row0_values)[:4])
    is_valid, err = verify_claimed_pattern(sample_card, incomplete_set, pattern)
    assert is_valid is False
    assert "not been called" in (err or "")

    # Complete row 0 set
    is_valid, err = verify_claimed_pattern(sample_card, row0_values, pattern)
    assert is_valid is True
    assert err is None


def test_column_bingo_validation(sample_card):
    # Column 1 values
    col1_values = {sample_card.grid[r][1].value for r in range(5)}
    pattern = WinningPattern(type=WinningPatternType.COLUMN, index=1)

    is_valid, err = verify_claimed_pattern(sample_card, col1_values, pattern)
    assert is_valid is True


def test_diagonal_bingo_with_free_space(sample_card):
    # Main diagonal (0,0), (1,1), (2,2=FREE), (3,3), (4,4)
    diag_values = set()
    for i in range(5):
        val = sample_card.grid[i][i].value
        if val != "FREE":
            diag_values.add(val)

    # 4 numbers required because center is FREE
    assert len(diag_values) == 4
    pattern = WinningPattern(type=WinningPatternType.DIAGONAL, index=0)

    is_valid, err = verify_claimed_pattern(sample_card, diag_values, pattern)
    assert is_valid is True


def test_anti_diagonal_bingo(sample_card):
    # Anti-diagonal (0,4), (1,3), (2,2=FREE), (3,1), (4,0)
    diag_values = set()
    for i in range(5):
        val = sample_card.grid[i][4 - i].value
        if val != "FREE":
            diag_values.add(val)

    pattern = WinningPattern(type=WinningPatternType.DIAGONAL, index=1)
    is_valid, err = verify_claimed_pattern(sample_card, diag_values, pattern)
    assert is_valid is True


def test_find_all_valid_patterns(sample_card):
    # Call row 0 and col 4
    called = set()
    for c in range(5):
        called.add(sample_card.grid[0][c].value)
    for r in range(5):
        called.add(sample_card.grid[r][4].value)

    patterns = find_all_valid_patterns(sample_card, called)
    assert len(patterns) >= 2
    types = {(p.type, p.index) for p in patterns}
    assert (WinningPatternType.ROW, 0) in types
    assert (WinningPatternType.COLUMN, 4) in types
