'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, MapPin, Search, RotateCcw, Crosshair } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';
import GlassCard from '@/components/ui/GlassCard';

type Props = {
  initialCoords: { lat: number; lng: number };
  hostName: string;
  accuracy?: number | null;
  onConfirmAction: (coords: { lat: number; lng: number }) => void;
  onCancelAction: () => void;
};

export default function LocationPicker({ initialCoords, hostName, accuracy, onConfirmAction, onCancelAction }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const [coords, setCoords] = useState(initialCoords);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isRelocating, setIsRelocating] = useState(false);

  // Search for places using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Move marker to a searched location
  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCoords({ lat, lng });
    setSearchResults([]);
    setShowSearch(false);
    setSearchQuery('');

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 18, { animate: true });
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(5); // After manual selection, accuracy is ~5m
      }
    }
  };

  // Re-capture GPS from the map view
  const handleRecaptureGPS = () => {
    if (!navigator.geolocation) return;
    setIsRelocating(true);

    let bestReading: GeolocationPosition | null = null;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const acc = position.coords.accuracy;
        if (!bestReading || acc < bestReading.coords.accuracy) {
          bestReading = position;
        }
        if (acc <= 10) {
          finish();
        }
      },
      () => { finish(); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    const finish = () => {
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      setIsRelocating(false);
      if (bestReading) {
        const lat = bestReading.coords.latitude;
        const lng = bestReading.coords.longitude;
        const acc = bestReading.coords.accuracy;
        setCoords({ lat, lng });
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (mapInstanceRef.current) mapInstanceRef.current.setView([lat, lng], 18, { animate: true });
        if (accuracyCircleRef.current) accuracyCircleRef.current.setLatLng([lat, lng]).setRadius(acc > 50 ? 50 : acc);
      }
    };

    const timer = setTimeout(finish, 5000);
  };

  // Initialize the Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      LRef.current = L;
      if (!isMounted) return;

      await import('leaflet/dist/leaflet.css');

      // Adaptive zoom: if accuracy is bad (>100m), zoom out so user sees more area
      const initialZoom = accuracy && accuracy > 100 ? 15 : accuracy && accuracy > 30 ? 17 : 18;

      const map = L.map(mapRef.current, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Draw accuracy circle to show GPS uncertainty (capped at 50m for visual clarity)
      const circleRadius = Math.min(accuracy || 30, 50);
      const circle = L.circle([initialCoords.lat, initialCoords.lng], {
        radius: circleRadius,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '6, 4',
      }).addTo(map);
      accuracyCircleRef.current = circle;

      // Draggable marker
      const hostIcon = L.divIcon({
        html: `<div class="relative flex flex-col items-center" style="filter: drop-shadow(0 4px 12px rgba(27,42,74,0.3))">
                    <div class="absolute -top-10 bg-navy-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap z-10">
                        📍 Your Location
                    </div>
                    <div class="relative w-10 h-10 bg-navy-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-xl">
                        <span class="text-xl">📌</span>
                    </div>
                    <div class="w-3 h-3 bg-navy-600 rotate-45 -mt-1.5 border-r-2 border-b-2 border-white"></div>
                </div>`,
        iconSize: [40, 55],
        iconAnchor: [20, 55],
        className: 'marker-custom',
      });

      const marker = L.marker([initialCoords.lat, initialCoords.lng], {
        icon: hostIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        setCoords({ lat: newPos.lat, lng: newPos.lng });
        circle.setLatLng(newPos);
        circle.setRadius(5); // Manual adjustment = very precise
      });

      // Tap map to move marker
      map.on('click', (e: any) => {
        const newPos = e.latlng;
        marker.setLatLng(newPos);
        circle.setLatLng(newPos);
        circle.setRadius(5);
        setCoords({ lat: newPos.lat, lng: newPos.lng });
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialCoords, hostName, accuracy]);

  return (
    <div className="animate-in-fade flex flex-col gap-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-black text-navy-600 mb-2">Confirm Your Location</h1>
        <p className="text-sm text-navy-400 font-medium">
          Move the pin to your <span className="text-navy-600 font-bold">exact</span> spot, or search for your building below.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-navy-400 hover:border-accent-300 transition-all shadow-sm"
        >
          <Search size={16} className="text-accent-500" />
          <span>Search for a building or place...</span>
        </button>

        {showSearch && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[1001] overflow-hidden animate-in-slide-up">
            <div className="flex items-center gap-2 p-3 border-b border-slate-100">
              <Search size={16} className="text-navy-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Accounts Office, Building 7..."
                className="flex-1 text-sm font-medium text-navy-600 outline-none bg-transparent placeholder:text-navy-300"
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-3 py-1.5 bg-navy-600 text-white text-xs font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
              >
                {isSearching ? '...' : 'Go'}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto">
                {searchResults.map((r: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(r)}
                    className="w-full text-left px-4 py-3 text-sm text-navy-600 hover:bg-accent-50 border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <span className="font-bold">{r.display_name.split(',')[0]}</span>
                    <span className="text-navy-300 text-xs block mt-0.5">
                      {r.display_name.split(',').slice(1, 4).join(',')}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="p-4 text-xs text-navy-300 text-center font-medium">No results. Try a different search.</p>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <GlassCard className="!p-0 !rounded-[2rem] overflow-hidden shadow-2xl relative border-white/40 h-[380px]">
        <div ref={mapRef} className="w-full h-full" />

        {/* Map Controls */}
        <div className="absolute bottom-5 right-5 z-[1000] flex flex-col gap-2">
          {/* Re-capture GPS */}
          <button
            onClick={handleRecaptureGPS}
            disabled={isRelocating}
            className={`p-3 rounded-2xl shadow-xl border transition-all active:scale-95 ${
              isRelocating
                ? 'bg-accent-50 text-accent-600 border-accent-200 animate-pulse'
                : 'bg-white text-navy-600 border-slate-100 hover:bg-slate-50'
            }`}
            title="Re-capture GPS"
          >
            {isRelocating ? <RotateCcw size={20} className="animate-spin" /> : <Crosshair size={20} />}
          </button>
        </div>



        {/* Top Badge */}
        <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/50 shadow-sm inline-flex items-center gap-2">
            <MapPin size={14} className="text-accent-500" />
            <span className="text-[10px] font-black text-navy-600 uppercase tracking-widest leading-none">
              Drag pin · Tap map · Or search above
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Coordinates Display */}
      <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-navy-300">
        <span>{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <CustomButton
          variant="primary"
          onClick={() => onConfirmAction(coords)}
          className="w-full !py-4 shadow-xl !rounded-2xl"
          icon={<Check size={20} />}
        >
          Confirm This Location
        </CustomButton>
        <button
          onClick={onCancelAction}
          className="text-sm font-bold text-navy-300 hover:text-navy-400 py-2 transition-colors"
        >
          Cancel and Go Back
        </button>
      </div>
    </div>
  );
}
