import pytest
from app.game.randomness import (
    DeterministicPRNG,
    derive_player_seed,
    generate_deterministic_card,
    create_card_commitment,
    verify_card_commitment,
)
from app.game.cards import validate_bingo_card_structure
from app.security import sha256_hash


def test_deterministic_card_validity():
    derived_seed = sha256_hash("test_server_seed:g_123:p_456:user_entropy_xyz")
    card = generate_deterministic_card(derived_seed)

    # Structure checks
    assert validate_bingo_card_structure(card) is True
    assert len(card.grid) == 5
    assert len(card.grid[0]) == 5
    assert card.grid[2][2].value == "FREE"

    # Column range checks
    for r in range(5):
        # B column: 1-15
        assert 1 <= card.grid[r][0].value <= 15
        # I column: 16-30
        assert 16 <= card.grid[r][1].value <= 30
        # N column: 31-45 (except row 2 FREE)
        if r != 2:
            assert 31 <= card.grid[r][2].value <= 45
        # G column: 46-60
        assert 46 <= card.grid[r][3].value <= 60
        # O column: 61-75
        assert 61 <= card.grid[r][4].value <= 75


def test_card_generation_determinism():
    seed1 = sha256_hash("same_entropy_seed")
    card1 = generate_deterministic_card(seed1)
    card2 = generate_deterministic_card(seed1)

    assert card1.canonical_repr == card2.canonical_repr
    assert card1.grid[0][0].value == card2.grid[0][0].value


def test_card_generation_distinctness():
    seed1 = sha256_hash("seed_player_1")
    seed2 = sha256_hash("seed_player_2")
    card1 = generate_deterministic_card(seed1)
    card2 = generate_deterministic_card(seed2)

    assert card1.canonical_repr != card2.canonical_repr


def test_card_commitment_verification():
    seed = sha256_hash("seed_commitment_test")
    card = generate_deterministic_card(seed)

    commitment, nonce = create_card_commitment(card.canonical_repr)
    assert commitment.card_hash != ""
    assert commitment.nonce == nonce

    # Valid commitment
    assert verify_card_commitment(card.canonical_repr, nonce, commitment.card_hash) is True

    # Tampered card
    tampered_repr = card.canonical_repr + ",99"
    assert verify_card_commitment(tampered_repr, nonce, commitment.card_hash) is False

    # Tampered nonce
    assert verify_card_commitment(card.canonical_repr, "wrong_nonce", commitment.card_hash) is False
