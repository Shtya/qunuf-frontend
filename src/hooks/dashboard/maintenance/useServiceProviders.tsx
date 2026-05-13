import { useSearchParams } from 'next/navigation';
import api from '@/libs/axios';
import { ServiceProvider, ProviderStatus, PaginatedResponse } from '@/types/dashboard/maintenance';
import { TableRowType } from '@/types/table';

export function useServiceProviders() {
    const searchParams = useSearchParams();

    const getRows = async (signal?: AbortSignal): Promise<{
        rows: TableRowType<ServiceProvider>[];
        error?: Error | null;
        totalCount?: number;
    }> => {
        try {
            const params = new URLSearchParams();
            const page = searchParams.get('page') || '1';
            const status = searchParams.get('status');
            const search = searchParams.get('search');

            params.set('page', page);
            params.set('limit', '10');
            if (status && status !== 'all') params.set('status', status);
            if (search) params.set('search', search);

            const { data } = await api.get<PaginatedResponse<ServiceProvider>>(
                `/maintenance/providers?${params.toString()}`,
                { signal },
            );

            const rows: TableRowType<ServiceProvider>[] = data.data.map(p => ({
                ...p,
                key: p.id,
            }));

            return { rows, totalCount: data.total };
        } catch (err: any) {
            if (err?.name === 'CanceledError') return { rows: [] };
            return { rows: [], error: err };
        }
    };

    const createProvider = async (payload: {
        name: string;
        email?: string;
        phone: string;
        serviceCategory: string;
        description?: string;
        slaHours?: number;
        address?: string;
    }) => {
        const { data } = await api.post('/maintenance/providers', payload);
        return data;
    };

    const updateProvider = async (id: string, payload: Partial<ServiceProvider>) => {
        const { data } = await api.patch(`/maintenance/providers/${id}`, payload);
        return data;
    };

    const deleteProvider = async (id: string) => {
        await api.delete(`/maintenance/providers/${id}`);
    };

    const listAll = async (): Promise<ServiceProvider[]> => {
        const { data } = await api.get<PaginatedResponse<ServiceProvider>>(
            '/maintenance/providers?limit=200&status=active',
        );
        return data.data;
    };

    return { getRows, createProvider, updateProvider, deleteProvider, listAll };
}
