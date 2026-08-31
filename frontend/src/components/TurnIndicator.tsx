import React from 'react';
import { Sparkles, Clock, UserCheck } from 'lucide-react';
import { PlayerPublic } from '../game/types';

interface TurnIndicatorProps {
  currentTurnPlayerId?: string | null;
  myPlayerId?: string | null;
  players: PlayerPublic[];
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentTurnPlayerId,
  myPlayerId,
  players,
}) => {
  const isMyTurn = currentTurnPlayerId && myPlayerId && currentTurnPlayerId === myPlayerId;
  const currentTurnPlayer = players.find((p) => p.player_id === currentTurnPlayerId);
  const currentName = currentTurnPlayer?.name || 'Waiting...';

  if (!currentTurnPlayerId) {
    return null;
  }

  return (
    <div
      className={`w-full rounded-2xl p-3.5 md:p-4 text-center transition-all duration-300 shadow-xl border ${
        isMyTurn
          ? 'bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 border-emerald-500/60 text-emerald-100 ring-2 ring-emerald-500/30'
          : 'bg-slate-900/80 border-slate-800 text-slate-300'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isMyTurn ? (
          <>
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <span className="text-base md:text-lg font-black tracking-wide text-emerald-300 uppercase flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse-fast" />
              YOUR TURN
            </span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Current Turn:</span>
            <span className="text-sm font-bold text-white flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              {currentName}
            </span>
          </>
        )}
      </div>

      <p className="text-xs mt-1 text-slate-400">
        {isMyTurn ? 'Select any uncalled number from the number grid below.' : `Waiting for ${currentName} to choose a number...`}
      </p>
    </div>
  );
};
