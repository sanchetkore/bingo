import React, { useState, useMemo } from 'react';
import { Lock } from 'lucide-react';
import { getColumnLetterForNumber, BINGO_COLUMNS } from '../game/card';

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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Number Selector (1–75)
          </span>
          {!isMyTurn && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Lock className="w-3 h-3" /> Locked
            </span>
          )}
        </div>

        {/* Column Filter Tabs for quick mobile navigation */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedColumnFilter('ALL')}
            className={`px-2 py-1 rounded-lg font-bold transition ${
              selectedColumnFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL
          </button>
          {BINGO_COLUMNS.map((col) => (
            <button
              key={col}
              onClick={() => setSelectedColumnFilter(col)}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                selectedColumnFilter === col
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Numbers */}
      <div
        className={`grid gap-1.5 sm:gap-2 transition-all ${
          selectedColumnFilter === 'ALL'
            ? 'grid-cols-5 sm:grid-cols-10 md:grid-cols-15'
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
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs sm:text-sm font-bold border transition duration-150 select-none ${
                isCalled
                  ? 'bg-slate-950 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed line-through'
                  : canClick
                  ? 'bg-slate-800 hover:bg-emerald-500 hover:border-emerald-400 hover:text-slate-950 border-slate-700 text-slate-100 shadow active:scale-90 cursor-pointer'
                  : 'bg-slate-800/40 border-slate-800/60 text-slate-500 cursor-not-allowed'
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
