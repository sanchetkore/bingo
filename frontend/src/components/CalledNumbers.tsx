import React from 'react';
import { getColumnLetterForNumber } from '../game/card';

interface CalledNumbersProps {
  calledNumbers: number[];
  lastNumber?: number | null;
  latestCallerName?: string | null;
}

export const CalledNumbers: React.FC<CalledNumbersProps> = ({
  calledNumbers,
  lastNumber,
  latestCallerName,
}) => {
  const getLetterColor = (letter: string) => {
    switch (letter) {
      case 'B':
        return 'from-red-500 to-rose-600 border-red-400 text-white';
      case 'I':
        return 'from-amber-500 to-orange-600 border-amber-400 text-white';
      case 'N':
        return 'from-yellow-500 to-amber-500 border-yellow-300 text-slate-950';
      case 'G':
        return 'from-emerald-500 to-green-600 border-emerald-400 text-white';
      case 'O':
        return 'from-blue-500 to-indigo-600 border-blue-400 text-white';
      default:
        return 'from-slate-600 to-slate-700 border-slate-500 text-white';
    }
  };

  const lastLetter = lastNumber ? getColumnLetterForNumber(lastNumber) : null;
  const recentNumbers = [...calledNumbers].reverse();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Called Numbers</span>
          <span className="text-xs text-slate-500 font-medium">
            {calledNumbers.length} of 75 called
          </span>
        </div>

        {lastNumber && lastLetter && (
          <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl px-3.5 py-1.5 shadow-inner">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Ball</span>
              {latestCallerName && (
                <span className="text-[10px] text-emerald-400 truncate max-w-[80px] block">
                  by {latestCallerName}
                </span>
              )}
            </div>
            <div
              className={`w-11 h-11 rounded-full bg-gradient-to-br ${getLetterColor(
                lastLetter
              )} border-2 shadow-lg flex flex-col items-center justify-center font-black animate-stamp`}
            >
              <span className="text-[10px] leading-none opacity-90">{lastLetter}</span>
              <span className="text-base leading-none tracking-tight">{lastNumber}</span>
            </div>
          </div>
        )}
      </div>

      {/* Called History Pills */}
      {recentNumbers.length > 0 ? (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {recentNumbers.map((num, idx) => {
            const letter = getColumnLetterForNumber(num);
            const isLatest = idx === 0;
            return (
              <div
                key={num}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                  isLatest
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/80 border-slate-700/70 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-mono">{letter}</span>
                <span>{num}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-2 text-xs text-slate-500 italic">
          No numbers have been called yet.
        </div>
      )}
    </div>
  );
};
