import React, { useState } from 'react';
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react';

interface JoinGameProps {
  initialCode?: string;
  onBack: () => void;
  onGameJoined: (gameId: string, gameCode: string, playerId: string, sessionToken: string) => void;
}

export const JoinGame: React.FC<JoinGameProps> = ({
  initialCode = '',
  onBack,
  onGameJoined,
}) => {
  const [gameCode, setGameCode] = useState(initialCode);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = gameCode.trim().replace(/\s+/g, '');
    if (!cleanCode) {
      setError('Please enter the 6-digit game code');
      return;
    }
    if (!playerName.trim()) {
      setError('Please enter your display name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Could not join game. Check your code.');
      }

      const data = await res.json();
      onGameJoined(data.game_id, cleanCode, data.player_id, data.session_token);
    } catch (err: any) {
      setError(err.message || 'Network error joining game');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto relative">
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition mb-4 inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">Join Game Room</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter the 6-digit game code provided by the host.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              6-Digit Game Code
            </label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="e.g. 482913"
              maxLength={8}
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl p-3.5 text-center text-2xl font-mono tracking-widest text-emerald-400 placeholder:text-slate-600 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Your Display Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Rahul"
              maxLength={24}
              required
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl p-3.5 text-white font-medium placeholder:text-slate-600 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !gameCode.trim() || !playerName.trim()}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-[0.98] text-slate-950 font-extrabold rounded-2xl text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>ENTER GAME</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
