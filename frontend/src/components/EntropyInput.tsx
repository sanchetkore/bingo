import React, { useState } from 'react';
import { Sparkles, Dices, Check, Shield } from 'lucide-react';

interface EntropyInputProps {
  initialEntropy?: string;
  onSaveEntropy: (entropy: string) => void;
  disabled?: boolean;
}

export const EntropyInput: React.FC<EntropyInputProps> = ({
  initialEntropy = '',
  onSaveEntropy,
  disabled = false,
}) => {
  const [entropy, setEntropy] = useState(initialEntropy);
  const [isSaved, setIsSaved] = useState(false);

  const generateRandomString = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    const randomValues = new Uint32Array(12);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < 12; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    setEntropy(result);
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entropy.trim()) return;
    onSaveEntropy(entropy.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 md:p-5 shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Make Your Card Random</h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fair Seed Entropy</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        Enter custom characters or roll the dice. These characters are cryptographically combined with the server seed to generate your card.
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={entropy}
            onChange={(e) => {
              setEntropy(e.target.value);
              setIsSaved(false);
            }}
            placeholder="e.g. X7@kP91!zQ"
            disabled={disabled}
            maxLength={32}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono tracking-wider placeholder:text-slate-600 outline-none transition"
          />
          <button
            type="button"
            onClick={generateRandomString}
            disabled={disabled}
            className="p-2.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 hover:text-white rounded-xl border border-slate-600 transition"
            title="Generate Random Characters"
            aria-label="Randomize Entropy"
          >
            <Dices className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={disabled || !entropy.trim()}
          className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
            isSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Entropy Applied!</span>
            </>
          ) : (
            <span>Apply Entropy</span>
          )}
        </button>
      </form>
    </div>
  );
};
