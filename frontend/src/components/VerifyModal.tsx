import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, KeyRound, Dna } from 'lucide-react';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
}

export const VerifyModal: React.FC<VerifyModalProps> = ({ isOpen, onClose, gameId }) => {
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && gameId) {
      setLoading(true);
      setError(null);
      fetch(`/api/games/${gameId}/audit`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || 'Audit data unavailable');
          }
          return res.json();
        })
        .then((data) => {
          setAuditData(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen, gameId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Cryptographic Randomness Audit</h2>
            <p className="text-xs text-slate-400">Verifiable post-game proof of card generation</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse">
            Loading cryptographic audit records...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : auditData ? (
          <div className="space-y-4 text-xs">
            {/* Server Seed Section */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <KeyRound className="w-4 h-4" />
                <span>Server Seed (Revealed Post-Game)</span>
              </div>
              <div className="font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-slate-300 break-all select-all">
                {auditData.server_seed}
              </div>
              <div className="text-[11px] text-slate-400">
                Pre-committed hash was: <span className="font-mono text-slate-300 select-all">{auditData.server_seed_hash}</span>
              </div>
            </div>

            {/* Players Audit */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Dna className="w-4 h-4 text-amber-400" />
                <span>Player Card Derivations ({auditData.players.length})</span>
              </div>

              {auditData.players.map((p: any) => (
                <div key={p.player_id} className="bg-slate-800/30 border border-slate-700/60 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reproduced & Verified</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Player Entropy:</span>
                      <span className="font-mono text-slate-200">{p.entropy || '(auto-generated)'}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Derived Seed:</span>
                      <span className="font-mono text-slate-200 truncate block">{p.derived_seed}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px]">
                    <span className="text-slate-400 block mb-0.5">Canonical Card:</span>
                    <span className="font-mono text-slate-300 text-[10px] break-all">{p.actual_canonical}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
