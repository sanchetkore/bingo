import React, { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { BINGO_COLUMNS, getColumnLetterForNumber } from '../game/card';

interface NumberGridProps {
  calledNumbers: number[];
  isMyTurn: boolean;
  onSelectNumber: (num: number) => void;
  disabled?: boolean;
}

export const NumberGrid: React.FC<NumberGridProps> = ({
  calledNumbers,
  isMyTurn,
  onSelectNumber,
  disabled = false,
}) => {
  const [selectedColumnFilter, setSelectedColumnFilter] = useState<'ALL' | 'B' | 'I' | 'N' | 'G' | 'O'>('ALL');
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);
  const allNumbers = useMemo(() => Array.from({ length: 75 }, (_, i) => i + 1), []);

  const filteredNumbers = useMemo(() => {
    if (selectedColumnFilter === 'ALL') return allNumbers;
    return allNumbers.filter((n) => getColumnLetterForNumber(n) === selectedColumnFilter);
  }, [allNumbers, selectedColumnFilter]);

  const handleNumberClick = (num: number) => {
    if (!isMyTurn || disabled || calledSet.has(num)) return;
    onSelectNumber(num);
  };

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="fine-label text-stone-300">Number board</span>
          {!isMyTurn && (
            <span className="flex items-center gap-1 text-[11px] text-amber-200 bg-amber-300/10 px-2 py-0.5 rounded-full border border-amber-300/20">
              <Lock className="w-3 h-3" /> Locked
            </span>
          )}
        </div>

        <div className="flex bg-stone-950/70 p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setSelectedColumnFilter('ALL')}
            className={`px-2 py-1 rounded-md font-bold transition ${
              selectedColumnFilter === 'ALL'
                ? 'bg-white/10 text-white shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            ALL
          </button>
          {BINGO_COLUMNS.map((col) => (
            <button
              key={col}
              onClick={() => setSelectedColumnFilter(col)}
              className={`px-2 py-1 rounded-md font-bold transition ${
                selectedColumnFilter === col
                  ? 'bg-amber-300 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid gap-1.5 sm:gap-2 transition-all ${
          selectedColumnFilter === 'ALL'
            ? 'grid-cols-5 sm:grid-cols-10 md:[grid-template-columns:repeat(15,minmax(0,1fr))]'
            : 'grid-cols-5'
        }`}
      >
        {filteredNumbers.map((num) => {
          const isCalled = calledSet.has(num);
          const canClick = isMyTurn && !isCalled && !disabled;

          return (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              disabled={!canClick}
              className={`tile-3d relative aspect-square flex items-center justify-center rounded-md text-xs sm:text-sm font-bold border transition duration-150 select-none ${
                isCalled
                  ? 'bg-stone-950/80 border-stone-900 text-stone-600 opacity-45 cursor-not-allowed line-through'
                  : canClick
                  ? 'bg-white/[0.08] hover:bg-amber-300 hover:border-amber-200 hover:text-stone-950 border-white/10 text-stone-100 cursor-pointer'
                  : 'bg-white/[0.035] border-white/10 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>{num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
