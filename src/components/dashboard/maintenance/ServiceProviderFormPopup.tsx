'use client';

import { useState, useEffect } from 'react';
import Popup from '@/components/atoms/Popup';
import { useTranslations } from 'next-intl';
import { useServiceProviders } from '@/hooks/dashboard/maintenance/useServiceProviders';
import { ServiceProvider, ServiceCategory } from '@/types/dashboard/maintenance';

interface Props {
    show: boolean;
    provider?: ServiceProvider | null;
    onClose: () => void;
    onSuccess?: () => void;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    serviceCategory: ServiceCategory;
    description: string;
    slaHours: string;
    address: string;
}

const CATEGORIES: ServiceCategory[] = ['electrical','plumbing','hvac','carpentry','painting','cleaning','security','landscaping','general','other'];

export default function ServiceProviderFormPopup({ show, provider, onClose, onSuccess }: Props) {
    const t = useTranslations('dashboard.maintenance');
    const { createProvider, updateProvider } = useServiceProviders();
    const isEdit = !!provider;

    const [form, setForm] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        serviceCategory: 'general',
        description: '',
        slaHours: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (provider) {
            setForm({
                name: provider.name,
                email: provider.email ?? '',
                phone: provider.phone,
                serviceCategory: provider.serviceCategory,
                description: provider.description ?? '',
                slaHours: provider.slaHours?.toString() ?? '',
                address: provider.address ?? '',
            });
        } else {
            setForm({ name: '', email: '', phone: '', serviceCategory: 'general', description: '', slaHours: '', address: '' });
        }
    }, [provider, show]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone) {
            setError(t('validationRequired'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...form,
                slaHours: form.slaHours ? parseInt(form.slaHours) : undefined,
                email: form.email || undefined,
                description: form.description || undefined,
                address: form.address || undefined,
            };
            if (isEdit && provider) {
                await updateProvider(provider.id, payload);
            } else {
                await createProvider(payload);
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

    return (
        <Popup
            show={show}
            onClose={onClose}
            headerContent={isEdit ? t('editProvider') : t('addProvider')}
        >
            <form onSubmit={handleSubmit} className="space-y-4 min-w-[340px] md:min-w-[480px]">

                <div className="grid grid-cols-2 gap-3">
                    {field(t('providerName'), (
                        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} required />
                    ))}
                    {field(t('providerPhone'), (
                        <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} required />
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {field(t('providerEmail'), (
                        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
                    ))}
                    {field(t('categoryLabel'), (
                        <select value={form.serviceCategory} onChange={e => setForm(p => ({ ...p, serviceCategory: e.target.value as ServiceCategory }))} className={`${inputCls} cursor-pointer`}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{t(`categoryOptions.${c}`)}</option>)}
                        </select>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {field(t('slaHours'), (
                        <input type="number" min="1" value={form.slaHours} onChange={e => setForm(p => ({ ...p, slaHours: e.target.value }))} className={inputCls} placeholder="e.g. 24" />
                    ))}
                    {field(t('providerAddress'), (
                        <input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className={inputCls} />
                    ))}
                </div>

                {field(t('descriptionLabel'), (
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={`${inputCls} resize-none`} rows={2} />
                ))}

                {error && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        {t('cancel')}
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-[var(--secondary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                        {loading ? t('saving') : isEdit ? t('saveChanges') : t('addProvider')}
                    </button>
                </div>
            </form>
        </Popup>
    );
}
