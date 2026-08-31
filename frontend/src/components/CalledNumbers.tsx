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
        return '[--ball-color:#e65d4f] text-white';
      case 'I':
        return '[--ball-color:#e88643] text-white';
      case 'N':
        return '[--ball-color:#d6a84f] text-stone-950';
      case 'G':
        return '[--ball-color:#41b883] text-white';
      case 'O':
        return '[--ball-color:#45b7d1] text-white';
      default:
        return '[--ball-color:#78716c] text-white';
    }
  };

  const lastLetter = lastNumber ? getColumnLetterForNumber(lastNumber) : null;
  const recentNumbers = [...calledNumbers].reverse().slice(0, 5);

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <span className="fine-label block">Called balls</span>
          <span className="text-xs text-stone-500 font-medium">
            {calledNumbers.length} of 75 called
          </span>
        </div>

        {lastNumber && lastLetter && (
          <div className="flex items-center gap-2.5 bg-stone-950/[0.65] border border-white/10 rounded-lg px-3.5 py-1.5 shadow-inner">
            <div className="text-right">
              <span className="fine-label block">Last</span>
              {latestCallerName && (
                <span className="text-[10px] text-cyan-300 truncate max-w-[80px] block">
                  by {latestCallerName}
                </span>
              )}
            </div>
            <div
              className={`ball-3d w-11 h-11 flex flex-col items-center justify-center font-black animate-stamp ${getLetterColor(
                lastLetter
              )}`}
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
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                  isLatest
                    ? 'bg-amber-300/[0.18] border-amber-300/50 text-amber-200 ring-1 ring-amber-300/30'
                    : 'bg-white/[0.055] border-white/10 text-stone-300'
                }`}
              >
                <span className="text-[10px] text-stone-400 font-mono">{letter}</span>
                <span>{num}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-2 text-xs text-stone-500">
          No calls yet.
        </div>
      )}
    </div>
  );
};
