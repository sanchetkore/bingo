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
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
            B
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Game Room</div>
            <div className="text-xs font-black text-white font-mono tracking-wider">{gameState.game_code}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlayersDrawer(!showPlayersDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{gameState.players.length} Players</span>
            {showPlayersDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenRules}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
            title="Game Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onLeaveGame}
            className="p-1.5 bg-red-900/40 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition border border-red-900/50 hover:border-red-500 ml-1"
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
        isMyTurn={isMyTurn && !isFinished}
        onSelectNumber={onSelectNumber}
      />

      {/* Footer / Card Commitment info */}
      {cardCommitmentHash && (
        <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Card Commitment:</span>
          <span className="font-mono text-slate-400" title={cardCommitmentHash}>
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
