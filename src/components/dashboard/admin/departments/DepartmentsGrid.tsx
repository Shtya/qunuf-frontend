'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import SectionHeading from '../../SectionHeading';
import Pagination from '@/components/atoms/Pagination';
import { ErrorCard } from '@/components/atoms/ErrorCard';
import EmptyState from '@/components/atoms/EmptyState';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import Popup from '@/components/atoms/Popup';
import api from '@/libs/axios';
import DepartmentForm from './DepartmentForm';
import DeleteDepartmentPopup from './DeleteDepartmentPopup';
import DepartmentCard from './DepartmentCard';

export default function DepartmentsGrid() {
    const t = useTranslations("dashboard.admin.departments");

    // UI State
    const [popupOpen, setPopupOpen] = useState<'add-edit' | 'delete' | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<any | null>(null);

    // Data State
    const [departments, setDepartments] = useState([]);
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

    // Abort Controller
    const abortRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async (page: number) => {
        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            const res = await api.get(
                `/departments?page=${page}&limit=${limit}`,
                { signal: controller.signal }
            );

            const { records, pagination: serverPagination } = res.data;

            setDepartments(records);
            setPagination(p => ({
                ...p,
                total: serverPagination.total,
                totalPages: serverPagination.totalPages,
            }));

        } catch (err: any) {
            if (err?.name === "CanceledError") return;

            setError(err?.response?.data?.message || "Failed to load departments");
        } finally {
            if (abortRef.current === controller) setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchData(page);
    }, [page, limit]);

    async function handleSuccess() {
        await fetchData(1);
    }

    function onClose() {
        setPopupOpen(null);
        setSelectedDepartment(null);
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
                        setSelectedDepartment(null);
                    }}
                    className="bg-secondary hover:bg-secondary-hover font-semibold text-lighter sm:!py-2"
                >
                    {t("add")}
                </SecondaryButton>
            </div>

            {/* Loading Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {Array(8).fill(0).map((_, i) => <DepartmentSkeletonCard key={i} />)}
                </div>
            )}

            {/* Empty State */}
            {!loading && departments.length === 0 && (
                <EmptyState title={t("emptyTitle")} message={t("emptyMessage")}
                    actionLabel={t('resetFilters')} onAction={() => setPage(1)} />
            )}

            {/* Grid */}
            {!loading && departments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {departments.map((dep: any) => (
                        <DepartmentCard
                            key={dep.id}
                            {...dep}
                            onEdit={() => {
                                setSelectedDepartment(dep);
                                setPopupOpen('add-edit');
                            }}
                            onDelete={() => {
                                setSelectedDepartment(dep);
                                setPopupOpen('delete');
                            }}
                        />
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

            {/* Add/Edit Popup */}
            <Popup
                show={popupOpen === 'add-edit'}
                onClose={onClose}
                className="max-sm:!w-full"
                headerContent={
                    <p className="text-[24px] font-bold text-dark">
                        {selectedDepartment ? t('edit') : t('add')}
                    </p>
                }
            >
                <DepartmentForm
                    key={selectedDepartment?.id}
                    initialData={selectedDepartment ? { ...selectedDepartment, image: selectedDepartment?.imagePath } : undefined}
                    onClose={onClose}
                    onSuccess={handleSuccess}
                />
            </Popup>

            {/* Delete Popup */}
            <Popup show={popupOpen === 'delete'} onClose={onClose} headerContent={t('deleteTitle')}>
                {selectedDepartment && (
                    <DeleteDepartmentPopup
                        selectedDepartment={selectedDepartment}
                        onClose={onClose}
                        onSuccess={handleSuccess}
                    />
                )}
            </Popup>
        </div>
    );
}

// Skeleton Loader
function DepartmentSkeletonCard() {
    return (
        <div className="bg-card-bg rounded-xl p-4 shadow-sm animate-pulse">
            {/* Image Skeleton */}
            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>

            {/* Title Skeleton */}
            <div className="h-5 w-2/3 bg-gray-200 rounded mb-3"></div>

            {/* Description Skeleton (2 lines) */}
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
        </div>
    );
}

