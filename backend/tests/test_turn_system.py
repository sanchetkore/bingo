import pytest
from app.game.manager import GameManager
from app.game.models import GameStatus


@pytest.mark.asyncio
async def test_game_creation_and_turns():
    gm = GameManager()
    g_id, g_code, host_id, host_token, seed_hash, _ = await gm.create_game("HostPlayer")
    assert g_id.startswith("g_")
    assert len(g_code) == 6
    assert host_id.startswith("p_")
    assert seed_hash != ""

    # Join player 2
    _, p2_id, p2_token, err = await gm.join_game(g_code, "Player2")
    assert err is None
    assert p2_id is not None

    # Try selecting number before start (should fail)
    ok, err_msg, _, _ = await gm.select_number(g_id, host_id, 10)
    assert ok is False
    assert "not active" in (err_msg or "").lower()

    # Start game
    ok, err_msg, cards = await gm.start_game(g_id, host_id)
    assert ok is True
    assert len(cards) == 2

    game = gm.get_game(g_id)
    assert game.status == GameStatus.ACTIVE
    current_player = game.current_turn_player_id
    assert current_player in [host_id, p2_id]

    other_player = p2_id if current_player == host_id else host_id

    # Non-turn player cannot select number
    ok, err_msg, _, _ = await gm.select_number(g_id, other_player, 15)
    assert ok is False
    assert "turn" in (err_msg or "").lower()

    # Valid turn selects number
    ok, err_msg, called_num, next_pid = await gm.select_number(g_id, current_player, 15)
    assert ok is True, f"Error: {err_msg}"
    assert called_num == 15
    assert next_pid == other_player
    assert 15 in game.called_numbers

    # Try calling same number again
    ok, err_msg, _, _ = await gm.select_number(g_id, next_pid, 15)
    assert ok is False
    assert "already been called" in (err_msg or "").lower()

    # Out of bounds number (e.g., 0, 76)
    ok, err_msg, _, _ = await gm.select_number(g_id, next_pid, 0)
    assert ok is False
    ok, err_msg, _, _ = await gm.select_number(g_id, next_pid, 76)
    assert ok is False
