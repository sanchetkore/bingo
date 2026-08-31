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
  const [daubedNumbers, setDaubedNumbers] = React.useState<Set<number>>(new Set());

  // Auto-daub numbers that are no longer in calledSet (e.g., if a new game starts), 
  // but wait, calledSet only grows.
  
  const detectedPatterns = useMemo(() => {
    if (!card) return [];
    return detectWinningPatterns(card, daubedNumbers);
  }, [card, daubedNumbers]);

  const hasBingoAvailable = detectedPatterns.length >= 5 && !winnerDeclared;

  if (!card) {
    return (
      <div className="panel p-8 text-center text-stone-400">
        <div className="animate-spin w-8 h-8 border-2 border-amber-300 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-semibold">Dealing your card...</p>
      </div>
    );
  }

  const linesCount = detectedPatterns.length;
  
  const columnHeaders = [
    { letter: 'B', index: 1, activeBg: 'bg-red-500 text-red-50 border-red-400 ring-2 ring-red-400/40 shadow-[0_0_15px_rgba(239,68,68,0.5)]' },
    { letter: 'I', index: 2, activeBg: 'bg-orange-500 text-orange-50 border-orange-400 ring-2 ring-orange-400/40 shadow-[0_0_15px_rgba(249,115,22,0.5)]' },
    { letter: 'N', index: 3, activeBg: 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-300/40 shadow-[0_0_15px_rgba(251,191,36,0.5)]' },
    { letter: 'G', index: 4, activeBg: 'bg-emerald-500 text-emerald-50 border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
    { letter: 'O', index: 5, activeBg: 'bg-cyan-500 text-cyan-50 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.5)]' },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Local Bingo Alert Banner & Action */}
      {hasBingoAvailable && (
        <div className="panel w-full mb-3 p-3.5 border-amber-300/70 animate-pulse flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="ball-3d h-11 w-11 flex items-center justify-center text-stone-950 [--ball-color:#d6a84f]">
              <Trophy className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Bingo ready
              </div>
              <div className="text-xs text-stone-300">You have 5 winning lines!</div>
            </div>
          </div>

          <button
            onClick={() => onClaimBingo(detectedPatterns[0])}
            disabled={disabled}
            className="button-primary !py-2 !px-4 text-sm"
          >
            Claim
          </button>
        </div>
      )}

      {/* Bingo Card Container */}
      <div className="surface-3d panel w-full p-3 md:p-4">
        {/* Column Header B-I-N-G-O */}
        <div className="grid grid-cols-5 gap-1.5 md:gap-2 mb-2">
          {columnHeaders.map((col) => {
            const isActive = linesCount >= col.index;
            const inactiveBg = 'bg-white/[0.04] text-white/40 border-white/10';
            
            return (
              <div
                key={col.letter}
                className={`py-2 md:py-2.5 rounded-md border text-center font-black text-lg md:text-xl transition-all duration-500 ${
                  isActive ? col.activeBg : inactiveBg
                }`}
              >
                {col.letter}
              </div>
            );
          })}
        </div>

        {/* 5x5 Grid */}
        <div className="grid grid-cols-5 gap-1.5 md:gap-2">
          {card.grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isFree = cell.value === 'FREE';
              // isMarked is only true if the player MANUALLY daubed it
              const isMarked = isFree || (typeof cell.value === 'number' && daubedNumbers.has(cell.value));
              const isWinning = isWinningCell(rIdx, cIdx, detectedPatterns);
              
              // In player-turn mode, a cell is selectable if it's my turn and the number hasn't been called by anyone yet.
              const isTurnSelectable = !disabled && !winnerDeclared && isMyTurn && typeof cell.value === 'number' && !calledSet.has(cell.value);
              
              // A cell is daubable if it has been called but not daubed yet
              const isDaubable = !disabled && !winnerDeclared && typeof cell.value === 'number' && calledSet.has(cell.value) && !isMarked;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => {
                    if (cell.value === 'FREE') return;
                    
                    if (isTurnSelectable && onSelectNumber) {
                      onSelectNumber(cell.value as number);
                      setDaubedNumbers(prev => new Set(prev).add(cell.value as number));
                    } else if (isDaubable) {
                      // Toggle daub manually
                      setDaubedNumbers(prev => {
                        const next = new Set(prev);
                        if (next.has(cell.value as number)) {
                          next.delete(cell.value as number);
                        } else {
                          next.add(cell.value as number);
                        }
                        return next;
                      });
                    }
                  }}
                  className={`tile-3d relative aspect-square flex flex-col items-center justify-center rounded-md font-black text-base md:text-xl transition-all duration-300 border select-none ${
                    isWinning
                      ? 'bg-amber-300/25 border-amber-300 text-amber-100 ring-2 ring-amber-300/40'
                      : isMarked
                      ? 'bg-emerald-950/60 border-emerald-300/40 text-emerald-200 shadow-inner'
                      : isTurnSelectable
                      ? 'bg-white/[0.08] border-cyan-300/[0.45] text-white cursor-pointer hover:bg-cyan-400/[0.16] hover:border-cyan-200'
                      : isDaubable
                      ? 'bg-white/[0.06] border-white/10 text-stone-200 shadow cursor-pointer'
                      : 'bg-white/[0.06] border-white/10 text-stone-200 shadow'
                  }`}
                >
                  {isFree ? (
                    <div className="flex flex-col items-center justify-center">
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-300 fill-amber-300 animate-pulse" />
                      <span className="text-[9px] md:text-[10px] font-extrabold text-amber-200 mt-0.5">
                        FREE
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="tracking-tight">{cell.value}</span>
                      {isMarked && (
                        <span className="absolute bottom-1 right-1.5 text-emerald-300">
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
