import React from 'react';
import { PlusCircle, LogIn, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface HomeProps {
  onNavigateCreate: () => void;
  onNavigateJoin: () => void;
  onOpenRules: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigateCreate,
  onNavigateJoin,
  onOpenRules,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 max-w-md mx-auto relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* SKFB Apps Branding Header */}
      <div className="w-full flex justify-center items-center z-20 py-4 mb-4">
         <a href="https://skfbapps.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition">
            <img src="https://skfbapps.com/logo.png" alt="SKFB Apps Logo" className="h-6 md:h-8 object-contain" />
            <span className="text-sm font-bold text-slate-300 tracking-wide">SKFB Apps <span className="font-normal text-slate-500">(skfbapps.com)</span></span>
         </a>
      </div>

      {/* Main Container */}
      <div className="w-full flex-grow flex flex-col justify-center relative z-10 text-center space-y-6 pb-12">
        {/* Brand Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Realtime Multiplayer</span>
          </div>

          <div className="flex justify-center mb-6">
             <img src="/branded-bingo-logo.jpg" alt="Bingo Game Logo" className="w-32 h-32 md:w-40 md:h-40 rounded-3xl shadow-2xl object-cover ring-2 ring-emerald-500/20" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest mb-2 font-mono">BINGO</h1>

          <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">
            Multiplayer 75-ball Bingo with server-verified claims and verifiable cryptographic fairness.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onNavigateCreate}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-[0.98] text-slate-950 font-extrabold rounded-2xl text-base shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2.5"
          >
            <PlusCircle className="w-5 h-5" />
            <span>CREATE GAME</span>
          </button>

          <button
            onClick={onNavigateJoin}
            className="w-full py-4 px-6 bg-slate-800/90 hover:bg-slate-800 active:scale-[0.98] border border-slate-700 text-white font-extrabold rounded-2xl text-base shadow-xl transition flex items-center justify-center gap-2.5"
          >
            <LogIn className="w-5 h-5 text-emerald-400" />
            <span>JOIN GAME</span>
          </button>
        </div>

        {/* Footer info & Rules */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-4">
          <button
            onClick={onOpenRules}
            className="hover:text-white flex items-center gap-1.5 transition py-1 px-2.5 rounded-lg hover:bg-slate-800/60"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How to Play</span>
          </button>

          <span className="text-slate-700">•</span>

          <div className="flex items-center gap-1.5 text-slate-400 py-1 px-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SHA-256 Fair</span>
          </div>
        </div>
      </div>
    </div>
  );
};
