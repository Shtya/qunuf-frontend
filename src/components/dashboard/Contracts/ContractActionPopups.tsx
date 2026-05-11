'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/libs/axios';
import toast from 'react-hot-toast';
import { Contract, ContractStatus } from '@/types/dashboard/contract';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import TextAreaInput from '@/components/molecules/forms/TextAreaInput';
import TextInput from '@/components/molecules/forms/TextInput';
import { diffWords, Change } from 'diff';
import {
    LucideFilePen,
    LucideCircleCheck,
    LucideCircleX,
    LucideFileCheck2,
    LucideOctagonAlert,
    LucideLoader,
     LucideInfo,
    LucideBell,
    LucideUpload,
    LucideFileText,
    LucideEye,
    LucideEyeOff,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ContractActionPopupsProps = {
    row: Contract;
    onClose: () => void;
    setRows?: React.Dispatch<React.SetStateAction<any[] | null>>;
    fetchRows?: (signal?: AbortSignal) => Promise<void>;
};

// ─── Schemas ───────────────────────────────────────────────────────────────────

const getReviseSchema = (t: (key: string, params?: any) => string) =>
    z.object({
        newTerms: z
            .string()
            .min(1, { message: t('validation.required') })
            .max(10000, { message: t('validation.maxLength', { max: 10000 }) }),
    });

type ReviseFormData = z.infer<ReturnType<typeof getReviseSchema>>;

export interface AcceptFormData {
    shouldSendRenewalNotify?: boolean;
    renewalDiscountAmount?: number;
    requiredMonthsForIncentive?: number;
}

export const getAcceptSchema = (t: any): z.ZodType<AcceptFormData> =>
    z
        .object({
            shouldSendRenewalNotify: z.boolean().optional(),
            renewalDiscountAmount: z.coerce
                .number()
                .min(0, { message: t('validation.min', { min: 0 }) })
                .optional(),
            requiredMonthsForIncentive: z.coerce
                .number()
                .min(0, { message: t('validation.min', { min: 0 }) })
                .optional(),
        })
        .refine(
            (data) => {
                if (data.shouldSendRenewalNotify && (data.renewalDiscountAmount ?? 0) > 0) {
                    return (data.requiredMonthsForIncentive ?? 0) > 0;
                }
                return true;
            },
            { message: t('validation.required'), path: ['requiredMonthsForIncentive'] }
        );

const getActivateSchema = (t: (key: string, params?: any) => string) =>
    z.object({
        contractNumber: z
            .string()
            .min(1, { message: t('validation.required') })
            .max(50, { message: t('validation.maxLength', { max: 50 }) }),
        contractPdf: z
            .any()
            .refine((files) => files?.length > 0, { message: t('validation.required') })
            .refine((files) => files?.[0] instanceof File, { message: t('validation.required') }),
    });

type ActivateFormData = z.infer<ReturnType<typeof getActivateSchema>>;

// ─── Shared layout primitives ──────────────────────────────────────────────────

function PopupHeader({
    icon: Icon,
    iconBg,
    iconColor,
    title,
    subtitle,
}: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="px-6 pt-6 pb-5 border-b border-[var(--gray)]">
            <div
                className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}
            >
                <Icon size={22} className={iconColor} />
            </div>
            <h2 className="text-lg font-bold text-[var(--dark)]">{title}</h2>
            <p className="text-sm text-[var(--placeholder)] mt-0.5">{subtitle}</p>
        </div>
    );
}

function PopupFooter({
    onClose,
    isSubmitting,
    cancelLabel,
    submitLabel,
    submitVariant = 'primary',
}: {
    onClose: () => void;
    isSubmitting: boolean;
    cancelLabel: string;
    submitLabel: string;
    submitVariant?: 'primary' | 'danger';
}) {
    const submitCls =
        submitVariant === 'danger'
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] text-white';

    return (
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
                {cancelLabel}
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className={`
                    flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                    ${submitCls}
                `}
            >
                {isSubmitting ? (
                    <>
                        <LucideLoader size={14} className="animate-spin" />
                        <span className="opacity-80">{submitLabel}</span>
                    </>
                ) : (
                    submitLabel
                )}
            </button>
        </div>
    );
}

// ─── Danger confirmation card (Cancel / Terminate) ─────────────────────────────

function DangerConfirmPopup({
    icon: Icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    note,
    cancelLabel,
    confirmLabel,
    onClose,
    onConfirm,
    isSubmitting,
}: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    note?: string;
    cancelLabel: string;
    confirmLabel: string;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}) {
    return (
        <div className="w-[92vw] sm:w-[420px] flex flex-col gap-0">
            <div className="px-6 pt-6 pb-5 border-b border-[var(--gray)]">
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={iconColor} />
                </div>
                <h2 className="text-lg font-bold text-[var(--dark)]">{title}</h2>
                <p className="text-sm text-[var(--placeholder)] mt-0.5">{subtitle}</p>
            </div>

            {note && (
                <div className="mx-6 mt-5 flex gap-2.5 p-3.5 bg-orange-50 border border-orange-200 rounded-xl">
                    <LucideInfo size={15} className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 leading-relaxed">{note}</p>
                </div>
            )}

            <div className="px-6 py-5 pb-6 flex gap-2.5 mt-auto">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="
                        flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                        border border-[var(--gray)] text-[var(--dark)]
                        hover:bg-[var(--lighter)] transition-colors duration-150
                        disabled:opacity-50
                    "
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className="
                        flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                        bg-red-500 hover:bg-red-600 text-white
                        transition-colors duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                    "
                >
                    {isSubmitting ? (
                        <>
                            <LucideLoader size={14} className="animate-spin" />
                            <span className="opacity-80">{confirmLabel}</span>
                        </>
                    ) : (
                        confirmLabel
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── ReviseContractPopup ───────────────────────────────────────────────────────

export function ReviseContractPopup({ row: contract, onClose, fetchRows }: ContractActionPopupsProps) {
    const tCommon = useTranslations('comman');
    const t = useTranslations('dashboard.contracts.actions.revise');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDiff, setShowDiff] = useState(false);

    const reviseSchema = useMemo(() => getReviseSchema(tCommon), [tCommon]);

    const { watch, setValue, handleSubmit, formState: { errors } } = useForm<ReviseFormData>({
        resolver: zodResolver(reviseSchema),
        defaultValues: {
            newTerms: contract.currentTerms || contract.originalTerms || '',
        },
    });

    const watchedNewTerms = watch('newTerms');

    const termsDiff = useMemo(() => {
        if (!showDiff) return [];
        return diffWords(contract.originalTerms || '', watchedNewTerms || '');
    }, [showDiff, watchedNewTerms, contract.originalTerms]);

    const onSubmit = async (data: ReviseFormData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(tCommon('submitting'));
        try {
            await api.patch(`/contracts/${contract.id}/landlord-revise`, { newTerms: data.newTerms });
            toast.success(t('success'), { id: toastId });
            if (fetchRows) await fetchRows();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('error'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-[92vw] sm:w-[600px] lg:w-[680px] flex flex-col gap-0"
        >
            <PopupHeader
                icon={LucideFilePen}
                iconBg="bg-[var(--lighter)]"
                iconColor="text-[var(--secondary)]"
                title={t('title')}
                subtitle={t('subtitle')}
            />

            <div className="px-6 py-5 flex flex-col gap-4">
                {/* Toggle bar */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--secondary)] uppercase tracking-wide">
                        {t('fields.terms')}
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowDiff((p) => !p)}
                        className="
                            inline-flex items-center gap-1.5
                            px-3 py-1.5 rounded-lg text-xs font-medium
                            border border-[var(--gray)] text-[var(--secondary)]
                            hover:bg-[var(--lighter)] transition-colors duration-150
                        "
                    >
                        {showDiff ? <LucideEyeOff size={13} /> : <LucideEye size={13} />}
                        {showDiff ? t('hideComparison') : t('showComparison')}
                    </button>
                </div>

                {/* Content area — fixed height prevents layout shift */}
                <div className="min-h-[320px]">
                    {showDiff ? (
                        <div className="animate-in fade-in duration-200 flex flex-col gap-2">
                            {/* Legend */}
                            <div className="flex gap-4 items-center">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-green-700">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    {t('addedText')}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-600">
                                    <span className="w-2 h-2 rounded-full bg-red-400" />
                                    {t('removedText')}
                                </span>
                            </div>
                            <div className="p-4 bg-[var(--highlight)] rounded-xl border border-[var(--gray)] h-[290px] overflow-y-auto custom-scrollbar">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {termsDiff.map((part: Change, i: number) => (
                                        <span
                                            key={i}
                                            className={
                                                part.added
                                                    ? 'bg-green-100 text-green-800 rounded px-0.5'
                                                    : part.removed
                                                    ? 'bg-red-100 text-red-700 line-through rounded px-0.5'
                                                    : 'text-[var(--dark)]'
                                            }
                                        >
                                            {part.value}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-200">
                            <TextAreaInput
                                value={watchedNewTerms ?? ''}
                                onChange={(e) => setValue('newTerms', e.target.value)}
                                placeholder={t('fields.termsPlaceholder')}
                                rows={12}
                                error={errors.newTerms?.message}
                            />
                        </div>
                    )}
                </div>
            </div>

            <PopupFooter
                onClose={onClose}
                isSubmitting={isSubmitting}
                cancelLabel={tCommon('cancel')}
                submitLabel={isSubmitting ? tCommon('submitting') : t('submit')}
            />
        </form>
    );
}

// ─── AcceptContractPopup ───────────────────────────────────────────────────────

export function AcceptContractPopup({ row: contract, onClose, fetchRows }: ContractActionPopupsProps) {
    const t = useTranslations('dashboard.contracts.actions.accept');
    const tCommon = useTranslations('comman');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLandlord = contract.status === ContractStatus.PENDING_LANDLORD_ACCEPTANCE;
    const acceptSchema = useMemo(() => getAcceptSchema(tCommon), [tCommon]);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<AcceptFormData>({
        resolver: zodResolver(acceptSchema),
        defaultValues: {
            shouldSendRenewalNotify: false,
            renewalDiscountAmount: 0,
            requiredMonthsForIncentive: 0,
        },
    });

    const shouldSendRenewalNotify = watch('shouldSendRenewalNotify');
    const renewalDiscountAmount = watch('renewalDiscountAmount');

    const onSubmit = async (data: AcceptFormData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(tCommon('submitting'));
        try {
            const payload: any = {};
            if (isLandlord && data.shouldSendRenewalNotify) {
                payload.shouldSendRenewalNotify = data.shouldSendRenewalNotify;
                if (data.renewalDiscountAmount && data.renewalDiscountAmount > 0) {
                    payload.renewalDiscountAmount = data.renewalDiscountAmount;
                    payload.requiredMonthsForIncentive = data.requiredMonthsForIncentive || 0;
                }
            }
            await api.post(`/contracts/${contract.id}/accept`, payload);
            toast.success(t('success'), { id: toastId });
            if (fetchRows) await fetchRows();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('error'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-[92vw] sm:w-[460px] flex flex-col gap-0">
            <PopupHeader
                icon={LucideCircleCheck}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                title={t('title')}
                subtitle={t('subtitle')}
            />

            {isLandlord && (
                <div className="px-6 py-5 flex flex-col gap-4">
                    {/* Renewal notify toggle */}
                    <label className="
                        flex items-center gap-3 cursor-pointer
                        p-3.5 rounded-xl border border-[var(--gray)]
                        hover:bg-[var(--lighter)] transition-colors duration-150
                        has-[:checked]:border-[var(--secondary)] has-[:checked]:bg-[var(--lighter)]
                    ">
                        <div className="relative shrink-0">
                            <input
                                type="checkbox"
                                {...register('shouldSendRenewalNotify')}
                                className="sr-only peer"
                            />
                            {/* Custom toggle */}
                            <div className="
                                w-9 h-5 rounded-full bg-[var(--gray)]
                                peer-checked:bg-[var(--secondary)]
                                transition-colors duration-200
                            " />
                            <div className="
                                absolute top-0.5 start-0.5
                                w-4 h-4 rounded-full bg-white shadow
                                transition-transform duration-200
                                peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4
                            " />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-[var(--dark)]">
                                {t('fields.sendRenewalNotify')}
                            </span>
                            <span className="text-xs text-[var(--placeholder)]">
                                {t('fields.sendRenewalNotifyHint')}
                            </span>
                        </div>
                        <LucideBell size={16} className="text-[var(--secondary)] ms-auto shrink-0" />
                    </label>

                    {/* Expanded renewal fields */}
                    {shouldSendRenewalNotify && (
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-3.5 border border-[var(--gray)] bg-[var(--lighter)]  rounded-xl flex flex-col gap-3">
                                <TextInput
                                    {...register('renewalDiscountAmount', { valueAsNumber: true })}
                                    type="number"
                                    label={t('fields.renewalDiscountAmount')}
                                    placeholder="0"
                                    min={0}
                                    error={errors.renewalDiscountAmount?.message}
                                />

                                {(renewalDiscountAmount ?? 0) > 0 && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                                        <TextInput
                                            {...register('requiredMonthsForIncentive', { valueAsNumber: true })}
                                            type="number"
                                            label={t('fields.requiredMonthsForIncentive')}
                                            placeholder="0"
                                            min={0}
                                            max={contract.durationInMonths}
                                            error={errors.requiredMonthsForIncentive?.message}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className={isLandlord ? '' : 'pt-5'}>
                <PopupFooter
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    cancelLabel={tCommon('cancel')}
                    submitLabel={isSubmitting ? tCommon('submitting') : t('submit')}
                />
            </div>
        </form>
    );
}

// ─── CancelContractPopup ───────────────────────────────────────────────────────

export function CancelContractPopup({ row: contract, onClose, fetchRows }: ContractActionPopupsProps) {
    const t = useTranslations('dashboard.contracts.actions.cancel');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCancel = async () => {
        setIsSubmitting(true);
        const toastId = toast.loading(t('submitting'));
        try {
            await api.post(`/contracts/${contract.id}/cancel`);
            toast.success(t('success'), { id: toastId });
            if (fetchRows) await fetchRows();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('error'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DangerConfirmPopup
            icon={LucideCircleX}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            title={t('title')}
            subtitle={t('subtitle')}
            cancelLabel={t('cancel')}
            confirmLabel={t('confirm')}
            onClose={onClose}
            onConfirm={handleCancel}
            isSubmitting={isSubmitting}
        />
    );
}

// ─── ActivateContractPopup ────────────────────────────────────────────────────

export function ActivateContractPopup({ row: contract, onClose, fetchRows }: ContractActionPopupsProps) {
    const t = useTranslations('dashboard.contracts.actions.activate');
    const tCommon = useTranslations('comman');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const activateSchema = useMemo(() => getActivateSchema(tCommon), [tCommon]);

    const { register, handleSubmit, formState: { errors } } = useForm<ActivateFormData>({
        resolver: zodResolver(activateSchema),
    });

    const onSubmit = async (data: ActivateFormData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(tCommon('submitting'));
        try {
            const formData = new FormData();
            formData.append('contractPdf', data.contractPdf?.[0]);
            formData.append('contractNumber', data.contractNumber);

            await api.patch(`/contracts/${contract.id}/activate-ejar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(t('success'), { id: toastId });
            if (fetchRows) await fetchRows();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('error'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // File input registration with change capture for display
    const fileRegistration = register('contractPdf');

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-[92vw] sm:w-[460px] flex flex-col gap-0">
            <PopupHeader
                icon={LucideFileCheck2}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                title={t('title')}
                subtitle={t('subtitle')}
            />

            <div className="px-6 py-5 flex flex-col gap-4">
                <TextInput
                    {...register('contractNumber')}
                    label={t('fields.contractNumber')}
                    placeholder={t('fields.contractNumberPlaceholder')}
                    error={errors.contractNumber?.message}
                />

                {/* Styled file upload zone */}
                <div>
                    <span className="block text-xs font-semibold text-[var(--secondary)] uppercase tracking-wide mb-2">
                        {t('fields.contractPdf')}
                    </span>
                    <label className="
                        relative flex flex-col items-center justify-center gap-2
                        w-full py-6 px-4 rounded-xl
                        border-2 border-dashed border-[var(--light)]
                        bg-[var(--highlight)] hover:bg-[var(--lighter)]
                        transition-colors duration-150 cursor-pointer
                        group
                    ">
                        <input
                            type="file"
                            accept=".pdf"
                            {...fileRegistration}
                            onChange={(e) => {
                                fileRegistration.onChange(e);
                                setFileName(e.target.files?.[0]?.name ?? null);
                            }}
                            className="sr-only"
                        />
                        {fileName ? (
                            <>
                                <div className="w-9 h-9 rounded-xl bg-[var(--lighter)] border border-[var(--gray)] flex items-center justify-center">
                                    <LucideFileText size={18} className="text-[var(--secondary)]" />
                                </div>
                                <span className="text-sm font-medium text-[var(--dark)] text-center max-w-[260px] truncate">
                                    {fileName}
                                </span>
                                <span className="text-xs text-[var(--secondary)]">
                                    {t('fields.changeFile')}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="w-9 h-9 rounded-xl bg-[var(--lighter)] border border-[var(--gray)] flex items-center justify-center group-hover:border-[var(--secondary)] transition-colors">
                                    <LucideUpload size={18} className="text-[var(--secondary)]" />
                                </div>
                                <span className="text-sm font-medium text-[var(--dark)]">
                                    {t('fields.uploadPdf')}
                                </span>
                                <span className="text-xs text-[var(--placeholder)]">PDF</span>
                            </>
                        )}
                    </label>
                    {errors.contractPdf && (
                        <p className="text-xs text-red-500 mt-1.5">
                            {errors.contractPdf.message?.toString()}
                        </p>
                    )}
                </div>
            </div>

            <PopupFooter
                onClose={onClose}
                isSubmitting={isSubmitting}
                cancelLabel={tCommon('cancel')}
                submitLabel={isSubmitting ? tCommon('submitting') : t('submit')}
            />
        </form>
    );
}

// ─── TerminateContractPopup ────────────────────────────────────────────────────

export function TerminateContractPopup({ row: contract, onClose, fetchRows }: ContractActionPopupsProps) {
    const t = useTranslations('dashboard.contracts.actions.terminate');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTerminate = async () => {
        setIsSubmitting(true);
        const toastId = toast.loading(t('submitting'));
        try {
            await api.post(`/contracts/${contract.id}/terminate`);
            toast.success(t('success'), { id: toastId });
            if (fetchRows) await fetchRows();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('error'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DangerConfirmPopup
            icon={LucideOctagonAlert}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            title={t('title')}
            subtitle={t('subtitle')}
            note={t('note')}
            cancelLabel={t('cancel')}
            confirmLabel={t('confirm')}
            onClose={onClose}
            onConfirm={handleTerminate}
            isSubmitting={isSubmitting}
        />
    );
}