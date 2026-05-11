import { User } from "@/types/dashboard/user";
import { UserStatus } from "@/types/global";
import { TableColumnType } from "@/types/table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import AdminUserStatusSelect from "@/components/dashboard/Users/AdminUserStatusSelect";
import Image from "next/image";
import { resolveUrl } from "@/utils/upload";

export const UserColumns = (t: ReturnType<typeof useTranslations>, role: string): TableColumnType<User>[] => [
    {
        key: 'name',
        label: t('table.columns.name'),
        cell(value, row) {
            const user = row as User;
            return (
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                            src={user.imagePath ? resolveUrl(user.imagePath) : '/users/default-user.png'}
                            alt={user.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="font-medium text-dark">{user.name}</span>
                </div>
            );
        },
    },
    {
        key: 'email',
        label: t('table.columns.email'),
        cell: (value) => <span className="text-gray-700">{value as string}</span>,
    },
    {
        key: 'role',
        label: t('table.columns.role'),
        cell: (value) => {
            const role = value as string;
            const roleMap: Record<string, { bg: string; text: string }> = {
                admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
                landlord: { bg: 'bg-blue-100', text: 'text-blue-700' },
                tenant: { bg: 'bg-green-100', text: 'text-green-700' },
            };
            const r = roleMap[role] ?? roleMap.tenant;
            return (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${r.bg} ${r.text}`}>
                    {t(`roleOptions.${role}`)}
                </span>
            );
        }
    },
    {
        key: 'status',
        label: t('table.columns.status'),
        cell(value, row, setRows) {
            const status = value as string;
            const user = row as User;

            // If the user in the row is admin, show status badge only (admin status can't be updated)
            if (user.role === 'admin') {
                const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
                    active: { bg: 'bg-[#ECFDF3]', text: 'text-[#027A48]', dot: 'bg-[#027A48]' },
                    inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-600' },
                    pending_verification: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', dot: 'bg-[#92400E]' },
                    suspended: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', dot: 'bg-[#B91C1C]' },
                    deleted: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-700' },
                };

                const s = statusMap[status] ?? statusMap.pending_verification;

                return (
                    <div className={`${s.bg} ${s.text} flex items-center gap-1.5 rounded-full w-fit px-3 py-0.5 text-xs font-medium border-[1px] border-current/10`}>
                        <div className={`w-1.5 h-1.5 ${s.dot} rounded-full animate-pulse`} />
                        <span>{t(`statusOptions.${status}`)}</span>
                    </div>
                );
            }

            // If logged-in user is admin, show the Select component for non-admin users
            if (role === 'admin') {
                return (
                    <AdminUserStatusSelect
                        id={row.id}
                        currentStatus={status}
                        setRows={setRows}
                    />
                );
            }

            // Show status badge for non-admin logged-in users
            const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
                active: { bg: 'bg-[#ECFDF3]', text: 'text-[#027A48]', dot: 'bg-[#027A48]' },
                inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-600' },
                pending_verification: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', dot: 'bg-[#92400E]' },
                suspended: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', dot: 'bg-[#B91C1C]' },
                deleted: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-700' },
            };

            const s = statusMap[status] ?? statusMap.pending_verification;

            return (
                <div className={`${s.bg} ${s.text} flex items-center gap-1.5 rounded-full w-fit px-3 py-0.5 text-xs font-medium border-[1px] border-current/10`}>
                    <div className={`w-1.5 h-1.5 ${s.dot} rounded-full animate-pulse`} />
                    <span>{t(`statusOptions.${status}`)}</span>
                </div>
            );
        },
    },
    {
        key: 'lastLogin',
        label: t('table.columns.lastLogin'),
        cell: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : t('table.columns.never'),
    },
    {
        key: 'created_at',
        label: t('table.columns.createdAt'),
        cell: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : "—",
    },
];
