import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Target, Navigation2 } from 'lucide-react';
import { HostData, GuestCoords } from './GuestNavigationClient';
import FloatingInfoCard from './FloatingInfoCard';
import CustomButton from '@/components/ui/CustomButton';

type Props = {
    hostData: HostData;
    guestCoords: GuestCoords;
};

export type RouteInfo = {
    durationSeconds: number;
    distanceMeters: number;
};

export type TravelMode = 'walk' | 'drive';

// Haversine distance in meters
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapView({ hostData, guestCoords }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstanceRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routeLayerRef = useRef<any>(null);

    const [travelMode, setTravelMode] = useState<TravelMode>('walk');
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [routeLoading, setRouteLoading] = useState(true);
    const [routeError, setRouteError] = useState(false);

    const LRef = useRef<any>(null);

    const handleRecenter = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([guestCoords.lat, guestCoords.lng], 17, {
                animate: true,
                duration: 1,
            });
        }
    };

    // 1. Initialize Map and Markers (Runs Once)
    useEffect(() => {
        let isMounted = true;

        async function initMap() {
            if (!mapRef.current || mapInstanceRef.current) return;

            const L = (await import('leaflet')).default;
            LRef.current = L;

            if (!isMounted || mapInstanceRef.current) return;

            await import('leaflet/dist/leaflet.css');

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const midLat = (hostData.lat + guestCoords.lat) / 2;
            const midLng = (hostData.lng + guestCoords.lng) / 2;

            const map = L.map(mapRef.current, {
                center: [midLat, midLng],
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
                html: `<div class="relative flex items-center justify-center">
                    <div class="absolute w-12 h-12 bg-navy-600/20 rounded-full animate-ping"></div>
                    <div class="relative w-10 h-10 bg-navy-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-xl transform -rotate-3">
                        <span class="text-xl">📍</span>
                    </div>
                </div>`,
                iconSize: [48, 48],
                iconAnchor: [24, 24],
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
            L.marker([guestCoords.lat, guestCoords.lng], { icon: guestIcon }).addTo(map);

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
    }, [hostData, guestCoords]); // Re-init strictly if coords completely change context (rare)

    // 2. Fetch and Draw Route (Runs on travelMode change)
    const fetchRoute = useCallback(async () => {
        if (!mapInstanceRef.current || !LRef.current) return;
        
        const map = mapInstanceRef.current;
        const L = LRef.current;

        setRouteLoading(true);
        setRouteError(false);

        // Remove existing route layer
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
                const coords = route.geometry.coordinates.map(
                    (c: [number, number]) => [c[1], c[0]] as [number, number]
                );

                const color = travelMode === 'drive' ? '#10B981' : '#3B82F6'; // Emerald for drive, Blue for walk

                // Feature Group to hold multi-layer polylines
                const routeGroup = L.featureGroup();

                L.polyline(coords, {
                    color: color,
                    weight: 8,
                    opacity: 0.2,
                    lineCap: 'round',
                }).addTo(routeGroup);

                L.polyline(coords, {
                    color: color,
                    weight: 4,
                    opacity: travelMode === 'drive' ? 1 : 0.8,
                    lineCap: 'round',
                    dashArray: travelMode === 'walk' ? '1, 10' : undefined,
                    dashOffset: '0',
                }).addTo(routeGroup);

                routeGroup.addTo(map);
                routeLayerRef.current = routeGroup;

                setRouteInfo({
                    durationSeconds: route.duration,
                    distanceMeters: route.distance,
                });
                
                // Adjust bounds to fit route
                map.fitBounds(routeGroup.getBounds(), { padding: [100, 80], animate: true });
                setRouteLoading(false);
            } else {
                throw new Error('No route found');
            }
        } catch {
            const dist = haversine(guestCoords.lat, guestCoords.lng, hostData.lat, hostData.lng);
            const speed = travelMode === 'walk' ? 1.4 : 10; // m/s
            
            const fallbackLine = L.polyline(
                [[guestCoords.lat, guestCoords.lng], [hostData.lat, hostData.lng]],
                { color: travelMode === 'drive' ? '#10B981' : '#3B82F6', weight: 4, opacity: 0.6, dashArray: '8 12' }
            ).addTo(map);
            
            routeLayerRef.current = fallbackLine;

            setRouteInfo({
                durationSeconds: dist / speed,
                distanceMeters: dist,
            });
            setRouteError(true);
            setRouteLoading(false);
        }
    }, [travelMode, hostData, guestCoords]);

    // Trigger route fetch when map is ready and mode changes
    useEffect(() => {
        // We need a slight delay to ensure LRef and mapInstance are populated if rendering rapidly
        const timeout = setTimeout(() => {
            fetchRoute();
        }, 100);
        return () => clearTimeout(timeout);
    }, [fetchRoute]);

    return (
        <div className="relative w-full h-screen bg-slate-50 font-jakarta overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />

            <div className="absolute top-6 left-6 right-6 z-[1001] pointer-events-none">
                <div className="flex items-center justify-between">
                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3">
                        <Navigation2 size={16} className={`fill-current ${travelMode === 'drive' ? 'text-emerald-500' : 'text-accent-500'}`} />
                        <span className="text-[10px] font-black text-navy-600 uppercase tracking-widest leading-none">
                            Active Navigation
                        </span>
                    </div>
                </div>
            </div>

            <div className="absolute top-24 right-6 z-[1001] flex flex-col gap-3">
                <CustomButton
                    variant="primary"
                    size="sm"
                    onClick={handleRecenter}
                    className="!p-3 !rounded-2xl shadow-floating bg-white !text-navy-600 hover:!bg-slate-50 border border-slate-100 transition-all active:scale-95"
                    icon={<Target size={20} />}
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
