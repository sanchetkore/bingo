import React, { useState } from 'react';
import { ArrowLeft, Crown, Sparkles, Loader2 } from 'lucide-react';

interface CreateGameProps {
  onBack: () => void;
  onGameCreated: (gameId: string, gameCode: string, playerId: string, sessionToken: string) => void;
}

export const CreateGame: React.FC<CreateGameProps> = ({ onBack, onGameCreated }) => {
  const [hostName, setHostName] = useState('');
  const [callMode, setCallMode] = useState('player');
  const [drawSpeed, setDrawSpeed] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_name: hostName.trim(), call_mode: callMode, draw_speed: drawSpeed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create game room');
      }

      const data = await responseData(res);
      onGameCreated(data.game_id, data.game_code, data.host_player_id, data.session_token);
    } catch (err: any) {
      setError(err.message || 'Network error creating game');
      setLoading(false);
    }
  };

  const responseData = async (res: Response) => {
    return await res.json();
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
          <div className="ball-3d w-16 h-16 mx-auto mb-4 flex items-center justify-center [--ball-color:#d6a84f]">
            <Crown className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Create Room</h2>
          <p className="text-sm text-stone-400 mt-1">You host the round and start when everyone is in.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/30 text-red-200 text-xs rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="fine-label block mb-2">
              Display name
            </label>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="e.g. Sanchet"
              maxLength={24}
              required
              autoFocus
              className="w-full bg-stone-950/80 border border-white/10 focus:border-amber-300 focus:ring-1 focus:ring-amber-300 rounded-lg p-3.5 text-white font-medium placeholder:text-stone-600 outline-none transition"
            />
          </div>

          <div>
            <label className="fine-label block mb-2">
              Who calls numbers?
            </label>
            <select
              value={callMode}
              onChange={(e) => setCallMode(e.target.value)}
              className="w-full bg-stone-950/80 border border-white/10 focus:border-amber-300 focus:ring-1 focus:ring-amber-300 rounded-lg p-3.5 text-white font-medium outline-none transition appearance-none"
            >
              <option value="player">Players Take Turns</option>
              <option value="server">Server (Auto-Draw)</option>
            </select>
          </div>

          {callMode === 'server' && (
            <div className="animate-fadeIn">
              <label className="fine-label block mb-2">
                Server Draw Speed
              </label>
              <select
                value={drawSpeed}
                onChange={(e) => setDrawSpeed(Number(e.target.value))}
                className="w-full bg-stone-950/80 border border-white/10 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300 rounded-lg p-3.5 text-cyan-100 font-medium outline-none transition appearance-none"
              >
                <option value={3}>Fast (3 seconds)</option>
                <option value={5}>Normal (5 seconds)</option>
                <option value={8}>Slow (8 seconds)</option>
                <option value={15}>Very Slow (15 seconds)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !hostName.trim()}
            className="button-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Room</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
