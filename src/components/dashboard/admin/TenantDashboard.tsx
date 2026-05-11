'use client';

import DashboardCard from "@/components/dashboard/DashboardCard";
import StatCard, { StatSkeleton } from "@/components/dashboard/StatCard";
import EmptyState from "@/components/atoms/EmptyState";
import { ErrorCard } from "@/components/atoms/ErrorCard";
import RentedPropertyCard from "@/components/dashboard/landlord/RentedPropertyCard";

import { BiBuildings } from "react-icons/bi";
import { IoIosTrendingDown, IoIosTrendingUp } from "react-icons/io";
import { IoCardOutline } from "react-icons/io5";

import { useTranslations } from "next-intl";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import { resolveUrl } from "@/utils/upload";
import { getTrend } from "@/utils/helpers";
import { useState } from "react";
import DateRangePicker from "@/components/molecules/forms/SelectDateRange";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StatValue {
    value?: number;
    changePercent?: number;
}

interface TrendResult {
    isUp: boolean;
    value: number;
} 

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives the shared `trend`, `trendIcon`, and `trendColor` props
 * for a StatCard from a raw stat object. Centralises the repeated
 * ternary chains that were littered across the original render.
 */
function buildTrendProps(
    trend: TrendResult | null | undefined,
    tStat: ReturnType<typeof useTranslations>
) {
    if (!trend) return {};

    return {
        trend: trend.isUp
            ? tStat("increase", { value: trend.value })
            : tStat("decrease", { value: trend.value }),
        trendIcon: trend.isUp
            ? <IoIosTrendingUp size={14} />
            : <IoIosTrendingDown size={14} />,
        trendColor: trend.isUp
            ? "rgba(76,108,90,0.1)"
            : "rgba(220,38,38,0.1)",
    };
}

/**
 * Picks the primary (or first) image from a contract's property images,
 * with a fallback to the placeholder.
 */
function resolvePropertyImage(
    images?: Array<{ url: string; is_primary?: boolean }>
): string {
    const url =
        images?.find((img) => img.is_primary)?.url ??
        images?.[0]?.url ??
        "/images/property-placeholder.png";
    return resolveUrl(url);
}

 
function ContractListSkeleton() {
    return (
        <div className="flex flex-col divide-y divide-gray/10">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 px-3 py-3.5 flex-row rtl:flex-row-reverse"
                >
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gray/15 animate-pulse shrink-0" />
                    {/* Text lines */}
                    <div className="flex-1 flex flex-col gap-2 items-start rtl:items-end">
                        <div className="h-4 w-2/5 rounded bg-gray/15 animate-pulse" />
                        <div className="h-3 w-1/3 rounded bg-gray/10 animate-pulse" />
                    </div>
                    {/* Price badge */}
                    <div className="h-9 w-24 rounded-xl bg-gray/15 animate-pulse shrink-0" />
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function TenantDashboard() {
    const tStat   = useTranslations("dashboard.statistics");
    const tTenant = useTranslations("dashboard.tenant.root");

    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        return {
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
        };
    });

    const { stats, recentContracts, loading, error, refetch } = useDashboardStats(
        dateRange.startDate,
        dateRange.endDate,
    );

    // ── Error state ────────────────────────────────────────────────────────
    if (error && !loading) {
        return <ErrorCard message={error} onAction={refetch} />;
    }

    const s = stats ?? {};

    // ── Stat rows ──────────────────────────────────────────────────────────
    const statItems: Array<{
        key: string;
        icon: React.ReactNode;
        label: string;
        stat: StatValue | undefined;
        formatValue?: (v: number) => string;
    }> = [
        {
            key: "activeContracts",
            icon: (
                <BiBuildings
                    className="text-secondary w-[22px] h-[22px] md:w-[26px] md:h-[26px]"
                />
            ),
            label: tTenant("reservedProperty"),
            stat: s.activeContracts,
        },
        {
            key: "pendingRenewRequests",
            icon: <BiBuildings size={26} className="text-secondary" />,
            label: tTenant("pendingRenewRequests"),
            stat: s.totalPendingRenewRequests,
        },
        {
            key: "totalEjarAmount",
            icon: <IoCardOutline size={26} className="text-secondary" />,
            label: tTenant("totalEjarAmount"),
            stat: s.totalAmountWithEjar,
            formatValue: (v) =>
                new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "SAR",
                }).format(v),
        },
    ];

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">

            {/* Date Range Filter */}
            <div className="flex items-center justify-end">
                <DateRangePicker
                    value={dateRange}
                    onChange={({ startDate, endDate }) => {
                        if (startDate && endDate) setDateRange({ startDate, endDate });
                    }}
                />
            </div>

            {/* ── Stat cards row ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading
                    ? statItems.map((item) => <StatSkeleton key={item.key} />)
                    : statItems.map((item) => {
                        const trend = getTrend(item.stat?.changePercent);
                        const rawValue = item.stat?.value ?? 0;
                        const displayValue = item.formatValue
                            ? item.formatValue(rawValue)
                            : rawValue;

                        return (
                            <StatCard
                                key={item.key}
                                icon={item.icon}
                                label={item.label}
                                value={displayValue}
                                subtext={tStat("fromLastWeek")}
                                {...buildTrendProps(trend, tStat)}
                            />
                        );
                    })}
            </div>

            {/* ── Recent contracts card ───────────────────────────────────── */}
            <DashboardCard
                title={tTenant("lastRentedProperties")}
                className="max-h-[620px]"
            >
                {loading ? (
                    <ContractListSkeleton />
                ) : recentContracts.length === 0 ? (
                    <EmptyState
                        title={tTenant("noContracts")}
                        message={tTenant("noContractsMessage")}
                    />
                ) : (
                    <div className="divide-y divide-gray/10">
                        {recentContracts.map((contract) => (
                            <RentedPropertyCard
                                key={contract.id}
                                imageSrc={resolvePropertyImage(contract.property?.images)}
                                address={contract.propertyName}
                                date={new Date(contract.date)}
                                price={contract.price}
                                id={contract.property?.slug}
                            />
                        ))}
                    </div>
                )}
            </DashboardCard>

        </div>
    );
}