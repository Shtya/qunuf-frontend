'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import TextInput from '@/components/molecules/forms/TextInput';
import PopupActionButtons from './PopupActionButtons';
import api from '@/libs/axios'; // Ensure you have this import
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
    value?: string;
    close: () => void;
    // We added an optional callback if you need to refresh the user after success
    onSuccess?: () => void;
}

export function EmailPopup({ value = '', close, onSuccess }: Props) {
    const t = useTranslations('dashboard.account');
    const [email, setEmail] = useState(value);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const { user, setCurrentUser } = useAuth()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 1. Simple Local Validation
        const emailSchema = z.email('validation.invalidEmail');
        const validation = emailSchema.safeParse(email);

        if (!validation.success) {
            // Translate the Zod error key
            setError(validation.error.issues?.[0].message);
            return;
        }

        // 2. Submit to API
        setIsLoading(true);
        const toastId = toast.loading(t('messages.updating'));

        try {
            // Using the endpoint requested
            await api.post('/auth/request-email-change', { newEmail: email });
            setCurrentUser({
                ...user,
                pendingEmail: email
            });

            toast.success(t('messages.checkEmailForLink'), { id: toastId });

            if (onSuccess) onSuccess();
            close();
        } catch (err: any) {
            const serverError = err?.response?.data?.message || 'messages.updateError';
            toast.error(serverError, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
                type="email"
                label={t('newEmail')}
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                }}
                error={error ? t(error) : undefined}
                placeholder="example@mail.com"
            />
            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
                disabled={!email || isLoading}
                updateText={t('sendLink')} // Optional: Change button text to "Send Link"
            />
        </form>
    );
}