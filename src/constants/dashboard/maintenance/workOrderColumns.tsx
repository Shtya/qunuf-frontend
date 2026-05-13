'use client';

import { WorkOrder, WorkOrderStatus, MaintenancePriority } from '@/types/dashboard/maintenance';
import { TableColumnType } from '@/types/table';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

const STATUS_MAP: Record<WorkOrderStatus, { bg: string; text: string; ring: string; dot: string }> = {
    scheduled:   { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200',   dot: 'bg-blue-500' },
    in_progress: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', dot: 'bg-violet-500' },
    completed:   { bg: 'bg-emerald-50',text: 'text-emerald-700',ring: 'ring-emerald-200',dot: 'bg-emerald-500' },
    closed:      { bg: 'bg-gray-100',  text: 'text-gray-500',   ring: 'ring-gray-200',   dot: 'bg-gray-400' },
    overdue:     { bg: 'bg-red-50',    text: 'text-red-600',    ring: 'ring-red-200',    dot: 'bg-red-500' },
    cancelled:   { bg: 'bg-red-50',    text: 'text-red-400',    ring: 'ring-red-100',    dot: 'bg-red-300' },
};

const PRIORITY_MAP: Record<MaintenancePriority, { text: string; dot: string }> = {
    low:      { text: 'text-gray-500',   dot: 'bg-gray-400' },
    medium:   { text: 'text-amber-600',  dot: 'bg-amber-500' },
    high:     { text: 'text-orange-600', dot: 'bg-orange-500' },
    critical: { text: 'text-red-600',    dot: 'bg-red-500' },
};

const STATUS_TRANSITIONS: Partial<Record<WorkOrderStatus, WorkOrderStatus[]>> = {
    scheduled:   ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    overdue:     ['in_progress', 'scheduled', 'cancelled'],
    cancelled:   ['scheduled'],
};

export type WorkOrderColumnOptions = {
    isAdminOrLandlord?: boolean;
    onStatusChange?: (id: string, status: WorkOrderStatus) => void;
};

export const WorkOrderColumns = (
    t: ReturnType<typeof useTranslations>,
    options?: WorkOrderColumnOptions,
): TableColumnType<WorkOrder>[] => [
    {
        key: 'title',
        label: t('columns.title'),
        cell: (value) => (
            <span className="font-medium text-sm text-(--dark)">{value as string}</span>
        ),
    },
    {
        key: 'property',
        label: t('columns.property'),
        cell: (value) => (
            <span className="text-sm text-gray-600">{(value as any)?.name ?? '—'}</span>
        ),
    },
    {
        key: 'status',
        label: t('columns.status'),
        cell: (value, row) => {
            const current = value as WorkOrderStatus;
            const s = STATUS_MAP[current] ?? STATUS_MAP.scheduled;

            if (options?.isAdminOrLandlord && options?.onStatusChange) {
                const next = STATUS_TRANSITIONS[current] ?? [];
                return (
                    <select
                        value={current}
                        onChange={e => options.onStatusChange!(row!.id, e.target.value as WorkOrderStatus)}
                        onClick={e => e.stopPropagation()}
                        className={`
                            appearance-none cursor-pointer text-xs font-semibold
                            rounded-full px-2.5 py-1 ring-1 border-none outline-none
                            transition-colors duration-150 max-w-40
                            ${s.bg} ${s.text} ${s.ring}
                        `}
                    >
                        <option value={current}>{t(`statusOptions.${current}`)}</option>
                        {next.map(ns => (
                            <option key={ns} value={ns}>
                                → {t(`statusOptions.${ns}`)}
                            </option>
                        ))}
                    </select>
                );
            }

            return (
                <span className={`inline-flex items-center gap-1.5 ${s.bg} ${s.text} ring-1 ${s.ring} rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap`}>
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                        {current === 'in_progress' && (
                            <span className={`absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-60 animate-ping`} />
                        )}
                        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    </span>
                    {t(`statusOptions.${current}`)}
                </span>
            );
        },
    },
    {
        key: 'priority',
        label: t('columns.priority'),
        cell: (value) => {
            const p = PRIORITY_MAP[value as MaintenancePriority] ?? PRIORITY_MAP.medium;
            return (
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${p.text}`}>
                    <span className={`inline-flex h-1.5 w-1.5 rounded-full ${p.dot}`} />
                    {t(`priorityOptions.${value}`)}
                </span>
            );
        },
    },
    {
        key: 'provider',
        label: t('columns.provider'),
        cell: (value) => (
            <span className="text-sm text-gray-600">{(value as any)?.name ?? <span className="text-gray-300">—</span>}</span>
        ),
    },
    {
        key: 'dueDate',
        label: t('columns.dueDate'),
        cell: (value) =>
            value ? (
                <span className="text-sm text-(--dark)">
                    {format(new Date(value as string), 'dd/MM/yyyy')}
                </span>
            ) : (
                <span className="text-gray-300 select-none">—</span>
            ),
    },
    {
        key: 'tenantRating',
        label: t('columns.tenantRating'),
        cell: (value) =>
            value ? (
                <span className="inline-flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`text-sm ${i < (value as number) ? 'opacity-100' : 'opacity-20'}`}>★</span>
                    ))}
                    <span className="ms-1 text-xs font-semibold text-amber-600">{value as number}/5</span>
                </span>
            ) : (
                <span className="text-gray-300 select-none">—</span>
            ),
    },
    {
        key: 'created_at',
        label: t('columns.createdAt'),
        cell: (value) =>
            value ? (
                <span className="text-sm text-gray-500">
                    {format(new Date(value as string), 'dd/MM/yyyy')}
                </span>
            ) : (
                <span className="text-gray-300 select-none">—</span>
            ),
    },
];

export const ServiceProviderColumns = (
    t: ReturnType<typeof useTranslations>,
): TableColumnType<any>[] => [
    {
        key: 'name',
        label: t('providerColumns.name'),
        cell: (value) => <span className="font-medium text-sm">{value as string}</span>,
    },
    {
        key: 'serviceCategory',
        label: t('providerColumns.category'),
        cell: (value) => (
            <span className="capitalize text-sm text-gray-600">{(value as string).replace('_', ' ')}</span>
        ),
    },
    {
        key: 'phone',
        label: t('providerColumns.phone'),
        cell: (value) => <span className="text-sm font-mono">{value as string}</span>,
    },
    {
        key: 'email',
        label: t('providerColumns.email'),
        cell: (value) =>
            value ? (
                <span className="text-sm text-gray-600">{value as string}</span>
            ) : (
                <span className="text-gray-300">—</span>
            ),
    },
    {
        key: 'status',
        label: t('providerColumns.status'),
        cell: (value) => {
            const colors: Record<string, string> = {
                active:    'bg-emerald-50 text-emerald-700 ring-emerald-200',
                inactive:  'bg-gray-100 text-gray-500 ring-gray-200',
                suspended: 'bg-red-50 text-red-600 ring-red-200',
            };
            return (
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${colors[value as string] ?? colors.inactive}`}>
                    {value as string}
                </span>
            );
        },
    },
    {
        key: 'averageRating',
        label: t('providerColumns.rating'),
        cell: (value) =>
            value !== null && value !== undefined ? (
                <span className="text-sm font-semibold text-amber-500">
                    ★ {Number(value).toFixed(1)}
                </span>
            ) : (
                <span className="text-gray-300">—</span>
            ),
    },
    {
        key: 'slaHours',
        label: t('providerColumns.sla'),
        cell: (value) =>
            value ? (
                <span className="text-sm text-gray-600">{value as number}h</span>
            ) : (
                <span className="text-gray-300">—</span>
            ),
    },
];
