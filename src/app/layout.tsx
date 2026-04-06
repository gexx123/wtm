import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'WayToMe — Campus Guest Navigation',
  description: 'Share your location as a link. Guests get a branded welcome screen and live walking directions to find you on campus or at the office.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WayToMe',
  },
  openGraph: {
    title: 'WayToMe — Campus Guest Navigation',
    description: 'Find your way with live walking directions shared by your host.',
    type: 'website',
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased font-jakarta">
        {children}
      </body>
    </html>
  );
}