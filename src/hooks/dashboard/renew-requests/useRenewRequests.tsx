import api from "@/libs/axios";
import { CustomPaginatedResponse } from "@/types/dashboard/pagination";
import { RenewRequest } from "@/types/dashboard/renew-request";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useRenewRequests() {
    const searchParams = useSearchParams();
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "15";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sort");

    const fetchRequests = useCallback(
        async (signal?: AbortSignal): Promise<{
            requests: RenewRequest[];
            error?: Error | null;
            totalCount?: number;
        }> => {
            try {
                const params = new URLSearchParams();
                params.append("page", page);
                params.append("limit", limit);

                if (status && status !== "all") params.append("status", status);
                if (sortBy) params.append("sortBy", sortBy);

                const res = await api.get<CustomPaginatedResponse<RenewRequest>>(
                    `/contracts/renews/my-offers?${params.toString()}`,
                    { signal }
                );

                const { records, pagination } = res.data;

                return {
                    requests: records,
                    totalCount: pagination.total,
                    error: null,
                };
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.name === "AbortError") {
                    return { requests: [], totalCount: 0, error: null };
                }

                return {
                    requests: [],
                    totalCount: 0,
                    error: err?.response?.data?.message || "Failed to load renew requests",
                };
            }
        },
        [page, limit, status, sortBy]
    );

    return { fetchRequests };
}
