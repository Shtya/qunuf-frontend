'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/libs/axios';
import toast from 'react-hot-toast';
import { Contract } from '@/types/dashboard/contract';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import TextAreaInput from '@/components/molecules/forms/TextAreaInput';
import { TableRowType } from '@/types/table';
 import { format } from 'date-fns';
import { LucideAlertCircle, LucideCalendar, LucideInbox, LucideLoader, LucideMessageSquare, LucideStar } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ReviewPopupsProps = {
    row: Contract;
    onClose: () => void;
    setRows?: React.Dispatch<React.SetStateAction<TableRowType<Contract>[] | null>>;
    fetchRows?: (signal?: AbortSignal) => Promise<void>;
};

// ─── Schema ────────────────────────────────────────────────────────────────────

const getCreateReviewSchema = (t: (key: string, params?: any) => string) =>
    z.object({
        rate: z.coerce
            .number()
            .min(1, { message: t('validation.min', { min: 1 }) })
            .max(5, { message: t('validation.max', { max: 5 }) }),
        reviewText: z
            .string()
            .max(5000, { message: t('validation.maxLength', { max: 5000 }) })
            .optional(),
    });

type CreateReviewFormData = z.infer<ReturnType<typeof getCreateReviewSchema>>;

// ─── Star Rating Component ─────────────────────────────────────────────────────

function StarRating({
    value,
    onChange,
    readonly = false,
    size = 'md',
}: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}) {
    const [hovered, setHovered] = useState(0);

    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 36 : 28;
    const active = readonly ? value : hovered || value;

    const LABELS = ['', '😞 Terrible', '😕 Poor', '😐 Average', '🙂 Good', '😄 Excellent'];

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onChange?.(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(0)}
                        className={`
                            relative transition-transform duration-100
                            ${!readonly ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]/40 rounded
                        `}
                        aria-label={`${star} star`}
                    >
                        <LucideStar
                            size={iconSize}
                            className="transition-colors duration-150"
                            style={{
                                fill: star <= active ? '#f59e0b' : 'transparent',
                                stroke: star <= active ? '#f59e0b' : '#d1d5db',
                                strokeWidth: 1.5,
                            }}
                        />
                    </button>
                ))}
            </div>

            {/* Label under stars (only interactive) */}
            {!readonly && active > 0 && (
                <span className="text-xs font-medium text-amber-600 transition-all duration-150 animate-in fade-in slide-in-from-bottom-1">
                    {LABELS[active]}
                </span>
            )}
        </div>
    );
}

// ─── Section Label ─────────────────────────────────────────────────────────────

function FieldLabel({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-2">
            <Icon size={13} className="text-[var(--secondary)]" />
            <span className="text-xs font-semibold text-[var(--secondary)] uppercase tracking-wide">
                {label}
            </span>
        </div>
    );
}

// ─── CreateReviewPopup ─────────────────────────────────────────────────────────

export function CreateReviewPopup({ row: contract, onClose, setRows, fetchRows }: ReviewPopupsProps) {
    const tCommon = useTranslations('comman');
    const t = useTranslations('dashboard.contracts.reviews.create');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);

    const createReviewSchema = useMemo(() => getCreateReviewSchema(tCommon), [tCommon]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateReviewFormData>({
        resolver: zodResolver(createReviewSchema) as unknown as any,
        defaultValues: { rate: 0, reviewText: '' },
    });

    const watchedRate = watch('rate');

    const handleRatingChange = (star: number) => {
        setSelectedRating(star);
        setValue('rate', star, { shouldValidate: true });
    };

    const onSubmit = async (data: CreateReviewFormData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(tCommon('submitting'));
        try {
            await api.post('/reviews', {
                contractId: contract.id,
                rate: data.rate,
                reviewText: data.reviewText || undefined,
            });

            toast.success(t('success'), { id: toastId });

            if (setRows) {
                setRows((prev) =>
                    prev
                        ? prev.map((item) =>
                              item.id === contract.id ? { ...item, isReviewed: true } : item
                          )
                        : null
                );
            }
            if (fetchRows) await fetchRows();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('error'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-[92vw] sm:w-[480px] flex flex-col gap-0">
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-[var(--gray)]">
                {/* Decorative star icon */}
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                    <LucideStar size={22} className="text-amber-500" style={{ fill: '#f59e0b' }} />
                </div>
                <h2 className="text-lg font-bold text-[var(--dark)]">{t('title')}</h2>
                <p className="text-sm text-[var(--placeholder)] mt-0.5">{t('subtitle')}</p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-5">
                {/* Star Rating */}
                <div>
                    <FieldLabel icon={LucideStar} label={t('fields.rating')} />
                    <StarRating
                        value={selectedRating || watchedRate}
                        onChange={handleRatingChange}
                        size="lg"
                    />
                    <input type="hidden" {...register('rate')} />
                    {errors.rate && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <LucideAlertCircle size={12} />
                            {tCommon(String(errors.rate.message))}
                        </p>
                    )}
                </div>

                {/* Review text */}
                <div>
                    <FieldLabel icon={LucideMessageSquare} label={t('fields.reviewText')} />
                    <TextAreaInput
                        value={watch('reviewText') ?? ''}
                        onChange={(e) => setValue('reviewText', e.target.value)}
                        placeholder={t('fields.reviewTextPlaceholder')}
                        rows={4}
                        error={
                            errors.reviewText?.message
                                ? tCommon(String(errors.reviewText.message))
                                : undefined
                        }
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-2.5">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="
                        flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                        border border-[var(--gray)] text-[var(--dark)]
                        hover:bg-[var(--lighter)] transition-colors duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    {tCommon('cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !watchedRate}
                    className="
                        flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                        bg-[var(--secondary)] text-white
                        hover:bg-[var(--secondary-hover)] transition-colors duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                    "
                >
                    {isSubmitting ? (
                        <>
                            <LucideLoader size={14} className="animate-spin" />
                            {tCommon('submitting')}
                        </>
                    ) : (
                        t('submit')
                    )}
                </button>
            </div>
        </form>
    );
}

// ─── ViewReviewPopup ───────────────────────────────────────────────────────────

export function ViewReviewPopup({ row: contract, onClose }: ReviewPopupsProps) {
    const t = useTranslations('dashboard.contracts.reviews.view');
    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchReview = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/reviews/contract/${contract.id}`, {
                    signal: controller.signal,
                    params: { limit: 1 },
                });
                if (res.data.items?.length > 0) {
                    setReview(res.data.items[0]);
                } else {
                    setError(t('noReview'));
                }
            } catch (err: any) {
                if (err?.name === 'CanceledError') return;
                setError(err?.response?.data?.message || t('error'));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchReview();
        return () => controller.abort();
    }, [contract.id, t]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="w-[92vw] sm:w-[420px] flex flex-col items-center justify-center gap-3 py-14">
                <div className="w-10 h-10 rounded-full border-2 border-[var(--lighter)] border-t-[var(--secondary)] animate-spin" />
                <p className="text-sm text-[var(--placeholder)]">{t('loading')}</p>
            </div>
        );
    }

    // ── Error ──
    if (error) {
        return (
            <div className="w-[92vw] sm:w-[420px] flex flex-col items-center justify-center gap-3 py-14 px-6">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                    <LucideAlertCircle size={22} className="text-red-500" />
                </div>
                <p className="text-sm text-red-500 text-center">{error}</p>
                <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2 rounded-xl text-sm font-medium bg-[var(--secondary)] text-white hover:bg-[var(--secondary-hover)] transition-colors"
                >
                    {t('close')}
                </button>
            </div>
        );
    }

    // ── Empty ──
    if (!review) {
        return (
            <div className="w-[92vw] sm:w-[420px] flex flex-col items-center justify-center gap-3 py-14 px-6">
                <div className="w-11 h-11 rounded-xl bg-[var(--lighter)] border border-[var(--gray)] flex items-center justify-center">
                    <LucideInbox size={22} className="text-[var(--secondary)]" />
                </div>
                <p className="text-sm text-[var(--placeholder)] text-center">{t('noReview')}</p>
                <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2 rounded-xl text-sm font-medium border border-[var(--gray)] text-[var(--dark)] hover:bg-[var(--lighter)] transition-colors"
                >
                    {t('close')}
                </button>
            </div>
        );
    }

    // ── Content ──
    return (
        <div className="w-[92vw] sm:w-[420px] flex flex-col gap-0">
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-[var(--gray)]">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                    <LucideStar size={22} className="text-amber-500" style={{ fill: '#f59e0b' }} />
                </div>
                <h2 className="text-lg font-bold text-[var(--dark)]">{t('title')}</h2>
                <p className="text-sm text-[var(--placeholder)] mt-0.5">{t('subtitle')}</p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-5">
                {/* Stars */}
                <div>
                    <FieldLabel icon={LucideStar} label={t('fields.rating')} />
                    <div className="flex items-center gap-3">
                        <StarRating value={review.rate} readonly size="md" />
                        <span className="text-2xl font-bold text-[var(--dark)] font-number">
                            {review.rate}
                            <span className="text-sm font-normal text-[var(--placeholder)]">/5</span>
                        </span>
                    </div>
                </div>

                {/* Review text */}
                {review.reviewText && (
                    <div>
                        <FieldLabel icon={LucideMessageSquare} label={t('fields.reviewText')} />
                        <p className="text-sm text-[var(--dark)] bg-[var(--lighter)] border border-[var(--gray)] rounded-xl px-4 py-3 leading-relaxed">
                            {review.reviewText}
                        </p>
                    </div>
                )}

                {/* Date */}
                <div>
                    <FieldLabel icon={LucideCalendar} label={t('fields.reviewDate')} />
                    <p className="text-sm text-[var(--dark)]">
                        {format(new Date(review.created_at), 'dd MMM yyyy')}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
                <button
                    onClick={onClose}
                    className="
                        w-full px-4 py-2.5 rounded-xl text-sm font-medium
                        bg-[var(--secondary)] text-white
                        hover:bg-[var(--secondary-hover)] transition-colors duration-150
                    "
                >
                    {t('close')}
                </button>
            </div>
        </div>
    );
}