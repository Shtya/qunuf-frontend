'use client'
import { DoughnutChart } from "@/components/molecules/charts/DoughnutChart";
import { useTranslations } from "next-intl"
import { ContractStatus } from "@/types/dashboard/contract";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/atoms/EmptyState";

interface CostBreakdownChartProps {
    statusBreakdown?: Record<string, number>;
    totalContracts?: number;
}

export function CostBreakdownChart({ statusBreakdown = {}, totalContracts = 0 }: CostBreakdownChartProps) {
    const tdash = useTranslations('dashboard.statistics');
    const t = useTranslations('dashboard.contracts.table.statusOptions');

    // Map contract statuses to labels
    const statusLabels: Record<string, string> = {
        [ContractStatus.PENDING_LANDLORD_ACCEPTANCE]: t('pending_landlord_acceptance'),
        [ContractStatus.PENDING_TENANT_ACCEPTANCE]: t('pending_tenant_acceptance'),
        [ContractStatus.PENDING_SIGNATURE]: t('pending_signature'),
        [ContractStatus.ACTIVE]: t('active'),
        [ContractStatus.TERMINATED]: t('terminated'),
        [ContractStatus.CANCELLED]: t('cancelled'),
        [ContractStatus.EXPIRED]: t('expired'),
    };

    // Extract statuses that have counts
    const { statuses, labels, data } = useMemo(() => {
        const statuses = Object.keys(statusLabels).filter(status => (statusBreakdown[status] || 0) > 0);
        const labels = statuses.map(status => statusLabels[status]);
        const data = statuses.map(status => statusBreakdown[status] || 0);

        return { statuses, labels, data };
    }, [statusLabels, statusBreakdown]);

    const hasData = useMemo(() => data.some((val) => val > 0), [data]);

    // Get CSS variable colors
    const [primaryColor, setPrimaryColor] = useState<string>('#2F6B3E');
    const [secondaryColor, setSecondaryColor] = useState<string>('#D4AF37');

    useEffect(() => {
        const primary = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary')
            .trim();
        const secondary = getComputedStyle(document.documentElement)
            .getPropertyValue('--secondary')
            .trim();

        if (primary) setPrimaryColor(primary);
        if (secondary) setSecondaryColor(secondary);
    }, []);

    if (!hasData) {
        return (
            <div className="flex items-center justify-center min-h-[300px] p-8">
                <EmptyState
                    title={tdash('noChartData')}
                    message={tdash('noChartDataMessage')}
                />
            </div>
        );
    }

    // Enhanced color palette using primary and secondary colors with variations
    const colors = [
        primaryColor,           // Primary
        secondaryColor,         // Secondary
        '#A4C8AE',             // Light green
        '#E5D6B8',             // Light gold
        '#C1D8DA',             // Light blue
        '#B8BED5',             // Light purple
        '#D4A5A5',             // Light red
    ];

    return (
        <div className="relative">
            {/* Gradient background overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl pointer-events-none" />

            {/* Chart container */}
            <div className="relative p-4">
                <DoughnutChart
                    centerText={totalContracts.toString()}
                    labels={labels}
                    data={data}
                    colors={colors.slice(0, labels.length)}
                />
            </div>

            {/* Legend */}
            <div className="relative mt-4 px-4 pb-2">
                <div className="flex flex-wrap gap-2 justify-center">
                    {labels.map((label, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray/10 shadow-sm"
                        >
                            <div
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: colors[index] }}
                            />
                            <span className="text-xs font-medium text-dark/80">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}