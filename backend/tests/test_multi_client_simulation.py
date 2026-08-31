import asyncio
import json
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.game.manager import game_manager
from app.websocket.schemas import ClientMessageType, ServerMessageType


@pytest.mark.asyncio
async def test_full_multi_client_flow():
    """
    Simulates complete game flow with 3 players:
    - Host creates game
    - Player 2 & Player 3 join
    - All contribute entropy
    - Host starts game
    - Cards generated & delivered
    - Turns rotate and players call numbers
    - Player claims Bingo and is server-verified as winner
    - Post-game audit verified
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json() == {"status": "ok"}

        # 2. Host creates game
        create_res = await client.post("/api/games", json={"host_name": "Sanchet"})
        assert create_res.status_code == 201
        create_data = create_res.json()
        game_id = create_data["game_id"]
        game_code = create_data["game_code"]
        host_id = create_data["host_player_id"]
        host_token = create_data["session_token"]
        assert len(game_code) == 6

        # 3. Player 2 joins
        p2_res = await client.post(f"/api/games/{game_code}/join", json={"player_name": "Rahul"})
        assert p2_res.status_code == 200
        p2_data = p2_res.json()
        p2_id = p2_data["player_id"]
        p2_token = p2_data["session_token"]

        # 4. Player 3 joins
        p3_res = await client.post(f"/api/games/{game_code}/join", json={"player_name": "Priya"})
        assert p3_res.status_code == 200
        p3_data = p3_res.json()
        p3_id = p3_data["player_id"]
        p3_token = p3_data["session_token"]

        # 5. Check lobby state via REST
        lobby_res = await client.get(f"/api/games/{game_code}")
        assert lobby_res.status_code == 200
        lobby_data = lobby_res.json()
        assert len(lobby_data["players"]) == 3
        assert lobby_data["status"] == "LOBBY"

        # 6. Players submit entropy
        ok, _ = await game_manager.set_player_entropy(game_id, host_id, "SanchetEntropy_99")
        assert ok is True
        ok, _ = await game_manager.set_player_entropy(game_id, p2_id, "RahulEntropy_88")
        assert ok is True
        ok, _ = await game_manager.set_player_entropy(game_id, p3_id, "PriyaEntropy_77")
        assert ok is True

        # 7. Host starts game
        ok, err, cards = await game_manager.start_game(game_id, host_id)
        assert ok is True
        assert len(cards) == 3
        assert host_id in cards and p2_id in cards and p3_id in cards

        # 8. Verify unique cards for each player
        c_host = cards[host_id].canonical_repr
        c_p2 = cards[p2_id].canonical_repr
        c_p3 = cards[p3_id].canonical_repr
        assert c_host != c_p2 and c_p2 != c_p3

        # 9. Verify turns and number selection
        game = game_manager.get_game(game_id)
        assert game.status == "ACTIVE"

        # Simulate calling all numbers for Player 2's top row (row 0)
        p2_row0_numbers = [cards[p2_id].grid[0][c].value for c in range(5)]

        for num in p2_row0_numbers:
            curr_turn = game.current_turn_player_id
            ok, err, called_num, next_turn = await game_manager.select_number(game_id, curr_turn, num)
            assert ok is True
            assert called_num == num

        # 10. Player 2 claims Bingo
        from app.game.models import WinningPattern, WinningPatternType
        pattern = WinningPattern(type=WinningPatternType.ROW, index=0)
        ok, err, winner = await game_manager.claim_bingo(game_id, p2_id, pattern)
        assert ok is True
        assert winner.player_id == p2_id
        assert winner.name == "Rahul"
        assert game.status == "FINISHED"

        # 11. Cryptographic audit verification via REST
        audit_res = await client.get(f"/api/games/{game_id}/audit")
        assert audit_res.status_code == 200
        audit_data = audit_res.json()
        assert audit_data["winner"]["player_id"] == p2_id
        assert len(audit_data["players"]) == 3
        for p in audit_data["players"]:
            assert p["is_card_reproduced_identically"] is True
            assert p["is_commitment_valid"] is True
