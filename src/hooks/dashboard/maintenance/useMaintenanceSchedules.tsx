import { useSearchParams } from 'next/navigation';
import api from '@/libs/axios';
import { MaintenanceSchedule, PaginatedResponse } from '@/types/dashboard/maintenance';
import { TableRowType } from '@/types/table';

export function useMaintenanceSchedules() {
    const searchParams = useSearchParams();

    const getRows = async (signal?: AbortSignal): Promise<{
        rows: TableRowType<MaintenanceSchedule>[];
        error?: Error | null;
        totalCount?: number;
    }> => {
        try {
            const params = new URLSearchParams();
            const page = searchParams.get('page') || '1';
            const propertyId = searchParams.get('propertyId');

            params.set('page', page);
            params.set('limit', '10');
            if (propertyId) params.set('propertyId', propertyId);

            const { data } = await api.get<PaginatedResponse<MaintenanceSchedule>>(
                `/maintenance/schedules?${params.toString()}`,
                { signal },
            );

            const rows: TableRowType<MaintenanceSchedule>[] = data.data.map(s => ({
                ...s,
                key: s.id,
            }));

            return { rows, totalCount: data.total };
        } catch (err: any) {
            if (err?.name === 'CanceledError') return { rows: [] };
            return { rows: [], error: err };
        }
    };

    const createSchedule = async (payload: {
        propertyId: string;
        title: string;
        description?: string;
        startDate: string;
        endDate?: string;
        recurrenceType: string;
        recurrenceInterval?: number;
        notificationDaysBefore?: number[];
        maintenanceItemId?: string;
        providerId?: string;
    }) => {
        const { data } = await api.post('/maintenance/schedules', payload);
        return data;
    };

    const updateSchedule = async (id: string, payload: Partial<MaintenanceSchedule>) => {
        const { data } = await api.patch(`/maintenance/schedules/${id}`, payload);
        return data;
    };

    const deleteSchedule = async (id: string) => {
        await api.delete(`/maintenance/schedules/${id}`);
    };

    return { getRows, createSchedule, updateSchedule, deleteSchedule };
}
