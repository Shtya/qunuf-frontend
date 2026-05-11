'use client'
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import TextInput from '@/components/molecules/forms/TextInput';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import PopupActionButtons from './PopupActionButtons';

interface SubPopupProps {
    value?: string;           // The initial value (e.g., user.phoneNumber)
    error?: string;           // The error key from Zod (e.g., "phoneNumber")
    onSave: (val: string) => void;
    close: () => void;
}
export function PhonePopupDefault({ value = '', onSave, close, error, isLoading }: SubPopupProps & { isLoading: boolean }) {
    const t = useTranslations('dashboard.account');
    const [phone, setPhone] = useState(value);
    useEffect(() => {
        setPhone(value);
    }, [value]);


    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(phone.trim()); }} className="space-y-6">
            <TextInput
                type='text'
                label={t('phone')}
                placeholder={t('placeholders.phoneNumber')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={error ? t(error) : ""}
            />
            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
                disabled={!phone?.trim()}
            />
        </form>
    );
}