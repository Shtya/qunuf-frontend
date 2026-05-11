'use client';

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import api from "@/libs/axios";
import { User } from "@/types/dashboard/user";
import { TableRowType } from "@/types/table";
import Image from "next/image";
import { BiErrorCircle, BiUser, BiEnvelope, BiPhone, BiCalendar, BiMapPin, BiIdCard } from "react-icons/bi";
import { resolveUrl } from "@/utils/upload";
import Link from "next/link";
import { getDashboardHref } from "@/utils/dashboardPaths";
import { cn } from "@/lib/utils";

type UserDetailsPopupProps = {
    row: TableRowType<User>;
    onClose: () => void;
};

export default function UserDetailsPopup({ row, onClose }: UserDetailsPopupProps) {
    const t = useTranslations("dashboard.users");
    const [details, setDetails] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const locale = useLocale();

    useEffect(() => {
        const controller = new AbortController();
        async function fetchDetails() {
            try {
                setLoading(true);
                const res = await api.get(`/users/${row.id}/full-details`, { signal: controller.signal });
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
    if (error) return <ErrorMessage error={error || "Failed to load user"} onClose={onClose} t={t} />;
    if (!details) return null;

    return (
        <div className="w-[90vw] lg:w-[70vw] xl:w-[60vw] px-2 custom-scrollbar">
            <div className="space-y-6 animate__animated animate__fadeIn">
                {/* Header Card */}
                <div className={cn(
                    "relative overflow-hidden",
                    "bg-gradient-to-br from-primary via-primary/90 to-secondary",
                    "rounded-2xl p-6 shadow-lg border-2 border-secondary/10"
                )}>
                    {/* Decorative blob */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Image */}
                        {details.imagePath && (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary rounded-2xl opacity-50 group-hover:opacity-100 blur transition-opacity duration-300" />
                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-dashboard-bg ring-4 ring-white">
                                    <Image src={resolveUrl(details.imagePath)} alt={details.name} fill className="object-cover" />
                                </div>
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 space-y-3">
                            <Link
                                href={getDashboardHref('chats', { user: details.id })}
                                className="group inline-block"
                            >
                                <h2 className="text-3xl font-bold text-white group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                                    {details.name}
                                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </h2>
                            </Link>

                            <div className="flex flex-wrap gap-2">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold shadow-md",
                                    "transition-transform duration-200 hover:scale-105",
                                    getStatusStyle(details.status)
                                )}>
                                    {t(`statusOptions.${details.status}`)}
                                </span>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold uppercase",
                                    "bg-gradient-to-r from-secondary to-primary text-white shadow-md",
                                    "transition-transform duration-200 hover:scale-105"
                                )}>
                                    {t(`roleOptions.${details.role}`)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Info Section */}
                <div className="animate__animated animate__fadeInUp animate__delay-1s">
                    <SectionHeader icon={<BiUser />} title={t("details.basicInfo")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                        <IconDetailItem icon={<BiEnvelope />} label={t("details.email")} value={details.email} />
                        {details.pendingEmail && (
                            <IconDetailItem
                                icon={<BiEnvelope className="text-orange-500" />}
                                label={t("details.pendingEmail")}
                                value={details.pendingEmail}
                                highlight
                            />
                        )}
                        <IconDetailItem icon={<BiPhone />} label={t("details.phoneNumber")} value={details.phoneNumber || t("details.notProvided")} />
                        <IconDetailItem
                            icon={<BiCalendar />}
                            label={t("details.birthDate")}
                            value={details.birthDate ? new Date(details.birthDate).toLocaleDateString() : t("details.notProvided")}
                        />
                        {details.lastLogin && (
                            <IconDetailItem
                                icon={<BiCalendar />}
                                label={t("details.lastLogin")}
                                value={new Date(details.lastLogin).toLocaleString()}
                            />
                        )}
                        {!details.lastLogin && (
                            <IconDetailItem
                                icon={<BiCalendar />}
                                label={t("details.lastLogin")}
                                value={t("details.never")}
                            />
                        )}
                    </div>
                </div>

                {/* Identity Section */}
                <div className="animate__animated animate__fadeInUp animate__delay-2s">
                    <SectionHeader icon={<BiIdCard />} title={t("details.identity")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                        {details.nationality && (
                            <DetailItem
                                label={t("details.nationality")}
                                value={locale === "ar" ? details.nationality.name_ar : details.nationality.name}
                            />
                        )}
                        <DetailItem
                            label={t("details.identityType")}
                            value={details.identityType ? t(`details.identityTypes.${details.identityType}`) : t("details.notProvided")}
                        />
                        <DetailItem
                            label={t("details.identityNumber")}
                            value={details.identityNumber || t("details.notProvided")}
                        />
                        {details.identityIssueCountry && (
                            <DetailItem
                                label={t("details.identityIssueCountry")}
                                value={locale === "ar" ? details.identityIssueCountry.name_ar : details.identityIssueCountry.name}
                            />
                        )}
                        {details.identityType === 'other' && details.identityOtherType && (
                            <DetailItem
                                label={t("details.identityOtherType")}
                                value={details.identityOtherType}
                            />
                        )}
                    </div>
                </div>

                {/* Address Section */}
                {details.shortAddress && (
                    <div className="animate__animated animate__fadeInUp animate__delay-3s">
                        <SectionHeader icon={<BiMapPin />} title={t("details.address")} />
                        <div className="p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                            <DetailItem label={t("details.shortAddress")} value={details.shortAddress} />
                        </div>
                    </div>
                )}

                {/* Account Info Section */}
                <div className="animate__animated animate__fadeInUp animate__delay-4s">
                    <SectionHeader icon={<BiUser />} title={t("details.accountInfo")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                        <DetailItem
                            label={t("details.createdAt")}
                            value={new Date(details.created_at).toLocaleString()}
                        />
                        {details.updated_at && (
                            <DetailItem
                                label={t("details.updatedAt")}
                                value={new Date(details.updated_at).toLocaleString()}
                            />
                        )}
                        <DetailItem
                            label={t("details.notificationsEnabled")}
                            value={details.notificationsEnabled ? t("details.yes") : t("details.no")}
                        />
                        {details.notificationUnreadCount !== undefined && (
                            <DetailItem
                                label={t("details.unreadNotifications")}
                                value={details.notificationUnreadCount.toString()}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Helper Components */

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white shadow-lg">
                <span className="text-xl">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-dark">{title}</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-secondary/30 to-transparent" />
        </div>
    );
}

function DetailsSkeleton() {
    return (
        <div className="w-[90vw] lg:w-[70vw] xl:w-[60vw] space-y-6 animate-pulse">
            <div className="bg-gradient-to-br from-gray/20 to-gray/10 rounded-2xl p-6 shadow-lg">
                <div className="flex gap-6">
                    <div className="w-32 h-32 bg-gray/40 rounded-2xl" />
                    <div className="flex-1 space-y-3 py-2">
                        <div className="h-8 bg-gray/40 w-1/2 rounded-lg" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray/40 w-24 rounded-full" />
                            <div className="h-6 bg-gray/40 w-20 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
            {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                    <div className="h-6 bg-gray/30 w-40 rounded-lg" />
                    <div className="grid grid-cols-2 gap-4 p-5 bg-gray/10 rounded-2xl">
                        {[1, 2, 3, 4].map(j => (
                            <div key={j} className="h-16 bg-gray/30 rounded-xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
    if (value === undefined || value === null || value === "") return null;
    return (
        <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">{label}</p>
            <p className="text-sm text-dark font-semibold">{value}</p>
        </div>
    );
}

function IconDetailItem({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value?: any; highlight?: boolean }) {
    if (!value) return null;
    return (
        <div className={cn(
            "flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300",
            "hover:shadow-md hover:-translate-y-1",
            highlight ? "bg-orange-50 border border-orange-200" : "bg-white/50 border border-secondary/10"
        )}>
            <span className={cn(
                "text-2xl mb-2 p-2 rounded-lg",
                highlight ? "text-orange-500 bg-orange-100" : "text-secondary bg-secondary/10"
            )}>
                {icon}
            </span>
            <p className="text-[10px] font-bold text-grey-dark uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-bold text-dark">{value}</p>
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

function getStatusStyle(status: string) {
    switch (status) {
        case 'active': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700';
        case 'inactive': return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700';
        case 'pending_verification': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700';
        case 'suspended': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700';
        case 'deleted': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700';
        default: return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700';
    }
}