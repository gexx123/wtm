import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

export default function HostPageHeader() {
  return (
    <header className="w-full px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <AppLogo size={32} />
        <span className="font-jakarta font-700 text-lg tracking-tight text-navy-600">WayTm</span>
      </div>
      <span className="text-xs font-medium text-navy-400 bg-accent-50 border border-accent-100 px-3 py-1 rounded-full">
        Host Portal
      </span>
    </header>
  );
}
