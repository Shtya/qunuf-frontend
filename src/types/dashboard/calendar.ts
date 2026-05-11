// ── Event types that can appear on the calendar ───────────────────────────────

export type CalendarEventType =
    | 'contract_start'
    | 'contract_end'
    | 'contract_signed'
    | 'termination'
    | 'payment_due'
    | 'payment_made'
    | 'renewal_request'
    | 'custom'
    | 'reminder';

export type CalendarEventSource = 'contract' | 'payment' | 'renewal' | 'custom';

export type CalendarView = 'month' | 'week' | 'day';

// ── Normalised event as returned by GET /calendar/events ─────────────────────

export interface CalendarEvent {
    id: string;
    title: string;
    start: string; // ISO date-time string
    end: string | null;
    type: CalendarEventType;
    status?: string;
    source: CalendarEventSource;
    sourceId: string;
    url: string | null;
    metadata: Record<string, unknown>;
    color: string;
    isCustom: boolean;
}

// ── Custom event stored in DB (returned after POST / PATCH) ──────────────────

export interface CustomCalendarEvent {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    allDay: boolean;
    color: string | null;
    eventType: 'custom' | 'reminder';
    url: string | null;
    created_at: string;
    updated_at: string;
}

// ── Create / update payload ───────────────────────────────────────────────────

export interface CreateCalendarEventPayload {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    allDay?: boolean;
    color?: string;
    eventType?: 'custom' | 'reminder';
    url?: string;
}

export type UpdateCalendarEventPayload = Partial<CreateCalendarEventPayload>;

// ── Filter params for the query ───────────────────────────────────────────────

export interface CalendarEventFilter {
    start?: string;
    end?: string;
    types?: string; // comma-separated CalendarEventType list
}

// ── Color / label maps used in the UI ────────────────────────────────────────

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
    contract_start: '#10B981',
    contract_end:   '#EF4444',
    contract_signed: '#6366F1',
    termination:    '#F59E0B',
    payment_due:    '#F97316',
    payment_made:   '#14B8A6',
    renewal_request: '#8B5CF6',
    custom:         '#4F46E5',
    reminder:       '#EC4899',
};

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
    contract_start:  'Contract Start',
    contract_end:    'Contract End',
    contract_signed: 'Contract Signed',
    termination:     'Termination',
    payment_due:     'Payment Due',
    payment_made:    'Payment Made',
    renewal_request: 'Renewal Request',
    custom:          'Custom Event',
    reminder:        'Reminder',
};

export const ALL_EVENT_TYPES: CalendarEventType[] = [
    'contract_start',
    'contract_end',
    'contract_signed',
    'termination',
    'payment_due',
    'payment_made',
    'renewal_request',
    'custom',
    'reminder',
];
