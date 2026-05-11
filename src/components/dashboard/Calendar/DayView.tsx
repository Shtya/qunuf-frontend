'use client';

import {
    format,
    isSameDay,
    isToday,
    parseISO,
    getHours,
} from 'date-fns';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/dashboard/calendar';
import { CalendarEventPill } from './CalendarEventPill';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onCreateClick: (date: Date) => void;
}

export function DayView({ currentDate, events, onEventClick, onCreateClick }: Props) {
    const t = useTranslations('dashboard.calendar');
    const dayEvents = events.filter(e => isSameDay(parseISO(e.start), currentDate));
    const today = isToday(currentDate);

    const eventsForHour = (hour: number) =>
        dayEvents.filter(e => getHours(parseISO(e.start)) === hour);

    // All-day / no-time events
    const allDayEvents = dayEvents.filter(e => {
        const meta = e.metadata as any;
        return meta?.allDay === true;
    });

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
            {/* Day header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-black/5 px-6 py-3 flex items-center gap-3">
                <span
                    className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-xl text-[18px] font-bold',
                        today
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-black/4 text-dark/70',
                    )}
                >
                    {format(currentDate, 'd')}
                </span>
                <div>
                    <p className="text-[14px] font-bold text-dark">{format(currentDate, 'EEEE')}</p>
                    <p className="text-[11px] text-dark/40">{format(currentDate, 'MMMM yyyy')}</p>
                </div>
                {today && (
                    <span className="ms-auto text-[10px] font-bold px-2 py-1 rounded-md bg-primary/10 text-primary">
                        {t('today')}
                    </span>
                )}
            </div>

            {/* All-day row */}
            {allDayEvents.length > 0 && (
                <div className="border-b border-black/5 px-4 py-2 flex flex-col gap-1 bg-black/[0.018]">
                    <p className="text-[10px] text-dark/35 font-bold uppercase tracking-widest mb-1">{t('dayPanel.allDay')}</p>
                    {allDayEvents.map(e => (
                        <CalendarEventPill key={e.id} event={e} onClick={onEventClick} />
                    ))}
                </div>
            )}

            {/* Hour slots */}
            <div className="flex-1">
                {HOURS.map(hour => {
                    const slotEvents = eventsForHour(hour);
                    return (
                        <div
                            key={hour}
                            onClick={() => {
                                const d = new Date(currentDate);
                                d.setHours(hour, 0, 0, 0);
                                onCreateClick(d);
                            }}
                            className={cn(
                                'flex gap-4 min-h-14 border-b border-black/5 px-4 py-1',
                                'cursor-pointer hover:bg-primary/3 transition-colors duration-100 group',
                            )}
                        >
                            <div className="w-12 shrink-0 pt-1 text-[11px] text-dark/35 font-medium text-end select-none">
                                {`${String(hour).padStart(2, '0')}:00`}
                            </div>
                            <div className="flex-1 flex flex-col gap-1 py-1">
                                {slotEvents.map(e => (
                                    <CalendarEventPill key={e.id} event={e} onClick={onEventClick} />
                                ))}
                                {slotEvents.length === 0 && (
                                    <div className="h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[11px] text-primary/60 font-medium">{t('dayPanel.addEvent')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
