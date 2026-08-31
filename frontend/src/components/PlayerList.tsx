import React from 'react';
import { Crown, User, CheckCircle } from 'lucide-react';
import { PlayerPublic } from '../game/types';

interface PlayerListProps {
  players: PlayerPublic[];
  currentTurnPlayerId?: string | null;
  myPlayerId?: string | null;
  showEntropyStatus?: boolean;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentTurnPlayerId,
  myPlayerId,
  showEntropyStatus = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Players ({players.length})
        </h3>
      </div>

      <div className="space-y-2">
        {players.map((p) => {
          const isMe = p.player_id === myPlayerId;
          const isTurn = p.player_id === currentTurnPlayerId;

          return (
            <div
              key={p.player_id}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                isTurn
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      p.is_host
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {p.is_host ? <Crown className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Connection indicator */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      p.is_connected ? 'bg-emerald-400' : 'bg-red-500'
                    }`}
                    title={p.is_connected ? 'Connected' : 'Disconnected'}
                  />
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5 text-sm font-semibold truncate">
                    <span className="truncate text-white">{p.name}</span>
                    {isMe && <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-normal shrink-0">You</span>}
                  </div>
                  {isTurn && (
                    <span className="text-[10px] text-emerald-400 font-bold block animate-pulse">
                      Playing Turn...
                    </span>
                  )}
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex items-center gap-1.5 shrink-0">
                {showEntropyStatus && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                      p.has_entropy
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {p.has_entropy ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Ready</span>
                      </>
                    ) : (
                      <span>Waiting</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
