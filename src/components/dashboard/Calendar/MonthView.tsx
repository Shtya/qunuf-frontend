'use client';

import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
} from 'date-fns';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/dashboard/calendar';
import { CalendarEventPill } from './CalendarEventPill';

interface Props {
    currentDate: Date;
    events: CalendarEvent[];
    onDayClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    onCreateClick: (date: Date) => void;
}

export function MonthView({ currentDate, events, onDayClick, onEventClick, onCreateClick }: Props) {
    const t = useTranslations('dashboard.calendar');
    const weekdays = t.raw('weekdays') as string[];

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const eventsForDay = (day: Date) =>
        events.filter(e => isSameDay(parseISO(e.start), day));

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-black/5">
                {weekdays.map((day: string) => (
                    <div
                        key={day}
                        className="py-2 text-center text-[11px] font-bold text-dark/40 uppercase tracking-widest"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-0">
                {days.map((day, idx) => {
                    const dayEvents = eventsForDay(day);
                    const inMonth = isSameMonth(day, currentDate);
                    const today = isToday(day);
                    const MAX_VISIBLE = 3;

                    return (
                        <div
                            key={idx}
                            onClick={() => onDayClick(day)}
                            onDoubleClick={e => { e.stopPropagation(); onCreateClick(day); }}
                            className={cn(
                                'relative border-b border-e border-black/5 p-1 min-h-20 cursor-pointer',
                                'transition-colors duration-150 group',
                                inMonth
                                    ? 'bg-white/60 hover:bg-primary/3'
                                    : 'bg-black/[0.018] hover:bg-black/3',
                            )}
                        >
                            {/* Day number */}
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={cn(
                                        'w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-bold transition-colors',
                                        today
                                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                                            : inMonth
                                            ? 'text-dark/70 group-hover:text-primary'
                                            : 'text-dark/25',
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                                {/* Event dot indicator for days with events (mobile hint) */}
                                {dayEvents.length > 0 && (
                                    <span
                                        className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-0 lg:hidden"
                                        aria-hidden
                                    />
                                )}
                            </div>

                            {/* Events */}
                            <div className="flex flex-col gap-0.5">
                                {dayEvents.slice(0, MAX_VISIBLE).map(event => (
                                    <CalendarEventPill
                                        key={event.id}
                                        event={event}
                                        compact
                                        onClick={onEventClick}
                                    />
                                ))}
                                {dayEvents.length > MAX_VISIBLE && (
                                    <button
                                        onClick={e => { e.stopPropagation(); onDayClick(day); }}
                                        className="text-[9px] text-primary/70 font-semibold px-1 text-start hover:text-primary transition-colors"
                                    >
                                        {t('addMore', { count: dayEvents.length - MAX_VISIBLE })}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
