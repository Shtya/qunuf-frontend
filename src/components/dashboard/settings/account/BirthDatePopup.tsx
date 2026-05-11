'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import TextInput from '@/components/molecules/forms/TextInput';
import PopupActionButtons from './PopupActionButtons';
import DateInput from '@/components/molecules/forms/DateInput';


interface Props {
    value?: string | null; // ISO date: yyyy-mm-dd
    error?: string;
    isLoading: boolean;
    onSave: (value: Date | null) => void;
    close: () => void;
}

export function BirthDatePopup({ value, error, isLoading, onSave, close }: Props) {
    const t = useTranslations('dashboard.account');
    const [birthDate, setBirthDate] = useState(value ? new Date(value) : undefined);

    useEffect(() => {
        setBirthDate(value ? new Date(value) : undefined);
    }, [value]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(birthDate ? new Date(birthDate) : undefined);
    };
    const today = new Date();

    // Maximum date (User must be at least 18 years old)
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
        .toISOString().split("T")[0];

    // Minimum date (User cannot be older than 100 years)
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
        .toISOString().split("T")[0];
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <DateInput
                minDate={minDate}
                maxDate={maxDate}
                label={t('birthDate')}
                placeholder={t('placeholders.birthDate')}
                value={birthDate}
                // Convert Date object to YYYY-MM-DD string to match your state
                onChange={(dates) => {
                    const selectedDate = dates[0] ? dates[0] : undefined;
                    setBirthDate(selectedDate);
                }}
                error={error ? t(error) : ""}
            />

            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
            />
        </form>
    );
}
