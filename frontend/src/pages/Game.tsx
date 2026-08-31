import React, { useState } from 'react';
import { HelpCircle, Users, ShieldCheck, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { GameStatePublic, BingoCard, WinningPattern } from '../game/types';
import { TurnIndicator } from '../components/TurnIndicator';
import { CalledNumbers } from '../components/CalledNumbers';
import { BingoBoard } from '../components/BingoBoard';
import { PlayerList } from '../components/PlayerList';
import { WinnerModal } from '../components/WinnerModal';
import { VerifyModal } from '../components/VerifyModal';

interface GameProps {
  gameState: GameStatePublic;
  playerCard: BingoCard | null;
  cardCommitmentHash: string | null;
  myPlayerId: string;
  latestCallerName?: string | null;
  onSelectNumber: (num: number) => void;
  onClaimBingo: (pattern?: WinningPattern) => void;
  onPlayAgain: () => void;
  onOpenRules: () => void;
  onLeaveGame: () => void;
}

export const Game: React.FC<GameProps> = ({
  gameState,
  playerCard,
  cardCommitmentHash,
  myPlayerId,
  latestCallerName,
  onSelectNumber,
  onClaimBingo,
  onPlayAgain,
  onOpenRules,
  onLeaveGame,
}) => {
  const [showPlayersDrawer, setShowPlayersDrawer] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const isMyTurn = gameState.current_turn === myPlayerId;
  const isFinished = gameState.status === 'FINISHED';

  return (
    <div className="min-h-screen py-4 px-3 sm:px-4 max-w-2xl mx-auto space-y-4 pb-12">
      {/* Game Header */}
      <div className="panel flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="ball-3d w-9 h-9 text-stone-950 font-black flex items-center justify-center text-sm [--ball-color:#d6a84f]">
            B
          </div>
          <div>
            <div className="fine-label">Room</div>
            <div className="text-xs font-black text-white font-mono">{gameState.game_code}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlayersDrawer(!showPlayersDrawer)}
            className="button-secondary !py-1.5 !px-3 text-xs"
          >
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">{gameState.players.length} Players</span>
            {showPlayersDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenRules}
            className="button-secondary !p-2"
            title="Game Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onLeaveGame}
            className="button-secondary !p-2 text-red-200"
            title="Leave Game"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Players Collapsible Drawer */}
      {showPlayersDrawer && (
        <div className="animate-fadeIn">
          <PlayerList
            players={gameState.players}
            currentTurnPlayerId={gameState.current_turn}
            myPlayerId={myPlayerId}
          />
        </div>
      )}

      {/* Turn Indicator */}
      <TurnIndicator
        currentTurnPlayerId={gameState.current_turn}
        myPlayerId={myPlayerId}
        players={gameState.players}
        callMode={gameState.call_mode}
        drawSpeed={gameState.draw_speed}
      />

      {/* Called Numbers Tracker */}
      <CalledNumbers
        calledNumbers={gameState.called_numbers}
        lastNumber={gameState.last_number}
        latestCallerName={latestCallerName}
      />

      {/* Bingo Board */}
      <BingoBoard
        card={playerCard}
        calledNumbers={gameState.called_numbers}
        onClaimBingo={onClaimBingo}
        disabled={isFinished}
        winnerDeclared={isFinished}
        isMyTurn={gameState.call_mode === 'player' && isMyTurn && !isFinished}
        onSelectNumber={onSelectNumber}
      />

      {/* Footer / Card Commitment info */}
      {cardCommitmentHash && (
        <div className="text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>Card hash</span>
          <span className="font-mono text-stone-400" title={cardCommitmentHash}>
            {cardCommitmentHash.slice(0, 16)}...
          </span>
        </div>
      )}

      {/* Winner Modal */}
      {isFinished && gameState.winner && (
        <WinnerModal
          winner={gameState.winner}
          myPlayerId={myPlayerId}
          players={gameState.players}
          calledCount={gameState.called_numbers.length}
          onPlayAgain={onPlayAgain}
          onOpenAudit={() => setShowVerifyModal(true)}
        />
      )}

      {/* Verifiable Randomness Audit Modal */}
      <VerifyModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        gameId={gameState.game_id}
      />
    </div>
  );
};
