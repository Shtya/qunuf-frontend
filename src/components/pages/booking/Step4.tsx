'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import StepTitle from './StepTitle';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Step4() {
    const t = useTranslations('bookings.step4');
    const router = useRouter();
    const [contractId, setContractId] = useState<string | null>(null);

    useEffect(() => {
        // Get contract ID from sessionStorage
        const savedContract = sessionStorage.getItem('createdContract');
        if (savedContract) {
            try {
                const contract = JSON.parse(savedContract);
                setContractId(contract.id);
            } catch (error) {
                console.error('Failed to parse contract from sessionStorage');
            }
        }
    }, []);

    const handleViewContract = () => {
        if (contractId) {
            router.push(`/dashboard/contracts?view=${contractId}`);
        } else {
            router.push('/dashboard/contracts');
        }
    };

    return (
        <div className="space-y-12">
            <StepTitle title={t('imageAlt')} />

            <div className="space-y-10">
                <Image
                    src="/payment-completed.png"
                    width={491}
                    height={378}
                    alt={t('imageAlt')}
                    className="mx-auto"
                />

                {/* Summary Card */}
                <div className="bg-lighter rounded-xl shadow-sm px-6 py-5 max-w-xl mx-auto text-center space-y-4">
                    <p className="text-dark text-lg sm:text-xl font-medium leading-snug">
                        {t('message.line1')}
                    </p>
                    <p className="text-dark text-lg sm:text-xl font-medium leading-snug">
                        {t('message.line2')}
                    </p>
                    <p className="text-dark text-lg sm:text-xl font-medium leading-snug">
                        {t('message.line3')}
                    </p>
                </div>

                {/* View Contract Button */}
                <div className="flex justify-center">
                    <SecondaryButton
                        onClick={handleViewContract}
                        className="bg-secondary hover:bg-secondary-hover text-white py-2 lg:py-3 w-full sm:w-[323px]"
                    >
                        {t('viewContract')}
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
}
