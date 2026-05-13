'use client';

import { useState, useEffect } from 'react';
import { WorkOrder, WorkOrderStatus } from '@/types/dashboard/maintenance';
import Popup from '@/components/atoms/Popup';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/constants/user';
import { MdWork, MdAccessTime, MdPerson, MdBusiness, MdCheckCircle, MdStar, MdCalendarMonth } from 'react-icons/md';
import api from '@/libs/axios';

interface Props {
    workOrder: WorkOrder | null;
    onClose: () => void;
    onRefresh?: () => void;
}

const STATUS_COLORS: Record<WorkOrderStatus, { bg: string; text: string; ring: string; dot: string }> = {
    scheduled:   { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200',   dot: 'bg-blue-500' },
    in_progress: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', dot: 'bg-violet-500' },
    completed:   { bg: 'bg-emerald-50',text: 'text-emerald-700',ring: 'ring-emerald-200',dot: 'bg-emerald-500' },
    closed:      { bg: 'bg-gray-100',  text: 'text-gray-500',   ring: 'ring-gray-200',   dot: 'bg-gray-400' },
    overdue:     { bg: 'bg-red-50',    text: 'text-red-600',    ring: 'ring-red-200',    dot: 'bg-red-500' },
    cancelled:   { bg: 'bg-red-50',    text: 'text-red-400',    ring: 'ring-red-100',    dot: 'bg-red-300' },
};

const STATUS_TRANSITIONS: Partial<Record<WorkOrderStatus, WorkOrderStatus[]>> = {
    scheduled:   ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    overdue:     ['in_progress', 'cancelled'],
    cancelled:   ['scheduled'],
};

const CAN_RESCHEDULE: WorkOrderStatus[] = ['overdue', 'cancelled', 'scheduled'];
const TERMINAL_STATUSES: WorkOrderStatus[] = ['completed', 'closed'];

function Stars({ value, max = 5, interactive = false, onSelect }: {
    value: number;
    max?: number;
    interactive?: boolean;
    onSelect?: (n: number) => void;
}) {
    return (
        <span className="inline-flex gap-0.5">
            {Array.from({ length: max }, (_, i) => (
                <MdStar
                    key={i}
                    onClick={() => interactive && onSelect?.(i + 1)}
                    className={[
                        'text-xl',
                        i < value ? 'text-amber-400' : 'text-gray-200',
                        interactive ? 'cursor-pointer hover:scale-110 transition-transform' : '',
                    ].join(' ')}
                />
            ))}
        </span>
    );
}

export default function WorkOrderDetailsPopup({ workOrder: initialWorkOrder, onClose, onRefresh }: Props) {
    const t = useTranslations('dashboard.maintenance');
    const { role } = useAuth();

    // Local fresh copy fetched from API on open
    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [fetchError, setFetchError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    // Rating
    const [rating, setRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [showRatingForm, setShowRatingForm] = useState(false);

    // Reschedule
    const [showReschedule, setShowReschedule] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');

    // Fetch fresh data every time popup opens with a new work order ID
    useEffect(() => {
        if (!initialWorkOrder) {
            setWorkOrder(null);
            return;
        }
        setWorkOrder(initialWorkOrder); // show immediately from table data
        setFetchError(false);
        setActionError('');
        setRating(0);
        setRatingComment('');
        setShowRatingForm(false);
        setShowReschedule(false);
        setRescheduleDate('');

        // Then fetch the latest status from the API
        api.get<WorkOrder>(`/maintenance/work-orders/${initialWorkOrder.id}`)
            .then(r => setWorkOrder(r.data))
            .catch(() => setFetchError(true));
    }, [initialWorkOrder?.id]);

    if (!initialWorkOrder) return null;

    const isAdminOrLandlord = role === UserRole.ADMIN || role === UserRole.LANDLORD;
    const isTenant = role === UserRole.TENANT;

    const wo = workOrder ?? initialWorkOrder;
    const sc = STATUS_COLORS[wo.status] ?? STATUS_COLORS.scheduled;
    const nextStatuses = STATUS_TRANSITIONS[wo.status] ?? [];
    const canReschedule = isAdminOrLandlord && CAN_RESCHEDULE.includes(wo.status);
    const isTerminal = TERMINAL_STATUSES.includes(wo.status);

    const callApi = async (fn: () => Promise<unknown>) => {
        setLoading(true);
        setActionError('');
        try {
            await fn();
            onRefresh?.();
            onClose();
        } catch (err: any) {
            setActionError(err?.response?.data?.message ?? t('genericError'));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (status: WorkOrderStatus) =>
        callApi(() => api.patch(`/maintenance/work-orders/${wo.id}/status`, { status }));

    const handleReschedule = () =>
        callApi(async () => {
            await api.patch(`/maintenance/work-orders/${wo.id}`, { dueDate: rescheduleDate });
            if (['overdue', 'cancelled'].includes(wo.status)) {
                await api.patch(`/maintenance/work-orders/${wo.id}/status`, { status: 'scheduled' });
            }
        });

    const handleRate = () => {
        if (rating === 0) return;
        callApi(() => api.patch(`/maintenance/work-orders/${wo.id}/rate`, { rating, comment: ratingComment }));
    };

    return (
        <Popup show={!!initialWorkOrder} onClose={onClose} headerContent={t('workOrderDetails')}>
            <div className="space-y-4 min-w-[340px] md:min-w-[500px]">

                {/* Title + status badge */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-[var(--dark)] leading-snug">{wo.title}</h2>
                        {wo.description && (
                            <p className="text-sm text-gray-500 mt-1">{wo.description}</p>
                        )}
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 whitespace-nowrap ${sc.bg} ${sc.text} ${sc.ring}`}>
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                            {wo.status === 'in_progress' && (
                                <span className={`absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-60 animate-ping`} />
                            )}
                            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        </span>
                        {t(`statusOptions.${wo.status}`)}
                    </span>
                </div>

                <hr className="border-gray-100" />

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {wo.property?.name && (
                        <MetaRow icon={<MdBusiness />} label={t('property')} value={wo.property.name} />
                    )}
                    <MetaRow icon={<MdWork />} label={t('priorityLabel')} value={t(`priorityOptions.${wo.priority}`)} />
                    {wo.category && (
                        <MetaRow icon={<MdWork />} label={t('categoryLabel')} value={t(`categoryOptions.${wo.category}`)} />
                    )}
                    {wo.dueDate && (
                        <MetaRow icon={<MdAccessTime />} label={t('dueDate')} value={format(new Date(wo.dueDate), 'dd MMM yyyy')} />
                    )}
                    {wo.completedDate && (
                        <MetaRow icon={<MdCheckCircle className="text-emerald-500" />} label={t('completedDate')} value={format(new Date(wo.completedDate), 'dd MMM yyyy')} />
                    )}
                    {wo.assignedTenant?.name && (
                        <MetaRow icon={<MdPerson />} label={t('tenantLabel')} value={wo.assignedTenant.name} />
                    )}
                </div>

                {/* Provider */}
                {wo.provider && (
                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <MdPerson className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">{t('provider')}</p>
                            <p className="text-sm font-semibold text-[var(--dark)]">{wo.provider.name}</p>
                            {wo.provider.averageRating != null && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Stars value={Math.round(Number(wo.provider.averageRating))} />
                                    <span className="text-xs text-gray-500">{Number(wo.provider.averageRating).toFixed(1)} {t('avgRatingLabel')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {wo.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
                        <span className="font-medium text-gray-700 block mb-1">{t('notes')}</span>
                        {wo.notes}
                    </div>
                )}

                {/* Existing tenant rating */}
                {!!wo.tenantRating && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">{t('tenantRating')}</p>
                        <Stars value={wo.tenantRating} />
                        {wo.tenantRatingComment && (
                            <p className="mt-1.5 text-sm text-gray-600 italic">"{wo.tenantRatingComment}"</p>
                        )}
                    </div>
                )}

                {/* Error from action */}
                {actionError && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{actionError}</p>
                )}

                {/* ── TENANT ACTIONS ── */}
                {isTenant && (
                    <div className="space-y-3 pt-1 border-t border-gray-100">

                        {/* Multi-choice: what happened with the provider? */}
                        {['scheduled', 'in_progress'].includes(wo.status) && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    {t('tenantOutcomeTitle')}
                                </p>

                                {/* Finished */}
                                <button
                                    onClick={() => handleStatusChange('completed')}
                                    disabled={loading}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50 text-start"
                                >
                                    <span className="text-lg">✅</span>
                                    <div>
                                        <p>{t('tenantOutcomeFinished')}</p>
                                        <p className="text-xs font-normal text-emerald-600 opacity-80">{t('tenantOutcomeFinishedDesc')}</p>
                                    </div>
                                </button>

                                {/* Working now — only makes sense when still scheduled */}
                                {wo.status === 'scheduled' && (
                                    <button
                                        onClick={() => handleStatusChange('in_progress')}
                                        disabled={loading}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-200 text-sm font-semibold hover:bg-violet-100 transition-colors disabled:opacity-50 text-start"
                                    >
                                        <span className="text-lg">🔨</span>
                                        <div>
                                            <p>{t('tenantOutcomeWorking')}</p>
                                            <p className="text-xs font-normal text-violet-600 opacity-80">{t('tenantOutcomeWorkingDesc')}</p>
                                        </div>
                                    </button>
                                )}

                                {/* No-show / left early */}
                                <button
                                    onClick={() => handleStatusChange('scheduled')}
                                    disabled={loading || wo.status === 'scheduled'}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 text-orange-700 ring-1 ring-orange-200 text-sm font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50 text-start"
                                >
                                    <span className="text-lg">⚠️</span>
                                    <div>
                                        <p>{wo.status === 'scheduled' ? t('tenantOutcomeNoShow') : t('tenantOutcomeLeftEarly')}</p>
                                        <p className="text-xs font-normal text-orange-600 opacity-80">{t('tenantOutcomeNoShowDesc')}</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Rate — only after completion, before rated */}
                        {wo.status === 'completed' && !wo.tenantRating && (
                            !showRatingForm ? (
                                <button
                                    onClick={() => setShowRatingForm(true)}
                                    className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-sm font-semibold hover:bg-amber-100 transition-colors"
                                >
                                    {t('rateWork')}
                                </button>
                            ) : (
                                <div className="space-y-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                    <div className="flex gap-1 justify-center">
                                        <Stars value={rating} interactive onSelect={setRating} />
                                    </div>
                                    <textarea
                                        value={ratingComment}
                                        onChange={e => setRatingComment(e.target.value)}
                                        placeholder={t('ratingCommentPlaceholder')}
                                        rows={2}
                                        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowRatingForm(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                                            {t('cancel')}
                                        </button>
                                        <button
                                            onClick={handleRate}
                                            disabled={loading || rating === 0}
                                            className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
                                        >
                                            {t('submitRating')}
                                        </button>
                                    </div>
                                </div>
                            )
                        )}

                        {isTerminal && (
                            <p className="text-xs text-gray-400 text-center py-1">{t('noActionsTerminal')}</p>
                        )}
                    </div>
                )}

                {/* ── ADMIN / LANDLORD ACTIONS ── */}
                {isAdminOrLandlord && (
                    <div className="space-y-3 pt-1 border-t border-gray-100">

                        {isTerminal ? (
                            <p className="text-xs text-gray-400 text-center py-1">{t('noActionsTerminal')}</p>
                        ) : (
                            <>
                                {/* Status transition buttons */}
                                {nextStatuses.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {nextStatuses.map(s => {
                                            const c = STATUS_COLORS[s];
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => handleStatusChange(s)}
                                                    disabled={loading}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ring-1 transition-all disabled:opacity-50 hover:opacity-80 ${c.bg} ${c.text} ${c.ring}`}
                                                >
                                                    <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
                                                    {t(`actions.${s}`)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Reschedule */}
                                {canReschedule && !showReschedule && (
                                    <button
                                        onClick={() => setShowReschedule(true)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100 transition-colors"
                                    >
                                        <MdCalendarMonth />
                                        {t('rescheduleBtn')}
                                    </button>
                                )}

                                {showReschedule && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                        <input
                                            type="date"
                                            value={rescheduleDate}
                                            onChange={e => setRescheduleDate(e.target.value)}
                                            className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                        <button
                                            onClick={handleReschedule}
                                            disabled={loading || !rescheduleDate}
                                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {t('confirmReschedule')}
                                        </button>
                                        <button
                                            onClick={() => setShowReschedule(false)}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
                                        >
                                            {t('cancel')}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </Popup>
    );
}

function MetaRow({ icon, label, value }: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
}) {
    return (
        <div className="flex items-start gap-2">
            <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
            <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-[var(--dark)]">
                    {value ?? <span className="text-gray-300">—</span>}
                </p>
            </div>
        </div>
    );
}
