'use client'
import { BarChart } from "@/components/molecules/charts/BarChart";
import EmptyState from "@/components/atoms/EmptyState";
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"

interface ReportSalesChartProps {
    data?: number[];
}

export function ReportSalesChart({ data = [] }: ReportSalesChartProps) {
    const tStat = useTranslations('dashboard.statistics');
    const tComman = useTranslations('comman');

    const labels = tComman.raw('weekdays') as string[];
    const chartData = useMemo(
        () => (data.length === 7 ? data : Array(7).fill(0)),
        [data]
    );

    const hasData = useMemo(() => chartData.some((val) => val > 0), [chartData]);

    const [resolvedColor, setResolvedColor] = useState<string>('#2F6B3E'); // fallback

    useEffect(() => {
        const cssVar = getComputedStyle(document.documentElement)
            .getPropertyValue('--secondary')
            .trim();
        if (cssVar) setResolvedColor(cssVar);
    }, []);

    if (!hasData) {
        return (
            <div className="flex items-center justify-center min-h-[300px] p-8">
                <EmptyState
                    title={tStat('noChartData')}
                    message={tStat('noChartDataMessage')}
                />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Gradient background overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 rounded-xl pointer-events-none" />

            {/* Chart container */}
            <div className="relative p-4">
                <BarChart
                    labels={labels}
                    label={tStat('contractsCreated')}
                    usePattern
                    patternSpacing={30}
                    patternStroke="#FFFFFF4D"
                    data={chartData}
                    barColors={Array(labels.length).fill(resolvedColor)}
                />
            </div>
        </div>
    );
}