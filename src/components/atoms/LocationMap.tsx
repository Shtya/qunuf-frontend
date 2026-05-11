'use client';

import Map, { Marker } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// Load RTL plugin for proper Arabic shaping
maplibregl.setRTLTextPlugin(
    'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
    true // Lazy load
);

type Props = {
    lat: number;
    lng: number;
    zoom?: number;
    onChange?: (coords: { lat: number; lng: number }) => void;
};

export default function LocationMap({ lat, lng, onChange, zoom = 8 }: Props) {
    const [isInteracting, setIsInteracting] = useState(false);
    const t = useTranslations('comman.form')
    return (
        <div className="relative group">
            {/* Glow effect on hover */}
            <div className={cn(
                "absolute -inset-1 bg-gradient-to-r from-secondary/20 via-primary/20 to-secondary/20 rounded-2xl opacity-0 blur-md transition-opacity duration-300",
                "group-hover:opacity-100"
            )} />

            {/* Map container */}
            <div className={cn(
                "relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden",
                "rounded-2xl border-2 transition-all duration-300",
                "shadow-lg shadow-secondary/10",
                isInteracting
                    ? "border-secondary shadow-xl shadow-secondary/20 scale-[1.01]"
                    : "border-gray/20 hover:border-secondary/40"
            )}>
                <Map
                    initialViewState={{
                        latitude: lat,
                        longitude: lng,
                        zoom,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="https://tiles.openfreemap.org/styles/liberty"
                    onClick={(e) => {
                        const { lat, lng } = e.lngLat;
                        onChange?.({ lat, lng });
                    }}
                    onMouseDown={() => setIsInteracting(true)}
                    onMouseUp={() => setIsInteracting(false)}
                    onTouchStart={() => setIsInteracting(true)}
                    onTouchEnd={() => setIsInteracting(false)}
                    dragRotate={false}
                >
                    {/* Custom Marker */}
                    <Marker latitude={lat} longitude={lng}>
                        <div className="relative animate__animated animate__bounceIn">
                            {/* Pulsing ring */}
                            <div className="absolute inset-0 -m-3 bg-secondary/30 rounded-full animate-ping" />
                            <div className="absolute inset-0 -m-2 bg-secondary/40 rounded-full animate-pulse" />

                            {/* Main pin */}
                            <div className="relative">
                                <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="drop-shadow-xl"
                                >
                                    <path
                                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                        fill="url(#gradient)"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: 'var(--secondary)' }} />
                                            <stop offset="100%" style={{ stopColor: 'var(--primary)' }} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </Marker>
                </Map>

                {/* Instructions overlay */}
                <div className={cn(
                    "absolute top-4 left-1/2 -translate-x-1/2",
                    "bg-dashboard-bg/95 backdrop-blur-md",
                    "px-4 py-2 rounded-full shadow-lg border border-secondary/20",
                    "text-xs sm:text-sm font-semibold text-dark",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "pointer-events-none"
                )}>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        {t("mapInstruction")}
                    </span>
                </div>

                {/* Zoom controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <div className={cn(
                        "bg-dashboard-bg/95 backdrop-blur-md rounded-lg shadow-lg border border-secondary/20",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}>
                        {/* Info badge */}
                        <div className="px-3 py-2 text-xs font-semibold text-dark/60">
                            Zoom: {zoom}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}