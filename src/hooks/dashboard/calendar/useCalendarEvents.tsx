'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/libs/axios';
import {
    CalendarEvent,
    CalendarEventFilter,
    CreateCalendarEventPayload,
    UpdateCalendarEventPayload,
    CustomCalendarEvent,
} from '@/types/dashboard/calendar';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

export function useCalendarEvents(initialDate?: Date) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(initialDate ?? new Date());
    const [activeTypes, setActiveTypes] = useState<string[]>([]);

    const buildFilter = useCallback(
        (date: Date, types: string[]): CalendarEventFilter => {
            // Load ±1 month buffer so views are pre-loaded when navigating
            const start = format(startOfMonth(addMonths(date, -1)), "yyyy-MM-dd'T'HH:mm:ss'Z'");
            const end = format(endOfMonth(addMonths(date, 1)), "yyyy-MM-dd'T'23:59:59'Z'");
            return {
                start,
                end,
                types: types.length ? types.join(',') : undefined,
            };
        },
        [],
    );

    const fetchEvents = useCallback(
        async (date: Date, types: string[], signal?: AbortSignal) => {
            setLoading(true);
            setError(null);
            try {
                const filter = buildFilter(date, types);
                const params = new URLSearchParams();
                if (filter.start) params.set('start', filter.start);
                if (filter.end) params.set('end', filter.end);
                if (filter.types) params.set('types', filter.types);

                const res = await api.get<CalendarEvent[]>(
                    `/calendar/events?${params.toString()}`,
                    { signal },
                );
                setEvents(res.data ?? []);
            } catch (err: any) {
                if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
                setError(err?.response?.data?.message ?? 'Failed to load calendar events');
            } finally {
                setLoading(false);
            }
        },
        [buildFilter],
    );

    useEffect(() => {
        const ctrl = new AbortController();
        fetchEvents(currentDate, activeTypes, ctrl.signal);
        return () => ctrl.abort();
    }, [currentDate, activeTypes, fetchEvents]);

    const refetch = useCallback(
        () => fetchEvents(currentDate, activeTypes),
        [currentDate, activeTypes, fetchEvents],
    );

    // ── Navigation ─────────────────────────────────────────────────────────────

    const navigate = useCallback((direction: 'prev' | 'next' | 'today') => {
        setCurrentDate(d => {
            if (direction === 'today') return new Date();
            const offset = direction === 'next' ? 1 : -1;
            return addMonths(d, offset);
        });
    }, []);

    const goToDate = useCallback((date: Date) => setCurrentDate(date), []);

    // ── Type filter ────────────────────────────────────────────────────────────

    const toggleType = useCallback((type: string) => {
        setActiveTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
        );
    }, []);

    const clearTypeFilters = useCallback(() => setActiveTypes([]), []);

    // ── Custom event CRUD ──────────────────────────────────────────────────────

    const createEvent = useCallback(
        async (payload: CreateCalendarEventPayload): Promise<CustomCalendarEvent> => {
            const res = await api.post<CustomCalendarEvent>('/calendar/events', payload);
            await fetchEvents(currentDate, activeTypes);
            return res.data;
        },
        [currentDate, activeTypes, fetchEvents],
    );

    const updateEvent = useCallback(
        async (id: string, payload: UpdateCalendarEventPayload): Promise<CustomCalendarEvent> => {
            // id is the raw UUID, strip source prefix if present
            const rawId = id.startsWith('custom_') ? id.slice(7) : id;
            const res = await api.patch<CustomCalendarEvent>(`/calendar/events/${rawId}`, payload);
            await fetchEvents(currentDate, activeTypes);
            return res.data;
        },
        [currentDate, activeTypes, fetchEvents],
    );

    const deleteEvent = useCallback(
        async (id: string): Promise<void> => {
            const rawId = id.startsWith('custom_') ? id.slice(7) : id;
            await api.delete(`/calendar/events/${rawId}`);
            setEvents(prev => prev.filter(e => e.id !== id));
        },
        [],
    );

    return {
        events,
        loading,
        error,
        currentDate,
        activeTypes,
        navigate,
        goToDate,
        toggleType,
        clearTypeFilters,
        refetch,
        createEvent,
        updateEvent,
        deleteEvent,
    };
}
