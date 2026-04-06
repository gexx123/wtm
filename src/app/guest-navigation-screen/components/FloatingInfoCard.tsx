import React from 'react';
import { Clock, Footprints, AlertTriangle, Navigation2, Car } from 'lucide-react';
import { HostData } from './GuestNavigationClient';
import GlassCard from '@/components/ui/GlassCard';
import { RouteInfo, TravelMode } from './MapView';

type Props = {
    hostData: HostData;
    routeInfo: RouteInfo | null;
    routeLoading: boolean;
    routeError: boolean;
    travelMode: TravelMode;
    onModeChange: (mode: TravelMode) => void;
};

function formatDuration(seconds: number): string {
    const mins = Math.round(seconds / 60);
    if (mins < 1) return '< 1 min';
    if (mins === 1) return '1 min';
    return `${mins} mins`;
}

function formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
}

export default function FloatingInfoCard({
    hostData,
    routeInfo,
    routeLoading,
    routeError,
    travelMode,
    onModeChange,
}: Props) {
    const isDrive = travelMode === 'drive';

    return (
        <div
            className="absolute bottom-6 left-4 right-4 z-[1000] animate-in-slide-up"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <GlassCard className="!p-0 overflow-hidden !rounded-[2rem] border-white/40 shadow-floating flex flex-col">
                {/* Visual indicator bar */}
                <div className={`h-1.5 w-full mb-[-1.5px] transition-colors duration-500 ${isDrive ? 'bg-emerald-500' : 'bg-navy-600/10'}`} />
                
                <div className="px-6 pt-5 pb-4">
                    {/* Header: Host Info */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-navy-600 flex items-center justify-center shadow-lg transform -rotate-3">
                                <Navigation2 className="w-5 h-5 text-white" fill="white" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-navy-600 font-extrabold text-base tracking-tight leading-tight">
                                    {hostData.hostName}
                                </h3>
                                <p className="text-navy-400 text-xs font-bold uppercase tracking-wider">
                                    {hostData.orgName}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest">Live</span>
                        </div>
                    </div>

                    {/* Mode Switcher */}
                    <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1.5 mb-5 relative overflow-hidden backdrop-blur-sm border border-slate-200">
                        <button
                            onClick={() => onModeChange('walk')}
                            className={`flex-[0.5] py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all z-10 ${
                                !isDrive ? 'bg-white text-accent-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Footprints size={16} />
                            Walk
                        </button>
                        <button
                            onClick={() => onModeChange('drive')}
                            className={`flex-[0.5] py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all z-10 ${
                                isDrive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Car size={16} />
                            Drive
                        </button>
                    </div>

                    {/* Stats section */}
                    <div className="flex items-center gap-6">
                        {routeLoading ? (
                            <div className="flex-1 flex gap-4 animate-pulse">
                                <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                                <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDrive ? 'bg-emerald-500/10' : 'bg-accent-500/10'}`}>
                                        <Clock className={`w-5 h-5 ${isDrive ? 'text-emerald-600' : 'text-accent-600'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-navy-600 font-black text-lg leading-tight tabular-nums">
                                            {routeInfo ? formatDuration(routeInfo.durationSeconds) : '--'}
                                        </span>
                                        <span className="text-navy-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                                            ETA
                                        </span>
                                    </div>
                                </div>

                                <div className="w-px h-8 bg-black/[0.04]" />

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        {isDrive ? <Car className="w-5 h-5 text-slate-500" /> : <Footprints className="w-5 h-5 text-slate-500" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-navy-500 font-black text-lg leading-tight tabular-nums">
                                            {routeInfo ? formatDistance(routeInfo.distanceMeters) : '--'}
                                        </span>
                                        <span className="text-navy-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                                            Distance
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {routeError && (
                            <div className="ml-auto group relative">
                                <AlertTriangle className="text-amber-500" size={20} />
                                <div className="absolute bottom-full right-0 mb-2 invisible group-hover:visible bg-navy-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                    Estimated straight-line route
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
