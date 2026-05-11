'use client'
import { useTranslations } from "next-intl"
import { LineChart } from "./LineChart"

import { useMemo } from "react";
import EmptyState from "@/components/atoms/EmptyState";

interface RentedAnalyticsChartProps {
    data?: number[]
}

export default function RentedAnalyticsChart({ data }: RentedAnalyticsChartProps) {
    const tdash = useTranslations('dashboard.statistics');
    const tComman = useTranslations('comman');

    // Get months array directly
    const months = tComman.raw('months') as string[];
    const hasData = useMemo(() => data.some((val) => val > 0), [data]);
    if (!hasData) {
        return (

            <EmptyState
                title={tdash('noChartData')}
            />
        );
    }
    return (
        <LineChart
            labels={months}
            data={data ?? []}
            label={tdash('rentedProperties')}
            lineColor="#2F6B3E" // darker green line
            curves={false}
            bgGradient={{
                from: 'rgba(164, 200, 174, 0.2)', // very light fill
                to: 'rgba(164, 200, 174, 0.9)'    // slightly stronger fill
            }}
        />
    );
}