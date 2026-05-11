'use client';

import { format, parseISO } from 'date-fns';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';
import { FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { CalendarEvent } from '@/types/dashboard/calendar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Props {
    event: CalendarEvent | null;
    onClose: () => void;
    onEdit: (event: CalendarEvent) => void;
    onDelete: (event: CalendarEvent) => void;
}

export function EventDetailDrawer({ event, onClose, onEdit, onDelete }: Props) {
    const t = useTranslations('dashboard.calendar');
    const router = useRouter();
    if (!event || typeof window === 'undefined') return null;

    const label = t(`eventTypes.${event.type}` as any);
    const startFmt = format(parseISO(event.start), 'PPp');
    const endFmt = event.end ? format(parseISO(event.end), 'PPp') : null;
    const meta = event.metadata as any;

    return createPortal(
        <>
            <div
                className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={cn(
                    'fixed z-[1001] top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2',
                    'w-full max-w-sm rounded-2xl overflow-hidden',
                    'bg-white/95 backdrop-blur-2xl',
                    'border border-white/70',
                    'shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_32px_-4px_rgba(0,0,0,0.18),0_32px_64px_-12px_rgba(0,0,0,0.12)]',
                    'animate-in fade-in zoom-in-95 duration-200',
                )}
            >
                {/* Color bar */}
                <div className="h-1.5" style={{ backgroundColor: event.color }} />

                {/* Header */}
                <div className="flex items-start gap-3 px-5 pt-4 pb-3 border-b border-black/5">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                    >
                        <span className="text-[11px] font-black uppercase">
                            {label.slice(0, 2)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-dark leading-tight line-clamp-2">
                            {event.title}
                        </p>
                        <span
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: event.color + '18', color: event.color }}
                        >
                            {label}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label={t('detail.close')}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
                            text-dark/35 hover:text-dark hover:bg-black/6 transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-3">
                    <InfoRow label={t('detail.start')} value={startFmt} />
                    {endFmt && <InfoRow label={t('detail.end')} value={endFmt} />}
                    {meta?.amount && (
                        <InfoRow label={t('detail.amount')} value={`SAR ${Number(meta.amount).toLocaleString()}`} />
                    )}
                    {meta?.contractNumber && (
                        <InfoRow label={t('detail.contract')} value={meta.contractNumber} />
                    )}
                    {meta?.status && (
                        <InfoRow label={t('detail.status')} value={String(meta.status)} />
                    )}
                    {meta?.description && (
                        <InfoRow label={t('detail.note')} value={String(meta.description)} />
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 flex items-center gap-2">
                    {event.url && (
                        <button
                            onClick={() => { router.push(event.url!); onClose(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl
                                bg-primary text-white text-[12px] font-semibold
                                hover:bg-primary/90 transition-colors duration-150
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            <FiExternalLink className="w-3.5 h-3.5" />
                            {t('detail.viewDetails')}
                        </button>
                    )}
                    {event.isCustom && (
                        <>
                            <button
                                onClick={() => onEdit(event)}
                                className="flex items-center gap-1.5 py-2 px-3 rounded-xl
                                    bg-black/5 hover:bg-black/8 text-dark/60 hover:text-dark
                                    text-[12px] font-semibold transition-colors duration-150
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            >
                                <FiEdit2 className="w-3.5 h-3.5" />
                                {t('detail.edit')}
                            </button>
                            <button
                                onClick={() => onDelete(event)}
                                className="flex items-center gap-1.5 py-2 px-3 rounded-xl
                                    bg-red-50 hover:bg-red-100 text-red-500
                                    text-[12px] font-semibold transition-colors duration-150
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                            >
                                <FiTrash2 className="w-3.5 h-3.5" />
                                {t('detail.delete')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>,
        document.body,
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="shrink-0 text-[11px] text-dark/38 font-semibold w-20 pt-0.5">{label}</span>
            <span className="flex-1 text-[12px] text-dark/75 font-medium">{value}</span>
        </div>
    );
}
