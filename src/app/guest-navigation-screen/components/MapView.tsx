import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Target, Navigation2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { HostData, GuestCoords } from './GuestNavigationClient';
import FloatingInfoCard from './FloatingInfoCard';
import CustomButton from '@/components/ui/CustomButton';
import ArrivalOverlay from './ArrivalOverlay';

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

export type Props = {
  hostData: HostData;
  guestCoords: GuestCoords;
};

export type RouteInfo = {
  durationSeconds: number;
  distanceMeters: number;
};

export type TravelMode = 'walk' | 'drive';

export default function MapView({ hostData, guestCoords: initialGuestCoords }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const guestMarkerRef = useRef<any>(null);

  const [guestCoords, setGuestCoords] = useState(initialGuestCoords);
  const [travelMode, setTravelMode] = useState<TravelMode>('walk');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState(false);
  const [isArrived, setIsArrived] = useState(false);

  const LRef = useRef<any>(null);

  // Update guest coords whenever they change via props (real GPS)
  useEffect(() => {
    setGuestCoords(initialGuestCoords);
  }, [initialGuestCoords]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([guestCoords.lat, guestCoords.lng], 18, {
        animate: true,
        duration: 1,
      });
    }
  };

  // Initialize Map and Markers
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      LRef.current = L;

      if (!isMounted || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [hostData.lat, hostData.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const hostIcon = L.divIcon({
        html: `<div class="relative flex flex-col items-center">
                    <div class="absolute -top-10 bg-navy-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap z-10">
                        ${hostData.hostName}
                    </div>
                    <div class="absolute w-12 h-12 bg-navy-600/20 rounded-full animate-ping"></div>
                    <div class="relative w-10 h-10 bg-navy-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-xl transform -rotate-3">
                        <span class="text-xl">📍</span>
                    </div>
                </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        className: 'marker-custom',
      });

      const guestIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                    <div class="absolute w-8 h-8 bg-accent-500/30 rounded-full animate-pulse"></div>
                    <div class="w-4 h-4 bg-accent-500 border-2 border-white rounded-full shadow-lg"></div>
                </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: 'marker-custom',
      });

      L.marker([hostData.lat, hostData.lng], { icon: hostIcon }).addTo(map);
      guestMarkerRef.current = L.marker([guestCoords.lat, guestCoords.lng], {
        icon: guestIcon,
      }).addTo(map);

      const bounds = L.latLngBounds(
        [hostData.lat, hostData.lng],
        [guestCoords.lat, guestCoords.lng]
      );
      map.fitBounds(bounds, { padding: [100, 80] });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hostData]);

  // Fix for white patches: invalidate size after a small delay to ensure full render
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [mapInstanceRef.current]);

  // Move guest marker when coords change
  useEffect(() => {
    if (guestMarkerRef.current) {
      guestMarkerRef.current.setLatLng([guestCoords.lat, guestCoords.lng]);
    }
  }, [guestCoords]);

  // Distance Calculation and Arrival check
  useEffect(() => {
    const dist = haversine(guestCoords.lat, guestCoords.lng, hostData.lat, hostData.lng);
    if (dist < 25 && !isArrived) {
      setIsArrived(true);
    }
  }, [guestCoords, hostData, isArrived]);

  const fetchRoute = useCallback(async () => {
    if (!mapInstanceRef.current || !LRef.current) return;

    const map = mapInstanceRef.current;
    const L = LRef.current;

    setRouteLoading(true);
    setRouteError(false);

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const profile = travelMode === 'drive' ? 'driving' : 'foot';
    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${guestCoords.lng},${guestCoords.lat};${hostData.lng},${hostData.lat}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(osrmUrl);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        const color = travelMode === 'drive' ? '#10B981' : '#3B82F6';

        const routeGroup = L.featureGroup();
        L.polyline(coords, { color, weight: 8, opacity: 0.15, lineCap: 'round' }).addTo(routeGroup);
        L.polyline(coords, {
          color,
          weight: 4,
          opacity: 1,
          lineCap: 'round',
          dashArray: travelMode === 'walk' ? '1, 10' : undefined,
        }).addTo(routeGroup);

        routeGroup.addTo(map);
        routeLayerRef.current = routeGroup;

        setRouteInfo({ durationSeconds: route.duration, distanceMeters: route.distance });
        setRouteLoading(false);
      } else throw new Error();
    } catch {
      const dist = haversine(guestCoords.lat, guestCoords.lng, hostData.lat, hostData.lng);
      const speed = travelMode === 'walk' ? 1.4 : 10;
      setRouteInfo({ durationSeconds: dist / speed, distanceMeters: dist });
      setRouteError(true);
      setRouteLoading(false);
    }
  }, [travelMode, hostData, guestCoords]);

  useEffect(() => {
    const timeout = setTimeout(fetchRoute, 1500);
    return () => clearTimeout(timeout);
  }, [fetchRoute]);

  return (
    <div className="relative w-full h-screen bg-slate-50 font-jakarta overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Arrival State Overlay */}
      {isArrived && (
        <ArrivalOverlay hostName={hostData.hostName} hostId={hostData.id} onClose={() => setIsArrived(false)} />
      )}

      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-[1001] pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/50 shadow-sm inline-flex items-center gap-2 sm:gap-3">
          <Navigation2
            size={14}
            className={`fill-current sm:w-4 sm:h-4 ${travelMode === 'drive' ? 'text-emerald-500' : 'text-accent-500'}`}
          />
          <span className="text-[9px] sm:text-[10px] font-black text-navy-600 uppercase tracking-widest leading-none">
            Active Navigation
          </span>
        </div>
      </div>

      <div className="absolute top-20 sm:top-24 right-4 sm:right-6 z-[1001] flex flex-col gap-2 sm:gap-3">
        <CustomButton
          variant="primary"
          size="sm"
          onClick={handleRecenter}
          className="!p-2.5 sm:!p-3 !rounded-xl sm:!rounded-2xl shadow-floating bg-white !text-navy-600 hover:!bg-slate-50 border border-slate-100 transition-all active:scale-95"
          icon={<Target size={18} className="sm:w-5 sm:h-5" />}
        >
          <span className="sr-only">Recenter</span>
        </CustomButton>
      </div>

      <FloatingInfoCard
        hostData={hostData}
        routeInfo={routeInfo}
        routeLoading={routeLoading}
        routeError={routeError}
        travelMode={travelMode}
        onModeChange={setTravelMode}
      />
    </div>
  );
}
