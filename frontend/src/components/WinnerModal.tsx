import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ShieldCheck, RotateCcw } from 'lucide-react';
import { WinnerInfo, PlayerPublic } from '../game/types';

interface WinnerModalProps {
  winner: WinnerInfo | null;
  myPlayerId: string | null;
  players: PlayerPublic[];
  calledCount: number;
  onPlayAgain: () => void;
  onOpenAudit: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  myPlayerId,
  players,
  calledCount,
  onPlayAgain,
  onOpenAudit,
}) => {
  if (!winner) return null;

  const isMe = winner.player_id === myPlayerId;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback silently if confetti encounters environment issues
      }
    }
  }, []);

  const formatPattern = () => {
    const p = winner.winning_pattern;
    if (p.type === 'row') return `Row ${p.index + 1}`;
    if (p.type === 'column') return `Column ${['B', 'I', 'N', 'G', 'O'][p.index]}`;
    if (p.type === 'diagonal') return p.index === 0 ? 'Top-Left Diagonal (\\)' : 'Top-Right Diagonal (/)';
    return 'Winning Line';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-500/60 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative text-center">
        {/* Trophy Animation */}
        <div className="relative inline-flex mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-10 h-10 text-slate-950 animate-bounce" />
          </div>
          <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-spin" />
        </div>

        {/* Title */}
        <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-1">
          {isMe ? 'VICTORY!' : 'GAME OVER'}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
          {isMe ? '🎉 YOU WON BINGO!' : `🏆 ${winner.name} WON!`}
        </h2>

        <p className="text-xs text-slate-300 mb-6">
          {isMe
            ? 'Congratulations! Your Bingo claim was server-verified as the winning card.'
            : `Better luck next round! ${winner.name} achieved the first verified Bingo.`}
        </p>

        {/* Win Details Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Winning Pattern:</span>
            <span className="font-bold text-white uppercase">{formatPattern()}</span>
          </div>
          {winner.winning_number && (
            <div className="flex justify-between items-center text-slate-400">
              <span>Winning Call:</span>
              <span className="font-bold text-emerald-400 font-mono">Ball #{winner.winning_number}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-slate-400">
            <span>Total Calls:</span>
            <span className="font-bold text-slate-200">{calledCount}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Total Players:</span>
            <span className="font-bold text-slate-200">{players.length}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onOpenAudit}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-2xl text-xs transition border border-slate-700 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify Cryptographic Randomness</span>
          </button>
        </div>
      </div>
    </div>
  );
};
