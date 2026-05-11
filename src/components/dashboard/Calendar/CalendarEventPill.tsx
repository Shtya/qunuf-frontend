'use client';

import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/dashboard/calendar';
import { useRouter } from 'next/navigation';

interface Props {
    event: CalendarEvent;
    compact?: boolean;
    onClick?: (event: CalendarEvent) => void;
}

export function CalendarEventPill({ event, compact = false, onClick }: Props) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
            onClick(event);
        } else if (event.url) {
            router.push(event.url);
        }
    };

    return (
        <button
            onClick={handleClick}
            title={event.title}
            className={cn(
                'w-full text-start truncate rounded-md font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                compact
                    ? 'text-[9px] px-1 py-0.5 leading-tight'
                    : 'text-[11px] px-2 py-1',
                'hover:brightness-110 active:scale-95',
            )}
            style={{
                backgroundColor: event.color + '22',
                color: event.color,
                borderLeft: `3px solid ${event.color}`,
            }}
        >
            {event.title}
        </button>
    );
}
