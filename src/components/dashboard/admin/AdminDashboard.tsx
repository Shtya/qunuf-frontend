'use client';

import DashboardCard from "@/components/dashboard/DashboardCard";
import StatCard from "@/components/dashboard/StatCard";
import { BiBuildings } from "react-icons/bi";
import { IoCardOutline } from "react-icons/io5";
import { IoIosTrendingDown, IoIosTrendingUp } from "react-icons/io";
import RentedPropertyCard from "@/components/dashboard/landlord/RentedPropertyCard";
import { ReportSalesChart } from "@/components/dashboard/admin/ReportSalesChart";
import { CostBreakdownChart } from "@/components/dashboard/admin/CostBreakdownChart";
import { useTranslations } from "next-intl";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import { ErrorCard } from "@/components/atoms/ErrorCard";
import EmptyState from "@/components/atoms/EmptyState";
import { resolveUrl } from "@/utils/upload";
import Link from "next/link";
import { getTrend } from "@/utils/helpers";
import { useState } from "react";
import DateRangePicker from "@/components/molecules/forms/SelectDateRange";

export default function AdminDashboard() {
	const tStat = useTranslations('dashboard.statistics');
	const tAdmin = useTranslations('dashboard.admin.root');

	const [dateRange, setDateRange] = useState(() => {
		const now = new Date();
		return {
			startDate: new Date(now.getFullYear(), now.getMonth(), 1),
			endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
		};
	});

	const { stats, chartData, recentContracts, recentProperties, loading, error, refetch } = useDashboardStats(
		dateRange.startDate,
		dateRange.endDate,
	);

	if (error && !loading) {
		return (
			<ErrorCard
				message={error}
				onAction={refetch}
			/>
		);
	}

	const statsValue = stats || {};
	const contractsPerDay = chartData?.contractsPerDay || [];
	const statusBreakdown = chartData?.statusBreakdown || {};
	const totalContracts = chartData?.totalContracts || 0;


	function isRecent(date) {
		const propertyDate: any = new Date(date);
		const now: any = new Date();
		const diffTime = Math.abs(now - propertyDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 7;
	}
	return (
		<div className="space-y-6 h-full overflow-hidden">
			{/* Date Range Filter */}
			<div className="flex items-center justify-end">
				<DateRangePicker
					value={dateRange}
					onChange={({ startDate, endDate }) => {
						if (startDate && endDate) setDateRange({ startDate, endDate });
					}}
				/>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
				{/* Total Properties */}
				{(() => {
					const stat = statsValue.totalProperties;
					const trend = getTrend(stat?.changePercent);

					return (
						<StatCard
							icon={<BiBuildings size={26} className="text-secondary" />}
							label={tAdmin("totalProperties")}
							value={loading ? "..." : stat?.value ?? 0}
							trend={
								trend
									? trend.isUp
										? tStat("increase", { value: trend.value })
										: tStat("decrease", { value: trend.value })
									: undefined
							}
							trendColor={trend?.isUp ? "rgba(47, 107, 62, 0.1)" : "rgba(220, 38, 38, 0.1)"}
							trendIcon={
								trend ? (
									trend.isUp ? <IoIosTrendingUp size={14} /> : <IoIosTrendingDown size={14} />
								) : undefined
							}
							subtext={tStat("fromLastWeek")}
						/>
					);
				})()}

				{/* Free Properties */}
				{(() => {
					const stat = statsValue.freeProperties;
					const trend = getTrend(stat?.changePercent);

					return (
						<StatCard
							icon={<IoCardOutline size={26} className="text-primary" />}
							label={tAdmin("freeProperties")}
							value={loading ? "..." : stat?.value ?? 0}
							trend={
								trend
									? trend.isUp
										? tStat("increase", { value: trend.value })
										: tStat("decrease", { value: trend.value })
									: undefined
							}
							trendColor={trend?.isUp ? "rgba(47, 107, 62, 0.1)" : "rgba(220, 38, 38, 0.1)"}
							trendIcon={
								trend ? (
									trend.isUp ? <IoIosTrendingUp size={14} /> : <IoIosTrendingDown size={14} />
								) : undefined
							}
							subtext={tStat("fromLastWeek")}
						/>
					);
				})()}

				{/* Rented Properties */}
				{(() => {
					const stat = statsValue.rentedProperties;
					const trend = getTrend(stat?.changePercent);

					return (
						<StatCard
							icon={<IoCardOutline size={26} className="text-secondary" />}
							label={tAdmin("rentedProperties")}
							value={loading ? "..." : stat?.value ?? 0}
							trend={
								trend
									? trend.isUp
										? tStat("increase", { value: trend.value })
										: tStat("decrease", { value: trend.value })
									: undefined
							}
							trendColor={trend?.isUp ? "rgba(47, 107, 62, 0.1)" : "rgba(220, 38, 38, 0.1)"}
							trendIcon={
								trend ? (
									trend.isUp ? <IoIosTrendingUp size={14} /> : <IoIosTrendingDown size={14} />
								) : undefined
							}
							subtext={tStat("fromLastWeek")}
						/>
					);
				})()}
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
				<DashboardCard
					title={tStat('contractsCreated')}
					className="lg:col-span-2"
				>
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="relative">
								<div className="w-12 h-12 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
							</div>
						</div>
					) : (
						<ReportSalesChart data={contractsPerDay} />
					)}
				</DashboardCard>

				<DashboardCard
					title={tStat('costBreakdown')}
					className="lg:col-span-1"
				>
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="relative">
								<div className="w-12 h-12 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
							</div>
						</div>
					) : (
						<CostBreakdownChart statusBreakdown={statusBreakdown} totalContracts={totalContracts} />
					)}
				</DashboardCard>
			</div>

			{/* Last Transactions & Recent Properties */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
				{/* Last Transactions */}
				<DashboardCard
					title={tAdmin("lastTransactions")}
					className="max-h-[620px] overflow-y-auto thin-scrollbar"
				>
					{loading ? (
						<div className="flex items-center justify-center h-32">
							<div className="relative">
								<div className="w-10 h-10 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
							</div>
						</div>
					) : recentContracts.length === 0 ? (
						<EmptyState
							title={tAdmin("noContracts")}
							message={tAdmin("noContractsMessage")}
						/>
					) : (
						<div className="divide-y divide-gray/10">
							{recentContracts.map((contract) => {
								const imageSrc = contract.property?.images?.find(img => img.is_primary)?.url ||
									contract.property?.images?.[0]?.url ||
									"/images/property-placeholder.png";

								return (
									<RentedPropertyCard
										key={contract.id}
										imageSrc={resolveUrl(imageSrc)}
										address={contract.propertyName}
										date={new Date(contract.date)}
										price={contract.price}
										id={contract.property?.slug}
									/>
								);
							})}
						</div>
					)}
				</DashboardCard>

				{/* Recent Properties */}
				<DashboardCard
					title={tAdmin("recentProperties")}
					className="max-h-[620px] overflow-y-auto thin-scrollbar"
				>
					{loading ? (
						<div className="flex items-center justify-center h-32">
							<div className="relative">
								<div className="w-10 h-10 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
							</div>
						</div>
					) : recentProperties.length === 0 ? (
						<EmptyState
							title={tAdmin("noProperties")}
							message={tAdmin("noPropertiesMessage")}
						/>
					) : (
						<div className="divide-y divide-gray/5">
							{recentProperties.map((property, index) => (
								<div
									key={property.id}
									className="group/row relative transform-gpu" // Added transform-gpu for hardware acceleration
									style={{
										animationDelay: `${index * 40}ms`,
										animation: 'fadeInUp 0.4s ease-out forwards',
										opacity: 0,
										willChange: 'transform, opacity' // Prepares browser for animation
									}}
								>
									{/* 1. Hover background - Only renders fully when needed */}
									<div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/5 to-primary/5 rounded-xl opacity-0 invisible group-hover/row:opacity-100 group-hover/row:visible transition-all duration-200 pointer-events-none" />

									{/* Content Wrapper */}
									<div className="relative flex justify-between items-center gap-4 py-3 px-3 rounded-xl transition-transform duration-200 group-hover/row:translate-x-1 will-change-transform">
										<div className="flex items-center gap-4 flex-1 min-w-0">

											{/* Property Image Container */}
											<div className="relative shrink-0">
												{/* 2. OPTIMIZED GLOWS: Using 'invisible' to stop browser from calculating blurs when not hovered */}
												<div className="absolute -inset-1 bg-gradient-to-br from-secondary/40 via-primary/40 to-secondary/40 rounded-full opacity-0 invisible group-hover/row:opacity-100 group-hover/row:visible blur-lg transition-all duration-500" />
												<div className="absolute -inset-0.5 bg-gradient-to-br from-secondary/30 to-primary/30 rounded-full opacity-0 invisible group-hover/row:opacity-100 group-hover/row:visible blur-md transition-all duration-300" />

												{/* Image container */}
												<div className="relative w-[58px] h-[58px] rounded-full overflow-hidden ring-2 ring-gray/20 group-hover/row:ring-secondary group-hover/row:ring-4 transition-all duration-300 shadow-md">
													<img
														src={resolveUrl(property.imageSrc)}
														alt={property.name}
														className="w-full h-full object-cover transition-transform duration-500 group-hover/row:scale-110 group-hover/row:rotate-2"
														loading="lazy" // Added to prevent main thread blocking
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent opacity-0 invisible group-hover/row:opacity-100 group-hover/row:visible transition-opacity duration-300" />
												</div>

												{/* Status badge */}
												<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-secondary to-primary rounded-full shadow-lg flex items-center justify-center transform scale-0 group-hover/row:scale-100 transition-transform duration-300">
													<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
													</svg>
												</div>
											</div>

											{/* Property Info */}
											<div className="flex-1 min-w-0 space-y-1">
												<Link href={`/properties/${property.slug}`} className="group/link block">
													<div className="flex items-center gap-2">
														<h4 className="font-bold text-sm sm:text-base text-dark group-hover/link:text-primary transition-colors duration-200 line-clamp-1">
															{property.name}
														</h4>
														<svg className="w-4 h-4 text-secondary opacity-0 group-hover/link:opacity-100 transform -translate-x-2 group-hover/link:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
														</svg>
													</div>
												</Link>

												<div className="flex items-center gap-2">
													<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray/5 group-hover/row:bg-secondary/10 transition-colors duration-200">
														<span className="text-xs text-dark/60 font-medium">
															{new Date(property.date).toLocaleDateString()}
														</span>
													</div>
													{isRecent(property.date) && (
														<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
															NEW
														</span>
													)}
												</div>
											</div>
										</div>

										{/* View Button */}
										<Link
											href={`/properties/${property.slug}`}
											className="shrink-0 opacity-0 invisible group-hover/row:opacity-100 group-hover/row:visible transform scale-90 group-hover/row:scale-100 transition-all duration-200"
										>
											<button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-md active:scale-95">
												<span className="flex items-center gap-1.5">
													View
													<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
													</svg>
												</span>
											</button>
										</Link>
									</div>
								</div>
							))}
						</div>


					)}
				</DashboardCard>

			</div>
		</div>
	);
}