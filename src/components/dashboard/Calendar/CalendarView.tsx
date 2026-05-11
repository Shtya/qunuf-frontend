'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
    CalendarEvent, 
    ALL_EVENT_TYPES,
    EVENT_TYPE_COLORS,
    CalendarEventType,
    CreateCalendarEventPayload,
} from '@/types/dashboard/calendar';
import { useCalendarEvents } from '@/hooks/dashboard/calendar/useCalendarEvents';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { EventDetailDrawer } from './EventDetailDrawer';
import { EventFormModal } from './EventFormModal';
import { DayDetailPanel } from './DayDetailPanel';
import { GoogleConnectModal } from './GoogleConnectModal';
import toast from 'react-hot-toast';

import { LuChevronLeft, LuChevronRight, LuPlus, LuCalendarDays, LuFilter } from 'react-icons/lu';
import { BsCalendar3Week, BsCalendarDay, BsGoogle } from 'react-icons/bs';

const VIEW_ICONS = {
    month: LuCalendarDays,
    week: BsCalendar3Week,
    day: BsCalendarDay,
};

export default function CalendarView() {
    const t = useTranslations('dashboard.calendar');

    const {
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
    } = useCalendarEvents();

    const [view, setView] = useState<any>('month');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formDefault, setFormDefault] = useState<Date | undefined>();
    const [filterOpen, setFilterOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<CalendarEvent | null>(null);
    const [dayPanelDate, setDayPanelDate] = useState<Date | null>(null);
    const [googleModalOpen, setGoogleModalOpen] = useState(false);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
    };

    const handleCreateClick = (date: Date) => {
        setDayPanelDate(null);
        setFormDefault(date);
        setEditingEvent(null);
        setFormOpen(true);
    };

    const handleDayClick = (date: Date) => {
        setDayPanelDate(date);
    };

    const handleEdit = (event: CalendarEvent) => {
        setSelectedEvent(null);
        setDayPanelDate(null);
        setEditingEvent(event);
        setFormOpen(true);
    };

    const handleDelete = async (event: CalendarEvent) => {
        setDeleteConfirm(event);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await deleteEvent(deleteConfirm.id);
            toast.success(t('delete.title'));
        } catch {
            toast.error('Failed to delete event');
        } finally {
            setDeleteConfirm(null);
            setSelectedEvent(null);
            setDayPanelDate(null);
        }
    };

    const handleSave = async (payload: CreateCalendarEventPayload) => {
        if (editingEvent) {
            await updateEvent(editingEvent.id, payload);
            toast.success(t('form.save'));
        } else {
            await createEvent(payload);
            toast.success(t('form.create'));
        }
    };

    const headerTitle = () => {
        if (view === 'month') return format(currentDate, 'MMMM yyyy');
        if (view === 'week') return `${t('views.week')} — ${format(currentDate, 'MMM d, yyyy')}`;
        return format(currentDate, 'EEEE, MMM d, yyyy');
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* ── Top toolbar ───────────────────────────────────────────── */}
            <div
                className="flex flex-wrap items-center gap-3 px-5 py-3 shrink-0
                    bg-white/78 backdrop-blur-2xl rounded-2xl mb-3
                    ring-1 ring-inset ring-white/70
                    shadow-[0_2px_1px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.06),0_14px_36px_rgba(0,0,0,0.04)]"
            >
                {/* Navigation */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => navigate('prev')}
                        className="w-8 h-8 flex items-center justify-center rounded-xl
                            bg-black/4 hover:bg-primary/8 text-dark/50 hover:text-primary
                            transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <LuChevronLeft className=" rtl:scale-x-[-1] w-4 h-4" />
                    </button>

                    <button
                        onClick={() => navigate('today')}
                        className="px-3 py-1.5 rounded-xl text-[12px] font-semibold
                            bg-black/4 hover:bg-primary/8 text-dark/55 hover:text-primary
                            transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        {t('today')}
                    </button>

                    <button
                        onClick={() => navigate('next')}
                        className="w-8 h-8 flex items-center justify-center rounded-xl
                            bg-black/4 hover:bg-primary/8 text-dark/50 hover:text-primary
                            transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <LuChevronRight className=" rtl:scale-x-[-1] w-4 h-4" />
                    </button>
                </div>

                {/* Title */}
                <h2 className="text-[15px] font-bold text-dark flex-1 min-w-0 truncate">
                    {headerTitle()}
                </h2>

                {/* View switcher */}
                <div className="flex items-center gap-1 bg-black/4 rounded-xl p-0.5">
                    {(['month', 'week', 'day'] as any[]).map(v => {
                        const Icon = VIEW_ICONS[v];
                        return (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all duration-150',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                    view === v
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-dark/50 hover:text-dark',
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t(`views.${v}` as any)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter toggle */}
                <button
                    onClick={() => setFilterOpen(p => !p)}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        filterOpen || activeTypes.length > 0
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-black/4 hover:bg-primary/6 text-dark/50 hover:text-primary',
                    )}
                >
                    <LuFilter className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('filter')}</span>
                    {activeTypes.length > 0 && (
                        <span className="w-4 h-4 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-black">
                            {activeTypes.length}
                        </span>
                    )}
                </button>

                {/* Google Calendar */}
                <button
                    title={t('googleConnect')}
                    onClick={() => setGoogleModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
                        bg-black/4 hover:bg-[#4285F4]/8 text-dark/50 hover:text-[#4285F4]
                        transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4]/30"
                >
                    <BsGoogle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('google')}</span>
                </button>

                {/* New event */}
                <button
                    onClick={() => { setEditingEvent(null); setFormDefault(new Date()); setFormOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                        bg-primary text-white shadow-md shadow-primary/25
                        hover:bg-primary/90 active:scale-95 transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    <LuPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('newEvent')}</span>
                </button>
            </div>

            {/* ── Filter panel ──────────────────────────────────────────── */}
            {filterOpen && (
                <div
                    className="flex flex-wrap gap-2 px-4 py-3 mb-3 shrink-0
                        bg-white/70 backdrop-blur-xl rounded-2xl
                        ring-1 ring-inset ring-white/60
                        animate-in slide-in-from-top-2 duration-150"
                >
                    <button
                        onClick={clearTypeFilters}
                        className={cn(
                            'px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-150',
                            activeTypes.length === 0
                                ? 'bg-dark text-white border-dark'
                                : 'bg-black/4 text-dark/55 border-black/8 hover:border-dark/20',
                        )}
                    >
                        {t('allTypes')}
                    </button>
                    {ALL_EVENT_TYPES.map(type => {
                        const active = activeTypes.includes(type);
                        return (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-150',
                                    active
                                        ? 'text-white border-transparent'
                                        : 'bg-black/4 text-dark/55 border-black/8 hover:border-black/20',
                                )}
                                style={active ? { backgroundColor: EVENT_TYPE_COLORS[type] } : {}}
                            >
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: EVENT_TYPE_COLORS[type] }}
                                />
                                {t(`eventTypes.${type}` as any)}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Calendar body ─────────────────────────────────────────── */}
            <div
                className="flex-1 min-h-0 overflow-hidden rounded-2xl
                    bg-white/78 backdrop-blur-2xl
                    ring-1 ring-inset ring-white/70
                    shadow-[0_2px_1px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.06),0_14px_36px_rgba(0,0,0,0.04)]"
            >
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center
                        bg-white/60 backdrop-blur-sm rounded-2xl">
                        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <div className="!py-6 flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-dark/60">{error}</p>
                            <button
                                onClick={refetch}
                                className="mt-2 text-[12px] text-primary font-semibold hover:underline"
                            >
                                {t('error.retry')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && events.length === 0 && (
                    <div className=" !py-6 flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-black/4 flex items-center justify-center
                            shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]">
                            <LuCalendarDays className="w-7 h-7 text-dark/20" />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-dark/40">{t('empty.title')}</p>
                            <p className="text-[12px] text-dark/28 mt-1">{t('empty.description')}</p>
                        </div>
                    </div>
                )}

                {/* Views */}
                {!error && (
                    <div className="  flex flex-col h-full">
                        {view === 'month' && (
                            <MonthView
                                currentDate={currentDate}
                                events={events}
                                onDayClick={handleDayClick}
                                onEventClick={handleEventClick}
                                onCreateClick={handleCreateClick}
                            />
                        )}
                        {view === 'week' && (
                            <WeekView
                                currentDate={currentDate}
                                events={events}
                                onEventClick={handleEventClick}
                                onCreateClick={handleCreateClick}
                            />
                        )}
                        {view === 'day' && (
                            <DayView
                                currentDate={currentDate}
                                events={events}
                                onEventClick={handleEventClick}
                                onCreateClick={handleCreateClick}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* ── Modals & panels ───────────────────────────────────────── */}
            <GoogleConnectModal
                open={googleModalOpen}
                onClose={() => setGoogleModalOpen(false)}
            />

            <DayDetailPanel
                date={dayPanelDate}
                events={events}
                onClose={() => setDayPanelDate(null)}
                onCreateClick={handleCreateClick}
                onEventEdit={handleEdit}
                onEventDelete={handleDelete}
            />

            <EventDetailDrawer
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <EventFormModal
                open={formOpen}
                onClose={() => { setFormOpen(false); setEditingEvent(null); }}
                onSave={handleSave}
                initial={editingEvent}
                defaultDate={formDefault}
            />

            {/* Delete confirmation */}
            {deleteConfirm && typeof window !== 'undefined' && (
                <div className="fixed inset-0 z-1002 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-[15px] font-bold text-dark mb-2">{t('delete.title')}</h3>
                        <p className="text-[13px] text-dark/55 mb-5">
                            &quot;{deleteConfirm.title}&quot; {t('delete.message')}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2 rounded-xl bg-black/5 text-[13px] font-semibold text-dark/60 hover:bg-black/8 transition-colors"
                            >
                                {t('delete.cancel')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2 rounded-xl bg-red-500 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
                            >
                                {t('delete.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
