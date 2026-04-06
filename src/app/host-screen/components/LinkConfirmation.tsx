'use client';

import React, { useState } from 'react';
import { Check, Copy, Share2, ArrowLeft, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { HostSession } from './HostScreenClient';
import CustomButton from '@/components/ui/CustomButton';
import GlassCard from '@/components/ui/GlassCard';

type Props = {
    session: HostSession;
    guestLink: string;
    onReset: () => void;
};

export default function LinkConfirmation({ session, guestLink, onReset }: Props) {
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(guestLink);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Find me at ${session.orgName}`,
                    text: `Hey, I'm at ${session.orgName}. Use this link to find me:`,
                    url: guestLink,
                });
            } catch (err) {
                // User cancelled or share failed
            }
        } else {
            handleCopy();
        }
    };

    // Zero-dependency QR Code using a public API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(guestLink)}&bgcolor=ffffff&color=1B2A4A&margin=10`;

    return (
        <div className="animate-in-fade space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <Check className="w-8 h-8 text-emerald-600" strokeWidth={3} />
                </div>
                <h1 className="text-2xl font-extrabold text-navy-600 mb-2">Location Ready!</h1>
                <p className="text-sm text-navy-400 font-medium">
                    Your guest can now find you at <span className="text-navy-600 font-bold">{session.orgName}</span>
                </p>
            </div>

            {/* Sharing Card */}
            <GlassCard className="p-8 space-y-8">
                {/* Link Box */}
                <div className="space-y-3">
                    <label className="text-[10px] font-extrabold text-navy-300 uppercase tracking-widest ml-1">
                        Guest Access Link
                    </label>
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex-1 px-3 py-2 text-xs font-bold text-navy-500 overflow-hidden text-ellipsis whitespace-nowrap">
                            {guestLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`p-3 rounded-xl transition-all duration-200 ${
                                copied ? 'bg-emerald-500 text-white' : 'bg-white text-navy-400 hover:text-navy-600 shadow-sm border border-slate-100'
                            }`}
                        >
                            {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <CustomButton
                        variant="primary"
                        onClick={handleShare}
                        className="w-full"
                        icon={<Share2 size={18} />}
                    >
                        Share Link
                    </CustomButton>
                    <CustomButton
                        variant="outline"
                        onClick={() => setShowQr(!showQr)}
                        className="w-full"
                        icon={<QrCode size={18} />}
                    >
                        {showQr ? 'Hide QR' : 'Show QR'}
                    </CustomButton>
                </div>

                {/* QR Code Section */}
                {showQr && (
                    <div className="animate-in-slide-up bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-4">
                        <div className="relative w-48 h-48 bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-50">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={qrUrl} 
                                alt="Location QR Code" 
                                className="w-full h-full p-2"
                            />
                        </div>
                        <p className="text-[11px] text-navy-300 font-bold uppercase text-center">
                            Scan to open navigation
                        </p>
                    </div>
                )}
            </GlassCard>

            {/* Bottom links */}
            <div className="flex flex-col gap-3 pt-4">
                <a 
                    href={guestLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm font-bold text-accent-500 hover:text-accent-600 transition-colors py-2"
                >
                    <ExternalLink size={16} />
                    Preview guest view
                </a>
                <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-navy-300 hover:text-navy-400 transition-colors py-2"
                >
                    <ArrowLeft size={16} />
                    Create new link
                </button>
            </div>
        </div>
    );
}