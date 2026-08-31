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
      <div className="panel w-full max-w-sm p-6 relative text-center">
        <button
          onClick={onClose}
          className="button-secondary absolute top-4 right-4 !p-2 text-stone-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="ball-3d inline-flex h-14 w-14 items-center justify-center text-stone-950 mb-3 [--ball-color:#45b7d1]">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Invite Players</h3>
        <p className="text-xs text-stone-400 mb-4">Scan with a phone camera.</p>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-lg inline-block shadow-inner mb-4">
          <QRCodeSVG value={joinUrl} size={180} level="M" includeMargin={false} />
        </div>

        {/* Game Code Display */}
        <div className="panel-light p-3 mb-4">
          <div className="fine-label mb-1">Game code</div>
          <div className="text-3xl font-black text-amber-300 font-mono">{gameCode}</div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyCode}
            className="button-secondary !py-2 !px-3 text-xs"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Copied' : 'Copy code'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="button-primary !py-2 !px-3 text-xs"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
