import { DashboardPathKey, getDashboardHref } from "@/utils/dashboardPaths";
import { useAuth } from "@/contexts/AuthContext";

export function useDashboardHref() {
    const { role } = useAuth();

    const getHref = (
        key: DashboardPathKey,
        query?: Record<string, string | number | boolean>
    ): string => {
        return getDashboardHref(key, query);
    };

    return { getHref, role };
}
