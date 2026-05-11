'use client'

import DataView from "@/components/molecules/DateViewTable/DataView";
import { MenuActionItem } from "@/components/molecules/DateViewTable/MenuActionList";
import { useContracts } from "@/hooks/dashboard/contracts/useContracts";
import { Contract, ContractStatus } from "@/types/dashboard/contract";
import { ContractColumns } from '@/constants/dashboard/contracts/contractColumns';
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { FaEye, FaStar } from "react-icons/fa";
import { MdEdit, MdCheck, MdClose, MdUpload } from "react-icons/md";
import { RiIndeterminateCircleLine } from "react-icons/ri";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Popup from "@/components/atoms/Popup";
import ContractDetailsPopup from "./Contracts/ContractDetailsPopup";
import {
    ReviseContractPopup,
    AcceptContractPopup,
    CancelContractPopup,
    ActivateContractPopup,
    TerminateContractPopup,
} from "./Contracts/ContractActionPopups";
import { CreateReviewPopup, ViewReviewPopup } from "./Contracts/ReviewPopups";
import CreateContractPopup from "./Contracts/CreateContractPopup";
import { FilterConfig } from "@/types/table";
import { MdAddCircleOutline } from "react-icons/md";

export default function ContractDataView() {
    const t = useTranslations('dashboard.contracts.table');
    const { getRows, exportRows } = useContracts();
    const { role } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const fetchRowsRef = useRef<((signal?: AbortSignal) => Promise<void>) | null>(null);

    useEffect(() => {
        const viewId = searchParams.get('view');
        if (viewId && (!selectedContract || selectedContract.id !== viewId)) {
            setSelectedContract({ id: viewId } as Contract);
        } else if (!viewId && selectedContract) {
            setSelectedContract(null);
        }
    }, [searchParams]);

    const handleSetSelected = (contract: Contract | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (contract) {
            params.set('view', contract.id);
            setSelectedContract(contract);
        } else {
            params.delete('view');
            setSelectedContract(null);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleFetchRowsReady = (fetchRows: (signal?: AbortSignal) => Promise<void>) => {
        fetchRowsRef.current = fetchRows;
    };

    const statusOptions = [
        { label: t('statusOptions.all'), value: 'all' },
        // { label: t('statusOptions.draft'), value: ContractStatus.DRAFT },
        { label: t('statusOptions.pending_tenant_acceptance'), value: ContractStatus.PENDING_TENANT_ACCEPTANCE },
        { label: t('statusOptions.pending_landlord_acceptance'), value: ContractStatus.PENDING_LANDLORD_ACCEPTANCE },
        { label: t('statusOptions.pending_signature'), value: ContractStatus.PENDING_SIGNATURE },
        { label: t('statusOptions.active'), value: ContractStatus.ACTIVE },
        { label: t('statusOptions.expired'), value: ContractStatus.EXPIRED },
        { label: t('statusOptions.cancelled'), value: ContractStatus.CANCELLED },
        { label: t('statusOptions.terminated'), value: ContractStatus.TERMINATED },
        { label: t('statusOptions.pending_termination'), value: ContractStatus.PENDING_TERMINATION },
    ];

    const contractFilters: FilterConfig[] = [
        {
            key: 'status',
            label: t('filters.status'),
            type: 'select',
            options: statusOptions,
            default: 'all',
        }
    ];

    const getActions = (contract: Contract): MenuActionItem[] => {
        const actions: MenuActionItem[] = [];

        // View Details - Always available
        actions.push({
            label: t('viewDetails'),
            Icon: FaEye,
            onClick: () => handleSetSelected(contract),
        });

        // Review action for tenants with contractNumber
        if (role === 'tenant' && contract.contractNumber) {
            if (contract.isReviewed) {
                actions.push({
                    label: t('viewReview'),
                    Icon: FaStar,
                    Child: ViewReviewPopup,
                });
            } else {
                actions.push({
                    label: t('addReview'),
                    Icon: FaStar,
                    Child: CreateReviewPopup,
                });
            }
        }

        // Landlord actions for PENDING_LANDLORD_ACCEPTANCE
        if (role === 'landlord' && contract.status === ContractStatus.PENDING_LANDLORD_ACCEPTANCE) {
            actions.push({
                label: t('reviseContract'),
                Icon: MdEdit,
                Child: ReviseContractPopup,
            });
            actions.push({
                label: t('acceptContract'),
                Icon: MdCheck,
                Child: AcceptContractPopup,
            });
            actions.push({
                label: t('cancelContract'),
                Icon: MdClose,
                Child: CancelContractPopup,
            });
        }

        // Tenant actions for PENDING_TENANT_ACCEPTANCE
        if (role === 'tenant' && contract.status === ContractStatus.PENDING_TENANT_ACCEPTANCE) {
            actions.push({
                label: t('acceptContract'),
                Icon: MdCheck,
                Child: AcceptContractPopup,
            });
            actions.push({
                label: t('cancelContract'),
                Icon: MdClose,
                Child: CancelContractPopup,
            });
        }

        // Admin actions for PENDING_SIGNATURE
        if (role === 'admin' && contract.status === ContractStatus.PENDING_SIGNATURE) {
            actions.push({
                label: t('activateContract'),
                Icon: MdUpload,
                Child: ActivateContractPopup,
            });
        }

        // Terminate action for ACTIVE contracts
        if ((contract.status === ContractStatus.ACTIVE && (role === 'tenant' || role === 'landlord')) || (contract.status === ContractStatus.PENDING_TERMINATION && role === 'tenant')) {
            actions.push({
                label: t('terminateContract'),
                Icon: RiIndeterminateCircleLine,
                Child: TerminateContractPopup,
            });
        }

        return actions;
    };

    return (
        <>
            <DataView<Contract>
                key={'contracts'}
                columns={ContractColumns(t, role)}
                getRows={getRows}
                onExport={exportRows}
                onFetchRowsReady={handleFetchRowsReady}
                showActions={true}
                showSearch={true}
                searchPlaceholder={t('searchPlaceholder')}
                actionsMenuItems={getActions}
                pageSize={10}
                filters={contractFilters}
                actionButton={{
                    show: role === 'admin',
                    label: t('addContract'),
                    MobileIcon: MdAddCircleOutline,
                    onClick: () => setShowCreatePopup(true),
                }}
            />
 
            {selectedContract && (
                <Popup show={true} onClose={() => handleSetSelected(null)}>
                    <ContractDetailsPopup
                        row={selectedContract}
                        onClose={() => handleSetSelected(null)}
                    />
                </Popup>
            )}

            {showCreatePopup && (
                <Popup show={true} onClose={() => setShowCreatePopup(false)}>
                    <CreateContractPopup
                        onClose={() => setShowCreatePopup(false)}
                        fetchRows={fetchRowsRef.current ?? undefined}
                    />
                </Popup>
            )}
        </>
    );
}
