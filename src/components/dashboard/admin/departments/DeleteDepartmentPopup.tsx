'use client';

import ActionPopup from "@/components/atoms/ActionPopup";
import api from "@/libs/axios";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaBuilding } from "react-icons/fa";

interface DeleteDepartmentPopupProps {
    onClose: () => void;
    onSuccess: () => void;
    selectedDepartment: {
        id: string;
        name: string;
    };
}

export default function DeleteDepartmentPopup({
    onClose,
    onSuccess,
    selectedDepartment
}: DeleteDepartmentPopupProps) {

    const t = useTranslations('dashboard.admin.departments');
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        const toastId = toast.loading(
            t('delete.deleting', { name: selectedDepartment.name })
        );
        setDeleting(true);

        try {
            await api.delete(`/departments/${selectedDepartment.id}`);

            toast.success(
                t('delete.success', { name: selectedDepartment.name }),
                { id: toastId }
            );

            onClose();
            onSuccess();
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                t('delete.error', { name: selectedDepartment.name }),
                { id: toastId }
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <ActionPopup
            title={t('delete.title')}
            subtitle={t.rich('delete.subtitle', {
                name: selectedDepartment.name,
                strong: (chunk) => <strong>{chunk}</strong>,
            })}
            MainIcon={FaBuilding}
            mainIconColor="#FD5257"
            cancelText={t('delete.cancel')}
            actionText={t('delete.actionText')}
            onCancel={onClose}
            onAction={handleDelete}
            isDisabled={deleting}
        />
    );
}
