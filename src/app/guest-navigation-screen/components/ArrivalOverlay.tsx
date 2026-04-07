import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CustomButton from '@/components/ui/CustomButton';
import { supabase } from '@/lib/supabase';

type Props = {
  hostName: string;
  hostId: string;
  onClose: () => void;
};

export default function ArrivalOverlay({ hostName, hostId, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleImHere = async () => {
    setLoading(true);
    await supabase.from('host_sessions').update({ guest_arrived: true }).eq('id', hostId);
    setLoading(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6 bg-navy-900/40 backdrop-blur-sm animate-in-fade">
      <GlassCard className="w-full max-w-sm !p-6 sm:!p-8 flex flex-col items-center text-center !rounded-[2rem] sm:!rounded-[2.5rem] shadow-2xl border-white/40">
        <div className="relative mb-5 sm:mb-6">
          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg transform rotate-3">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-navy-800 mb-1 sm:mb-2 tracking-tight">You Have Arrived!</h2>
        <p className="text-navy-500 text-[13px] sm:text-sm font-medium leading-relaxed mb-6 sm:mb-8">
          You&apos;ve reached <span className="font-bold text-navy-700">{hostName}</span>. The host
          has been notified of your proximity.
        </p>

        <div className="w-full flex flex-col gap-3">
          <CustomButton
            variant="primary"
            onClick={handleImHere}
            isLoading={loading}
            className="w-full !rounded-2xl"
            icon={!loading && <MessageSquare className="w-4 h-4" />}
          >
            I&apos;m Here
          </CustomButton>

          <button
            onClick={onClose}
            className="text-navy-300 text-xs font-bold uppercase tracking-widest hover:text-navy-500 transition-colors py-2"
          >
            Dismiss Map
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
