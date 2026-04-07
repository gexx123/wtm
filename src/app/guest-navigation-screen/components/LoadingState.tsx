'use client';

import React from 'react';
import { Navigation } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0A1126] font-jakarta overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-accent-600/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-navy-400/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8">
          {/* Ring loader */}
          <div className="absolute inset-0 border-4 border-white/5 rounded-2xl sm:rounded-[2.5rem]" />
          <div className="absolute inset-0 border-t-4 border-accent-500 rounded-2xl sm:rounded-[2.5rem] animate-spin" />

          {/* Icon pulsing in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Navigation className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
          Initializing WayTm
        </h2>
        <div className="flex items-center gap-1.5 justify-center py-2 px-3 rounded-full bg-white/5 border border-white/10">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" />
          </div>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-1">
            Verifying Session
          </span>
        </div>
      </div>

      {/* Bottom floating elements (decorative) */}
      <div className="absolute bottom-12 flex gap-4 opacity-10 grayscale pointer-events-none">
        <div className="w-px h-16 bg-white/50" />
        <div className="w-px h-12 bg-white/50 mt-4" />
        <div className="w-px h-20 bg-white/50 mr-4" />
      </div>
    </div>
  );
}
