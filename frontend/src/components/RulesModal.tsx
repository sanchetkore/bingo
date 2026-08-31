import React from 'react';
import { X, ShieldCheck, CheckCircle, Smartphone } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">How to Play & Fair Play</h2>
            <p className="text-xs text-slate-400">Multiplayer 75-ball server-authoritative Bingo</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Game Rules
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
              <li>Join the lobby with a 6-digit game code or QR scan.</li>
              <li>Contribute random characters to personalize your card seed.</li>
              <li>Each player receives a unique 5×5 Bingo card (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75, Center is FREE).</li>
              <li>Players take turns selecting any available number from 1–75.</li>
              <li>The chosen number is broadcast instantly to everyone and marked on all cards.</li>
              <li>Form a horizontal row, vertical column, or diagonal line.</li>
              <li>When you have a line, click <strong className="text-emerald-400">BINGO!</strong>. First valid claim wins!</li>
            </ol>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              Cryptographic Fairness & Anti-Cheat
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cards are derived from a combination of the server seed, game ID, player ID, and player entropy using SHA-256. 
              Before the game starts, the server commits to a secret hash preventing card alteration. 
              All claims and number calls are verified independently on the server.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-bold rounded-xl shadow-lg transition"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
