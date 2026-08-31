import React from 'react';
import { WifiOff, RefreshCw, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/sound';

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isReconnecting,
  errorMessage,
  onClearError,
}) => {
  const [isMuted, setIsMuted] = React.useState<boolean>(sounds.getMuted());

  const handleToggleMute = () => {
    const nextState = sounds.toggleMute();
    setIsMuted(nextState);
  };

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
      {/* Sound toggle button */}
      <button
        onClick={handleToggleMute}
        className="button-secondary !p-2"
        title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        aria-label="Toggle Sound"
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
      </button>

      {/* Connection Indicator */}
      {isReconnecting ? (
        <div className="panel-light flex items-center gap-2 px-3 py-1.5 text-amber-200 text-xs font-semibold animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Reconnecting...</span>
        </div>
      ) : !isConnected ? (
        <div className="panel-light flex items-center gap-2 px-3 py-1.5 text-red-200 text-xs font-semibold">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline</span>
        </div>
      ) : null}

      {/* Error Toast */}
      {errorMessage && (
        <div className="panel fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md w-[90%] text-red-100 px-4 py-3 flex items-center justify-between gap-3 animate-bounce-subtle z-50">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-xs text-red-200 hover:text-white underline shrink-0 font-semibold"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
};
