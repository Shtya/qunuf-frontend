'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TeamMemberCard } from './TeamMemberCard';
import Popup from '@/components/atoms/Popup';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import TeamMemberForm from './TeamMemberForm';
import SectionHeading from '../../SectionHeading';
import Pagination from '@/components/atoms/Pagination';
import { ErrorCard } from '@/components/atoms/ErrorCard';
import api from '@/libs/axios';
import EmptyState from '@/components/atoms/EmptyState';
import DeleteTeamMemberPopup from './DeleteTeamMemberPopup';


export default function TeamGrid() {
    const t = useTranslations("dashboard.admin.team");

    // UI State
    const [popupOpen, setPopupOpen] = useState<'add-edit' | 'delete' | null>(null);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    // Data State
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        limit: 15,
        total: 0,
        totalPages: 1,
    });

    const limit = pagination.limit;
    // Fetch function
    const abortRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async (page: number) => {
        // Abort previous request if exists
        if (abortRef.current) {
            abortRef.current.abort();
        }

        // Create new AbortController for this request
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            const res = await api.get(
                `/teams?page=${page}&limit=${limit}`,
                { signal: controller.signal }
            );

            const { records, pagination: serverPagination } = res.data;

            setTeam(records);
            setPagination(p => ({ ...p, total: serverPagination.total, totalPages: serverPagination.totalPages }));

        } catch (err: any) {
            if (err?.name === "CanceledError" || err?.message === "canceled") {
                // Request aborted → ignore
                return;
            }

            setError(err?.response?.data?.message || "Failed to load team members");
        } finally {
            if (abortRef.current === controller)
                setLoading(false);
        }
    }, [limit]);


    // Fetch when page changes
    useEffect(() => {
        fetchData(page);
    }, [page, limit]);



    async function handleSuccess() {
        await fetchData(1)
    }

    function onClose() {
        setPopupOpen(null);
        setSelectedMember(null);
    }
    // Error State
    if (!loading && error) {
        return (
            <ErrorCard
                message={error}
                onAction={() => fetchData(1)}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <SectionHeading title={t("title")} />
                <SecondaryButton
                    onClick={() => {
                        setPopupOpen('add-edit');
                        setSelectedMember(null);
                    }}
                    className="bg-secondary hover:bg-secondary-hover font-semibold text-lighter sm:!py-2"
                >
                    {t("add")}
                </SecondaryButton>
            </div>

            {/* Loading Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {Array(10)
                        .fill(0)
                        .map((_, i) => (
                            <Skeleton key={i} />
                        ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && team.length === 0 && (
                <EmptyState
                    title={t("emptyTitle")}
                    message={t("emptyMessage")}
                    actionLabel={t('resetFilters')} onAction={() => setPage(1)}
                />
            )}

            {/* Grid */}
            {!loading && team.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {team.map((member: any) => (
                        <TeamMemberCard
                            key={member.id}
                            onEdit={() => {
                                setSelectedMember(member);
                                setPopupOpen('add-edit');
                            }}
                            onDelete={() => {
                                setSelectedMember(member);
                                setPopupOpen('delete');
                            }}
                            {...member} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            <Pagination
                page={page}
                total={pagination.total}
                setPage={setPage}
                loading={loading}
                totalPages={pagination.totalPages}
                limit={pagination.limit}
            />

            {/* Add Member Popup */}
            {/* Add/Edit Popup */}
            <Popup
                show={popupOpen === 'add-edit'}
                onClose={onClose}
                className="max-sm:!w-full"
                headerContent={
                    <p className="text-[24px] font-bold text-dark">
                        {selectedMember ? t('edit') : t('add')}
                    </p>
                }
            >
                <TeamMemberForm
                    key={selectedMember?.id}
                    initialData={selectedMember ?? undefined}
                    onClose={onClose}
                    onSuccess={handleSuccess}
                />
            </Popup>

            <Popup show={popupOpen === 'delete'} onClose={onClose} headerContent={t('deleteTitle')}>
                {selectedMember && <DeleteTeamMemberPopup onClose={onClose} selectedMember={selectedMember} onSuccess={handleSuccess} />}
            </Popup>
        </div>
    );
}



// If loading + No previous data → Skeleton
const Skeleton = () => (
    <div
        className="bg-card-bg rounded-[14px] p-4 w-full max-w-xs mx-auto animate-pulse"
    >
        <div className="w-[111px] h-[105px] bg-gray rounded-[12px] mx-auto mb-4"></div>
        <div className="h-4 bg-gray rounded mb-2"></div>
        <div className="h-4 bg-gray rounded"></div>
    </div>
);
