// PasswordPopup.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import TextInput from '@/components/molecules/forms/TextInput';
import PopupActionButtons from './PopupActionButtons';
import { toast } from 'react-hot-toast';
import api from '@/libs/axios';
import { z } from 'zod';

interface Props {
    close: () => void;
}

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$#!%*?&])/

// Local validation schema for password change
const passwordSchema = z.object({
    oldPassword: z.string().min(1, 'validation.required'),
    newPassword: z.string()
        .min(8, 'validation.min8')
        .max(20, 'validation.max20')
        .regex(passwordRegex, "validation.invalidPassword"),
    confirmPassword: z.string().min(1, 'validation.required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "validation.passwordsDoNotMatch",
    path: ["confirmPassword"],
});

export function PasswordPopup({ close }: Props) {
    const t = useTranslations('dashboard.account');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // 1. Validate
        const result = passwordSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                fieldErrors[path] = issue.message;
            });

            setErrors(fieldErrors)
            return;
        }

        // 2. Submit
        setIsLoading(true);
        const toastId = toast.loading(t('messages.updating'));
        try {
            await api.put('/auth/change-password', {
                currentPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            toast.success(t('messages.passwordUpdated'), { id: toastId });
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            close();
        } catch (error: any) {
            toast.error(t('messages.updateError'), { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
                type="password"
                label={t('oldPassword')}
                placeholder={t('placeholders.oldPassword')}
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                error={errors.oldPassword && t(errors.oldPassword)}
            />
            <TextInput
                type="password"
                label={t('newPassword')}
                placeholder={t('placeholders.newPassword')}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                error={errors.newPassword && t(errors.newPassword)}
            />
            <TextInput
                type="password"
                label={t('confirmPassword')}
                placeholder={t('placeholders.confirmPassword')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword && t(errors.confirmPassword)}
            />

            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
            />
        </form>
    );
}