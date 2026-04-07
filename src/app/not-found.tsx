'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, TriangleAlert } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import CustomButton from '@/components/ui/CustomButton';
import GlassCard from '@/components/ui/GlassCard';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router?.push('/host-screen');
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history?.back();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-jakarta">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-500/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm z-10 text-center animate-in-fade">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-white rounded-3xl shadow-soft">
            <AppLogo size={48} />
          </div>
        </div>

        <GlassCard className="!p-8 !rounded-[2.5rem] shadow-2xl border-white/40 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <TriangleAlert className="w-8 h-8 text-amber-500" strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-black text-navy-800 mb-2 tracking-tight">Signal Lost</h1>
          <p className="text-navy-400 text-sm font-medium leading-relaxed mb-8">
            The navigation link you followed is invalid or has completely expired.
          </p>

          <div className="flex flex-col gap-3">
            <CustomButton
              variant="primary"
              onClick={handleGoBack}
              className="w-full !rounded-2xl"
              icon={<ArrowLeft size={18} />}
            >
              Go Back
            </CustomButton>

            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 text-navy-300 text-sm font-bold hover:text-navy-500 transition-colors py-2"
            >
              <Home size={16} />
              Start New Session
            </button>
          </div>
        </GlassCard>

        <p className="text-navy-300 text-[10px] font-black uppercase tracking-[0.2em]">
          WayTm &bull; Security Verified
        </p>
      </div>
    </div>
  );
}
