import api from "@/libs/axios";
import { useCallback, useEffect, useState } from "react";

interface stat {
    value: number;
    changePercent: number;
}

interface DashboardStats {
    totalProperties?: stat;
    freeProperties?: stat;
    rentedProperties?: stat;
    totalReviews?: stat;
    activeContracts?: stat;
    totalPendingRenewRequests?: stat;
    totalAmountWithEjar?: stat;
}

interface ChartData {
    contractsPerDay?: number[];
    statusBreakdown?: Record<string, number>;
    totalContracts?: number;
    rentedAnalytics?: number[];
}

interface RecentContract {
    id: string;
    propertyName: string;
    propertyId: string;
    date: string | Date;
    status: string;
    price: number;
    property?: {
        id: string;
        slug: string;
        images?: Array<{ url: string; is_primary: boolean }>;
    };
    review: {
        id: string;
        rate: number;
        comment?: string | null;
    } | null;
}

interface RecentProperty {
    id: string;
    name: string;
    slug: string;
    imageSrc: string;
    address: string;
    date: string;
    rating: number;
}

export function useDashboardStats(startDate?: Date, endDate?: Date) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);
    const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const startIso = startDate?.toISOString();
    const endIso = endDate?.toISOString();

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: Record<string, string> = {};
            if (startIso) params.startDate = startIso;
            if (endIso) params.endDate = endIso;

            const [statsRes, chartRes, contractsRes, propertiesRes] = await Promise.all([
                api.get('/contracts/dashboard/stats', { params }),
                api.get('/contracts/dashboard/chart-data', { params }),
                api.get('/contracts/dashboard/recent', { params }),
                api.get('/properties/dashboard/recent', { params }),
            ]);

            setStats(statsRes.data);
            setChartData(chartRes.data);
            setRecentContracts(contractsRes.data || []);
            setRecentProperties(propertiesRes.data || []);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [startIso, endIso]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        stats,
        chartData,
        recentContracts,
        recentProperties,
        loading,
        error,
        refetch: fetchDashboardData,
    };
}
