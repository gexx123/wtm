'use client';

import React from 'react';
import { Clock, AlertCircle, Home } from 'lucide-react';
import { HostData } from './GuestNavigationClient';
import CustomButton from '@/components/ui/CustomButton';
import GlassCard from '@/components/ui/GlassCard';

type Props = {
  hostData: HostData;
};

export default function ExpiredState({ hostData }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0A1126] font-jakarta">
      {/* Animated background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-red-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-navy-400/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm text-center animate-in-slide-up">
        <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Clock className="w-10 h-10 text-red-500" />
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Link Expired</h2>

        <GlassCard className="mb-8 !bg-white/5 border-white/10 p-6">
          <div className="flex items-start gap-4 text-left">
            <AlertCircle className="text-red-400 shrink-0 mt-1" size={20} />
            <div>
              <p className="text-white/90 text-sm font-bold mb-1">Safety First</p>
              <p className="text-white/60 text-xs leading-relaxed font-medium">
                For security, location links shared via WayTm auto-expire after 24 hours. The host{' '}
                <span className="text-white font-bold">{hostData.hostName}</span> will need to
                generate a new link for you.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <CustomButton
            onClick={() => window.location.reload()}
            variant="accent"
            className="w-full !rounded-2xl"
          >
            Try Again
          </CustomButton>
          <a href="/host-screen" className="block">
            <CustomButton
              variant="outline"
              className="w-full !rounded-2xl !border-white/10 !text-white/60 hover:!bg-white/5"
              icon={<Home size={18} />}
            >
              Back to Home
            </CustomButton>
          </a>
        </div>

        <p className="mt-12 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
          WayTm &bull; Campus Navigation
        </p>
      </div>
    </div>
  );
}
