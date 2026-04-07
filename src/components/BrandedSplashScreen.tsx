'use client';

import React from 'react';
import { Navigation } from 'lucide-react';

type Props = {
  title?: string;
  subtitle?: string;
  accuracy?: number | null;
};

export default function BrandedSplashScreen({ 
  title = "Initializing WayTm", 
  subtitle = "Verifying Session",
  accuracy 
}: Props) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 font-jakarta overflow-hidden bg-[#0A1126]">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <img 
          src="/icon-512.png" 
          alt="WayTm Welcome" 
          className="w-full h-full object-cover animate-in-fade"
        />
        {/* Dark Overlay for readability and depth */}
        <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-[2px]" />
      </div>

      {/* Animated background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-accent-500/20 blur-[120px] animate-pulse z-1" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-navy-400/20 blur-[100px] z-1" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-[2.5rem] shadow-glass animate-in-slide-up flex flex-col items-center min-w-[280px]">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8">
            {/* Ring loader */}
            <div className="absolute inset-0 border-4 border-white/10 rounded-2xl sm:rounded-[2.5rem]" />
            <div className="absolute inset-0 border-t-4 border-accent-400 rounded-2xl sm:rounded-[2.5rem] animate-spin" />

            {/* Icon pulsing in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Navigation className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-3 tracking-tight drop-shadow-sm">
            {title}
          </h2>
          
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 justify-center py-2.5 px-4 rounded-full bg-white/10 border border-white/10 shadow-inner">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">
                {subtitle}
              </span>
            </div>

            {accuracy !== undefined && (
              <div className="w-full flex flex-col items-center gap-2 animate-in-fade mt-2">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${Math.max(10, Math.min(100, accuracy ? (1 / accuracy) * 100 : 0))}%` }}
                  />
                </div>
                {accuracy !== null && (
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">
                    Signal: ±{accuracy}m
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branded Footer on Splash */}
      <div className="absolute bottom-10 left-0 w-full text-center z-10 animate-in-fade opacity-60">
        <p className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">
          WayTm &mdash; Premium Navigation
        </p>
      </div>
    </div>
  );
}
