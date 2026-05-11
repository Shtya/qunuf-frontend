'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { ReactElement, useEffect, useState } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { cn } from '@/lib/utils';

const LocationMap = dynamic(() => import('../../atoms/LocationMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl bg-gradient-to-br from-gray/20 to-gray/10 animate-pulse flex items-center justify-center">
            <div className="text-center space-y-3">
                <div className="w-16 h-16 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin mx-auto" />
                <p className="text-sm font-medium text-placeholder">Loading map...</p>
            </div>
        </div>
    )
});

async function reverseGeocode(
    lat: number,
    lng: number,
    t: ReturnType<typeof useTranslations>,
    signal?: AbortSignal,
    locale?: "ar" | 'en'
): Promise<string> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${locale ?? 'ar'}`;
        const res = await fetch(url, {
            signal,
            headers: {
                'User-Agent': 'YourAppName/1.0 (your-email@example.com)',
            },
        });
        if (!res.ok) throw new Error('Reverse geocoding failed');
        const data = await res.json();
        return data.display_name || t("unknownAddress");
    } catch (e: any) {
        if (e?.name === 'AbortError') throw e;
        return t("addressFetchError");
    }
}

type LocationInputProps = {
    control: Control<any>;
    name: Path<any>;
    showAddress?: boolean;
};

export type LocationInputType = (
    props: LocationInputProps
) => ReactElement;

function LocationInput({ control, name, showAddress = true }: LocationInputProps) {
    const {
        field: { value: position, onChange },
    } = useController({
        name,
        control,
    });
    const t = useTranslations("comman.form.locationInput");
    const locale = useLocale();

    const [address, setAddress] = useState<string>(t("fetching"));
    const [loadingAddress, setLoadingAddress] = useState<boolean>(false);
    const [latInput, setLatInput] = useState(position.lat.toFixed(6));
    const [lngInput, setLngInput] = useState(position.lng.toFixed(6));
    const [error, setError] = useState<string>('');

    const { debouncedValue: debouncedLatInput } = useDebounce({ value: latInput, delay: 800 });
    const { debouncedValue: debouncedLngInput } = useDebounce({ value: lngInput, delay: 800 });

    // Sync text inputs when position changes
    useEffect(() => {
        setLatInput(position.lat.toFixed(6));
        setLngInput(position.lng.toFixed(6));
    }, [position]);

    // Fetch address when position changes
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        if (!showAddress) return;

        const fetchAddress = async () => {
            try {
                setLoadingAddress(true);
                const addr = await reverseGeocode(position.lat, position.lng, t, controller.signal, locale as 'ar' | 'en');
                if (!isMounted) return;
                setAddress(addr);
            } catch (err) {
                if (!isMounted) return;
                setAddress(t("fetching"));
            } finally {
                if (isMounted) setLoadingAddress(false);
            }
        };

        fetchAddress();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [position, locale, showAddress]);

    // Validate and apply changes
    useEffect(() => {
        const lat = parseFloat(debouncedLatInput);
        const lng = parseFloat(debouncedLngInput);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            if (lat < -90 || lat > 90) {
                setError(t("latRangeError"));
                return;
            }
            if (lng < -180 || lng > 180) {
                setError(t("lngRangeError"));
                return;
            }
            setError('');
            onChange({ lat, lng });
        } else {
            setError(t("invalidInput"));
        }
    }, [debouncedLngInput, debouncedLatInput]);

    return (
        <div className="space-y-6 !p-6 animate__animated animate__fadeIn">

            {/* Address Display */}
            {showAddress && (
                <div className={cn(
                    "relative group overflow-hidden",
                    "bg-gradient-to-r from-lighter/50 via-highlight/30 to-lighter/50",
                    "rounded-xl border-2 border-secondary/20 p-4",
                    "shadow-md hover:shadow-lg transition-all duration-300"
                )}>
                    {/* Glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 blur-sm group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-lg",
                            "bg-gradient-to-br from-secondary to-primary",
                            "flex items-center justify-center shadow-lg",
                            loadingAddress && "animate-pulse"
                        )}>
                            {loadingAddress ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </div>

                        {/* Address Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">
                                {t("addressPrefix") || "Location Address"}
                            </p>
                            <p className={cn(
                                "text-sm sm:text-base font-medium text-dark leading-relaxed",
                                loadingAddress && "animate-pulse"
                            )}>
                                {loadingAddress ? (
                                    <span className="text-placeholder">{t("fetching")}...</span>
                                ) : (
                                    address
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

 

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Latitude Input */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="lat" className="text-input font-semibold text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18" />
                        </svg>
                        {t("latitude")}
                        <span className="text-red-500">*</span>

                        {/* Tooltip */}
                        <span className="relative group/tooltip">
                            <svg className="w-3.5 h-3.5 text-placeholder cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9h2v6H9V9zm0-4h2v2H9V5z" />
                            </svg>
                            <span className={cn(
                                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2",
                                "bg-dark text-white text-xs rounded-lg whitespace-nowrap",
                                "opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200",
                                "pointer-events-none z-10 shadow-xl"
                            )}>
                                Range: -90 to 90
                                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark" />
                            </span>
                        </span>
                    </label>

                    <div className="relative group/input">
                        {/* Glow effect */}
                        <div className={cn(
                            "absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 blur-sm transition-opacity duration-200",
                            !error && "group-focus-within/input:opacity-100"
                        )} />

                        <input
                            id="lat"
                            type="number"
                            step="0.000001"
                            min={-90}
                            max={90}
                            inputMode="decimal"
                            placeholder={t("latitudePlaceholder", { lat: latInput })}
                            value={latInput}
                            onChange={(e) => setLatInput(e.target.value)}
                            className={cn(
                                "relative w-full h-[46px] px-4 rounded-xl text-sm font-medium",
                                "bg-white border-2 transition-all duration-200",
                                "text-dark placeholder:text-placeholder",
                                "focus:outline-none focus:ring-2 focus:ring-transparent",
                                error
                                    ? "border-red-300 bg-red-50/30 focus:border-red-400"
                                    : "border-gray/20 hover:border-secondary/40 focus:border-secondary"
                            )}
                        />
                    </div>
                </div>

                {/* Longitude Input */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="lng" className="text-input font-semibold text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        {t("longitude")}
                        <span className="text-red-500">*</span>

                        {/* Tooltip */}
                        <span className="relative group/tooltip">
                            <svg className="w-3.5 h-3.5 text-placeholder cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9h2v6H9V9zm0-4h2v2H9V5z" />
                            </svg>
                            <span className={cn(
                                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2",
                                "bg-dark text-white text-xs rounded-lg whitespace-nowrap",
                                "opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200",
                                "pointer-events-none z-10 shadow-xl"
                            )}>
                                Range: -180 to 180
                                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark" />
                            </span>
                        </span>
                    </label>

                    <div className="relative group/input">
                        {/* Glow effect */}
                        <div className={cn(
                            "absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 blur-sm transition-opacity duration-200",
                            !error && "group-focus-within/input:opacity-100"
                        )} />

                        <input
                            id="lng"
                            type="number"
                            step="0.000001"
                            min={-180}
                            max={180}
                            inputMode="decimal"
                            placeholder={t("longitudePlaceholder", { lng: lngInput })}
                            value={lngInput}
                            onChange={(e) => setLngInput(e.target.value)}
                            className={cn(
                                "relative w-full h-[46px] px-4 rounded-xl text-sm font-medium",
                                "bg-white border-2 transition-all duration-200",
                                "text-dark placeholder:text-placeholder",
                                "focus:outline-none focus:ring-2 focus:ring-transparent",
                                error
                                    ? "border-red-300 bg-red-50/30 focus:border-red-400"
                                    : "border-gray/20 hover:border-secondary/40 focus:border-secondary"
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl",
                    "bg-red-50 border border-red-200 text-red-600",
                    "animate__animated animate__shakeX"
                )}>
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Map */}
            <div className="animate__animated animate__fadeInUp animate__delay-1s">
                <LocationMap
                    lat={position.lat}
                    lng={position.lng}
                    onChange={(coords) => onChange(coords)}
                />
            </div>
        </div>
    );
}

export default LocationInput;