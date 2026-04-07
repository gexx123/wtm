import React, { useState } from 'react';
import { Navigation, MapPin, Sparkles } from 'lucide-react';
import { HostData } from './GuestNavigationClient';
import CustomButton from '@/components/ui/CustomButton';

type Props = {
  hostData: HostData;
  onGetDirections: () => void;
};

export default function WelcomeCard({ hostData, onGetDirections }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    onGetDirections();
  };

  const initials = hostData.hostName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1126] relative overflow-hidden font-jakarta">
      {/* Animated background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-accent-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-navy-400/20 blur-[100px]" />
      <div className="absolute top-[20%] left-[10%] w-px h-[40%] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      {/* Top brand header */}
      <div className="relative z-10 px-6 pt-10 pb-4 flex flex-col items-center animate-in-fade">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase">
            Campus Guest Access
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center animate-in-slide-up pb-12">
        {/* Host Profile Image/Initials */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-accent-500 blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-4xl font-extrabold text-white tracking-tighter drop-shadow-sm">
              {initials}
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-accent-500 flex items-center justify-center border-4 border-[#0A1126] shadow-lg">
            <MapPin size={18} className="text-white" />
          </div>
        </div>

        {/* Typography stack */}
        <div className="space-y-4 mb-12">
          <div>
            <p className="text-accent-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              You are visiting
            </p>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              {hostData.orgName}
            </h1>
          </div>

          <div className="h-px w-12 bg-white/20 mx-auto" />

          <p className="text-white/70 text-lg font-medium">
            Hosted by <span className="text-white font-bold">{hostData.hostName}</span>
          </p>
        </div>

        {/* Call to action */}
        <CustomButton
          onClick={handleClick}
          variant="accent"
          size="lg"
          isLoading={loading}
          className="w-full max-w-sm !rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
          icon={<Navigation className="w-5 h-5" />}
        >
          {loading ? 'Finding you...' : 'Start Navigation'}
        </CustomButton>

        <p className="mt-6 text-white/30 text-[10px] font-bold uppercase tracking-widest">
          Location permission required for directions
        </p>
      </div>

      {/* Minimal footer */}
      <div className="relative z-10 px-6 py-8 text-center mt-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">
            WayTm Verified Session
          </span>
        </div>
      </div>
    </div>
  );
}
