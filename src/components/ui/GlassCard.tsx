'use client';

import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
                bg-white/70 backdrop-blur-xl 
                border border-white/40 
                shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
                rounded-3xl p-6 
                transition-all duration-300
                ${onClick ? 'cursor-pointer hover:bg-white/80 active:scale-[0.99]' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
