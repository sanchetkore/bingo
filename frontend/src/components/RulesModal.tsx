import React from 'react';
import { CheckCircle, ShieldCheck, Smartphone, X } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="panel w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="button-secondary absolute top-4 right-4 !p-2 text-stone-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-12">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">How it works</h2>
            <p className="text-xs text-stone-400">A server-run 75-ball Bingo round.</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-stone-300">
          <div className="panel-light p-3.5 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-300" />
              Round rules
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-300">
              <li>Join with the room code or QR link.</li>
              <li>Add an optional seed before the host starts.</li>
              <li>Each player gets a private 5 by 5 card with a free center.</li>
              <li>Players take turns calling one uncalled number.</li>
              <li>A row, column, or diagonal wins.</li>
              <li>Tap <strong className="text-amber-300">Claim</strong> when your card has a line.</li>
            </ol>
          </div>

          <div className="panel-light p-3.5 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              Fair play
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              The server checks calls, turns, and claims. After the round, players can verify the seed and card commitments.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="button-primary w-full !py-2.5 text-sm">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
