'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import WelcomeCard from './WelcomeCard';
import MapView from './MapView';
import ExpiredState from './ExpiredState';
import LoadingState from './LoadingState';
import { supabase } from '@/lib/supabase';

export type HostData = {
  id: string;
  hostName: string;
  orgName: string;
  lat: number;
  lng: number;
  createdAt: string;
};

export type GuestCoords = {
  lat: number;
  lng: number;
};

type AppState = 'loading' | 'welcome' | 'navigating' | 'expired' | 'not-found' | 'geo-error';

function isExpired(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created > 24 * 60 * 60 * 1000;
}

export default function GuestNavigationClient() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [hostData, setHostData] = useState<HostData | null>(null);
  const [guestCoords, setGuestCoords] = useState<GuestCoords | null>(null);
  const [geoErrorMsg, setGeoErrorMsg] = useState('');
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';

    if (!id) {
      setAppState('not-found');
      return;
    }

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('host_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setAppState('not-found');
        return;
      }

      const session: HostData = {
        id: data.id,
        hostName: data.host_name,
        orgName: data.org_name,
        lat: data.lat,
        lng: data.lng,
        createdAt: data.created_at,
      };

      if (isExpired(session.createdAt)) {
        setHostData(session);
        setAppState('expired');
        return;
      }

      setHostData(session);
      setAppState('welcome');
    };

    fetchSession();
  }, []);

  const handleGetDirections = () => {
    if (!navigator.geolocation) {
      setGeoErrorMsg('Your browser does not support location access.');
      setAppState('geo-error');
      return;
    }

    // Use watchPosition for real-time tracking
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGuestCoords({ lat: latitude, lng: longitude });
        
        // Transition to navigating state if not already
        setAppState((prev) => (prev === 'welcome' || prev === 'geo-error' ? 'navigating' : prev));

        // Throttle database updates to once every 3 seconds
        const now = Date.now();
        if (now - lastUpdateRef.current > 3000) {
          lastUpdateRef.current = now;
          if (hostData?.id) {
            await supabase
              .from('host_sessions')
              .update({ guest_lat: latitude, guest_lng: longitude })
              .eq('id', hostData.id);
          }
        }
      },
      (err) => {
        let msg = 'Unable to access your location.';
        if (err.code === 1)
          msg = 'Location permission denied. Please allow location access and try again.';
        else if (err.code === 2)
          msg = 'Your location is currently unavailable. Check your device settings.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
        setGeoErrorMsg(msg);
        setAppState('geo-error');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );

    // Save watchId to state or ref if we needed to clear it later when they leave the page
    // but since they stay on this page to navigate, it's fine running.

  };

  return (
    <div className="min-h-screen bg-white font-jakarta">
      <Toaster position="bottom-center" richColors />

      {appState === 'loading' && <LoadingState />}

      {appState === 'welcome' && hostData && (
        <WelcomeCard hostData={hostData} onGetDirections={handleGetDirections} />
      )}

      {appState === 'navigating' && hostData && guestCoords && (
        <MapView hostData={hostData} guestCoords={guestCoords} />
      )}

      {appState === 'geo-error' && hostData && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-50 to-white">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">📍</span>
            </div>
            <h2 className="text-xl font-bold text-navy-600 mb-2">Location Access Needed</h2>
            <p className="text-sm text-navy-400 mb-6 leading-relaxed">{geoErrorMsg}</p>
            <button
              onClick={handleGetDirections}
              className="w-full bg-navy-600 hover:bg-navy-700 active:scale-[0.98] text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-150"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={async () => {
                  const devLat = hostData.lat - 0.008;
                  const devLng = hostData.lng - 0.005;
                  setGuestCoords({ lat: devLat, lng: devLng });
                  
                  // Push to Supabase so Host auto-track fires in dev mode
                  if (hostData?.id) {
                    await supabase
                      .from('host_sessions')
                      .update({ guest_lat: devLat, guest_lng: devLng })
                      .eq('id', hostData.id);
                  }
                  
                  setAppState('navigating');
                }}
                className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-navy-600 font-semibold text-sm py-3.5 rounded-xl transition-all duration-150"
              >
                Simulate Location (Dev Only)
              </button>
            )}
          </div>
        </div>
      )}

      {appState === 'expired' && hostData && <ExpiredState hostData={hostData} />}

      {appState === 'not-found' && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-50 to-white">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🔍</span>
            </div>
            <h2 className="text-xl font-bold text-navy-600 mb-2">Link Not Found</h2>
            <p className="text-sm text-navy-400 leading-relaxed">
              This link doesn&apos;t exist. Double-check the URL or ask your host to resend it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
