'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function CustomButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}: CustomButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2.5 font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-navy-600 hover:bg-navy-700 text-white shadow-button hover:shadow-lg',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white shadow-lg',
    outline:
      'bg-transparent border-2 border-navy-200 hover:border-navy-400 text-navy-600 hover:bg-navy-50',
    ghost: 'bg-transparent text-navy-600 hover:bg-navy-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-8 py-4 text-sm rounded-2xl',
    lg: 'px-10 py-5 text-base rounded-3xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin opacity-80" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
