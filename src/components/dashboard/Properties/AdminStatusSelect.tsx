import api from '@/libs/axios';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-hot-toast'; // or your toast library

export default function AdminStatusSelect({ id, currentStatus, setRows }: {
    id: string;
    currentStatus: string;
    setRows?: any;
}) {
    const t = useTranslations('dashboard.properties');
    const [status, setStatus] = useState(currentStatus);

    const handleChange = async (newStatus: string) => {
        const toastId = toast.loading(t('updatingStatus'));
        const oldStatus = status;
        setStatus(newStatus); // Optimistic UI update

        try {
            await api.patch(`/properties/${id}/status`, { status: newStatus });

            // Update local table state
            setRows?.((prev: any) =>
                prev.map((row: any) => row.id === id ? { ...row, status: newStatus } : row)
            );

            toast.success(t('statusUpdated'), { id: toastId });
        } catch (error) {
            setStatus(oldStatus); // Revert on error
            toast.error(t('statusUpdateError'), { id: toastId });
        }
    };

    return (
        <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            className="text-xs font-medium rounded-md border-gray-200 bg-white py-1 px-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
        >
            <option value="active">{t('statusOptions.active')}</option>
            <option value="pending">{t('statusOptions.pending')}</option>
            <option value="rejected">{t('statusOptions.rejected')}</option>
            <option value="archived">{t('statusOptions.archived')}</option>
        </select>
    );
}