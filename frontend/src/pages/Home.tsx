import React from 'react';
import { HelpCircle, LogIn, PlusCircle, ShieldCheck } from 'lucide-react';

interface HomeProps {
  onNavigateCreate: () => void;
  onNavigateJoin: () => void;
  onOpenRules: () => void;
}

const previewValues = [8, 19, 32, 58, 72, 4, 25, 37, 49, 66, 13, 18, 'F', 52, 75, 9, 28, 42, 47, 61, 1, 21, 34, 55, 70];

export const Home: React.FC<HomeProps> = ({
  onNavigateCreate,
  onNavigateJoin,
  onOpenRules,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-5 max-w-5xl mx-auto relative overflow-hidden">
      <header className="w-full flex justify-between items-center z-20">
        <a
          href="https://skfbapps.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-stone-300 hover:text-white transition"
        >
          <img src="/skfb_logo.png" alt="SKFB Apps" className="h-7 w-7 rounded-md object-contain" />
          <span className="text-sm font-semibold">SKFB Apps</span>
        </a>
        <button onClick={onOpenRules} className="button-secondary !py-2 !px-3 text-xs">
          <HelpCircle className="w-4 h-4" />
          <span>Rules</span>
        </button>
      </header>

      <main className="w-full flex-1 grid md:grid-cols-[1.05fr_0.95fr] items-center gap-8 py-8 md:py-10">
        <section className="relative z-10 order-2 md:order-1">
          <p className="fine-label mb-3 text-amber-300">Live room bingo</p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-stone-50 leading-none">
            BINGO
          </h1>
          <p className="mt-4 text-base md:text-lg text-stone-300 leading-relaxed max-w-md">
            Start a room, share the code, and play a server-checked round from any phone at the table.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 max-w-md">
            <button onClick={onNavigateCreate} className="button-primary w-full text-sm">
              <PlusCircle className="w-5 h-5" />
              <span>Create Room</span>
            </button>
            <button onClick={onNavigateJoin} className="button-secondary w-full text-sm">
              <LogIn className="w-5 h-5 text-cyan-300" />
              <span>Join Room</span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Server-checked claims
            </span>
            <span className="h-1 w-1 rounded-full bg-stone-600" />
            <span>No app install</span>
          </div>
        </section>

        <section className="order-1 md:order-2 flex items-center justify-center min-h-[360px] md:min-h-[520px]">
          <div className="relative h-[340px] w-full max-w-sm sm:max-w-md md:h-[500px] [perspective:1100px]">
            <div className="absolute inset-x-8 top-14 h-56 rounded-[50%] border-[16px] border-stone-950 bg-[var(--felt)] shadow-2xl md:top-20 md:h-72 [transform:rotateX(62deg)]" />

            <div className="animate-floatCard absolute left-1/2 top-8 w-56 -translate-x-1/2 md:top-16 md:w-72">
              <div className="surface-3d panel p-4">
                <div className="grid grid-cols-5 gap-1.5">
                  {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                    <div key={letter} className="h-8 rounded-md border border-white/10 bg-stone-900/80 text-center text-sm font-black leading-8 text-amber-200">
                      {letter}
                    </div>
                  ))}
                  {previewValues.map((value, i) => (
                    <div
                      key={`${value}-${i}`}
                      className={`tile-3d aspect-square rounded-md border text-center text-sm font-black leading-[2.35rem] md:leading-[3.05rem] ${
                        value === 'F'
                          ? 'border-amber-300/60 bg-amber-300 text-stone-950'
                          : i % 4 === 0
                          ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-100'
                          : i % 3 === 0
                          ? 'border-red-300/40 bg-red-400/20 text-red-100'
                          : 'border-white/10 bg-white/[0.07] text-stone-200'
                      }`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ball-3d absolute left-8 top-44 h-16 w-16 text-center text-lg font-black leading-[4rem] text-white [--ball-color:#e65d4f]">B12</div>
            <div className="ball-3d absolute right-6 top-28 h-20 w-20 text-center text-xl font-black leading-[5rem] text-stone-950 [--ball-color:#d6a84f]">N</div>
            <div className="ball-3d absolute bottom-10 left-1/2 h-14 w-14 -translate-x-1/2 text-center text-base font-black leading-[3.5rem] text-white [--ball-color:#45b7d1]">O7</div>
          </div>
        </section>
      </main>
    </div>
  );
};
