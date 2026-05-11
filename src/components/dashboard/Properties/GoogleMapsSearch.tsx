'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export interface MapPlaceResult {
    formatted_address: string;
    lat: number;
    lng: number;
    postalCode?: string;
    district?: string;
    city?: string;
    region?: string;
    regionCode?: string;
    country?: string;
    streetName?: string;
    streetNumber?: string;
}

interface GoogleMapsSearchProps {
    onPlaceSelect: (result: MapPlaceResult) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function GoogleMapsSearch({
    onPlaceSelect,
    placeholder = 'Search address...',
    label,
    className,
}: GoogleMapsSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!loaded || !inputRef.current) return;
        const g = (window as any).google;
        if (!g?.maps?.places) return;

        const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'sa' },
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place?.geometry?.location) return;

            const components: { types: string[]; long_name: string; short_name: string }[] =
                place.address_components ?? [];
            const get = (type: string) =>
                components.find(c => c.types.includes(type))?.long_name;
            const getShort = (type: string) =>
                components.find(c => c.types.includes(type))?.short_name;

            onPlaceSelect({
                formatted_address: place.formatted_address ?? '',
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                postalCode: get('postal_code'),
                district: get('sublocality_level_1') ?? get('neighborhood'),
                city: get('locality') ?? get('administrative_area_level_2'),
                region: get('administrative_area_level_1'),
                regionCode: getShort('administrative_area_level_1'),
                country: get('country'),
                streetName: get('route'),
                streetNumber: get('street_number'),
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded]);

    if (!MAPS_API_KEY) return null;

    return (
        <>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&language=ar`}
                strategy="afterInteractive"
                onLoad={() => setLoaded(true)}
            />
            <div className={className}>
                {label && (
                    <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-dark/10 bg-white
                            text-[13px] text-dark placeholder:text-dark/30 font-medium
                            focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40
                            transition-all duration-150"
                    />
                    <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-dark/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    );
}
