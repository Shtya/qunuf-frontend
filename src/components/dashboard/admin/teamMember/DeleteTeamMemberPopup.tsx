import ActionPopup from "@/components/atoms/ActionPopup";
import api from "@/libs/axios";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaUser } from "react-icons/fa";


interface DeleteTeamMemberPopupProps {
    onClose: () => void;
    onSuccess: () => void;
    selectedMember: {
        id: string;
        name: string;
    };
}

export default function DeleteTeamMemberPopup({ onClose, onSuccess, selectedMember }: DeleteTeamMemberPopupProps) {
    const t = useTranslations('dashboard.admin.team');
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        const toastId = toast.loading(t('delete.deleting', { name: selectedMember.name }));
        setDeleting(true);
        try {
            await api.delete(`/teams/${selectedMember.id}`);
            toast.success(t('delete.success', { name: selectedMember.name }), { id: toastId });
            onClose();
            onSuccess();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || t('delete.error', { name: selectedMember.name }), { id: toastId });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <ActionPopup
            title={t('delete.title')}
            subtitle={t.rich('delete.subtitle', {
                name: selectedMember.name,
                strong: (chunk) => <strong>{chunk}</strong>,
            })}
            MainIcon={FaUser}
            mainIconColor="#FD5257"
            cancelText={t('delete.cancel')}
            actionText={t('delete.actionText')}
            onCancel={onClose}
            onAction={handleDelete}
            isDisabled={deleting}
        />
    );
}
