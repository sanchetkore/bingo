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
      <div className="panel w-full p-6 md:p-8 relative">
        <button
          onClick={onBack}
          className="button-secondary !py-2 !px-3 mb-5 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center mb-6">
          <div className="ball-3d w-16 h-16 mx-auto mb-4 flex items-center justify-center text-stone-950 [--ball-color:#45b7d1]">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Join Room</h2>
          <p className="text-sm text-stone-400 mt-1">Enter the code from the host's screen.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/30 text-red-200 text-xs rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="fine-label block mb-2">
              Game code
            </label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="e.g. 482913"
              maxLength={8}
              required
              autoFocus
              className="w-full bg-stone-950/80 border border-white/10 focus:border-amber-300 focus:ring-1 focus:ring-amber-300 rounded-lg p-3.5 text-center text-2xl font-mono text-amber-300 placeholder:text-stone-600 outline-none transition"
            />
          </div>

          <div>
            <label className="fine-label block mb-2">
              Display name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Rahul"
              maxLength={24}
              required
              className="w-full bg-stone-950/80 border border-white/10 focus:border-amber-300 focus:ring-1 focus:ring-amber-300 rounded-lg p-3.5 text-white font-medium placeholder:text-stone-600 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !gameCode.trim() || !playerName.trim()}
            className="button-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Enter Room</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
