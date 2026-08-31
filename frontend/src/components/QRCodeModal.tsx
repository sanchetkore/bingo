import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Share2 } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameCode: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, gameCode }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Format link for joining directly
  const joinUrl = `${window.location.origin}/?code=${gameCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Invite Players</h3>
        <p className="text-xs text-slate-400 mb-4">Scan with a phone camera to join the game</p>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-xl inline-block shadow-inner mb-4">
          <QRCodeSVG value={joinUrl} size={180} level="M" includeMargin={false} />
        </div>

        {/* Game Code Display */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 mb-4">
          <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-1">Game Code</div>
          <div className="text-3xl font-black tracking-widest text-emerald-400 font-mono">{gameCode}</div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-white transition active:scale-95"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold text-slate-950 transition active:scale-95"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
