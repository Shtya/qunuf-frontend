'use client';

import { format, parseISO } from 'date-fns';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    CalendarEvent,
} from '@/types/dashboard/calendar';

interface Props {
    date: Date | null;
    events: CalendarEvent[];
    onClose: () => void;
    onCreateClick: (date: Date) => void;
    onEventEdit: (event: CalendarEvent) => void;
    onEventDelete: (event: CalendarEvent) => void;
}

export function DayDetailPanel({
    date,
    events,
    onClose,
    onCreateClick,
    onEventEdit,
    onEventDelete,
}: Props) {
    const t = useTranslations('dashboard.calendar');
    const router = useRouter();

    const open = !!date;

    if (typeof window === 'undefined') return null;

    const dayEvents = date
        ? events.filter(e => {
              const d = parseISO(e.start);
              return (
                  d.getFullYear() === date.getFullYear() &&
                  d.getMonth() === date.getMonth() &&
                  d.getDate() === date.getDate()
              );
          })
        : [];

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                aria-hidden
                onClick={onClose}
                className={cn(
                    'fixed inset-0 z-[1000] bg-black/25 backdrop-blur-[2px] transition-opacity duration-300',
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
            />

            {/* Panel — slides in from the end (right in LTR, left in RTL) */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={date ? t('dayPanel.title', { date: format(date, 'PPP') }) : ''}
                className={cn(
                    'fixed top-0 end-0 h-full w-full max-w-[380px] z-[1001]',
                    'flex flex-col',
                    'bg-white/96 backdrop-blur-2xl',
                    'border-s border-white/60',
                    'shadow-[-24px_0_60px_-8px_rgba(0,0,0,0.14),-6px_0_20px_-4px_rgba(0,0,0,0.08)]',
                    'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    open ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full',
                )}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-black/6 shrink-0">
                    <div className="flex-1 min-w-0">
                        {date && (
                            <>
                                <p className="text-[18px] font-black text-dark md: leading-tight">
                                    {format(date, 'd')}
                                </p>
                                <p className="text-[12px] text-dark/40 font-semibold mt-0.5">
                                    {format(date, 'EEEE, MMMM yyyy')}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Add event shortcut */}
                    {date && (
                        <button
                            onClick={() => onCreateClick(date)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                bg-primary text-white text-[12px] font-semibold
                                hover:bg-primary/90 transition-colors duration-150
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            <LuPlus className="w-3.5 h-3.5" />
                            {t('dayPanel.addEvent')}
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        aria-label={t('dayPanel.close')}
                        className="w-8 h-8 flex items-center justify-center rounded-xl
                            text-dark/35 hover:text-dark hover:bg-black/6
                            transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                </div>

                {/* Event count badge */}
                <div className="px-5 py-2.5 border-b border-black/4 bg-black/[0.014] shrink-0">
                    <span className="text-[11px] font-bold text-dark/45 uppercase tracking-widest">
                        {t('dayPanel.events')}
                        {dayEvents.length > 0 && (
                            <span className="ms-2 px-2 py-0.5 rounded-full bg-primary/12 text-primary text-[10px] font-black">
                                {dayEvents.length}
                            </span>
                        )}
                    </span>
                </div>

                {/* Event list */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                    {dayEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-black/4 flex items-center justify-center">
                                <span className="text-xl">📅</span>
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-dark/38">{t('dayPanel.noEvents')}</p>
                                <p className="text-[11px] text-dark/24 mt-1">{t('dayPanel.noEventsHint')}</p>
                            </div>
                        </div>
                    ) : (
                        dayEvents.map(event => (
                            <DayEventCard
                                key={event.id}
                                event={event}
                                t={t}
                                onView={() => { if (event.url) router.push(event.url); }}
                                onEdit={() => onEventEdit(event)}
                                onDelete={() => onEventDelete(event)}
                            />
                        ))
                    )}
                </div>

                {/* Footer double-click hint */}
                <div className="shrink-0 px-5 py-3 border-t border-black/5 bg-black/[0.012]">
                    <p className="text-[10px] text-dark/28 text-center font-medium">
                        {t('dayPanel.noEventsHint')}
                    </p>
                </div>
            </div>
        </>,
        document.body,
    );
}

// ── Single event card inside the panel ────────────────────────────────────────

function DayEventCard({
    event,
    t,
    onView,
    onEdit,
    onDelete,
}: {
    event: CalendarEvent;
    t: ReturnType<typeof useTranslations<'dashboard.calendar'>>;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const label = t(`eventTypes.${event.type}` as any);
    const startFmt = format(parseISO(event.start), 'p');
    const endFmt = event.end ? format(parseISO(event.end), 'p') : null;
    const meta = event.metadata as any;

    return (
        <div
            className={cn(
                'group rounded-2xl border p-3.5 transition-all duration-150',
                'bg-white hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)]',
                'border-black/5 hover:border-black/10',
            )}
            style={{ borderLeftColor: event.color, borderLeftWidth: 3 }}
        >
            {/* Top row */}
            <div className="flex items-start gap-2.5 mb-2">
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: event.color + '18', color: event.color }}
                >
                    <span className="text-[10px] font-black uppercase">{label.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-dark md: leading-tight line-clamp-2">{event.title}</p>
                    <span
                        className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: event.color + '15', color: event.color }}
                    >
                        {label}
                    </span>
                </div>
            </div>

            {/* Time row */}
            <div className="flex items-center gap-1.5 mb-2 ms-10">
                <span className="text-[11px] text-dark/45 font-medium">{startFmt}</span>
                {endFmt && (
                    <>
                        <span className="text-dark/25">→</span>
                        <span className="text-[11px] text-dark/45 font-medium">{endFmt}</span>
                    </>
                )}
                {meta?.allDay && (
                    <span className="text-[10px] text-dark/35 font-semibold bg-black/4 px-1.5 py-0.5 rounded-md">
                        {t('dayPanel.allDay')}
                    </span>
                )}
            </div>

            {/* Metadata */}
            {meta?.amount && (
                <div className="ms-10 mb-1">
                    <span className="text-[11px] font-semibold text-dark/60">
                        SAR {Number(meta.amount).toLocaleString()}
                    </span>
                </div>
            )}
            {meta?.description && (
                <div className="ms-10 mb-1">
                    <p className="text-[11px] text-dark/45 line-clamp-2">{meta.description}</p>
                </div>
            )}

            {/* Action row */}
            <div className="flex items-center gap-1.5 ms-10 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {event.url && (
                    <button
                        onClick={onView}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg
                            bg-primary/8 hover:bg-primary/14 text-primary
                            text-[10px] font-semibold transition-colors duration-150"
                    >
                        <FiExternalLink className="w-3 h-3" />
                        {t('detail.viewDetails')}
                    </button>
                )}
                {event.isCustom && (
                    <>
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg
                                bg-black/5 hover:bg-black/8 text-dark/55
                                text-[10px] font-semibold transition-colors duration-150"
                        >
                            <FiEdit2 className="w-3 h-3" />
                            {t('detail.edit')}
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg
                                bg-red-50 hover:bg-red-100 text-red-500
                                text-[10px] font-semibold transition-colors duration-150"
                        >
                            <FiTrash2 className="w-3 h-3" />
                            {t('detail.delete')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
