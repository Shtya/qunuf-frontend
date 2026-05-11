'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import TextInput from '@/components/molecules/forms/TextInput';
import { useTranslations } from 'next-intl';
import api from '@/libs/axios';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';

interface PropertyNameInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    label: string;
    placeholder: string;
    initialEditName?: string; // The original name when editing
    propertyId?: string; // Current property ID when editing (to exclude from uniqueness check)
    setError?: (name: string, error: { type: string; message: string }) => void; // React Hook Form setError
    clearErrors?: () => void; // React Hook Form clearErrors
}

export default function PropertyNameInput({
    value,
    onChange,
    onBlur,
    error,
    label,
    placeholder,
    initialEditName,
    propertyId,
    setError,
    clearErrors,
}: PropertyNameInputProps) {
    const t = useTranslations('dashboard.properties.form');
    const [isChecking, setIsChecking] = useState(false);
    const [isUnique, setIsUnique] = useState<boolean | null>(null);
    const [checkError, setCheckError] = useState<string | null>(null);

    const { debouncedValue } = useDebounce({ value, delay: 500 });
    const abortRef = useRef<AbortController | null>(null);

    // FIX 1: Optimized Change Handler
    const handleChange = (newValue: string) => {
        onChange(newValue);

        // Only reset if we actually have an existing status
        if (isUnique !== null) setIsUnique(null);
        if (checkError !== null) setCheckError(null);

        // Only clear form errors if one exists (prevents unnecessary re-renders)
        if (error) clearErrors?.();
    };

    useEffect(() => {
        const checkUniqueness = async () => {
            if (abortRef.current) abortRef.current.abort();

            const trimmed = debouncedValue.trim();

            // Skip check if too short
            if (!trimmed || trimmed.length < 3) {
                setIsUnique(null);
                setCheckError(null);
                return;
            }

            if (initialEditName && trimmed === initialEditName.trim()) {
                setIsUnique(true);
                setCheckError(null);
                return;
            }

            const controller = new AbortController();
            abortRef.current = controller;
            setIsChecking(true);

            try {
                const response = await api.get<{ isUnique: boolean }>(
                    `/properties/check-slug?name=${encodeURIComponent(trimmed)}${propertyId ? `&excludeId=${propertyId}` : ''}`,
                    { signal: controller.signal }
                );

                const unique = response.data.isUnique;
                setIsUnique(unique);

                if (unique) {
                    setCheckError(null);
                } else {
                    const msg = t('validation.nameExists');
                    setCheckError(msg);
                    setError?.('name', { type: 'manual', message: msg });
                }
            } catch (err: any) {
                if (err.name === 'CanceledError') return;
                setIsUnique(false);
                setCheckError(t('validation.checkFailed'));
            } finally {
                if (abortRef.current === controller) setIsChecking(false);
            }
        };

        checkUniqueness();
    }, [debouncedValue, initialEditName, propertyId, t, setError]);

    // REMOVED: The second useEffect that was watching value vs debouncedValue.
    // That logic is now inside handleChange for better performance.

    const displayError = error || checkError || null;
    const showSuccess = isUnique === true && !isChecking && value.trim().length >= 3;

    return (
        <div className="w-full">
            <div className="relative">
                <TextInput
                    value={value}
                    onChange={(e) => handleChange(e.target.value)} // Use optimized handler
                    onBlur={onBlur}
                    label={label}
                    placeholder={placeholder}
                    error={displayError}
                />

                {/* Indicators moved to an absolute container to prevent layout shift lag */}
                <div className="min-h-[20px] mt-1">
                    {value.trim().length >= 3 && (
                        <div className="flex items-center gap-2">
                            {isChecking ? (
                                <div className="flex items-center gap-1 text-gray-400">
                                    <div className="w-3 h-3 border-2 border-gray-200 border-t-secondary rounded-full animate-spin" />
                                    <span className="text-[10px] uppercase tracking-wider font-bold">{t('validation.checking')}</span>
                                </div>
                            ) : showSuccess ? (
                                <div className="flex items-center gap-1 text-green-600">
                                    <BiCheckCircle className="text-sm" />
                                    <span className="text-[10px] uppercase tracking-wider font-bold">{t('validation.nameAvailable')}</span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
