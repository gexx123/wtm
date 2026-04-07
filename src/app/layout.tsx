import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
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
  themeColor: '#1B2A4A',
};

export const metadata: Metadata = {
  title: 'WayTm — Campus Guest Navigation',
  description:
    'Share your location as a link. Guests get a branded welcome screen and live walking directions to find you on campus or at the office.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WayTm',
  },
  openGraph: {
    title: 'WayTm — Campus Guest Navigation',
    description: 'Find your way with live walking directions shared by your host.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WayTm — Campus Guest Navigation',
    description: 'Find your way with live walking directions shared by your host.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased font-jakarta">{children}</body>
    </html>
  );
}
