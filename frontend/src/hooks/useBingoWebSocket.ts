import { useState, useEffect, useRef, useCallback } from 'react';
import { BingoCard, GameStatePublic, WinningPattern } from '../game/types';
import { sounds } from '../utils/sound';

interface UseBingoWebSocketOptions {
  gameId: string | null;
  playerId: string | null;
  sessionToken: string | null;
}

export function useBingoWebSocket({ gameId, playerId, sessionToken }: UseBingoWebSocketOptions) {
  const [gameState, setGameState] = useState<GameStatePublic | null>(null);
  const [playerCard, setPlayerCard] = useState<BingoCard | null>(null);
  const [cardCommitmentHash, setCardCommitmentHash] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestCalledInfo, setLatestCalledInfo] = useState<{
    number: number;
    selectedByName: string;
  } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 10;

  const clearTimers = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  const getWsUrl = useCallback((gId: string) => {
    // Check environment variable first
    const envWs = import.meta.env.VITE_WS_URL;
    if (envWs) {
      return `${envWs.replace(/\/$/, '')}/ws/${gId}`;
    }
    // Fallback to window.location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port;
    const portStr = port ? `:${port}` : '';
    return `${protocol}//${host}${portStr}/ws/${gId}`;
  }, []);

  const connect = useCallback(() => {
    if (!gameId || !playerId || !sessionToken) return;

    clearTimers();
    const wsUrl = getWsUrl(gameId);

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        setErrorMessage(null);
        reconnectAttemptsRef.current = 0;

        // Send join_game authentication message
        ws.send(
          JSON.stringify({
            type: 'join_game',
            player_id: playerId,
            session_token: sessionToken,
          })
        );

        // Start ping heartbeat every 15s
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleServerMessage(msg);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        clearTimers();

        // Attempt reconnection unless clean shutdown
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          setIsReconnecting(true);
          const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 10000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
      };
    } catch (err) {
      console.error('WebSocket connection initialization error:', err);
    }
  }, [gameId, playerId, sessionToken, getWsUrl]);

  const handleServerMessage = (msg: any) => {
    switch (msg.type) {
      case 'game_state':
        setGameState(msg.state);
        break;

      case 'card_assigned':
        setPlayerCard(msg.card);
        setCardCommitmentHash(msg.commitment_hash);
        break;

      case 'player_joined':
        setGameState((prev) => {
          if (!prev) return prev;
          const exists = prev.players.some((p) => p.player_id === msg.player.player_id);
          const updatedPlayers = exists
            ? prev.players.map((p) => (p.player_id === msg.player.player_id ? msg.player : p))
            : [...prev.players, msg.player];
          return { ...prev, players: updatedPlayers };
        });
        break;

      case 'entropy_updated':
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.player_id === msg.player_id ? { ...p, has_entropy: msg.has_entropy } : p
            ),
          };
        });
        break;

      case 'game_started':
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'ACTIVE',
            current_turn: msg.current_turn,
            players: msg.players,
          };
        });
        if (msg.current_turn === playerId) {
          sounds.playTurnNotification();
        }
        break;

      case 'number_called':
        setLatestCalledInfo({
          number: msg.number,
          selectedByName: msg.selected_by_name,
        });
        sounds.playPop();

        setGameState((prev) => {
          if (!prev) return prev;
          const nextNumbers = prev.called_numbers.includes(msg.number)
            ? prev.called_numbers
            : [...prev.called_numbers, msg.number];
          return {
            ...prev,
            called_numbers: nextNumbers,
            last_number: msg.number,
            current_turn: msg.next_turn,
          };
        });

        if (msg.next_turn === playerId) {
          setTimeout(() => sounds.playTurnNotification(), 200);
        }
        break;

      case 'turn_changed':
        setGameState((prev) => {
          if (!prev) return prev;
          return { ...prev, current_turn: msg.current_turn };
        });
        if (msg.current_turn === playerId) {
          sounds.playTurnNotification();
        }
        break;

      case 'bingo_invalid':
        setErrorMessage(msg.message || 'Bingo claim could not be verified by server.');
        setTimeout(() => setErrorMessage(null), 5000);
        break;

      case 'game_won':
        sounds.playBingoFanfare();
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'FINISHED',
            winner: msg.winner,
          };
        });
        break;

      case 'player_disconnected':
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.player_id === msg.player_id ? { ...p, is_connected: false } : p
            ),
          };
        });
        break;

      case 'player_reconnected':
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.player_id === msg.player_id ? { ...p, is_connected: true } : p
            ),
          };
        });
        break;

      case 'error':
        setErrorMessage(msg.message || 'An error occurred.');
        setTimeout(() => setErrorMessage(null), 5000);
        break;

      case 'pong':
        // Heartbeat confirmed
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    connect();
    return () => {
      clearTimers();
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
        socketRef.current = null;
      }
    };
  }, [connect]);

  // Client actions
  const send = useCallback((data: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    setErrorMessage('Connection lost. Please wait while reconnecting...');
    return false;
  }, []);

  const setEntropy = useCallback(
    (entropy: string) => {
      if (!playerId) return;
      send({
        type: 'set_entropy',
        player_id: playerId,
        entropy,
      });
    },
    [playerId, send]
  );

  const startGame = useCallback(() => {
    if (!playerId) return;
    send({
      type: 'start_game',
      player_id: playerId,
    });
  }, [playerId, send]);

  const selectNumber = useCallback(
    (number: number) => {
      if (!playerId) return;
      send({
        type: 'select_number',
        player_id: playerId,
        number,
      });
    },
    [playerId, send]
  );

  const claimBingo = useCallback(
    (pattern?: WinningPattern) => {
      if (!playerId) return;
      send({
        type: 'bingo_claim',
        player_id: playerId,
        winning_pattern: pattern || null,
      });
    },
    [playerId, send]
  );

  return {
    gameState,
    playerCard,
    cardCommitmentHash,
    isConnected,
    isReconnecting,
    errorMessage,
    latestCalledInfo,
    setEntropy,
    startGame,
    selectNumber,
    claimBingo,
    clearError: () => setErrorMessage(null),
  };
}
