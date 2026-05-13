'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkOrders } from '@/hooks/dashboard/maintenance/useWorkOrders';
import { useServiceProviders } from '@/hooks/dashboard/maintenance/useServiceProviders';
import { WorkOrder, ServiceProvider, WorkOrderStatus } from '@/types/dashboard/maintenance';
import { WorkOrderColumns, ServiceProviderColumns } from '@/constants/dashboard/maintenance/workOrderColumns';
import { FilterConfig } from '@/types/table';
import { UserRole } from '@/constants/user';
import api from '@/libs/axios';
import DataView from '@/components/molecules/DateViewTable/DataView';
import { MenuActionItem } from '@/components/molecules/DateViewTable/MenuActionList';
import WorkOrderDetailsPopup from './WorkOrderDetailsPopup';
import CreateWorkOrderPopup from './CreateWorkOrderPopup';
import ServiceProviderFormPopup from './ServiceProviderFormPopup';
import { MdAddCircleOutline, MdEdit, MdDelete, MdVisibility, MdStar } from 'react-icons/md';

type Tab = 'work-orders' | 'providers';

export default function MaintenanceDataView() {
    const t = useTranslations('dashboard.maintenance');
    const { role } = useAuth();

    const isAdmin = role === UserRole.ADMIN;
    const isAdminOrLandlord = role === UserRole.ADMIN || role === UserRole.LANDLORD;
    const isTenant = role === UserRole.TENANT;

    const [activeTab, setActiveTab] = useState<Tab>('work-orders');
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
    const [showCreateWorkOrder, setShowCreateWorkOrder] = useState(false);
    const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
    const [showProviderForm, setShowProviderForm] = useState(false);

    const workOrderFetchRef = useRef<((signal?: AbortSignal) => Promise<void>) | null>(null);
    const providerFetchRef = useRef<((signal?: AbortSignal) => Promise<void>) | null>(null);

    const { getRows: getWorkOrderRows, deleteWorkOrder } = useWorkOrders();
    const { getRows: getProviderRows, deleteProvider } = useServiceProviders();

    const handleStatusChange = async (id: string, status: WorkOrderStatus) => {
        try {
            await api.patch(`/maintenance/work-orders/${id}/status`, { status });
            workOrderFetchRef.current?.();
        } catch {
            // silent — user will see no change and can retry
        }
    };

    const workOrderColumns = WorkOrderColumns(t, {
        isAdminOrLandlord,
        onStatusChange: handleStatusChange,
    });
    const providerColumns = ServiceProviderColumns(t);

    // ─── Work Order status filter options ──────────────────────────────────────
    const statusOptions: WorkOrderStatus[] = [
        'scheduled', 'in_progress', 'completed', 'closed', 'overdue', 'cancelled',
    ];
    const workOrderFilters: FilterConfig[] = [
        {
            key: 'status',
            type: 'select',
            label: t('statusFilter'),
            options: [
                { label: t('statusOptions.all'), value: 'all' },
                ...statusOptions.map(s => ({ label: t(`statusOptions.${s}`), value: s })),
            ],
        },
    ];

    // ─── Row action menus ───────────────────────────────────────────────────────
    const workOrderActions = (row: WorkOrder, onClose?: () => void): MenuActionItem[] => {
        const actions: MenuActionItem[] = [
            {
                label: t('viewDetails'),
                Icon: MdVisibility,
                type: 'normal',
                onClick: () => { setSelectedWorkOrder(row); onClose?.(); },
            },
        ];

        if (isAdminOrLandlord) {
            actions.push({
                label: t('editWorkOrder'),
                Icon: MdEdit,
                type: 'edit',
                onClick: () => { setEditingWorkOrder(row); onClose?.(); },
            });
            actions.push({
                label: t('deleteWorkOrder'),
                Icon: MdDelete,
                type: 'delete',
                onClick: async () => {
                    await deleteWorkOrder(row.id);
                    workOrderFetchRef.current?.();
                    onClose?.();
                },
            });
        }

        if (isTenant && row.status === 'completed' && !row.tenantRating) {
            actions.push({
                label: t('rateWork'),
                Icon: MdStar,
                type: 'normal',
                onClick: () => { setSelectedWorkOrder(row); onClose?.(); },
            });
        }

        return actions;
    };

    const providerActions = (row: ServiceProvider, onClose?: () => void): MenuActionItem[] => {
        const actions: MenuActionItem[] = [
            {
                label: t('editProvider'),
                Icon: MdEdit,
                type: 'edit',
                onClick: () => { setSelectedProvider(row); setShowProviderForm(true); onClose?.(); },
            },
        ];
        if (isAdmin) {
            actions.push({
                label: t('deleteProvider'),
                Icon: MdDelete,
                type: 'delete',
                onClick: async () => {
                    await deleteProvider(row.id);
                    providerFetchRef.current?.();
                    onClose?.();
                },
            });
        }
        return actions;
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: 'work-orders', label: t('tabWorkOrders') },
        ...(isAdminOrLandlord ? [{ key: 'providers' as Tab, label: t('tabProviders') }] : []),
    ];

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === tab.key
                                ? 'bg-white text-[var(--dark)] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Work Orders Tab */}
            {activeTab === 'work-orders' && (
                <DataView<WorkOrder>
                    columns={workOrderColumns}
                    filters={workOrderFilters}
                    showSearch={false}
                    getRows={getWorkOrderRows}
                    showActions
                    actionsMenuItems={workOrderActions}
                    onFetchRowsReady={fn => { workOrderFetchRef.current = fn; }}
                    actionButton={isAdminOrLandlord ? {
                        show: true,
                        label: t('createWorkOrder'),
                        MobileIcon: MdAddCircleOutline,
                        onClick: () => setShowCreateWorkOrder(true),
                    } : undefined}
                />
            )}

            {/* Providers Tab */}
            {activeTab === 'providers' && isAdminOrLandlord && (
                <DataView<ServiceProvider>
                    columns={providerColumns}
                    showSearch
                    searchPlaceholder={t('searchProviders')}
                    getRows={getProviderRows}
                    showActions
                    actionsMenuItems={providerActions}
                    onFetchRowsReady={fn => { providerFetchRef.current = fn; }}
                    actionButton={isAdmin ? {
                        show: true,
                        label: t('addProvider'),
                        MobileIcon: MdAddCircleOutline,
                        onClick: () => { setSelectedProvider(null); setShowProviderForm(true); },
                    } : undefined}
                />
            )}

            {/* Popups */}
            <WorkOrderDetailsPopup
                workOrder={selectedWorkOrder}
                onClose={() => setSelectedWorkOrder(null)}
                onRefresh={() => workOrderFetchRef.current?.()}
            />

            <CreateWorkOrderPopup
                show={showCreateWorkOrder}
                onClose={() => setShowCreateWorkOrder(false)}
                onSuccess={() => { workOrderFetchRef.current?.(); }}
            />

            <CreateWorkOrderPopup
                show={!!editingWorkOrder}
                workOrder={editingWorkOrder}
                onClose={() => setEditingWorkOrder(null)}
                onSuccess={() => { workOrderFetchRef.current?.(); setEditingWorkOrder(null); }}
            />

            <ServiceProviderFormPopup
                show={showProviderForm}
                provider={selectedProvider}
                onClose={() => { setShowProviderForm(false); setSelectedProvider(null); }}
                onSuccess={() => { providerFetchRef.current?.(); }}
            />
        </div>
    );
}
