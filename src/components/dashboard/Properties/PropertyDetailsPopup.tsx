'use client';

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import api from "@/libs/axios";
import { Property, PropertyStatus, PropertyType } from "@/types/dashboard/properties";
import { TableRowType } from "@/types/table";
import Image from "next/image";
import { BiArea, BiMoney, BiDetail, BiBuildingHouse, BiMap, BiFile, BiWrench, BiErrorCircle, BiGroup, BiCalendar, BiKey } from "react-icons/bi";
import { resolveUrl } from "@/utils/upload";
import { cn } from "@/lib/utils";

type PropertyDetailsPopupProps = {
    row: TableRowType<Property>;
    onClose: () => void;
};

export default function PropertyDetailsPopup({ row, onClose }: PropertyDetailsPopupProps) {
    const tEnums = useTranslations("property.enums");
    const t = useTranslations("dashboard.properties");
    const [details, setDetails] = useState<Property | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const locale = useLocale();

    useEffect(() => {
        const controller = new AbortController();
        async function fetchDetails() {
            try {
                setLoading(true);
                const res = await api.get(`/properties/${row.id}/full-details`, { signal: controller.signal });
                setDetails(res.data);
            } catch (err: any) {
                if (err?.name === "CanceledError") return;
                setError(err?.response?.data?.message || t("details.error"));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        fetchDetails();
        return () => controller.abort();
    }, [row.id, t]);

    if (loading) return <DetailsSkeleton />;
    if (error) return <ErrorMessage error={error || "Failed to load property"} onClose={onClose} t={t} />;
    if (!details) return null;

    const primaryImage = details.images?.find(img => img.is_primary)?.url || details.images?.[0]?.url;

    return (
        <div className="w-[90vw] lg:w-[75vw] xl:w-[65vw] px-2 custom-scrollbar">
            <div className="space-y-6 animate__animated animate__fadeIn">
                {/* Header Card */}
                <div className={cn(
                    "relative overflow-hidden",
                    "bg-gradient-to-br from-primary via-primary/90 to-secondary",
                    "rounded-2xl p-6 shadow-lg border-2 border-secondary/10"
                )}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row gap-6 items-start">
                        {/* Image */}
                        {primaryImage && (
                            <div className="relative group w-full md:w-56">
                                <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary rounded-2xl opacity-50 group-hover:opacity-100 blur transition-opacity duration-300" />
                                <div className="relative w-full h-40 md:h-32 rounded-2xl overflow-hidden bg-dashboard-bg ring-4 ring-white">
                                    <Image src={resolveUrl(primaryImage)} alt={details.name} fill className="object-cover" />
                                </div>
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 space-y-1">
                            <h2 className="text-3xl font-bold text-white">{details.name}</h2>
                            <p className="text-sm text-white/80 leading-relaxed">{details.description}</p>
                            {details.additionalDetails && (
                                <p className="text-sm text-white/60 leading-relaxed  ">
                                    {details.additionalDetails}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold shadow-md",
                                    "transition-transform duration-200 hover:scale-105",
                                    getStatusStyle(details.status)
                                )}>
                                    {t(`statusOptions.${details.status}`)}
                                </span>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold",
                                    "bg-gradient-to-r from-secondary to-primary text-white shadow-md",
                                    "transition-transform duration-200 hover:scale-105"
                                )}>
                                    {tEnums(`propertyType.${details.propertyType}`)} -
                                    {details.propertyType === PropertyType.COMMERCIAL
                                        ? tEnums(`subType.commercial.${details.subType}`)
                                        : tEnums(`subType.residential.${details.subType}`)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial & Basic Info */}
                <div className="animate__animated animate__fadeInUp animate__delay-1s">
                    <SectionHeader icon={<BiMoney />} title={t("details.financials")} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                        <IconDetailItem icon={<BiMoney />} label={t("details.price")} value={`${details.rentPrice?.toLocaleString()} / ${t(`details.${details.rentType}`)}`} />
                        <IconDetailItem icon={<BiArea />} label={t("details.area")} value={`${details.area} m²`} />
                        <IconDetailItem icon={<BiMoney className="text-orange-500" />} label={t("details.securityDeposit")} value={details.securityDeposit} />
                        <IconDetailItem icon={<BiBuildingHouse />} label={t("details.isFurnished")} value={details.isFurnished ? t("details.yes") : t("details.no")} />
                        <IconDetailItem
                            icon={<BiKey />}
                            label={t("details.isRented")}
                            value={details.isRented ? t("details.yes") : t("details.no")}
                        />
                        {details.capacity && (
                            <IconDetailItem icon={<BiGroup />} label={t("details.capacity")} value={details.capacity} />
                        )}
                        {details.constructionDate && (
                            <IconDetailItem
                                icon={<BiCalendar />}
                                label={t("details.constructionDate")}
                                value={new Date(details.constructionDate).toLocaleDateString()}
                            />
                        )}
                        {details.state && (
                            <IconDetailItem
                                icon={<BiMap />}
                                label={t("details.state")}
                                value={locale === "ar" ? details.state.name_ar : details.state.name}
                            />
                        )}
                    </div>
                </div>

                {/* Facilities */}
                {details.facilities && (
                    <div className="animate__animated animate__fadeInUp animate__delay-2s">
                        <SectionHeader icon={<BiDetail />} title={t("details.facilities")} />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                            {Object.entries(details.facilities).map(([key, val]) => (
                                <DetailItem
                                    key={key}
                                    label={t(`details.facilityKeys.${key}`)}
                                    value={typeof val === 'boolean' ? (val ? t("details.yes") : t("details.no")) : val}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Infrastructure Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInUp animate__delay-3s">
                    {/* Utility Meters */}
                    <div className="space-y-4">
                        <SectionHeader icon={<BiWrench />} title={t("details.utilityMeters")} compact />
                        <div className={cn(
                            "p-5 rounded-2xl border border-secondary/10 min-h-[200px] flex flex-col",
                            "bg-gradient-to-br from-blue-50/30 to-highlight/20"
                        )}>
                            {(!details.electricityMeterNumber &&
                                !details.waterMeterNumber &&
                                !details.gasMeterNumber) ? (
                                <EmptyState message={t("details.noDataFound")} />
                            ) : (
                                <div className="space-y-3">
                                    <DetailItem label={t("details.electricityMeter")} value={details.electricityMeterNumber} />
                                    <DetailItem label={t("details.waterMeter")} value={details.waterMeterNumber} />
                                    <DetailItem label={t("details.gasMeter")} value={details.gasMeterNumber} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                        <SectionHeader icon={<BiFile />} title={t("details.documents")} compact />
                        <div className={cn(
                            "p-5 rounded-2xl border border-secondary/10 min-h-[200px] flex flex-col",
                            "bg-gradient-to-br from-lighter/30 to-highlight/20"
                        )}>
                            {(!details.documentNumber &&
                                !details.ownerIdNumber &&
                                !details.ownershipType &&
                                !details.documentType &&
                                !details.documentIssueDate &&
                                !details.issuedBy &&
                                !details.insurancePolicyNumber) ? (
                                <EmptyState message={t("details.noDataFound")} />
                            ) : (
                                <div className="space-y-3">
                                    <DetailItem label={t("details.documentNumber")} value={details.documentNumber} />
                                    <DetailItem label={t("details.ownerId")} value={details.ownerIdNumber} />
                                    <DetailItem label={t("details.insurancePolicy")} value={details.insurancePolicyNumber} />
                                    <DetailItem label={t("details.ownershipType")} value={details.ownershipType} />
                                    <DetailItem label={t("details.documentType")} value={details.documentType} />
                                    <DetailItem
                                        label={t("details.documentIssueDate")}
                                        value={details.documentIssueDate ? new Date(details.documentIssueDate).toLocaleDateString() : undefined}
                                    />
                                    <DetailItem label={t("details.issuedBy")} value={details.issuedBy} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Nearby Amenities */}
                {(details.educationInstitutions?.length || details.healthMedicalFacilities?.length) && (
                    <div className="animate__animated animate__fadeInUp animate__delay-4s">
                        <SectionHeader icon={<BiMap />} title={t("details.nearby")} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <NearbyList title={t("details.education")} items={details.educationInstitutions} />
                            <NearbyList title={t("details.health")} items={details.healthMedicalFacilities} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* Helper Components */
function SectionHeader({ icon, title, compact }: { icon: React.ReactNode; title: string; compact?: boolean }) {
    return (
        <div className={cn("flex items-center gap-3", compact ? "mb-2" : "mb-4")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white shadow-lg">
                <span className="text-xl">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-dark">{title}</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-secondary/30 to-transparent" />
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            </div>
            <p className="text-sm text-placeholder font-medium">{message}</p>
        </div>
    );
}

function DetailsSkeleton() {
    return (
        <div className="w-[90vw] lg:w-[75vw] xl:w-[65vw] space-y-6 animate-pulse">
            <div className="bg-gradient-to-br from-gray/20 to-gray/10 rounded-2xl p-6">
                <div className="flex gap-6">
                    <div className="w-56 h-32 bg-gray/40 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                        <div className="h-8 bg-gray/40 w-2/3 rounded-lg" />
                        <div className="h-4 bg-gray/30 w-full rounded" />
                        <div className="h-4 bg-gray/30 w-3/4 rounded" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray/40 w-24 rounded-full" />
                            <div className="h-6 bg-gray/40 w-32 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
            {[1, 2].map(i => (
                <div key={i} className="space-y-4">
                    <div className="h-6 bg-gray/30 w-40 rounded-lg" />
                    <div className="grid grid-cols-4 gap-4 p-5 bg-gray/10 rounded-2xl">
                        {[1, 2, 3, 4].map(j => (
                            <div key={j} className="h-20 bg-gray/30 rounded-xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value?: string | number | null | boolean }) {
    if (value === undefined || value === null || value === "") return null;
    return (
        <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">{label}</p>
            <p className="text-sm text-dark font-semibold">{String(value)}</p>
        </div>
    );
}

function IconDetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: any }) {
    if (!value) return null;
    return (
        <div className={cn(
            "flex flex-col items-center text-center p-4 rounded-xl",
            "bg-white/50 border border-secondary/10",
            "transition-all duration-300 hover:shadow-md hover:-translate-y-1"
        )}>
            <span className="text-2xl mb-2 p-2 rounded-lg text-secondary bg-secondary/10">{icon}</span>
            <p className="text-[10px] font-bold text-grey-dark uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-bold text-dark">{value}</p>
        </div>
    );
}

function NearbyList({ title, items }: { title: string; items: any[] | null }) {
    if (!items?.length) return null;
    return (
        <div className="p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
            <p className="text-sm font-bold mb-4 text-secondary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                {title}
            </p>
            <ul className="space-y-2">
                {items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-white/50 transition-colors">
                        <span className="font-medium text-dark">{item.name}</span>
                        <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                            {item.distance_km} km
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ErrorMessage({ error, onClose, t }: { error: string; onClose: () => void; t: (key: string) => string }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center p-8 space-y-6",
            "bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200 rounded-2xl",
            "animate__animated animate__shakeX shadow-xl"
        )}>
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                <BiErrorCircle className="text-4xl text-white" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-red-900">{t("details.errorTitle")}</h3>
                <p className="text-sm text-red-700 font-medium max-w-md">{error}</p>
            </div>
            <button
                onClick={onClose}
                className={cn(
                    "px-8 py-3 rounded-xl font-bold text-white",
                    "bg-gradient-to-r from-red-600 to-red-700",
                    "hover:from-red-700 hover:to-red-800",
                    "shadow-lg hover:shadow-xl",
                    "transition-all duration-300 hover:scale-105"
                )}
            >
                {t("details.close")}
            </button>
        </div>
    );
}

function getStatusStyle(status: PropertyStatus) {
    switch (status) {
        case 'active': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700';
        case 'pending': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700';
        case 'rejected': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700';
        case 'archived': return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700';
        default: return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700';
    }
}