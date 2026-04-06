'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Toaster } from 'sonner';
import HostForm from './HostForm';
import LinkConfirmation from './LinkConfirmation';
import HostPageHeader from './HostPageHeader';
import { supabase } from '@/lib/supabase';

export type HostFormValues = {
    hostName: string;
    orgName: string;
};

export type HostSession = {
    id: string;
    hostName: string;
    orgName: string;
    lat: number;
    lng: number;
    createdAt: string;
};

type ScreenState = 'form' | 'capturing' | 'ready' | 'error';

export default function HostScreenClient() {
    const [screenState, setScreenState] = useState<ScreenState>('form');
    const [session, setSession] = useState<HostSession | null>(null);
    const [geoError, setGeoError] = useState<string>('');

    const form = useForm<HostFormValues>({
        defaultValues: { hostName: '', orgName: '' },
        mode: 'onBlur',
    });

    const generateId = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    };

    const handleShareLocation = useCallback(
        async (values: HostFormValues) => {
            setGeoError('');
            setScreenState('capturing');

            if (!navigator.geolocation) {
                setGeoError('Your browser does not support location access. Please try a different browser.');
                setScreenState('error');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const id = generateId();
                    const now = new Date().toISOString();

                    const { error } = await supabase.from('host_sessions').insert([
                        {
                            id,
                            host_name: values.hostName,
                            org_name: values.orgName,
                            lat: latitude,
                            lng: longitude,
                            created_at: now,
                        },
                    ]);

                    if (error) {
                        setGeoError('Failed to save your session. Please try again.');
                        setScreenState('error');
                        return;
                    }

                    const newSession: HostSession = {
                        id,
                        hostName: values.hostName,
                        orgName: values.orgName,
                        lat: latitude,
                        lng: longitude,
                        createdAt: now,
                    };

                    setSession(newSession);
                    setScreenState('ready');
                },
                (err) => {
                    let message = 'Unable to access your location.';
                    if (err.code === 1) message = 'Location permission denied. Please allow location access in your browser settings.';
                    else if (err.code === 2) message = 'Location unavailable. Please check your device settings and try again.';
                    else if (err.code === 3) message = 'Location request timed out. Please try again.';
                    setGeoError(message);
                    setScreenState('error');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        },
        []
    );

    const handleSimulateLocation = useCallback(async () => {
        const values = form.getValues();
        const hostName = values.hostName || 'Dr. Rahul';
        const orgName = values.orgName || 'Accounts Office';

        setGeoError('');
        setScreenState('capturing');

        const mockLat = 40.7128; // Example Mock Coordinates (NY)
        const mockLng = -74.0060;
        const id = generateId();
        const now = new Date().toISOString();

        const { error } = await supabase.from('host_sessions').insert([
            { id, host_name: hostName, org_name: orgName, lat: mockLat, lng: mockLng, created_at: now },
        ]);

        if (error) {
            setGeoError('Failed to format mock session. Check DB.');
            setScreenState('error');
            return;
        }

        const newSession: HostSession = { id, hostName, orgName, lat: mockLat, lng: mockLng, createdAt: now };
        setSession(newSession);
        setScreenState('ready');
    }, [form]);

    const handleReset = () => {
        setSession(null);
        setScreenState('form');
        setGeoError('');
        form.reset();
    };

    const guestLink =
        session
            ? `${typeof window !== 'undefined' ? window.location.origin : ''}/guest-navigation-screen?id=${session.id}`
            : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-accent-50 flex flex-col font-jakarta">
            <Toaster position="bottom-center" richColors />
            <HostPageHeader />

            <main className="flex-1 flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    {(screenState === 'form' || screenState === 'capturing' || screenState === 'error') && (
                        <HostForm
                            form={form}
                            onSubmit={handleShareLocation}
                            isCapturing={screenState === 'capturing'}
                            error={geoError}
                            onSimulate={handleSimulateLocation}
                        />
                    )}
                    {screenState === 'ready' && session && (
                        <LinkConfirmation
                            session={session}
                            guestLink={guestLink}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </main>

            <footer className="text-center py-6 text-xs text-navy-400 font-jakarta">
                <span>WayTm &mdash; Campus Guest Navigation</span>
            </footer>
        </div>
    );
}