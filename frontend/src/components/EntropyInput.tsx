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
    <div className="panel-light p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-300/15 border border-amber-300/30 rounded-md text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Card seed</h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-stone-400">
          <Shield className="w-3.5 h-3.5 text-emerald-300" />
          <span>Optional</span>
        </div>
      </div>

      <p className="text-xs text-stone-400 mb-3 leading-relaxed">
        Add a few private characters or roll a seed. The server mixes it into your card.
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
            className="flex-1 min-w-0 bg-stone-950/75 border border-white/10 focus:border-amber-300 focus:ring-1 focus:ring-amber-300 rounded-lg px-3 py-2 text-sm text-amber-200 font-mono placeholder:text-stone-600 outline-none transition"
          />
          <button
            type="button"
            onClick={generateRandomString}
            disabled={disabled}
            className="button-secondary !p-2.5"
            title="Generate Random Characters"
            aria-label="Randomize Entropy"
          >
            <Dices className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
            disabled={disabled || !entropy.trim()}
            className={`w-full py-2 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
              isSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-300 hover:bg-amber-200 active:scale-[0.98] text-stone-950 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Seed saved</span>
            </>
          ) : (
            <span>Save seed</span>
          )}
        </button>
      </form>
    </div>
  );
};
