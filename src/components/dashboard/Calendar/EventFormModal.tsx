'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { CalendarEvent, CreateCalendarEventPayload } from '@/types/dashboard/calendar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const COLOR_PRESETS = [
    '#4F46E5', '#10B981', '#EF4444', '#F59E0B',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

function toInputDateTime(isoOrDate: string | Date): string {
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    return format(d, "yyyy-MM-dd'T'HH:mm");
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (payload: CreateCalendarEventPayload) => Promise<void>;
    initial?: CalendarEvent | null;
    defaultDate?: Date;
}

export function EventFormModal({ open, onClose, onSave, initial, defaultDate }: Props) {
    const t = useTranslations('dashboard.calendar');
    const isEdit = !!initial;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [color, setColor] = useState(COLOR_PRESETS[0]);
    const [eventType, setEventType] = useState<'custom' | 'reminder'>('custom');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (initial) {
            setTitle(initial.title);
            setDescription((initial.metadata as any)?.description ?? '');
            setStartDate(toInputDateTime(initial.start));
            setEndDate(initial.end ? toInputDateTime(initial.end) : '');
            setAllDay((initial.metadata as any)?.allDay ?? false);
            setColor(initial.color ?? COLOR_PRESETS[0]);
            setEventType((initial.type === 'reminder' ? 'reminder' : 'custom'));
        } else {
            setTitle('');
            setDescription('');
            const base = defaultDate ?? new Date();
            setStartDate(toInputDateTime(base));
            setEndDate('');
            setAllDay(false);
            setColor(COLOR_PRESETS[0]);
            setEventType('custom');
        }
    }, [open, initial, defaultDate]);

    if (!open || typeof window === 'undefined') return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { toast.error(t('form.required')); return; }
        if (!startDate) { toast.error(t('form.startRequired')); return; }

        setSaving(true);
        try {
            await onSave({
                title: title.trim(),
                description: description.trim() || undefined,
                startDate: new Date(startDate).toISOString(),
                endDate: endDate ? new Date(endDate).toISOString() : undefined,
                allDay,
                color,
                eventType,
            });
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to save event');
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <>
            <div
                className="fixed inset-0 z-1000 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={cn(
                    'fixed z-1001 top-1/2 ltr:right-1/2 rtl:left-1/2 ltr:translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2',
                    'w-full max-w-md rounded-2xl overflow-hidden',
                    'bg-white/96 backdrop-blur-2xl',
                    'border border-white/70',
                    'shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_40px_-6px_rgba(0,0,0,0.20),0_40px_80px_-16px_rgba(0,0,0,0.14)]',
                    'animate-in fade-in zoom-in-95 duration-200',
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-black/6">
                    <h2 className="text-[15px] font-bold text-dark">
                        {isEdit ? t('form.editEvent') : t('form.newEvent')}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        aria-label={t('detail.close')}
                        className="w-7 h-7 flex items-center justify-center rounded-lg
                            text-dark/35 hover:text-dark hover:bg-black/6 transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                            {t('form.titleLabel')} *
                        </label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={t('form.titlePlaceholder')}
                            maxLength={255}
                            className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-black/2
                                text-[13px] text-dark font-medium placeholder:text-dark/30
                                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40
                                transition-all duration-150"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                            {t('form.typeLabel')}
                        </label>
                        <div className="flex gap-2">
                            {(['custom', 'reminder'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setEventType(type)}
                                    className={cn(
                                        'flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150',
                                        eventType === type
                                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                            : 'bg-black/3 text-dark/55 border-black/8 hover:border-black/16',
                                    )}
                                >
                                    {type === 'custom' ? t('form.eventType') : t('form.reminderType')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                                {t('form.startLabel')} *
                            </label>
                            <input
                                type={allDay ? 'date' : 'datetime-local'}
                                value={allDay ? startDate.slice(0, 10) : startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-black/2
                                    text-[12px] text-dark
                                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40
                                    transition-all duration-150"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                                {t('form.endLabel')}
                            </label>
                            <input
                                type={allDay ? 'date' : 'datetime-local'}
                                value={allDay ? endDate.slice(0, 10) : endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-black/2
                                    text-[12px] text-dark
                                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40
                                    transition-all duration-150"
                            />
                        </div>
                    </div>

                    {/* All day */}
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={allDay}
                                onChange={e => setAllDay(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={cn(
                                'w-9 h-5 rounded-full border-2 transition-colors duration-200',
                                allDay ? 'bg-primary border-primary' : 'bg-black/8 border-black/12',
                            )}>
                                <div className={cn(
                                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                                    allDay ? 'inset-s-4' : 'inset-s-0.5',
                                )} />
                            </div>
                        </div>
                        <span className="text-[12px] font-semibold text-dark/60 group-hover:text-dark transition-colors">
                            {t('form.allDay')}
                        </span>
                    </label>

                    {/* Description */}
                    <div>
                        <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                            {t('form.noteLabel')}
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={t('form.notePlaceholder')}
                            rows={2}
                            className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-black/2
                                text-[13px] text-dark font-medium placeholder:text-dark/30
                                resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40
                                transition-all duration-150"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-2">
                            {t('form.colorLabel')}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {COLOR_PRESETS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        'w-7 h-7 rounded-lg transition-all duration-150',
                                        color === c
                                            ? 'ring-2 ring-offset-2 ring-dark/30 scale-110'
                                            : 'hover:scale-105',
                                    )}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-black/5 hover:bg-black/8
                                text-[13px] font-semibold text-dark/60 hover:text-dark
                                transition-all duration-150 disabled:opacity-50"
                        >
                            {t('form.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90
                                text-[13px] font-semibold text-white shadow-md shadow-primary/25
                                transition-all duration-150 disabled:opacity-50"
                        >
                            {saving ? t('form.saving') : isEdit ? t('form.save') : t('form.create')}
                        </button>
                    </div>
                </form>
            </div>
        </>,
        document.body,
    );
}
