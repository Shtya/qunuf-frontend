'use client';

import { useState, useEffect } from 'react';
import Popup from '@/components/atoms/Popup';
import { useTranslations } from 'next-intl';
import { useWorkOrders } from '@/hooks/dashboard/maintenance/useWorkOrders';
import { useServiceProviders } from '@/hooks/dashboard/maintenance/useServiceProviders';
import { ServiceProvider, WorkOrder } from '@/types/dashboard/maintenance';
import api from '@/libs/axios';

interface Property { id: string; name: string }

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    workOrder?: WorkOrder | null;
}

const CATEGORIES = ['electrical','plumbing','hvac','carpentry','painting','cleaning','security','landscaping','general','other'];
const PRIORITIES = ['low','medium','high','critical'];
const RECURRENCE_TYPES = ['daily','weekly','monthly','annually'];

const EMPTY_FORM = {
    propertyId: '',
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: '',
    providerId: '',
    isRecurring: false,
    recurrenceType: 'weekly',
    recurrenceInterval: '1',
    recurrenceEndDate: '',
};

export default function CreateWorkOrderPopup({ show, onClose, onSuccess, workOrder }: Props) {
    const t = useTranslations('dashboard.maintenance');
    const { createWorkOrder, updateWorkOrder } = useWorkOrders();
    const { listAll } = useServiceProviders();
    const isEdit = !!workOrder;

    const [properties, setProperties] = useState<Property[]>([]);
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (!show) return;
        if (!isEdit) {
            api.get('/properties/all', { params: { limit: 200 } })
                .then(r => setProperties(r.data?.records ?? []));
        }
        listAll().then(setProviders);
    }, [show]);

    useEffect(() => {
        if (workOrder) {
            setForm({
                propertyId: workOrder.propertyId ?? '',
                title: workOrder.title ?? '',
                description: workOrder.description ?? '',
                priority: workOrder.priority ?? 'medium',
                category: workOrder.category ?? '',
                dueDate: workOrder.dueDate ? workOrder.dueDate.slice(0, 10) : '',
                providerId: workOrder.providerId ?? '',
                isRecurring: false,
                recurrenceType: 'weekly',
                recurrenceInterval: '1',
                recurrenceEndDate: '',
            });
            setError('');
        } else {
            setForm(EMPTY_FORM);
            setError('');
        }
    }, [workOrder, show]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || (!isEdit && !form.propertyId)) {
            setError(t('validationRequired'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (isEdit && workOrder) {
                await updateWorkOrder(workOrder.id, {
                    title: form.title,
                    description: form.description || undefined,
                    priority: form.priority,
                    category: form.category || undefined,
                    dueDate: form.dueDate || undefined,
                    providerId: form.providerId || undefined,
                });
            } else {
                await createWorkOrder({
                    propertyId: form.propertyId,
                    title: form.title,
                    description: form.description || undefined,
                    priority: form.priority,
                    category: form.category || undefined,
                    dueDate: form.dueDate || undefined,
                    providerId: form.providerId || undefined,
                    isRecurring: form.isRecurring,
                    recurrenceType: form.isRecurring ? form.recurrenceType : undefined,
                    recurrenceInterval: form.isRecurring ? parseInt(form.recurrenceInterval) || 1 : undefined,
                    recurrenceEndDate: form.isRecurring && form.recurrenceEndDate ? form.recurrenceEndDate : undefined,
                });
            }
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? t('genericError'));
        } finally {
            setLoading(false);
        }
    };

    const field = (label: string, children: React.ReactNode) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
            {children}
        </div>
    );

    const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] bg-white';
    const selectCls = `${inputCls} cursor-pointer`;

    return (
        <Popup show={show} onClose={onClose} headerContent={isEdit ? t('editWorkOrder') : t('createWorkOrder')}>
            <form onSubmit={handleSubmit} className="space-y-4 min-w-[340px] md:min-w-[500px]">

                {/* Property selector — create mode only */}
                {!isEdit && field(t('propertyLabel'), (
                    <select value={form.propertyId} onChange={e => setForm(p => ({ ...p, propertyId: e.target.value }))} className={selectCls} required>
                        <option value="">{t('selectProperty')}</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                ))}

                {field(t('titleLabel'), (
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        className={inputCls}
                        placeholder={t('titlePlaceholder')}
                        required
                    />
                ))}

                {field(t('descriptionLabel'), (
                    <textarea
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        className={`${inputCls} resize-none`}
                        rows={2}
                        placeholder={t('descriptionPlaceholder')}
                    />
                ))}

                <div className="grid grid-cols-2 gap-3">
                    {field(t('priorityLabel'), (
                        <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className={selectCls}>
                            {PRIORITIES.map(pr => <option key={pr} value={pr}>{t(`priorityOptions.${pr}`)}</option>)}
                        </select>
                    ))}
                    {field(t('categoryLabel'), (
                        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={selectCls}>
                            <option value="">{t('selectCategory')}</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{t(`categoryOptions.${c}`)}</option>)}
                        </select>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {field(t('dueDateLabel'), (
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                            className={inputCls}
                        />
                    ))}
                    {field(t('providerLabel'), (
                        <select value={form.providerId} onChange={e => setForm(p => ({ ...p, providerId: e.target.value }))} className={selectCls}>
                            <option value="">{t('noProvider')}</option>
                            {providers.map(pv => <option key={pv.id} value={pv.id}>{pv.name}</option>)}
                        </select>
                    ))}
                </div>

                {/* Recurrence — create mode only */}
                {!isEdit && (
                    <>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="isRecurring"
                                checked={form.isRecurring}
                                onChange={e => setForm(p => ({ ...p, isRecurring: e.target.checked }))}
                                className="w-4 h-4 accent-[var(--secondary)] cursor-pointer"
                            />
                            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                {t('recurringLabel')}
                            </label>
                        </div>

                        {form.isRecurring && (
                            <div className="space-y-3 border border-amber-200 bg-amber-50 rounded-lg p-3">
                                <div className="grid grid-cols-2 gap-3">
                                    {field(t('recurrenceTypeLabel'), (
                                        <select
                                            value={form.recurrenceType}
                                            onChange={e => setForm(p => ({ ...p, recurrenceType: e.target.value }))}
                                            className={selectCls}
                                        >
                                            {RECURRENCE_TYPES.map(r => (
                                                <option key={r} value={r}>{t(`recurrenceOptions.${r}`)}</option>
                                            ))}
                                        </select>
                                    ))}
                                    {field(t('recurrenceIntervalLabel'), (
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.recurrenceInterval}
                                            onChange={e => setForm(p => ({ ...p, recurrenceInterval: e.target.value }))}
                                            className={inputCls}
                                            placeholder="1"
                                        />
                                    ))}
                                </div>
                                {field(t('recurrenceEndDateLabel'), (
                                    <input
                                        type="date"
                                        value={form.recurrenceEndDate}
                                        onChange={e => setForm(p => ({ ...p, recurrenceEndDate: e.target.value }))}
                                        className={inputCls}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {error && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg bg-[var(--secondary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading
                            ? (isEdit ? t('saving') : t('creating'))
                            : (isEdit ? t('saveChanges') : t('create'))
                        }
                    </button>
                </div>
            </form>
        </Popup>
    );
}
