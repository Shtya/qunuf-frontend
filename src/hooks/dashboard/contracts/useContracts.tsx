import api from "@/libs/axios";
import { CustomPaginatedResponse } from "@/types/dashboard/pagination";
import { Contract } from "@/types/dashboard/contract";
import { TableRowType } from "@/types/table";
import { triggerFileDownload } from "@/utils/validation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useContracts() {
    const searchParams = useSearchParams();
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort");
    const sortOrder = searchParams.get("dir");

    const getRows = useCallback(
        async (signal?: AbortSignal): Promise<{
            rows: TableRowType<Contract>[];
            error?: Error | null;
            totalCount?: number;
        }> => {
            try {
                const params = new URLSearchParams();
                params.append("page", page);
                params.append("limit", limit);

                if (status && status !== "all") params.append("status", status);
                if (search) params.append("search", search);
                if (sortBy) params.append("sortBy", sortBy);
                if (sortOrder) params.append("sortOrder", sortOrder);

                const res = await api.get<CustomPaginatedResponse<Contract>>(
                    `/contracts?${params.toString()}`,
                    { signal }
                );

                const { records, pagination } = res.data;

                return {
                    rows: records,
                    totalCount: pagination.total,
                    error: null,
                };
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.name === "AbortError") {
                    return { rows: [], totalCount: 0, error: null };
                }

                return {
                    rows: [],
                    totalCount: 0,
                    error: err?.response?.data?.message || "Failed to load contracts",
                };
            }
        },
        [page, limit, status, search, sortBy, sortOrder]
    );

    const exportRows = useCallback(async (limit: number) => {
        try {
            const params = new URLSearchParams();

            params.append("limit", limit.toString());

            if (status && status !== "all") params.append("status", status);
            if (search) params.append("search", search);
            if (sortBy) params.append("sortBy", sortBy);
            if (sortOrder) params.append("sortOrder", sortOrder);

            const response = await api.get(`/contracts/export?${params.toString()}`, {
                responseType: 'blob',
            });

            triggerFileDownload(response, `contracts_export_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error("Export failed", error);
        }
    }, [status, search, sortBy, sortOrder]);

    return { getRows, exportRows };
}

