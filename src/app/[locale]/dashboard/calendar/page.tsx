'use client';

import CalendarView from '@/components/dashboard/Calendar/CalendarView';

export default function CalendarPage() {
    return (
        <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 8rem)' }}>
            <CalendarView />
        </div>
    );
}
