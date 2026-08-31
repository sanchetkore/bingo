from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from app.game.manager import game_manager
from app.game.models import GameStatePublic

router = APIRouter()


class CreateGameRequest(BaseModel):
    host_name: str = Field(default="Host", max_length=30)


class CreateGameResponse(BaseModel):
    game_id: str
    game_code: str
    host_player_id: str
    session_token: str
    server_seed_hash: str


class JoinGameRequest(BaseModel):
    player_name: str = Field(default="Player", max_length=30)


class JoinGameResponse(BaseModel):
    game_id: str
    player_id: str
    session_token: str


class HealthResponse(BaseModel):
    status: str


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return HealthResponse(status="ok")


@router.post("/api/games", response_model=CreateGameResponse, status_code=status.HTTP_201_CREATED, tags=["Games"])
async def create_game(req: CreateGameRequest):
    game_id, game_code, host_player_id, session_token, server_seed_hash = await game_manager.create_game(
        host_name=req.host_name
    )
    return CreateGameResponse(
        game_id=game_id,
        game_code=game_code,
        host_player_id=host_player_id,
        session_token=session_token,
        server_seed_hash=server_seed_hash,
    )


@router.get("/api/games/{game_code}", response_model=GameStatePublic, tags=["Games"])
async def get_game_by_code(game_code: str):
    game = game_manager.get_game_by_code(game_code)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found with this code.",
        )
    return game.get_public_state()


@router.post("/api/games/{game_code}/join", response_model=JoinGameResponse, tags=["Games"])
async def join_game(game_code: str, req: JoinGameRequest):
    game_id, player_id, session_token, err = await game_manager.join_game(
        game_code=game_code, player_name=req.player_name
    )
    if err or not game_id or not player_id or not session_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err or "Could not join game.",
        )
    return JoinGameResponse(
        game_id=game_id,
        player_id=player_id,
        session_token=session_token,
    )


@router.get("/api/games/{game_id}/audit", tags=["Games"])
async def audit_game_randomness(game_id: str):
    success, err, audit_data = await game_manager.verify_game_audit(game_id)
    if not success or not audit_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err or "Audit unavailable.",
        )
    return audit_data
