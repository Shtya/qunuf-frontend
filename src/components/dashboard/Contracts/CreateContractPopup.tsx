'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { LucideFilePlus, LucideLoader, LucideCalendarCheck, LucideBanknote, LucideShieldCheck, LucideClock, LucideZap } from 'lucide-react';
import api from '@/libs/axios';
import TextInput from '@/components/molecules/forms/TextInput';
import TextAreaInput from '@/components/molecules/forms/TextAreaInput';
import SelectInput, { Option } from '@/components/molecules/forms/SelectInput';

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
    onClose: () => void;
    fetchRows?: (signal?: AbortSignal) => Promise<void>;
};

type PropertyInfo = {
    rentType: string;
    rentPrice: number;
    securityDeposit: number;
};

// ─── Schema ──────────────────────────────────────────────────────────────────

const getSchema = (t: (key: string, params?: any) => string) =>
    z.object({
        tenantId: z.string().min(1, { message: t('validation.required') }),
        propertyId: z.string().min(1, { message: t('validation.required') }),
        startDate: z.string().min(1, { message: t('validation.required') }),
        duration: z.coerce
            .number()
            .int()
            .min(1, { message: t('validation.min', { min: 1 }) }),
        proposedTerms: z.string().max(10000).optional(),
        directActivate: z.boolean().optional(),
    });

type FormData = z.infer<ReturnType<typeof getSchema>>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RENT_MONTH_DAYS = 30;

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDate(date: Date, locale: string) {
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function formatSAR(amount: number) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency', currency: 'SAR', maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateContractPopup({ onClose, fetchRows }: Props) {
    const t = useTranslations('dashboard.contracts.actions.create');
    const tCommon = useTranslations('comman');

    const [tenantOptions, setTenantOptions] = useState<Option[]>([]);
    const [propertyOptions, setPropertyOptions] = useState<Option[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const propertyInfoMap = useRef<Record<string, PropertyInfo>>({});

    const schema = useMemo(() => getSchema(tCommon), [tCommon]);

    const { register, handleSubmit, control, formState: { errors } } = useForm<any>({
        resolver: zodResolver(schema),
        defaultValues: { duration: 1 },
    });

    const selectedPropertyId  = useWatch({ control, name: 'propertyId' });
    const selectedStartDate   = useWatch({ control, name: 'startDate' });
    const selectedDuration    = useWatch({ control, name: 'duration' });
    const directActivate      = useWatch({ control, name: 'directActivate' });

    const propInfo    = selectedPropertyId ? propertyInfoMap.current[selectedPropertyId] : undefined;
    const durationNum = Number(selectedDuration) || 0;

    const durationUnit = propInfo?.rentType === 'yearly'
        ? t('fields.years')
        : propInfo?.rentType === 'monthly'
            ? t('fields.months')
            : undefined;

    // ── computed summary ──────────────────────────────────────────────────────
    const summary = useMemo(() => {
        if (!propInfo || !selectedStartDate || durationNum < 1) return null;

        const start = new Date(selectedStartDate);
        if (isNaN(start.getTime())) return null;

        const durationInMonths = propInfo.rentType === 'yearly'
            ? durationNum * 12
            : durationNum;
        const end = addDays(start, durationInMonths * RENT_MONTH_DAYS);

        const totalAmount = propInfo.rentType === 'yearly'
            ? propInfo.rentPrice * durationNum
            : propInfo.rentPrice * durationNum;

        return { end, totalAmount, securityDeposit: propInfo.securityDeposit, durationInMonths };
    }, [propInfo, selectedStartDate, durationNum]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadOptions() {
            setIsLoadingOptions(true);
            try {
                const [tenantsRes, propertiesRes] = await Promise.all([
                    api.get('/users/all', {
                        params: { role: 'tenant', limit: 100, status: 'active' },
                        signal: controller.signal,
                    }),
                    api.get('/properties/all', {
                        params: { status: 'active', isRented: false, limit: 100 },
                        signal: controller.signal,
                    }),
                ]);

                const tenants: Option[] = (tenantsRes.data?.records ?? []).map(
                    (u: any) => ({ label: `${u.name} — ${u.email}`, value: u.id })
                );
                const rawProperties: any[] = propertiesRes.data?.records ?? [];
                const properties: Option[] = rawProperties.map(
                    (p: any) => ({ label: p.name, value: p.id })
                );
                propertyInfoMap.current = Object.fromEntries(
                    rawProperties.map((p: any) => [p.id, {
                        rentType: p.rentType,
                        rentPrice: Number(p.rentPrice),
                        securityDeposit: Number(p.securityDeposit),
                    }])
                );

                setTenantOptions(tenants);
                setPropertyOptions(properties);
            } catch (err: any) {
                if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
                    toast.error(t('loadError'));
                }
            } finally {
                setIsLoadingOptions(false);
            }
        }

        loadOptions();
        return () => controller.abort();
    }, []);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(tCommon('submitting'));
        try {
            await api.post('/contracts/admin', data);
            toast.success(t('success'), { id: toastId });
            if (fetchRows) await fetchRows();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('error'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-[92vw] sm:w-[520px] flex flex-col gap-0 "
        >
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-[var(--gray)]">
                <div className="w-11 h-11 rounded-xl bg-[var(--lighter)] flex items-center justify-center mb-4">
                    <LucideFilePlus size={22} className="text-[var(--secondary)]" />
                </div>
                <h2 className="text-lg font-bold text-[var(--dark)]">{t('title')}</h2>
                <p className="text-sm text-[var(--placeholder)] mt-0.5">{t('subtitle')}</p>
            </div>

            {/* Fields */}
            <div className="px-6 py-5 flex flex-col gap-4">
                {isLoadingOptions ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-[var(--placeholder)]">
                        <LucideLoader size={18} className="animate-spin" />
                        <span className="text-sm">{t('loading')}</span>
                    </div>
                ) : (
                    <>
                        {/* Tenant */}
                        <Controller
                            name="tenantId"
                            control={control}
                            render={({ field }) => (
                                <SelectInput
                                    label={t('fields.tenant')}
                                    required
                                    searchable
                                    searchPlaceholder={t('fields.tenantSearch')}
                                    options={tenantOptions}
                                    value={tenantOptions.find(o => o.value === field.value) ?? null}
                                    onChange={opt => field.onChange(opt.value)}
                                    placeholder={t('fields.tenantPlaceholder')}
                                    noOptionsLabel={t('fields.noOptions')}
                                    error={errors.tenantId?.message as any}
                                />
                            )}
                        />

                        {/* Property */}
                        <Controller
                            name="propertyId"
                            control={control}
                            render={({ field }) => (
                                <SelectInput
                                    label={t('fields.property')}
                                    required
                                    searchable
                                    searchPlaceholder={t('fields.propertySearch')}
                                    options={propertyOptions}
                                    value={propertyOptions.find(o => o.value === field.value) ?? null}
                                    onChange={opt => field.onChange(opt.value)}
                                    placeholder={t('fields.propertyPlaceholder')}
                                    noOptionsLabel={t('fields.noOptions')}
                                    error={errors.propertyId?.message as any}
                                />
                            )}
                        />

                        {/* Start Date + Duration row */}
                        <div className="grid grid-cols-2 gap-3">
                            <TextInput
                                {...register('startDate')}
                                type="date"
                                label={t('fields.startDate')}
                                min={today}
                                required
                                error={errors.startDate?.message}
                            />
                            <TextInput
                                {...register('duration')}
                                type="number"
                                label={
                                    durationUnit
                                        ? `${t('fields.duration')} (${durationUnit})`
                                        : t('fields.duration')
                                }
                                placeholder="1"
                                suffix={durationUnit}
                                min={1}
                                required
                                error={errors.duration?.message}
                            />
                        </div>

                        {/* Optional Terms */}
                        <TextAreaInput
                            {...register('proposedTerms')}
                            label={t('fields.terms')}
                            placeholder={t('fields.termsPlaceholder')}
                            rows={3}
                            error={errors.proposedTerms?.message as string}
                        />

                        {/* ── Direct activate toggle ── */}
                        <Controller
                            name="directActivate"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                                <label className={[
                                    'flex items-center gap-3 cursor-pointer',
                                    'p-3.5 rounded-xl border-2 transition-all duration-150',
                                    field.value
                                        ? 'border-emerald-400 bg-emerald-50'
                                        : 'border-[var(--gray)] hover:border-emerald-300 hover:bg-emerald-50/40',
                                ].join(' ')}>
                                    {/* Custom toggle */}
                                    <div className="relative shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={!!field.value}
                                            onChange={e => field.onChange(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={[
                                            'w-9 h-5 rounded-full transition-colors duration-200',
                                            field.value ? 'bg-emerald-500' : 'bg-[var(--gray)]',
                                        ].join(' ')} />
                                        <div className={[
                                            'absolute top-0.5 start-0.5 w-4 h-4 rounded-full bg-white shadow',
                                            'transition-transform duration-200',
                                            field.value ? 'translate-x-4 rtl:-translate-x-4' : '',
                                        ].join(' ')} />
                                    </div>
                                    {/* Label text */}
                                    <div className="flex flex-col gap-0.5 flex-1">
                                        <span className={`text-sm font-semibold ${field.value ? 'text-emerald-700' : 'text-[var(--dark)]'}`}>
                                            {t('fields.directActivate')}
                                        </span>
                                        <span className="text-xs text-[var(--placeholder)]">
                                            {t('fields.directActivateHint')}
                                        </span>
                                    </div>
                                    <LucideZap size={16} className={field.value ? 'text-emerald-500 shrink-0' : 'text-[var(--placeholder)] shrink-0'} />
                                </label>
                            )}
                        />

                        {/* ── Summary card ── */}
                        {summary && (
                            <div className="rounded-xl border border-[var(--secondary)]/20 bg-[var(--highlight)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-[var(--secondary)]/15 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <LucideShieldCheck size={15} className="text-[var(--secondary)] shrink-0" />
                                        <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wide">
                                            {t('summary.title')}
                                        </span>
                                    </div>
                                    {/* Status badge */}
                                    {directActivate ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                                            <LucideZap size={10} />
                                            {t('summary.statusActive')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                                            {t('summary.statusPending')}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-px bg-[var(--secondary)]/10">
                                    {/* End date */}
                                    <SummaryCell
                                        icon={<LucideCalendarCheck size={14} />}
                                        label={t('summary.endDate')}
                                        value={formatDate(summary.end, 'ar')}
                                    />
                                    {/* Duration */}
                                    <SummaryCell
                                        icon={<LucideClock size={14} />}
                                        label={t('summary.duration')}
                                        value={`${summary.durationInMonths} ${t('fields.months')}`}
                                    />
                                    {/* Total */}
                                    <SummaryCell
                                        icon={<LucideBanknote size={14} />}
                                        label={t('summary.totalAmount')}
                                        value={formatSAR(summary.totalAmount)}
                                        highlight
                                    />
                                    {/* Security deposit */}
                                    <SummaryCell
                                        icon={<LucideShieldCheck size={14} />}
                                        label={t('summary.securityDeposit')}
                                        value={formatSAR(summary.securityDeposit)}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-2.5">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-(--gray) text-(--dark) hover:bg-(--lighter) transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {tCommon('cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || isLoadingOptions}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-secondary hover:bg-(--secondary-hover) text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <LucideLoader size={14} className="animate-spin" />
                            <span className="opacity-80">{tCommon('submitting')}</span>
                        </>
                    ) : (
                        t('submit')
                    )}
                </button>
            </div>
        </form>
    );
}

// ─── SummaryCell ──────────────────────────────────────────────────────────────

function SummaryCell({
    icon,
    label,
    value,
    highlight = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1 px-4 py-3 bg-[var(--highlight)]">
            <div className="flex items-center gap-1.5 text-[var(--placeholder)]">
                <span className="shrink-0">{icon}</span>
                <span className="text-[11px] font-medium">{label}</span>
            </div>
            <span className={`text-sm font-bold ${highlight ? 'text-[var(--secondary)]' : 'text-[var(--dark)]'}`}>
                {value}
            </span>
        </div>
    );
}
