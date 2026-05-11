'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/libs/axios';
import toast from 'react-hot-toast';
import TenantRenewRequestCard from "./TenantRenewRequestCard";
import { RenewRequest, RenewStatus } from "@/types/dashboard/renew-request";
import { useRenewRequests } from "@/hooks/dashboard/renew-requests/useRenewRequests";
import Pagination from '@/components/atoms/Pagination';
import { ErrorCard } from '@/components/atoms/ErrorCard';
import EmptyState from '@/components/atoms/EmptyState';

export default function TenantRenewRequests() {
    const t = useTranslations('dashboard.renewRequest');
    const { fetchRequests } = useRenewRequests();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [requests, setRequests] = useState<RenewRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        limit: 15,
        total: 0,
        totalPages: 1,
    });
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = pagination.limit;

    const loadData = useCallback(async (pageNum: number) => {
        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            const { requests: data, totalCount, error: fetchError } = await fetchRequests(controller.signal);

            if (fetchError) {
                setError(fetchError.message);
                return;
            }

            setRequests(data);
            setPagination(prev => ({
                ...prev,
                total: totalCount || 0,
                totalPages: Math.ceil((totalCount || 0) / limit),
            }));

        } catch (err: any) {
            if (err?.name === "CanceledError") return;
            setError(err?.response?.data?.message || t('loadError'));
        } finally {
            if (abortRef.current === controller) setLoading(false);
        }
    }, [fetchRequests, limit, t]);

    useEffect(() => {
        loadData(page);
        return () => {
            abortRef.current?.abort();
        };
    }, [page, loadData]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleAccept = async (requestId: string) => {
        setActionLoading(requestId);
        const toastId = toast.loading(t('accepting'));

        try {
            await api.post(`/contracts/renew/${requestId}/accept`);
            toast.success(t('acceptSuccess'), { id: toastId });
            await loadData(page);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('acceptError'), { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId: string) => {
        setActionLoading(requestId);
        const toastId = toast.loading(t('rejecting'));

        try {
            await api.patch(`/contracts/renew/${requestId}/reject`);
            toast.success(t('rejectSuccess'), { id: toastId });
            await loadData(page);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('rejectError'), { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    // Error State
    if (!loading && error) {
        return (
            <ErrorCard
                message={error}
                onAction={() => loadData(1)}
            />
        );
    }

    // Loading Skeleton
    if (loading && requests.length === 0) {
        return (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="max-sm:mx-auto max-sm:w-full bg-card-bg rounded-[12px] custom-shadow overflow-hidden max-w-[440px] animate-pulse">
                        <div className="h-[100px] bg-gray-200 m-4 rounded-md"></div>
                        <div className="h-4 bg-gray-200 mx-4 mb-2 rounded"></div>
                        <div className="h-4 bg-gray-200 mx-4 mb-4 rounded w-3/4"></div>
                        <div className="h-20 bg-gray-200 mx-4 mb-4 rounded"></div>
                        <div className="h-12 bg-gray-200 mx-4 mb-4 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty State
    if (!loading && requests.length === 0) {
        return (
            <EmptyState
                title={t('emptyTitle')}
                message={t('emptyMessage')}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {requests.map((request) => (
                    <TenantRenewRequestCard
                        key={request.id}
                        data={request}
                        onAccept={() => handleAccept(request.id)}
                        onReject={() => handleReject(request.id)}
                        isLoading={actionLoading === request.id}
                    />
                ))}
            </div>

            {/* Pagination */}
            <Pagination
                page={page}
                total={pagination.total}
                setPage={handlePageChange}
                loading={loading}
                totalPages={pagination.totalPages}
                limit={pagination.limit}
            />
        </div>
    );
}