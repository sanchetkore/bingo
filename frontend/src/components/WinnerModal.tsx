import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { PlayerPublic, WinnerInfo } from '../game/types';

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
  useEffect(() => {
    if (!winner) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti can fail in restricted browsers.
      }
    }
  }, [winner]);

  if (!winner) return null;

  const isMe = winner.player_id === myPlayerId;

  const formatPattern = () => {
    const p = winner.winning_pattern;
    if (p.type === 'row') return `Row ${p.index + 1}`;
    if (p.type === 'column') return `Column ${['B', 'I', 'N', 'G', 'O'][p.index]}`;
    if (p.type === 'diagonal') return p.index === 0 ? 'Main diagonal' : 'Anti diagonal';
    return 'Winning line';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="panel w-full max-w-md p-6 md:p-8 relative text-center border-amber-300/50">
        <div className="relative inline-flex mb-4">
          <div className="ball-3d w-20 h-20 flex items-center justify-center [--ball-color:#d6a84f]">
            <Trophy className="w-10 h-10 text-stone-950 animate-bounce" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-200 absolute -top-2 -right-2 animate-spin" />
        </div>

        <div className="fine-label text-amber-300 mb-1">
          {isMe ? 'You won' : 'Round complete'}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          {isMe ? 'Bingo confirmed' : `${winner.name} called Bingo`}
        </h2>

        <p className="text-sm text-stone-300 mb-6">
          {isMe ? 'Your claim checked out on the server.' : `${winner.name} had the first valid line.`}
        </p>

        <div className="panel-light p-4 mb-6 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-stone-400">
            <span>Line</span>
            <span className="font-bold text-white">{formatPattern()}</span>
          </div>
          {winner.winning_number && (
            <div className="flex justify-between items-center text-stone-400">
              <span>Last call</span>
              <span className="font-bold text-amber-300 font-mono">Ball {winner.winning_number}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-stone-400">
            <span>Calls</span>
            <span className="font-bold text-stone-200">{calledCount}</span>
          </div>
          <div className="flex justify-between items-center text-stone-400">
            <span>Players</span>
            <span className="font-bold text-stone-200">{players.length}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button onClick={onPlayAgain} className="button-primary w-full text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button onClick={onOpenAudit} className="button-secondary w-full !py-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Verify round</span>
          </button>
        </div>
      </div>
    </div>
  );
};
