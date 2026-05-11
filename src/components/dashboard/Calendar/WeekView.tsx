'use client';

import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
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

export function WeekView({ currentDate, events, onEventClick, onCreateClick }: Props) {
    const t = useTranslations('dashboard.calendar');
    const weekdays = t.raw('weekdays') as string[];

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const eventsForSlot = (day: Date, hour: number) =>
        events.filter(e => {
            const d = parseISO(e.start);
            return isSameDay(d, day) && getHours(d) === hour;
        });

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
            {/* Day headers */}
            <div className="grid grid-cols-[56px_repeat(7,1fr)] sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-black/5">
                <div className="p-2" />
                {days.map((day, i) => (
                    <div key={day.toISOString()} className="text-center py-2 border-s border-black/5">
                        <p className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                            {weekdays[i] ?? format(day, 'EEE')}
                        </p>
                        <span
                            className={cn(
                                'inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-bold mt-0.5',
                                isToday(day)
                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                    : 'text-dark/70',
                            )}
                        >
                            {format(day, 'd')}
                        </span>
                    </div>
                ))}
            </div>

            {/* Hour rows */}
            <div className="flex-1">
                {HOURS.map(hour => (
                    <div key={hour} className="grid grid-cols-[56px_repeat(7,1fr)] min-h-[52px] border-b border-black/5">
                        <div className="pt-1 pe-2 text-end text-[10px] text-dark/30 font-medium select-none shrink-0">
                            {hour === 0 ? '' : `${hour}:00`}
                        </div>
                        {days.map(day => {
                            const slotEvents = eventsForSlot(day, hour);
                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => {
                                        const d = new Date(day);
                                        d.setHours(hour);
                                        onCreateClick(d);
                                    }}
                                    className="border-s border-black/5 p-0.5 cursor-pointer hover:bg-primary/3 transition-colors duration-100 group"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        {slotEvents.map(e => (
                                            <CalendarEventPill
                                                key={e.id}
                                                event={e}
                                                compact
                                                onClick={onEventClick}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
