import { useState, useEffect } from 'react';
import { useBingoWebSocket } from './hooks/useBingoWebSocket';
import { Home } from './pages/Home';
import { CreateGame } from './pages/CreateGame';
import { JoinGame } from './pages/JoinGame';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { ConnectionStatus } from './components/ConnectionStatus';
import { RulesModal } from './components/RulesModal';

type AppView = 'home' | 'create' | 'join';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Session state stored in sessionStorage (tab-scoped for multiplayer testing)
  const [gameId, setGameId] = useState<string | null>(() => sessionStorage.getItem('bingo_game_id'));
  const [gameCode, setGameCode] = useState<string | null>(() => sessionStorage.getItem('bingo_game_code'));
  const [playerId, setPlayerId] = useState<string | null>(() => sessionStorage.getItem('bingo_player_id'));
  const [sessionToken, setSessionToken] = useState<string | null>(() => sessionStorage.getItem('bingo_session_token'));

  // Check URL params on initial mount for direct invite link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam && !gameId) {
      setCurrentView('join');
    }
  }, [gameId]);

  const {
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
    clearError,
  } = useBingoWebSocket({ gameId, playerId, sessionToken });

  const saveSession = (gId: string, gCode: string, pId: string, sToken: string) => {
    sessionStorage.setItem('bingo_game_id', gId);
    sessionStorage.setItem('bingo_game_code', gCode);
    sessionStorage.setItem('bingo_player_id', pId);
    sessionStorage.setItem('bingo_session_token', sToken);
    setGameId(gId);
    setGameCode(gCode);
    setPlayerId(pId);
    setSessionToken(sToken);
  };

  const clearSession = () => {
    sessionStorage.removeItem('bingo_game_id');
    sessionStorage.removeItem('bingo_game_code');
    sessionStorage.removeItem('bingo_player_id');
    sessionStorage.removeItem('bingo_session_token');
    setGameId(null);
    setGameCode(null);
    setPlayerId(null);
    setSessionToken(null);
    setCurrentView('home');
  };

  const handleGameCreated = (gId: string, gCode: string, pId: string, sToken: string) => {
    saveSession(gId, gCode, pId, sToken);
  };

  const handleGameJoined = (gId: string, gCode: string, pId: string, sToken: string) => {
    saveSession(gId, gCode, pId, sToken);
  };

  // Render view
  let content = null;

  if (gameId && playerId && sessionToken) {
    if (!gameState || gameState.status === 'LOBBY') {
      content = (
        <Lobby
          gameState={
            gameState || {
              game_id: gameId,
              game_code: gameCode || '',
              status: 'LOBBY',
              host_player_id: '',
              players: [],
              called_numbers: [],
              server_seed_hash: '',
            }
          }
          myPlayerId={playerId}
          onStartGame={startGame}
          onSetEntropy={setEntropy}
          onOpenRules={() => setIsRulesOpen(true)}
          onLeaveLobby={clearSession}
        />
      );
    } else {
      content = (
        <Game
          gameState={gameState}
          playerCard={playerCard}
          cardCommitmentHash={cardCommitmentHash}
          myPlayerId={playerId}
          latestCallerName={latestCalledInfo?.selectedByName}
          onSelectNumber={selectNumber}
          onClaimBingo={claimBingo}
          onPlayAgain={clearSession}
          onOpenRules={() => setIsRulesOpen(true)}
          onLeaveGame={clearSession}
        />
      );
    }
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code') || '';

    if (currentView === 'create') {
      content = (
        <CreateGame
          onBack={() => setCurrentView('home')}
          onGameCreated={handleGameCreated}
        />
      );
    } else if (currentView === 'join') {
      content = (
        <JoinGame
          initialCode={codeParam}
          onBack={() => setCurrentView('home')}
          onGameJoined={handleGameJoined}
        />
      );
    } else {
      content = (
        <Home
          onNavigateCreate={() => setCurrentView('create')}
          onNavigateJoin={() => setCurrentView('join')}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      );
    }
  }

  return (
    <div className="table-shell min-h-screen text-stone-100 antialiased selection:bg-amber-300 selection:text-stone-950">
      {/* Global Connection / Sound / Error Widget */}
      <ConnectionStatus
        isConnected={isConnected}
        isReconnecting={isReconnecting}
        errorMessage={errorMessage}
        onClearError={clearError}
      />

      {/* Main Page View */}
      {content}

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}

export default App;
