import React, { useState } from 'react';
import { Crown, Play, QrCode, Copy, Check, Shield, Sparkles, HelpCircle, LogOut } from 'lucide-react';
import { GameStatePublic } from '../game/types';
import { PlayerList } from '../components/PlayerList';
import { EntropyInput } from '../components/EntropyInput';
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
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 max-w-lg mx-auto space-y-5">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Game Lobby</span>
        </div>

        <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
          Share Game Code
        </div>
        <div className="text-4xl md:text-5xl font-black text-emerald-400 font-mono tracking-widest my-2 select-all">
          {gameState.game_code}
        </div>

        {/* Share buttons */}
        <div className="flex items-center justify-center gap-2.5 mt-4">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Code Copied' : 'Copy Code'}</span>
          </button>

          <button
            onClick={() => setIsQrOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Show QR</span>
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={onLeaveLobby}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-red-900/40 hover:bg-red-500 active:scale-95 border border-red-900/50 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-xs font-bold transition ml-auto"
            title="Leave Lobby"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>

        {/* Server Seed Pre-Commitment Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Server Seed Hash:</span>
          <span className="font-mono text-slate-300 truncate max-w-[140px]" title={gameState.server_seed_hash}>
            {gameState.server_seed_hash.slice(0, 12)}...
          </span>
        </div>
      </div>

      {/* Make Card Random (Entropy) */}
      <EntropyInput onSaveEntropy={onSetEntropy} />

      {/* Players List */}
      <PlayerList
        players={gameState.players}
        myPlayerId={myPlayerId}
        showEntropyStatus={true}
      />

      {/* Host Controls or Waiting message */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-center">
        {isHost ? (
          <div className="space-y-3">
            <button
              onClick={onStartGame}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-base uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2.5"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>START GAME</span>
            </button>
            <p className="text-xs text-slate-400">
              Host controls the start. All players will receive their cards privately.
            </p>
          </div>
        ) : (
          <div className="py-2 space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm animate-pulse">
              <Crown className="w-4 h-4" />
              <span>Waiting for Host to start the game...</span>
            </div>
            <p className="text-xs text-slate-400">
              Get ready! Your unique card will be generated as soon as the host starts.
            </p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        gameCode={gameState.game_code}
      />
    </div>
  );
};
