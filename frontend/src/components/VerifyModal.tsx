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
      <div className="panel w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="button-secondary absolute top-4 right-4 !p-2 text-stone-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Round verification</h2>
            <p className="text-xs text-stone-400">Seed, card, and commitment checks</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-400 animate-pulse">
            Loading verification data...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : auditData ? (
          <div className="space-y-4 text-xs">
            {/* Server Seed Section */}
            <div className="panel-light p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <KeyRound className="w-4 h-4" />
                <span>Server seed</span>
              </div>
              <div className="font-mono bg-stone-950/80 p-2.5 rounded-lg border border-white/10 text-stone-300 break-all select-all">
                {auditData.server_seed}
              </div>
              <div className="text-[11px] text-stone-400">
                Pre-game hash: <span className="font-mono text-stone-300 select-all">{auditData.server_seed_hash}</span>
              </div>
            </div>

            {/* Players Audit */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-stone-300 font-semibold">
                <Dna className="w-4 h-4 text-amber-400" />
                <span>Player cards ({auditData.players.length})</span>
              </div>

              {auditData.players.map((p: any) => (
                <div key={p.player_id} className="panel-light p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-stone-950/60 p-2 rounded border border-white/10">
                      <span className="text-stone-400 block mb-0.5">Player seed</span>
                      <span className="font-mono text-stone-200">{p.entropy || '(auto-generated)'}</span>
                    </div>
                    <div className="bg-stone-950/60 p-2 rounded border border-white/10">
                      <span className="text-stone-400 block mb-0.5">Derived seed</span>
                      <span className="font-mono text-stone-200 truncate block">{p.derived_seed}</span>
                    </div>
                  </div>

                  <div className="bg-stone-950/60 p-2 rounded border border-white/10 text-[11px]">
                    <span className="text-stone-400 block mb-0.5">Card</span>
                    <span className="font-mono text-stone-300 text-[10px] break-all">{p.actual_canonical}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="button-secondary !py-2.5 !px-5 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
