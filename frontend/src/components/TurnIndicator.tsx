import React from 'react';
import { Sparkles, Clock, UserCheck } from 'lucide-react';
import { PlayerPublic } from '../game/types';

interface TurnIndicatorProps {
  currentTurnPlayerId?: string | null;
  myPlayerId?: string | null;
  players: PlayerPublic[];
  callMode: 'player' | 'server';
  drawSpeed?: number;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentTurnPlayerId,
  myPlayerId,
  players,
  callMode,
  drawSpeed = 5,
}) => {
  if (callMode === 'server') {
    return (
      <div className="panel w-full p-3.5 md:p-4 text-center transition-all duration-300 border-cyan-400/30 text-cyan-100">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-cyan-300 animate-pulse" />
          <span className="text-base font-black text-cyan-200">Server Auto-Drawing</span>
        </div>
        <p className="text-xs mt-1 text-cyan-300/70">A random number is drawn every {drawSpeed} seconds.</p>
      </div>
    );
  }

  const isMyTurn = currentTurnPlayerId && myPlayerId && currentTurnPlayerId === myPlayerId;
  const currentTurnPlayer = players.find((p) => p.player_id === currentTurnPlayerId);
  const currentName = currentTurnPlayer?.name || 'Waiting...';

  if (!currentTurnPlayerId) {
    return null;
  }

  return (
    <div
      className={`panel w-full p-3.5 md:p-4 text-center transition-all duration-300 ${
        isMyTurn
          ? 'border-amber-300/60 text-amber-100 ring-2 ring-amber-300/20'
          : 'text-stone-300'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isMyTurn ? (
          <>
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
            </span>
            <span className="text-base md:text-lg font-black text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse-fast" />
              Your turn
            </span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="fine-label">Turn</span>
            <span className="text-sm font-bold text-white flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-cyan-300" />
              {currentName}
            </span>
          </>
        )}
      </div>

      <p className="text-xs mt-1 text-stone-400">
        {isMyTurn ? 'Choose an uncalled number.' : `Waiting for ${currentName}.`}
      </p>
    </div>
  );
};
