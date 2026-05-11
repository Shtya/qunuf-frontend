'use client';

import ActionPopup from "@/components/atoms/ActionPopup";
import api from "@/libs/axios";
import { Blog } from "@/types/dashboard/blog";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaBuilding, FaRegNewspaper } from "react-icons/fa";

interface DeleteBlogPopupProps {
    onClose: () => void;
    onSuccess: () => void;
    selectedBlog: Blog
}

export default function DeleteBlogPopup({
    onClose,
    onSuccess,
    selectedBlog
}: DeleteBlogPopupProps) {

    const t = useTranslations('dashboard.admin.blog');
    const [deleting, setDeleting] = useState(false);
    const locale = useLocale();
    const name = locale === 'ar' ? selectedBlog.title_ar : selectedBlog.title_en;

    const handleDelete = async () => {
        const toastId = toast.loading(
            t('delete.deleting')
        );
        setDeleting(true);

        try {
            await api.delete(`/blogs/${selectedBlog.id}`);

            toast.success(
                t('delete.success'),
                { id: toastId }
            );

            onClose();
            onSuccess();
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                t('delete.error'),
                { id: toastId }
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <ActionPopup
            title={t('delete.title')}
            subtitle={t.rich('delete.subtitle')}
            MainIcon={FaRegNewspaper}
            mainIconColor="#FD5257"
            cancelText={t('delete.cancel')}
            actionText={t('delete.actionText')}
            onCancel={onClose}
            onAction={handleDelete}
            isDisabled={deleting}
        />
    );
}
