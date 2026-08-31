import pytest
from app.game.manager import GameManager
from app.game.models import GameStatus, WinningPattern, WinningPatternType


@pytest.mark.asyncio
async def test_complete_game_lifecycle():
    gm = GameManager()
    g_id, g_code, host_id, _, _, _ = await gm.create_game("HostAlice")
    _, p2_id, _, _ = await gm.join_game(g_code, "Bob")

    # Set entropy
    await gm.set_player_entropy(g_id, host_id, "AliceEntropy_12345")
    await gm.set_player_entropy(g_id, p2_id, "BobEntropy_67890")

    # Start game
    ok, err, cards = await gm.start_game(g_id, host_id)
    assert ok is True
    bob_card = cards[p2_id]

    # Simulate calling all numbers in Bob's first row
    row0_numbers = [bob_card.grid[0][c].value for c in range(5)]

    game = gm.get_game(g_id)
    for num in row0_numbers:
        curr_turn = game.current_turn_player_id
        ok, _, called_num, _ = await gm.select_number(g_id, curr_turn, num)
        assert ok is True

    # Bob claims Bingo
    pattern = WinningPattern(type=WinningPatternType.ROW, index=0)
    ok, err, winner_info = await gm.claim_bingo(g_id, p2_id, pattern)
    assert ok is True
    assert winner_info.player_id == p2_id
    assert game.status == GameStatus.FINISHED

    # Subsequent Bingo claim after finish should be rejected
    ok2, err2, _ = await gm.claim_bingo(g_id, host_id, pattern)
    assert ok2 is False
    assert "FINISHED" in (err2 or "")

    # Post-game verifiable randomness audit
    ok_audit, err_audit, audit_data = await gm.verify_game_audit(g_id)
    assert ok_audit is True
    assert audit_data["server_seed"] != ""
    assert len(audit_data["players"]) == 2
    for p in audit_data["players"]:
        assert p["is_card_reproduced_identically"] is True
        assert p["is_commitment_valid"] is True


@pytest.mark.asyncio
async def test_player_reconnection():
    gm = GameManager()
    g_id, g_code, host_id, host_token, _, _ = await gm.create_game("Alice")

    # Disconnect Alice
    await gm.handle_disconnect(g_id, host_id)
    game = gm.get_game(g_id)
    assert game.players[host_id].is_connected is False

    # Attempt reconnect with wrong token
    ok, err, _ = await gm.handle_reconnect(g_id, host_id, "wrong_token")
    assert ok is False
    assert "Invalid session" in (err or "")

    # Reconnect with valid token
    ok, err, player = await gm.handle_reconnect(g_id, host_id, host_token)
    assert ok is True
    assert player.is_connected is True
    assert game.players[host_id].is_connected is True
