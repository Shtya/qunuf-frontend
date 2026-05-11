'use client'
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import TextInput from '@/components/molecules/forms/TextInput';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import PopupActionButtons from './PopupActionButtons';

interface SubPopupProps {
    value?: string;
    error?: string;
    isLoading: boolean;
    onSave: (val: string) => void;
    close: () => void;
}
export function NamePopupDefault({ value = '', isLoading, error, onSave, close }: SubPopupProps) {
    const t = useTranslations('dashboard.account');
    const [name, setName] = useState(value);

    useEffect(() => {
        setName(value);
    }, [value]);

    // Handle form submission (Enter key)
    const handleSubmit = (e: React.FormEvent) => {
        if (isLoading) return;
        e.preventDefault(); // prevent page reload
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
                type='text'
                label={t('fullName')}
                placeholder={t('placeholders.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={error ? t(error) : ''}
            />
            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
                disabled={!name.trim()}
            />
        </form>
    );
}
