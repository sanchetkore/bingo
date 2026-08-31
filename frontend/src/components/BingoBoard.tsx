import React, { useMemo } from 'react';
import { Star, Trophy, Sparkles, Check } from 'lucide-react';
import { BingoCard, WinningPattern } from '../game/types';
import { detectWinningPatterns, isWinningCell } from '../game/bingo';

interface BingoBoardProps {
  card: BingoCard | null;
  calledNumbers: number[];
  onClaimBingo: (pattern?: WinningPattern) => void;
  disabled?: boolean;
  winnerDeclared?: boolean;
  isMyTurn?: boolean;
  onSelectNumber?: (num: number) => void;
}

export const BingoBoard: React.FC<BingoBoardProps> = ({
  card,
  calledNumbers,
  onClaimBingo,
  disabled = false,
  winnerDeclared = false,
  isMyTurn = false,
  onSelectNumber,
}) => {
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);

  const detectedPatterns = useMemo(() => {
    if (!card) return [];
    return detectWinningPatterns(card, calledSet);
  }, [card, calledSet]);

  const hasBingoAvailable = detectedPatterns.length > 0 && !winnerDeclared;

  if (!card) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-semibold">Generating your secure Bingo card...</p>
      </div>
    );
  }

  const columnHeaders = [
    { letter: 'B', bg: 'bg-red-500/20 text-red-400 border-red-500/40' },
    { letter: 'I', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    { letter: 'N', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    { letter: 'G', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { letter: 'O', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Local Bingo Alert Banner & Action */}
      {hasBingoAvailable && (
        <div className="w-full mb-3 p-3.5 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border-2 border-emerald-400/80 rounded-2xl shadow-2xl animate-pulse backdrop-blur flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 rounded-xl text-slate-950">
              <Trophy className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> BINGO AVAILABLE!
              </div>
              <div className="text-xs text-slate-300">You have completed a winning line!</div>
            </div>
          </div>

          <button
            onClick={() => onClaimBingo(detectedPatterns[0])}
            disabled={disabled}
            className="py-2 px-4 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 transition border border-emerald-300"
          >
            CLAIM!
          </button>
        </div>
      )}

      {/* Bingo Card Container */}
      <div className="w-full bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur">
        {/* Column Header B-I-N-G-O */}
        <div className="grid grid-cols-5 gap-1.5 md:gap-2 mb-2">
          {columnHeaders.map((col) => (
            <div
              key={col.letter}
              className={`py-2 md:py-2.5 rounded-xl border text-center font-black text-lg md:text-xl shadow-sm ${col.bg}`}
            >
              {col.letter}
            </div>
          ))}
        </div>

        {/* 5x5 Grid */}
        <div className="grid grid-cols-5 gap-1.5 md:gap-2">
          {card.grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isFree = cell.value === 'FREE';
              const isMarked = isFree || (typeof cell.value === 'number' && calledSet.has(cell.value));
              const isWinning = isWinningCell(rIdx, cIdx, detectedPatterns);
              const isSelectable = !disabled && !winnerDeclared && isMyTurn && !isMarked && typeof cell.value === 'number';

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => {
                    if (isSelectable && onSelectNumber) {
                      onSelectNumber(cell.value as number);
                    }
                  }}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl md:rounded-3xl font-black text-base md:text-xl transition-all duration-300 border select-none ${
                    isWinning
                      ? 'bg-gradient-to-br from-amber-400/30 to-emerald-500/40 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20'
                      : isMarked
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-inner'
                      : isSelectable
                      ? 'bg-slate-800 border-emerald-500/50 text-white cursor-pointer hover:bg-emerald-900/40 hover:border-emerald-400 hover:scale-[1.02] shadow-emerald-500/20 shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 shadow'
                  }`}
                >
                  {isFree ? (
                    <div className="flex flex-col items-center justify-center">
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-amber-400 animate-pulse" />
                      <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-extrabold text-amber-300 mt-0.5">
                        FREE
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="tracking-tight">{cell.value}</span>
                      {isMarked && (
                        <span className="absolute bottom-1 right-1.5 text-emerald-400">
                          <Check className="w-3 h-3 md:w-3.5 md:h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
