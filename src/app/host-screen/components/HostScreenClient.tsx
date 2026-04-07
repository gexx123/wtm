'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Toaster } from 'sonner';
import HostForm from './HostForm';
import LinkConfirmation from './LinkConfirmation';
import HostPageHeader from './HostPageHeader';
import LocationPicker from './LocationPicker';
import HostTrackingView from './HostTrackingView';
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

type ScreenState = 'form' | 'capturing' | 'pinpointing' | 'refining' | 'ready' | 'tracking' | 'error';

export default function HostScreenClient() {
  const [screenState, setScreenState] = useState<ScreenState>('form');
  const [session, setSession] = useState<HostSession | null>(null);
  const [geoError, setGeoError] = useState<string>('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempValues, setTempValues] = useState<HostFormValues | null>(null);
  const [isGuestActive, setIsGuestActive] = useState(false);

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

  const finalizeCapture = async (lat: number, lng: number, values: HostFormValues) => {
    setScreenState('capturing');
    const id = generateId();
    const now = new Date().toISOString();
    
    // Privacy cleanup: Delete all sessions older than 24 hours whenever a new session is created.
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('host_sessions').delete().lt('created_at', yesterday);

    const { error } = await supabase.from('host_sessions').insert([
      {
        id,
        host_name: values.hostName,
        org_name: values.orgName,
        lat,
        lng,
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
      lat,
      lng,
      createdAt: now,
    };

    setSession(newSession);
    setScreenState('ready');
  };

  // Step 1: GPS convergence — watches signal for 6s, picks the best reading,
  // then transitions to the refinement map instead of saving directly
  const handleShareLocation = useCallback(async (values: HostFormValues) => {
    setGeoError('');
    setAccuracy(null);
    setScreenState('pinpointing');
    setTempValues(values);

    if (!navigator.geolocation) {
      setGeoError('Your browser does not support location access. Please try a different browser.');
      setScreenState('error');
      return;
    }

    let bestReading: GeolocationPosition | null = null;
    let settled = false;
    const SETTLING_TIME = 2500;
    const PERFECT_ACCURACY = 20;

    const goToRefine = (lat: number, lng: number) => {
      if (settled) return;
      settled = true;
      setTempCoords({ lat, lng });
      setScreenState('refining');
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentAccuracy = position.coords.accuracy;
        setAccuracy(Math.round(currentAccuracy));

        if (!bestReading || currentAccuracy < bestReading.coords.accuracy) {
          bestReading = position;
        }

        // Fast-path: if signal is perfect, go straight to refinement map
        if (currentAccuracy <= PERFECT_ACCURACY) {
          cleanup();
          goToRefine(position.coords.latitude, position.coords.longitude);
        }
      },
      (err) => {
        if (!bestReading) {
          cleanup();
          let message = 'Unable to access your location.';
          if (err.code === 1) message = 'Location permission denied. Please allow location access.';
          else if (err.code === 2) message = 'Location unavailable. Check your device settings.';
          else if (err.code === 3) message = 'Location request timed out.';
          setGeoError(message);
          setScreenState('error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    const cleanup = () => {
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timerId);
    };

    // After settling time, use the best reading we got and go to refinement
    const timerId = setTimeout(() => {
      cleanup();
      if (bestReading) {
        goToRefine(bestReading.coords.latitude, bestReading.coords.longitude);
      } else {
        setGeoError('Could not pinpoint a reliable location. Please try again or move to an open area.');
        setScreenState('error');
      }
    }, SETTLING_TIME);

  }, []);

  // Step 2: Called when user confirms location on the refinement map
  const handleConfirmLocation = (refinedCoords: { lat: number; lng: number }) => {
    if (!tempValues) return;
    finalizeCapture(refinedCoords.lat, refinedCoords.lng, tempValues);
  };

  const handleSimulateLocation = useCallback(async () => {
    const values = form.getValues();
    const hostName = values.hostName || 'Dr. Rahul';
    const orgName = values.orgName || 'Accounts Office';

    const mockLat = 40.7128;
    const mockLng = -74.006;

    setTempCoords({ lat: mockLat, lng: mockLng });
    setTempValues({ hostName, orgName });
    setScreenState('refining');
  }, [form]);

  const handleReset = () => {
    setSession(null);
    setTempCoords(null);
    setTempValues(null);
    setScreenState('form');
    setGeoError('');
    setAccuracy(null);
    form.reset();
  };

  const guestLink = session
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/guest-navigation-screen?id=${session.id}`
    : '';

  // Auto-transition to tracking view if guest starts navigation
  useEffect(() => {
    if (screenState === 'ready' && session?.id) {
      const channel = supabase
        .channel(`host_auto_track_${session.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'host_sessions',
            filter: `id=eq.${session.id}`,
          },
          (payload: any) => {
            const { guest_lat, guest_lng } = payload.new;
            if (guest_lat && guest_lng) {
              setIsGuestActive(true);
              setScreenState('tracking');
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [screenState, session?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-accent-50 flex flex-col font-jakarta">
      <Toaster position="bottom-center" richColors />
      <HostPageHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          {(screenState === 'form' || screenState === 'capturing' || screenState === 'pinpointing' || screenState === 'error') && (
            <HostForm
              form={form}
              onSubmit={handleShareLocation}
              isCapturing={screenState === 'capturing' || screenState === 'pinpointing'}
              accuracy={accuracy}
              error={geoError}
              onSimulate={handleSimulateLocation}
            />
          )}

          {screenState === 'refining' && tempCoords && tempValues && (
            <LocationPicker
              initialCoords={tempCoords}
              hostName={tempValues.hostName}
              accuracy={accuracy}
              onConfirmAction={handleConfirmLocation}
              onCancelAction={() => {
                setTempCoords(null);
                setTempValues(null);
                setScreenState('form');
              }}
            />
          )}

          {screenState === 'ready' && session && (
            <LinkConfirmation 
              session={session} 
              guestLink={guestLink} 
              isGuestActive={isGuestActive}
              onResetAction={handleReset} 
              onTrackGuestAction={() => setScreenState('tracking')}
            />
          )}

          {screenState === 'tracking' && session && (
            <HostTrackingView 
              session={session} 
              onExitAction={() => setScreenState('ready')} 
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
