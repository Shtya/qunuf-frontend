'use client';

import { User } from "@/types/dashboard/user";
import { useTranslations } from 'next-intl';
import { getDashboardHref } from '@/utils/dashboardPaths';
import { UserColumns } from '@/constants/users/constant';
import DataView from "@/components/molecules/DateViewTable/DataView";
import { MenuActionItem } from "@/components/molecules/DateViewTable/MenuActionList";
import { useUsers } from "@/hooks/users/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { FilterConfig } from "@/types/table";
import { useEffect, useMemo, useState } from "react";
import UserDetailsPopup from "./UserDetailsPopup";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import Popup from "@/components/atoms/Popup";
import { FaComments, FaUser } from "react-icons/fa";


export default function UsersDataView() {
    const t = useTranslations('dashboard.users');
    const { getRows, exportRows } = useUsers();
    const { role } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        const viewId = searchParams.get('view');
        if (viewId && (!selectedUser || selectedUser.id !== viewId)) {
            setSelectedUser({ id: viewId } as User);
        } else if (!viewId && selectedUser) {
            setSelectedUser(null);
        }
    }, [searchParams]);

    const handleSetSelected = (user: User | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (user) {
            params.set('view', user.id);
            setSelectedUser(user);
        } else {
            params.delete('view');
            setSelectedUser(null);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const statusOptions = [
        { label: t('statusOptions.all'), value: 'all' },
        { label: t('statusOptions.active'), value: 'active' },
        { label: t('statusOptions.inactive'), value: 'inactive' },
        { label: t('statusOptions.pending_verification'), value: 'pending_verification' },
        { label: t('statusOptions.suspended'), value: 'suspended' },
    ];

    const roleOptions = [
        { label: t('roleOptions.all'), value: 'all' },
        { label: t('roleOptions.admin'), value: 'admin' },
        { label: t('roleOptions.landlord'), value: 'landlord' },
        { label: t('roleOptions.tenant'), value: 'tenant' },
    ];

    const userFilters: FilterConfig[] = [
        {
            key: 'status',
            label: t('table.filters.status'),
            type: 'select',
            options: statusOptions,
            default: 'all',
        },
        {
            key: 'role',
            label: t('table.filters.role'),
            type: 'select',
            options: roleOptions,
            default: 'all',
        },
    ];

    const columns = useMemo(() => UserColumns(t, role), [t, role])

    return (
        <>
            <DataView<User>
                key={'users'}
                columns={columns}
                getRows={getRows}
                onExport={exportRows}
                filters={userFilters}
                showSearch={true}
                searchPlaceholder={t('table.searchPlaceholder')}
                showActions={true}
                actionsMenuItems={(row: User): MenuActionItem[] =>
                    [
                        {
                            label: t('table.chat'),
                            Icon: FaComments,
                            link: `/dashboard/chats?user=${row.id}`
                        },
                        {
                            label: t('table.viewDetails'),
                            Icon: FaUser,
                            onClick: () => handleSetSelected(row),
                        },
                    ]
                }
                pageSize={10}
            />
            {selectedUser && (
                <Popup show={true} onClose={() => handleSetSelected(null)}>
                    <UserDetailsPopup
                        row={selectedUser}
                        onClose={() => handleSetSelected(null)}
                    />
                </Popup>
            )}
        </>
    );
}
