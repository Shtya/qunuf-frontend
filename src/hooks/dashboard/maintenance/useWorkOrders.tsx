import { useSearchParams } from 'next/navigation';
import api from '@/libs/axios';
import { WorkOrder, WorkOrderStatus, PaginatedResponse } from '@/types/dashboard/maintenance';
import { TableRowType } from '@/types/table';

export function useWorkOrders() {
    const searchParams = useSearchParams();

    const getRows = async (signal?: AbortSignal): Promise<{
        rows: TableRowType<WorkOrder>[];
        error?: Error | null;
        totalCount?: number;
    }> => {
        try {
            const params = new URLSearchParams();
            const page = searchParams.get('page') || '1';
            const status = searchParams.get('status');
            const propertyId = searchParams.get('propertyId');
            const search = searchParams.get('search');

            params.set('page', page);
            params.set('limit', '10');
            if (status && status !== 'all') params.set('status', status);
            if (propertyId) params.set('propertyId', propertyId);

            const { data } = await api.get<PaginatedResponse<WorkOrder>>(
                `/maintenance/work-orders?${params.toString()}`,
                { signal },
            );

            const rows: TableRowType<WorkOrder>[] = data.data.map(wo => ({
                ...wo,
                key: wo.id,
            }));

            return { rows, totalCount: data.total };
        } catch (err: any) {
            if (err?.name === 'CanceledError') return { rows: [] };
            return { rows: [], error: err };
        }
    };

    const updateStatus = async (id: string, status: WorkOrderStatus, notes?: string, providerId?: string) => {
        const { data } = await api.patch(`/maintenance/work-orders/${id}/status`, {
            status,
            notes,
            providerId,
        });
        return data;
    };

    const createWorkOrder = async (payload: {
        propertyId: string;
        title: string;
        description?: string;
        priority: string;
        category?: string;
        dueDate?: string;
        providerId?: string;
        assignedTenantId?: string;
        isRecurring?: boolean;
        recurrenceType?: string;
        recurrenceInterval?: number;
        recurrenceEndDate?: string;
    }) => {
        const { data } = await api.post('/maintenance/work-orders', payload);
        return data;
    };

    const updateWorkOrder = async (id: string, payload: {
        title?: string;
        description?: string;
        priority?: string;
        category?: string;
        dueDate?: string;
        providerId?: string;
        notes?: string;
    }) => {
        const { data } = await api.patch(`/maintenance/work-orders/${id}`, payload);
        return data;
    };

    const deleteWorkOrder = async (id: string) => {
        await api.delete(`/maintenance/work-orders/${id}`);
    };

    const approveAccess = async (id: string) => {
        const { data } = await api.patch(`/maintenance/work-orders/${id}/approve-access`);
        return data;
    };

    const rateWorkOrder = async (id: string, rating: number, comment?: string) => {
        const { data } = await api.patch(`/maintenance/work-orders/${id}/rate`, { rating, comment });
        return data;
    };

    return { getRows, updateStatus, createWorkOrder, updateWorkOrder, deleteWorkOrder, approveAccess, rateWorkOrder };
}
