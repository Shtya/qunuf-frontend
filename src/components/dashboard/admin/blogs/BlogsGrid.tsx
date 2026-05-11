'use client'

import SecondaryButton from "@/components/atoms/buttons/SecondaryButton";
import SectionHeading from "../../SectionHeading";
import BlogContentCard from "./BlogContentCard";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Popup from "@/components/atoms/Popup";
import BlogEditForm from "./BlogEditForm";
import api from "@/libs/axios";
import { Blog } from "@/types/dashboard/blog";
import Pagination from "@/components/atoms/Pagination";
import EmptyState from "@/components/atoms/EmptyState";
import { ErrorCard } from "@/components/atoms/ErrorCard";
import DeleteBlogPopup from "./DeleteBlogPopup";



export default function BlogsGrid() {
    const t = useTranslations('dashboard.admin.blog');
    const [popupOpen, setPopupOpen] = useState<'add-edit' | 'delete' | null>(null);
    const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

    // Data State
    const [blogs, setBlogs] = useState<Blog[]>([]);
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
                `/blogs/admin?page=${page}&limit=${limit}`,
                { signal: controller.signal }
            );

            const { records, pagination: serverPagination } = res.data;

            setBlogs(records);
            setPagination(p => ({
                ...p,
                total: serverPagination.total,
                totalPages: serverPagination.totalPages,
            }));

        } catch (err: any) {
            if (err?.name === "CanceledError") return;

            setError(err?.response?.data?.message || "Failed to load blogs");
        } finally {
            if (abortRef.current === controller) setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchData(page);
    }, [page, limit]);


    function onClose() {
        setPopupOpen(null);
        setSelectedBlog(null);
    }
    async function handleSuccess() {
        await fetchData(1);
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <SectionHeading title={t('title')} />
                <SecondaryButton
                    onClick={() => {
                        setPopupOpen('add-edit');
                        setSelectedBlog(null);
                    }}
                    className="bg-secondary hover:bg-secondary-hover font-semibold text-lighter sm:!py-2"
                >
                    {t('add')}
                </SecondaryButton>
            </div>
            {loading && (
                <div className="grid grid-cols-1  gap-4">
                    {Array(8).fill(0).map((_, i) => <BlogSkeletonCard key={i} />)}
                </div>
            )}

            {/* Empty State */}
            {!loading && blogs.length === 0 && (
                <EmptyState title={t("emptyTitle")} message={t("emptyMessage")}
                    actionLabel={t('resetFilters')} onAction={() => setPage(1)} />
            )}


            {!loading && blogs.length > 0 && (
                <div className="gap-4 grid grid-cols-1">
                    {blogs.map((block, index) => (
                        <BlogContentCard key={index} block={block}
                            onEdit={() => {
                                setSelectedBlog(block);
                                setPopupOpen('add-edit');
                            }}
                            onDelete={() => {
                                setSelectedBlog(block);
                                setPopupOpen('delete');
                            }} />
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

            <Popup
                show={popupOpen === 'add-edit'}
                onClose={onClose}
                className="max-sm:!w-full"
                headerContent={
                    <p className="text-[24px] font-bold text-dark text-center">
                        {selectedBlog ? t('edit') : t('add')}
                    </p>
                }
            >
                <BlogEditForm
                    key={selectedBlog?.id}
                    initialData={selectedBlog ? { ...selectedBlog, image: selectedBlog?.imagePath } : undefined}
                    onClose={onClose}
                    onSuccess={handleSuccess}

                />
            </Popup>

            {/* Delete Popup */}
            <Popup show={popupOpen === 'delete'} onClose={onClose} headerContent={t('deleteTitle')}>
                {selectedBlog && (
                    <DeleteBlogPopup
                        selectedBlog={selectedBlog}
                        onClose={onClose}
                        onSuccess={handleSuccess}
                    />
                )}
            </Popup>
        </div>
    );
}

function BlogSkeletonCard() {
    return (
        <div className="flex flex-col md:flex-row max-md:items-center gap-5 md:gap-7 lg:gap-10 bg-card-bg rounded-[14px] p-3 w-full animate-pulse">

            {/* Image Skeleton */}
            <div className="w-[250px] h-[250px] rounded-[12px] bg-gray-200 shrink-0" />

            {/* Content */}
            <div className="flex gap-2 flex-col md:flex-row justify-between flex-1 w-full">

                {/* Text Skeleton */}
                <div className="flex flex-col flex-1">
                    <div className="space-y-3">
                        {/* Title */}
                        <div className="h-7 w-2/3 bg-gray-200 rounded" />

                        {/* Date */}
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                    </div>

                    {/* Description (3 lines) */}
                    <div className="mt-6 space-y-3">
                        <div className="h-5 w-full bg-gray-200 rounded" />
                        <div className="h-5 w-11/12 bg-gray-200 rounded" />
                        <div className="h-5 w-5/6 bg-gray-200 rounded" />
                    </div>
                </div>

                {/* Actions Skeleton */}
                <div className="flex gap-2 items-start justify-center md:justify-start mt-4 md:mt-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                </div>
            </div>
        </div>
    );
}

