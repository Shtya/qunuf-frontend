import api from "@/libs/axios";
import { CustomPaginatedResponse } from "@/types/dashboard/pagination";
import { Property } from "@/types/dashboard/properties";
import { TableRowType } from "@/types/table";
import { triggerFileDownload } from "@/utils/validation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";


export function useProperties() {
    const searchParams = useSearchParams();
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status");
    const propertyType = searchParams.get("propertyType");
    const isRented = searchParams.get("isRented");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort");
    const sortOrder = searchParams.get("dir");


    const getRows = useCallback(
        async (signal?: AbortSignal): Promise<{
            rows: TableRowType<Property>[];
            error?: Error | null;
            totalCount?: number;
        }> => {
            try {

                const params = new URLSearchParams();
                params.append("page", page);
                params.append("limit", limit);

                if (status && status !== "all") params.append("status", status);
                if (propertyType && propertyType !== "all") params.append("propertyType", propertyType);
                if (isRented && isRented !== "all") {
                    params.append("isRented", isRented === "true" ? "true" : "false");
                }

                if (search) params.append("search", search);
                if (sortBy) params.append("sortBy", sortBy);
                if (sortOrder) params.append("sortOrder", sortOrder);

                const res = await api.get<CustomPaginatedResponse<Property>>(
                    `/properties/all?${params.toString()}`,
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
                    error: err?.response?.data?.message || "Failed to load properties",
                };
            }
        },
        [page, limit, status, propertyType, isRented, search, sortBy, sortOrder] // يعيد تكوين الدالة عند تغير أي فلتر في الرابط
    );

    const exportRows = useCallback(async (limit: number) => {
        try {

            const params = new URLSearchParams();

            params.append("limit", limit.toString());

            if (status && status !== "all") params.append("status", status);
            if (propertyType && propertyType !== "all") params.append("propertyType", propertyType);
            if (isRented && isRented !== "all") {
                params.append("isRented", isRented === "true" ? "true" : "false");
            }
            if (search) params.append("search", search);
            if (sortBy) params.append("sortBy", sortBy);
            if (sortOrder) params.append("sortOrder", sortOrder);

            const response = await api.get(`/properties/export?${params.toString()}`, {
                responseType: 'blob', // Important: Treat response as a binary file
            });

            // 4. Extract Filename from Headers
            triggerFileDownload(response, `properties_export_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error("Export failed", error);
            // Optional: toast.error("Export failed");
        }
    }, [limit, status, propertyType, isRented, search, sortBy, sortOrder]);

    return { getRows, exportRows };
}