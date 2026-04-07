import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MapPin, User, Building2, Info } from 'lucide-react';
import Image from 'next/image';
import { HostFormValues } from './HostScreenClient';
import CustomButton from '@/components/ui/CustomButton';
import GlassCard from '@/components/ui/GlassCard';

type Props = {
  form: UseFormReturn<HostFormValues>;
  onSubmit: (values: HostFormValues) => void;
  isCapturing: boolean;
  accuracy: number | null;
  error: string;
  onSimulate?: () => void;
};

export default function HostForm({ form, onSubmit, isCapturing, accuracy, error, onSimulate }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="animate-in-slide-up">
      {/* Hero section */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="relative inline-flex items-center justify-center w-full max-w-[450px] mb-4 sm:mb-6 px-4 group">
          {/* Professional Glow Background */}
          <div className="absolute inset-0 bg-accent-500/5 blur-[100px] rounded-full scale-125" />
          
          <div className="relative w-full aspect-[16/10] rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-white/60 backdrop-blur-md transition-all duration-700 transform hover:scale-[1.02]">
            <img 
              src="/assets/image.png" 
              alt="WayTm Campus" 
              className="w-full h-full object-cover drop-shadow-md"
            />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-600 mb-0 tracking-tight">
          Share Your Location
        </h1>
      </div>

      {/* Form card */}
      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Host Name */}
          <div className="space-y-2">
            <label
              htmlFor="hostName"
              className="flex items-center gap-2 text-sm font-bold text-navy-600 ml-1"
            >
              <User size={16} className="text-accent-500" />
              Your Name
            </label>
            <div className="relative group">
              <input
                id="hostName"
                type="text"
                autoComplete="name"
                placeholder="e.g. Dr. Rahul"
                disabled={isCapturing}
                className={`premium-input ${errors.hostName ? 'border-red-400 ring-red-100' : ''}`}
                {...register('hostName', {
                  required: 'Enter your name to continue',
                  minLength: { value: 2, message: 'Name is too short' },
                  maxLength: { value: 60, message: 'Name is too long' },
                })}
              />
            </div>
            {errors.hostName ? (
              <p className="px-2 text-xs text-red-500 font-bold animate-in-fade">
                {errors.hostName.message}
              </p>
            ) : (
              <p className="px-2 text-[11px] text-navy-300 font-medium">
                This will be shown on the guest welcome screen
              </p>
            )}
          </div>

          {/* Org Name */}
          <div className="space-y-2">
            <label
              htmlFor="orgName"
              className="flex items-center gap-2 text-sm font-bold text-navy-600 ml-1"
            >
              <Building2 size={16} className="text-accent-500" />
              Organization / Place
            </label>
            <div className="relative group">
              <input
                id="orgName"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Accounts Office"
                disabled={isCapturing}
                className={`premium-input ${errors.orgName ? 'border-red-400 ring-red-100' : ''}`}
                {...register('orgName', {
                  required: 'Enter an organization or location name',
                  minLength: { value: 2, message: 'Too short' },
                  maxLength: { value: 80, message: 'Too long' },
                })}
              />
            </div>
            {errors.orgName ? (
              <p className="px-2 text-xs text-red-500 font-bold animate-in-fade">
                {errors.orgName.message}
              </p>
            ) : (
              <p className="px-2 text-[11px] text-navy-300 font-medium">
                Help guests identify their destination
              </p>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col gap-3 animate-in-fade">
              <div className="flex items-start gap-3">
                <Info className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-bold leading-snug">{error}</p>
              </div>
              {onSimulate && process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={onSimulate}
                  className="mt-1 w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs py-2.5 rounded-xl transition-all duration-150"
                >
                  Bypass Location Block (Dev)
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 space-y-3">
            <CustomButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isCapturing}
              icon={<MapPin className="w-5 h-5" />}
            >
              {isCapturing 
                ? (accuracy ? `Pinpointing (±${accuracy}m)...` : 'Pinpointing...') 
                : 'Generate Share Link'}
            </CustomButton>
            
            {isCapturing && accuracy && (
              <div className="flex flex-col items-center gap-1.5 animate-in-fade">
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-500 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${Math.max(10, Math.min(100, (1 / accuracy) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-accent-600 font-black uppercase tracking-widest">
                  Converging to High Precision
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Info note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] text-navy-300 font-bold uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
          Links auto-expire in 24 hours
        </div>
      </GlassCard>
    </div>
  );
}
