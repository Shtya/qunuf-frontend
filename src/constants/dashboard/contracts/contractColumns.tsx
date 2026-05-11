import { PropertyCell } from "@/components/molecules/properties/PropertyCell";
import { UserCell } from "@/components/molecules/properties/UserCell";
import { UserRole } from "@/constants/user";
import { Contract, ContractStatus } from "@/types/dashboard/contract";
import { TableColumnType } from "@/types/table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { LucideExternalLink, LucideFileText } from "lucide-react";
import { resolveUrl } from "@/utils/upload";

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
    ContractStatus,
    { bg: string; text: string; ring: string; dot: string }
> = {
    draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-500',
        ring: 'ring-gray-200',
        dot: 'bg-gray-400',
    },
    pending_tenant_acceptance: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        ring: 'ring-amber-200',
        dot: 'bg-amber-500',
    },
    pending_landlord_acceptance: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        ring: 'ring-blue-200',
        dot: 'bg-blue-500',
    },
    pending_signature: {
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        ring: 'ring-violet-200',
        dot: 'bg-violet-500',
    },
    active: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        ring: 'ring-emerald-200',
        dot: 'bg-emerald-500',
    },
    expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-500',
        ring: 'ring-gray-200',
        dot: 'bg-gray-400',
    },
    cancelled: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        ring: 'ring-red-200',
        dot: 'bg-red-500',
    },
    terminated: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        ring: 'ring-red-200',
        dot: 'bg-red-500',
    },
    pending_termination: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        ring: 'ring-orange-200',
        dot: 'bg-orange-500',
    },
};

// ─── Columns ───────────────────────────────────────────────────────────────────

export const ContractColumns = (
    t: ReturnType<typeof useTranslations>,
    role: UserRole
): TableColumnType<Contract>[] => [
    {
        key: 'propertySnapshot',
        label: t('columns.property'),
        cell(value, row) {
            return <PropertyCell property={{ ...row.property, name: value.name }} />;
        },
        sortKey: 'propertyName',
    },

    {
        key: 'status',
        label: t('columns.status'),
        cell(value) {
            const status = value as ContractStatus;
            const s = STATUS_MAP[status] ?? STATUS_MAP.draft;
            return (
                <span
                    className={`
                        inline-flex items-center gap-1.5
                        ${s.bg} ${s.text}
                        ring-1 ${s.ring}
                        rounded-full px-2.5 py-0.5
                        text-xs font-medium
                        whitespace-nowrap
                    `}
                >
                    {/* Pulsing dot for active, static for others */}
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                        {status === 'active' && (
                            <span
                                className={`absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-60 animate-ping`}
                            />
                        )}
                        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    </span>
                    {t(`statusOptions.${status}`)}
                </span>
            );
        },
    },

    {
        key: 'contractNumber',
        label: t('columns.contractNumber'),
        cell: (value) =>
            value ? (
                <span className="font-mono text-xs tracking-wide text-[var(--dark)] bg-[var(--lighter)] px-2 py-0.5 rounded-md border border-[var(--gray)]">
                    {value as string}
                </span>
            ) : (
                <span className="text-gray-300 select-none">—</span>
            ),
    },

    {
        key: 'tenantSnapshot',
        label: t('columns.tenant'),
        cell(value, row: Contract) {
            return <UserCell user={{ ...row.tenant, name: value.name }} role={role as UserRole} />;
        },
        sortKey: 'tenantName',
    },

    {
        key: 'landlordSnapshot',
        label: t('columns.landlord'),
        cell(value, row: Contract) {
            return <UserCell user={{ ...row.landlord, name: value.name }} role={role as UserRole} />;
        },
        sortKey: 'landlordName',
    },

    {
        key: 'startDate',
        label: t('columns.startDate'),
        cell: (value) =>
            value ? (
                <span className="text-sm text-[var(--dark)]">
                    {format(new Date(value as string), 'dd/MM/yyyy')}
                </span>
            ) : (
                <span className="text-gray-300 select-none">—</span>
            ),
    },

    {
        key: 'endDate',
        label: t('columns.endDate'),
        cell: (value) =>
            value ? (
                <span className="text-sm text-[var(--dark)]">
                    {format(new Date(value as string), 'dd/MM/yyyy')}
                </span>
            ) : (
                <span className="text-gray-300 select-none">—</span>
            ),
    },

    {
        key: 'totalAmount',
        label: t('columns.totalAmount'),
        cell: (value) => {
            const amount = value as number;
            return (
                <span className="font-number font-semibold text-sm text-[var(--dark)] tabular-nums">
                    {amount.toLocaleString()}
                    <span className="text-[var(--secondary)] font-normal text-xs ms-1">SAR</span>
                </span>
            );
        },
    },

    {
        key: 'created_at',
        label: t('columns.createdAt'),
        cell: (value) =>
            value ? (
                <span className="text-sm text-[var(--dark)]">
                    {format(new Date(value as string), 'dd/MM/yyyy')}
                </span>
            ) : (
                <span className="text-gray-300 select-none">—</span>
            ),
    },

    {
        key: 'ejarPdfPath',
        label: t('columns.contract'),
        cell(_value, row: Contract) {
            return <ContractViewButton contract={row} t={t} />;
        },
    },
];

// ─── ContractViewButton ────────────────────────────────────────────────────────

function ContractViewButton({
    contract,
    t,
}: {
    contract: Contract;
    t: ReturnType<typeof useTranslations>;
}) {
    const hasPdf = !!contract.ejarPdfPath;

    if (!hasPdf) {
        return (
            <span
                className="
                    inline-flex items-center gap-1.5
                    px-2.5 py-1 rounded-lg
                    text-xs font-medium
                    text-gray-400 bg-gray-50
                    ring-1 ring-gray-200
                    cursor-not-allowed select-none
                "
            >
                <LucideFileText size={12} className="shrink-0" />
                {t('viewContract')}
            </span>
        );
    }

    return (
        <a
            href={resolveUrl(contract.ejarPdfPath!)}
            target="_blank"
            rel="noopener noreferrer"
            className="
                inline-flex items-center gap-1.5
                px-2.5 py-1 rounded-lg
                text-xs font-medium
                text-[var(--secondary)] bg-[var(--lighter)]
                ring-1 ring-[var(--light)]
                transition-all duration-150
                hover:bg-[var(--light)]/40 hover:text-[var(--primary)]
                hover:ring-[var(--secondary)]
                active:scale-95
            "
        >
            <LucideFileText size={12} className="shrink-0" />
            {t('viewContract')}
            <LucideExternalLink size={10} className="shrink-0 opacity-60" />
        </a>
    );
}