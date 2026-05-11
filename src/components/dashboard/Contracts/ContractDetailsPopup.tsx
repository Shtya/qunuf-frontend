'use client';

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import api from "@/libs/axios";
import { Contract } from "@/types/dashboard/contract";
import { TableRowType } from "@/types/table";
import { BiErrorCircle, BiCalendar, BiMapPin, BiDollar, BiFile, BiUser } from "react-icons/bi";
import { format } from "date-fns";
import { PropertyType } from "@/types/dashboard/properties";
import { cn } from "@/lib/utils";

type ContractDetailsPopupProps = {
    row: TableRowType<Contract>;
    onClose: () => void;
};

export default function ContractDetailsPopup({ row, onClose }: ContractDetailsPopupProps) {
    const tUsers = useTranslations("dashboard.users");
    const tEnums = useTranslations("property.enums");
    const t = useTranslations("dashboard.contracts");
    const [details, setDetails] = useState<Contract | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const locale = useLocale();

    useEffect(() => {
        const controller = new AbortController();
        async function fetchDetails() {
            try {
                setLoading(true);
                const res = await api.get(`/contracts/${row.id}`, { signal: controller.signal });
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
    if (error) return <ErrorMessage error={error || "Failed to load contract"} onClose={onClose} t={t} />;
    if (!details) return null;

    const property = details.propertySnapshot;
    const landlord = details.landlordSnapshot;
    const tenant = details.tenantSnapshot;

    return (
        <div className="w-[90vw] lg:w-[75vw] xl:w-[65vw]  px-2 custom-scrollbar">
            <div className="space-y-6 animate__animated animate__fadeIn">
                {/* Header */}
               {/* ── Hero header ────────────────────────────────────────────────── */}
<div
  className={cn(
    "rounded-2xl overflow-hidden",
    "shadow-[0_2px_12px_rgba(0,0,0,0.08)]" 
  )}
>
  {/* Gradient background using your brand colors */}
  <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary px-7 py-8">
    {/* Subtle circle decoration — depth without clutter */}
    <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
    <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-secondary/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />

    <div
      className={cn(
        "relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5" 
      )}
    >
      {/* Left: label + contract number */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
          {t("details.title")}
        </p>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {details.contractNumber || `#${details.id.slice(0, 8).toUpperCase()}`}
        </h2>
        {details.contractDate && (
          <p className="text-xs text-white/60">
            {format(new Date(details.contractDate), "dd MMM yyyy")}
          </p>
        )}
      </div>

      {/* Right: status pill — white bg so it pops on the dark header */}
      <div
        className={cn(
          "inline-flex items-center gap-2 self-start",
          "px-4 py-2 rounded-full border border-white/20",
          "bg-white/15 backdrop-blur-sm",
          "text-xs font-semibold text-white"
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0" )} aria-hidden="true" />
        {t(`table.statusOptions.${details.status}`)}
      </div>
    </div>
  </div>
</div>

                {/* Property Information */}
                <div className="animate__animated animate__fadeInUp animate__delay-1s">
                    <SectionHeader icon={<BiMapPin />} title={t("details.property")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                        <DetailItem label={t("details.propertyName")} value={property?.name} />
                        <DetailItem
                            label={t("details.propertyType")}
                            value={property?.type ? `${tEnums(`propertyType.${property.type}`)} - ${tEnums(`subType.${property.type === PropertyType.RESIDENTIAL ? 'residential' : 'commercial'}.${property?.subType}`)}` : undefined}
                        />
                        <DetailItem label={t("details.area")} value={property?.area ? `${property.area} m²` : undefined} />
                        <DetailItem label={t("details.location")} value={property?.stateName} />
                    </div>
                </div>

                {/* Rental Period */}
                <div className="animate__animated animate__fadeInUp animate__delay-2s">
                    <SectionHeader icon={<BiCalendar />} title={t("details.rentalPeriod")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                        <DetailItem
                            label={t("details.startDate")}
                            value={details.startDate ? format(new Date(details.startDate), 'dd/MM/yyyy') : undefined}
                        />
                        <DetailItem
                            label={t("details.endDate")}
                            value={details.endDate ? format(new Date(details.endDate), 'dd/MM/yyyy') : undefined}
                        />
                        <DetailItem label={t("details.duration")} value={`${details.durationInMonths} ${t("details.months")}`} />
                        <DetailItem
                            label={t("details.rentType")}
                            value={details.rentType ? tEnums(`rentType.${details.rentType}`) : undefined}
                        />
                    </div>
                </div>

                {/* Financial Details */}
                <div className="animate__animated animate__fadeInUp animate__delay-3s">
                    <SectionHeader icon={<BiDollar />} title={t("details.financial")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                        <DetailItem
                            label={t("details.totalAmount")}
                            value={details.totalAmount ? `${details.totalAmount.toLocaleString()} SAR` : undefined}
                        />
                        <DetailItem
                            label={t("details.securityDeposit")}
                            value={details.securityDeposit ? `${Number(details.securityDeposit).toLocaleString()} SAR` : undefined}
                        />
                        <DetailItem
                            label={t("details.platformFee")}
                            value={details.platformFeePercentage ? `${details.platformFeePercentage}% (${Number(details.platformFeeAmount).toLocaleString()} SAR)` : undefined}
                        />
                    </div>
                </div>

                {/* Parties */}
                <div className="animate__animated animate__fadeInUp animate__delay-4s">
                    <SectionHeader icon={<BiUser />} title={t("details.parties")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Landlord Card */}
                        <PartyCard
                            title={t("details.landlord")}
                            data={landlord}
                            t={t}
                            tUsers={tUsers}
                        />

                        {/* Tenant Card */}
                        <PartyCard
                            title={t("details.tenant")}
                            data={tenant}
                            t={t}
                            tUsers={tUsers}
                        />
                    </div>
                </div>

                {/* Contract Terms */}
                {details.currentTerms && (
                    <div className="animate__animated animate__fadeInUp animate__delay-5s">
                        <SectionHeader icon={<BiFile />} title={t("details.terms")} />
                        <div className="p-6 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                            <div className="max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                                <p className="text-sm text-grey-dark whitespace-pre-wrap leading-relaxed font-medium">
                                    {details.currentTerms}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contract Info */}
                <div className="animate__animated animate__fadeInUp animate__delay-6s">
                    <SectionHeader icon={<BiCalendar />} title={t("details.contractInfo")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-lighter/30 to-highlight/20 rounded-2xl border border-secondary/10">
                        <DetailItem
                            label={t("details.createdAt")}
                            value={details.created_at ? format(new Date(details.created_at), 'dd/MM/yyyy HH:mm') : undefined}
                        />
                        {details.contractDate && (
                            <DetailItem
                                label={t("details.contractDate")}
                                value={format(new Date(details.contractDate), 'dd/MM/yyyy')}
                            />
                        )}
                        {details.terminationEffectiveDate && (
                            <DetailItem
                                label={t("details.terminationDate")}
                                value={format(new Date(details.terminationEffectiveDate), 'dd/MM/yyyy')}
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

function PartyCard({ title, data, t, tUsers }: { title: string; data: any; t: any; tUsers: any }) {
    return (
        <div className={cn(
            "p-5 rounded-2xl border border-secondary/10 space-y-3",
            "bg-gradient-to-br from-lighter/40 to-highlight/30",
            "hover:shadow-lg transition-all duration-300"
        )}>
            <div className="flex items-center gap-2 pb-3 border-b border-secondary/20">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">{title}</h4>
            </div>
            <div className="space-y-2">
                <DetailItem label={t("details.name")} value={data?.name} />
                <DetailItem label={t("details.email")} value={data?.email} />
                <DetailItem label={t("details.phone")} value={data?.phoneNumber} />
                <DetailItem label={t("details.nationality")} value={data?.nationality} />
                <DetailItem
                    label={t("details.identityType")}
                    value={data?.identityType === 'other' ? data?.identityOtherType : tUsers(`details.identityTypes.${data?.identityType}`)}
                />
                <DetailItem label={t("details.identityNumber")} value={data?.identityNumber} />
                <DetailItem label={t("details.identityIssueCountry")} value={data?.identityIssueCountry} />
                <DetailItem
                    label={t("details.birthDate")}
                    value={data?.birthDate ? format(new Date(data?.birthDate), 'dd/MM/yyyy') : 'Unknown'}
                />
                <DetailItem label={t("details.shortAddress")} value={data?.shortAddress} />
            </div>
        </div>
    );
}

function DetailsSkeleton() {
    return (
        <div className="w-[90vw] lg:w-[75vw] xl:w-[65vw] space-y-6 animate-pulse">
            <div className="bg-gradient-to-br from-gray/20 to-gray/10 rounded-2xl p-6">
                <div className="space-y-3">
                    <div className="h-8 bg-gray/40 w-1/2 rounded-lg" />
                    <div className="h-6 bg-gray/30 w-32 rounded-full" />
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
    const styles: Record<string, string> = {
        'active': 'bg-gradient-to-r from-green-100 to-green-200 text-green-700',
        'pending_landlord_acceptance': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700',
        'pending_tenant_acceptance': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700',
        'pending_signature': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700',
        'cancelled': 'bg-gradient-to-r from-red-100 to-red-200 text-red-700',
        'terminated': 'bg-gradient-to-r from-red-100 to-red-200 text-red-700',
        'pending_termination': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700',
    };
    return styles[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700';
}