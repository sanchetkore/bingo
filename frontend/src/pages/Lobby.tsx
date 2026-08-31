import React, { useState } from 'react';
import { Check, Copy, Crown, HelpCircle, LogOut, Play, QrCode, Shield } from 'lucide-react';
import { GameStatePublic } from '../game/types';
import { EntropyInput } from '../components/EntropyInput';
import { PlayerList } from '../components/PlayerList';
import { QRCodeModal } from '../components/QRCodeModal';

interface LobbyProps {
  gameState: GameStatePublic;
  myPlayerId: string;
  onStartGame: () => void;
  onSetEntropy: (entropy: string) => void;
  onOpenRules: () => void;
  onLeaveLobby: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  gameState,
  myPlayerId,
  onStartGame,
  onSetEntropy,
  onOpenRules,
  onLeaveLobby,
}) => {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const isHost = gameState.host_player_id === myPlayerId;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameState.game_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Clipboard access can be blocked by browser permissions.
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 max-w-5xl mx-auto">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="fine-label text-amber-300">Lobby</p>
          <h1 className="text-2xl font-black text-white">Room setup</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenRules} className="button-secondary !py-2 !px-3 text-xs" title="Rules">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Rules</span>
          </button>
          <button onClick={onLeaveLobby} className="button-secondary !py-2 !px-3 text-xs text-red-200" title="Leave">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      <main className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-5 md:p-6 overflow-hidden">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="fine-label mb-2">Share code</p>
              <div className="select-all font-mono text-5xl sm:text-6xl font-black text-amber-300 leading-none">
                {gameState.game_code}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button onClick={handleCopyCode} className="button-secondary !py-2.5 !px-3.5 text-xs">
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy code'}</span>
                </button>
                <button onClick={() => setIsQrOpen(true)} className="button-secondary !py-2.5 !px-3.5 text-xs">
                  <QrCode className="w-4 h-4 text-cyan-300" />
                  <span>QR code</span>
                </button>
              </div>
            </div>

            <div className="hidden sm:block [perspective:800px]">
              <div className="surface-3d h-32 w-32 rounded-lg border border-white/10 bg-[var(--felt)] p-3 shadow-2xl">
                <div className="grid grid-cols-3 gap-2">
                  {[12, 27, 43, 6, 'F', 61, 18, 55, 70].map((value, index) => (
                    <div key={`${value}-${index}`} className="tile-3d aspect-square rounded-md bg-white/[0.08] text-center text-xs font-black leading-8 text-stone-100">
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4 flex items-center gap-2 text-xs text-stone-400">
            <Shield className="w-4 h-4 text-emerald-300" />
            <span>Seed hash</span>
            <span className="font-mono text-stone-300 truncate" title={gameState.server_seed_hash}>
              {gameState.server_seed_hash.slice(0, 18)}...
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <EntropyInput onSaveEntropy={onSetEntropy} />
          <PlayerList players={gameState.players} myPlayerId={myPlayerId} showEntropyStatus={true} />
        </section>
      </main>

      <section className="panel mt-4 p-5 text-center">
        {isHost ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center sm:text-left">
            <div>
              <p className="font-bold text-white">Ready to call the first ball?</p>
              <p className="mt-1 text-sm text-stone-400">Each player receives a private card when the round starts.</p>
            </div>
            <button onClick={onStartGame} className="button-primary w-full sm:w-auto text-sm">
              <Play className="w-5 h-5 fill-stone-950" />
              <span>Start Game</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-stone-300">
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Waiting for the host.</span>
          </div>
        )}
      </section>

      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        gameCode={gameState.game_code}
      />
    </div>
  );
};
