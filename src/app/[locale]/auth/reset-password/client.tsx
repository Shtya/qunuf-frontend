'use client'

import AuthHeader from '@/components/atoms/AuthHeader';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/libs/axios';
import z from 'zod';
import { Link } from '@/i18n/navigation';
import PasswordInput from '@/components/molecules/forms/PasswordInput';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import TextInput from '@/components/molecules/forms/TextInput';



export default function ResetPasswordClient() {
    const t = useTranslations('auth.resetPassword');

    return (
        <section className="py-20 bg-[var(--bg-1)] mt-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-[800px] bg-white p-8 custom-shadow rounded-2xl">
                        <AuthHeader className="!mb-4" />
                        <h3 className="text-3xl font-bold mb-4 text-primary text-center">
                            {t('title')}
                        </h3>

                        <ResetPasswordForm />

                        <Link
                            href="/auth/sign-in"
                            className="mt-4 block text-primary font-semibold underline hover:text-primary-hover transition"
                        >
                            {t('backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}



const resetPasswordSchema = z.object({
    email: z.string().trim().min(1, { message: 'email.required' }).email({ message: 'email.invalid' }),
    code: z.string().trim().min(1, { message: 'code.required' }),
    password: z
        .string()
        .trim()
        .min(8, { message: 'password.minLength' })
        .max(20, { message: 'password.maxLength' })
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$!%*?&])/, { message: 'password.pattern' }),
    confirmPassword: z
        .string()
        .trim()
        .min(8, { message: 'password.minLength' })
        .max(20, { message: 'password.maxLength' })
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$!%*?&])/, { message: 'password.pattern' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "confirmPassword.mismatch",
    path: ["confirmPassword"],
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const t = useTranslations('auth.resetPassword.form');
    const searchParams = useSearchParams()
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: searchParams.get("email") || '', code: searchParams.get("code") || '', password: '', confirmPassword: '' },
    });

    const onSubmit = async (data: ResetPasswordFormValues) => {
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: data.email,
                code: data.code,
                password: data.password,
            });
            toast.success(t('success.sent'));
            router.push('/auth/sign-in');
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('errors.failed'));
        } finally {
            setLoading(false);
        }
    };

    const email = searchParams.get("email");
    const code = searchParams.get("code");

    // ❗ If missing — show error UI instead of form
    if (!email || !code) {
        return (
            <div className="flex flex-col gap-4 text-center">
                <p className="text-red-500 font-semibold">
                    {t('errors.invalidLink')}
                </p>
                <Link
                    href={'/auth/forgot-password'}
                    className="text-primary underline"
                >
                    {t('errors.requestNewLink')}
                </Link>
            </div>
        );
    }


    return (
        <form className="flex flex-col gap-4 md:gap-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <TextInput
                        label={t('email.label')}
                        placeholder={t('email.placeholder')}
                        type="email"
                        {...field}
                        readonly
                        disabled
                        error={errors.email?.message ? t(`errors.${errors.email.message}`) : undefined}
                    />
                )}
            />

            {/* New Password */}
            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <PasswordInput
                        label={t('password.label')}
                        placeholder={t('password.placeholder')}
                        {...field}
                        error={errors.password?.message ? t(`errors.${errors.password.message}`) : undefined}
                    />
                )}
            />

            {/* Confirm New Password */}
            <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                    <PasswordInput
                        label={t('confirmPassword.label')}
                        placeholder={t('confirmPassword.placeholder')}
                        {...field}
                        error={errors.confirmPassword?.message ? t(`errors.${errors.confirmPassword.message}`) : undefined}
                    />
                )}
            />

            <SecondaryButton
                type="submit"
                className="bg-secondary hover:bg-secondary-hover text-white py-2 lg:py-3 w-full"
                disabled={loading}
            >
                {loading ? t('loading') : t('reset')}
            </SecondaryButton>
        </form>
    );
}
