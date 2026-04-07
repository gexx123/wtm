'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Target, User, MapPin, X, Navigation } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CustomButton from '@/components/ui/CustomButton';
import { useArrivalSound } from '@/hooks/useArrivalSound';

type HostSession = {
  id: string;
  hostName: string;
  orgName: string;
  lat: number;
  lng: number;
};

type Props = {
  session: HostSession;
  onExitAction: () => void;
};

// Haversine distance in meters
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HostTrackingView({ session, onExitAction }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const guestMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const { playSound } = useArrivalSound();

  const [guestCoords, setGuestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [guestArrived, setGuestArrived] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [hasNotifiedArrival, setHasNotifiedArrival] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      LRef.current = L;

      if (!isMounted || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [session.lat, session.lng],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Host Marker
      const hostIcon = L.divIcon({
        html: `<div class="relative flex flex-col items-center">
                    <div class="absolute -top-10 bg-navy-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap z-10">
                        You
                    </div>
                    <div class="relative w-10 h-10 bg-navy-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-xl">
                        <span class="text-xl">📍</span>
                    </div>
                </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        className: 'marker-custom',
      });
      L.marker([session.lat, session.lng], { icon: hostIcon }).addTo(map);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [session]);

  // Fix for white patches
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [mapInstanceRef.current]);

  // Supabase Realtime Subscription
  useEffect(() => {
    let isMounted = true;

    // Fetch initial state in case guest is already connected
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('host_sessions')
        .select('guest_lat, guest_lng, guest_arrived')
        .eq('id', session.id)
        .single();

      if (data && isMounted) {
        if (data.guest_lat && data.guest_lng) {
          setGuestCoords({ lat: data.guest_lat, lng: data.guest_lng });
        }
        if (data.guest_arrived) {
          setGuestArrived(true);
        }
      }
    };

    fetchInitial();

    // Subscribe to changes on this specific session
    const channel = supabase
      .channel(`session_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'host_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload: any) => {
          const { guest_lat, guest_lng, guest_arrived } = payload.new;
          if (guest_lat && guest_lng) {
            setGuestCoords({ lat: guest_lat, lng: guest_lng });
          }
          if (guest_arrived && !hasNotifiedArrival) {
            setGuestArrived(true);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [session.id, hasNotifiedArrival]);

  // Update Guest Marker & Draw Line
  useEffect(() => {
    if (!mapInstanceRef.current || !LRef.current || !guestCoords) return;

    const map = mapInstanceRef.current;
    const L = LRef.current;

    // Guest Marker
    if (!guestMarkerRef.current) {
      const guestIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                    <div class="absolute -top-8 bg-accent-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-10 transition-all">
                        Guest
                    </div>
                    <div class="absolute w-8 h-8 bg-accent-500/30 rounded-full animate-pulse"></div>
                    <div class="w-4 h-4 bg-accent-500 border-2 border-white rounded-full shadow-lg"></div>
                </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: 'marker-custom transition-all duration-1000', // Smooth movement
      });
      guestMarkerRef.current = L.marker([guestCoords.lat, guestCoords.lng], { icon: guestIcon }).addTo(map);

      // Fit bounds to show both host and guest initially
      const bounds = L.latLngBounds(
        [session.lat, session.lng],
        [guestCoords.lat, guestCoords.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    } else {
      guestMarkerRef.current.setLatLng([guestCoords.lat, guestCoords.lng]);
    }

    // Straight line between host and guest to indicate connection
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }
    
    routeLayerRef.current = L.polyline(
      [[session.lat, session.lng], [guestCoords.lat, guestCoords.lng]], 
      { color: '#3B82F6', weight: 3, dashArray: '5, 10', opacity: 0.5 }
    ).addTo(map);

    // Calculate distance
    const dist = haversine(session.lat, session.lng, guestCoords.lat, guestCoords.lng);
    setDistance(Math.round(dist));

  }, [guestCoords, session.lat, session.lng]);

  // Handle Arrival Notification
  useEffect(() => {
    if (guestArrived && !hasNotifiedArrival) {
      setHasNotifiedArrival(true);
      playSound();
    }
  }, [guestArrived, hasNotifiedArrival, playSound]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      if (guestCoords) {
        const L = LRef.current;
        const bounds = L.latLngBounds(
          [session.lat, session.lng],
          [guestCoords.lat, guestCoords.lng]
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
      } else {
        mapInstanceRef.current.setView([session.lat, session.lng], 18);
      }
    }
  };

  return (
    <div className="absolute inset-0 z-[5000] bg-slate-50 flex flex-col animate-in-fade font-jakarta overflow-hidden">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[5010] p-4 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm pointer-events-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={onExitAction}
            className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-navy-600 pointer-events-auto hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex-1">
            <h2 className="text-sm font-black text-navy-800 uppercase tracking-wide">Live Tracking</h2>
            <p className="text-[11px] font-medium text-navy-500">ID: {session.id}</p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full bg-slate-200" />
      </div>

      {/* Status Panel */}
      <div className="absolute bottom-6 left-4 right-4 z-[5010] pointer-events-none">
        <div className="flex flex-col gap-3">
          {/* Recenter Button */}
          <div className="flex justify-end pointer-events-auto">
            <button
              onClick={handleRecenter}
              className="w-12 h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-navy-600 hover:bg-slate-50 transition-all active:scale-95"
            >
              <Target size={20} />
            </button>
          </div>

          {/* Main Status Card */}
          <GlassCard className="w-full !p-5 pointer-events-auto shadow-2xl !rounded-[2rem]">
            {guestArrived ? (
              <div className="flex flex-col items-center text-center animate-in-slide-up">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 animate-bounce">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-extrabold text-navy-800 mb-1">Your Guest Has Arrived!</h3>
                <p className="text-sm font-medium text-navy-500 mb-4">
                  They tapped "I'm Here". You should see them now.
                </p>
                <CustomButton
                  variant="primary"
                  isLoading={isClosing}
                  onClick={async () => {
                    setIsClosing(true);
                    await supabase.from('host_sessions').delete().eq('id', session.id);
                    onExitAction();
                  }}
                  className="w-full"
                >
                  Close Tracking & Delete Session
                </CustomButton>
              </div>
            ) : !guestCoords ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-navy-800 mb-0.5">Waiting for Guest...</h3>
                  <p className="text-xs font-medium text-navy-400">
                    They haven't opened the link or granted location access yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-accent-400/20 rounded-full animate-ping" />
                  <User className="w-5 h-5 text-accent-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-navy-800 mb-0.5 flex items-center gap-2">
                    Guest is Navigating
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </h3>
                  <p className="text-xs font-bold text-accent-500">
                    {distance !== null ? `~${distance}m away` : 'Connecting...'}
                  </p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
