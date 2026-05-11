'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

import TextInput from '@/components/molecules/forms/TextInput';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import Link from 'next/link';
import api from '@/libs/axios';

import AuthHeader from '@/components/atoms/AuthHeader';

// export async function generateMetadata() {
//     const t = useTranslations('auth.resendVerification');
//     return {
//         title: t('title'),
//     };
// }

export default async function ResendVerificationEmailPage() {
    const t = useTranslations('auth.resendVerification');

    return (
        <section className="py-20 bg-[var(--bg-1)] mt-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-[800px] bg-white p-8 custom-shadow rounded-2xl">
                        <AuthHeader className="!mb-4" />
                        <h3 className="text-3xl font-bold mb-4 text-primary text-center">
                            {t('title')}
                        </h3>

                        <ResendVerificationEmailForm />
                    </div>
                </div>
            </div>
        </section>
    );
}



// Zod schema
const resendSchema = z.object({
    email: z.string().trim().email({ message: 'invalidEmail' }),
});

type ResendFormValues = z.infer<typeof resendSchema>;

function ResendVerificationEmailForm() {
    const t = useTranslations('auth.resendVerification.form');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<ResendFormValues>({
        resolver: zodResolver(resendSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (data: ResendFormValues) => {
        setLoading(true);
        try {
            await api.post('/auth/resend-verification-email', data);
            toast.success(t('success.sent'));
            router.push('/auth/sign-in');
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('errors.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="flex flex-col gap-4 md:gap-5" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <TextInput
                        label={t('email.label')}
                        placeholder={t('email.placeholder')}
                        type="email"
                        {...field}
                        error={errors.email?.message ? t(`errors.${errors.email.message}`) : undefined}
                    />
                )}
            />

            <SecondaryButton
                type="submit"
                className="bg-secondary hover:bg-secondary-hover text-white py-2 lg:py-3 w-full"
                disabled={loading}
            >
                {loading ? t('loading') : t('send')}
            </SecondaryButton>

            <div className="text-center text-sm mt-4">
                {t('haveAccount')}
                <Link href="/auth/sign-in" className="text-primary font-semibold underline">
                    {t('login')}
                </Link>
            </div>
        </form>
    );
}
