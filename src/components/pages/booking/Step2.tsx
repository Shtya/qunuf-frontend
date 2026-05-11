'use client';

import FormActions from "./StepActions";
import StepTitle from "./StepTitle";
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/libs/axios";
import toast from "react-hot-toast";
import { useValues } from "@/contexts/GlobalContext";
import TextInput from "@/components/molecules/forms/TextInput";
import { PropertyStatus, RentType } from "@/types/dashboard/properties";
import DateInput from "@/components/molecules/forms/DateInput";

type step2Props = {
    nextStep: () => void,
    property: { id: string, rentType: RentType, status: PropertyStatus },
    setCreatedContract: (contract: any) => void;
}

export default function Step2({ nextStep, property, setCreatedContract }: step2Props) {
    const t = useTranslations('bookings.contractDetails');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { settings, loadingSettings } = useValues();

    const [startDate, setStartDate] = useState<string>('');
    const [duration, setDuration] = useState<number>(1);
    const [proposedTerms, setProposedTerms] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Set default terms when settings load
    useEffect(() => {
        if (settings && settings.defaultContractTerms) {
            setProposedTerms(settings.defaultContractTerms as string);
        }
    }, [settings]);

    const isMonthly = property?.rentType === RentType.MONTHLY;
    const minDuration = 1;
    const maxDuration = isMonthly ? 12 : 1;
    const isDurationDisabled = !isMonthly; // Disable if yearly

    // Calculate minimum start date (tomorrow)
    const getMinStartDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleSubmit = async () => {
        if (!property.id) {
            toast.error(t('errors.noProperty'));
            return;
        }
        if (!startDate) {
            toast.error(t('errors.noStartDate'));
            return;
        }
        if (!duration || duration < minDuration || duration > maxDuration) {
            toast.error(t('errors.invalidDuration'));
            return;
        }

        // Validate start date is in future
        const selectedDate = new Date(startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate <= today) {
            toast.error(t('errors.startDatePast'));
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(t('creating'));

        try {
            const contractPayload = {
                propertyId: property.id,
                startDate,
                duration,
                proposedTerms: proposedTerms || undefined,
            };

            const res = await api.post('/contracts', contractPayload);
            setCreatedContract(res.data);
            // Store contract in sessionStorage for next step
            sessionStorage.setItem('createdContract', JSON.stringify(res.data));
            toast.success(t('created'), { id: toastId });
            nextStep();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('errors.createFailed'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingSettings) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col justify-between gap-y-6">
            <div className="space-y-6">
                <StepTitle title={t('title')} subtitle={t('subtitle')} />

                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Start Date */}
                    <div>
                        <DateInput
                            label={t('fields.startDate.label')}
                            placeholder={t('fields.startDate.placeholder')}
                            value={startDate}
                            minDate={getMinStartDate()}
                            required
                            className="book-input"
                            // Formats Date object back to string for your local state
                            onChange={(dates) => {
                                const dateStr = dates[0] ? dates[0].toISOString().split('T')[0] : "";
                                setStartDate(dateStr);
                            }}
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <TextInput
                            type="number"
                            label={t('fields.duration.label')}
                            placeholder={t('fields.duration.placeholder')}
                            value={duration}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= minDuration && value <= maxDuration) {
                                    setDuration(value);
                                }
                            }}
                            min={minDuration}
                            max={maxDuration}
                            disabled={isDurationDisabled}
                            required
                            className="book-input"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {isMonthly
                                ? t('fields.duration.hint.monthly', { min: minDuration, max: maxDuration })
                                : t('fields.duration.hint.yearly')
                            }
                        </p>
                    </div>

                    {/* Proposed Terms */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('fields.proposedTerms.label')}
                        </label>
                        <textarea
                            value={proposedTerms}
                            onChange={(e) => setProposedTerms(e.target.value)}
                            placeholder={t('fields.proposedTerms.placeholder')}
                            rows={12}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent resize-y"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t('fields.proposedTerms.hint')}
                        </p>
                    </div>
                </div>
            </div>

            <FormActions
                confirmLabel={t('confirm')}
                cancelLabel={t('cancel')}
                onConfirm={handleSubmit}
                onCancel={() => router.push('/properties')}
                isDisabled={isSubmitting || !startDate || !duration}
            />
        </div>
    );
}
