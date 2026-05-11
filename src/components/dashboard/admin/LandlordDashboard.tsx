'use client';

import DashboardCard from "@/components/dashboard/DashboardCard";
import StatCard from "@/components/dashboard/StatCard";
import { BiBuildings } from "react-icons/bi";
import { IoIosTrendingDown, IoIosTrendingUp } from "react-icons/io";
import { IoCardOutline } from "react-icons/io5";
import PropertyCard from "./PropertCard";
import RentedAnalyticsChart from "@/components/molecules/charts/RentedAnalytics";
import { useTranslations } from "next-intl";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import EmptyState from "@/components/atoms/EmptyState";
import { ErrorCard } from "@/components/atoms/ErrorCard";
import { resolveUrl } from "@/utils/upload";
import { getTrend } from "@/utils/helpers";
import { useState } from "react";
import DateRangePicker from "@/components/molecules/forms/SelectDateRange";

export default function LandlordDashboard() {
    const tStat = useTranslations('dashboard.statistics');
    const tLandlord = useTranslations('dashboard.landlord.root');

    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        return {
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
        };
    });

    const { stats, chartData, recentContracts, loading, error, refetch } = useDashboardStats(
        dateRange.startDate,
        dateRange.endDate,
    );

    if (error && !loading) {
        return <ErrorCard message={error} onAction={refetch} />;
    }

    const statsValue = stats || {};
    const analyticsData = chartData?.rentedAnalytics && chartData.rentedAnalytics.length === 12
        ? chartData.rentedAnalytics
        : Array(12).fill(0);

    return (
        <div className="space-y-4 h-full">
            {/* Date Range Filter */}
            <div className="flex items-center justify-end">
                <DateRangePicker
                    value={dateRange}
                    onChange={({ startDate, endDate }) => {
                        if (startDate && endDate) setDateRange({ startDate, endDate });
                    }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                {/* Total Properties */}
                {(() => {
                    const stat = statsValue.totalProperties;
                    const trend = getTrend(stat?.changePercent);

                    return (
                        <StatCard
                            icon={<BiBuildings size={26} className="text-secondary w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />}
                            label={tLandlord('totalProperties')}
                            value={loading ? '...' : stat?.value ?? 0}
                            trend={
                                trend
                                    ? trend.isUp
                                        ? tStat('increase', { value: trend.value })
                                        : tStat('decrease', { value: trend.value })
                                    : undefined
                            }
                            trendIcon={
                                trend
                                    ? trend.isUp
                                        ? <IoIosTrendingUp size={14} />
                                        : <IoIosTrendingDown size={14} />
                                    : undefined
                            }
                            trendColor={trend?.isUp ? 'rgba(76,108,90,0.1)' : 'rgba(220,38,38,0.1)'}
                            subtext={tStat('fromLastWeek')}
                        />
                    );
                })()}

                {/* Total Reviews */}
                {(() => {
                    const stat = statsValue.totalReviews;
                    const trend = getTrend(stat?.changePercent);

                    return (
                        <StatCard
                            icon={<BiBuildings size={26} className="text-secondary w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />}
                            label={tLandlord('totalReviews')}
                            value={loading ? '...' : stat?.value ?? 0}
                            trend={
                                trend
                                    ? trend.isUp
                                        ? tStat('increase', { value: trend.value })
                                        : tStat('decrease', { value: trend.value })
                                    : undefined
                            }
                            trendIcon={
                                trend
                                    ? trend.isUp
                                        ? <IoIosTrendingUp size={14} />
                                        : <IoIosTrendingDown size={14} />
                                    : undefined
                            }
                            trendColor={trend?.isUp ? 'rgba(76,108,90,0.1)' : 'rgba(220,38,38,0.1)'}
                            subtext={tStat('fromLastWeek')}
                        />
                    );
                })()}

                {/* Free Properties */}
                {(() => {
                    const stat = statsValue.freeProperties;
                    const trend = getTrend(stat?.changePercent);

                    return (
                        <StatCard
                            icon={<IoCardOutline size={26} className="text-secondary w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />}
                            label={tLandlord('freeProperties')}
                            value={loading ? '...' : stat?.value ?? 0}
                            trend={
                                trend
                                    ? trend.isUp
                                        ? tStat('increase', { value: trend.value })
                                        : tStat('decrease', { value: trend.value })
                                    : undefined
                            }
                            trendIcon={
                                trend
                                    ? trend.isUp
                                        ? <IoIosTrendingUp size={14} />
                                        : <IoIosTrendingDown size={14} />
                                    : undefined
                            }
                            trendColor={trend?.isUp ? 'rgba(76,108,90,0.1)' : 'rgba(220,38,38,0.1)'}
                            subtext={tStat('fromLastWeek')}
                        />
                    );
                })()}

                {/* Rented Properties */}
                {(() => {
                    const stat = statsValue.rentedProperties;
                    const trend = getTrend(stat?.changePercent);

                    return (
                        <StatCard
                            icon={<IoCardOutline size={26} className="text-secondary w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />}
                            label={tLandlord('rentedProperties')}
                            value={loading ? '...' : stat?.value ?? 0}
                            trend={
                                trend
                                    ? trend.isUp
                                        ? tStat('increase', { value: trend.value })
                                        : tStat('decrease', { value: trend.value })
                                    : undefined
                            }
                            trendIcon={
                                trend
                                    ? trend.isUp
                                        ? <IoIosTrendingUp size={14} />
                                        : <IoIosTrendingDown size={14} />
                                    : undefined
                            }
                            trendColor={trend?.isUp ? 'rgba(76,108,90,0.1)' : 'rgba(220,38,38,0.1)'}
                            subtext={tStat('fromLastWeek')}
                        />
                    );
                })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DashboardCard
                    title={tStat('rentedAnalytics')}
                    className="flex flex-col justify-between "
                >
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                        </div>
                    ) : (
                        <RentedAnalyticsChart data={analyticsData} />
                    )}
                </DashboardCard>
                <DashboardCard
                    title={tLandlord('lastRentedProperties')}
                    className="max-h-[620px] overflow-y-auto thin-scrollbar"
                >
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                        </div>
                    ) : recentContracts.length === 0 ? (
                        <EmptyState
                            title={tLandlord('noContracts')}
                            message={tLandlord('noContractsMessage')}
                        />
                    ) : (
                        <div className="divide-y divide-gray-300">
                            {recentContracts.map((contract, index) => {
                                const imageSrc = contract.property?.images?.find(img => img.is_primary)?.url
                                    || contract.property?.images?.[0]?.url
                                    || "/images/property-placeholder.png";
                                return (
                                    <PropertyCard
                                        key={index}
                                        imageSrc={resolveUrl(imageSrc)}
                                        address={contract.propertyName}
                                        date={new Date(contract.date)}
                                        rating={contract.review ? contract.review.rate : undefined}
                                        id={contract.property?.slug}
                                    />
                                );
                            })}
                        </div>
                    )}
                </DashboardCard>
            </div>
        </div>
    );
}