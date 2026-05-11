import React from "react";

import { useTranslations } from "next-intl";
import SecondaryButton from "@/components/atoms/buttons/SecondaryButton";

interface PopupActionButtonsProps {
    onCancel: () => void;
    isLoading?: boolean;
    disabled?: boolean; // For validation (e.g., !name.trim())
    updateText?: string;
}

export default function PopupActionButtons({
    onCancel,
    isLoading,
    disabled,
    updateText,
}: PopupActionButtonsProps) {
    const t = useTranslations('dashboard.account');

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
            <SecondaryButton
                type="submit"
                className="bg-secondary text-white w-full sm:w-[323px]"
                disabled={disabled || isLoading}
            >
                {isLoading ? `${t('updating')}...` : (updateText || t('update'))}
            </SecondaryButton>

            <SecondaryButton
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="bg-[#F5F6F8] text-[#B3B3B3] hover:bg-[#E9EAEC] w-full sm:w-[323px]"
            >
                {t('cancel')}
            </SecondaryButton>
        </div>
    );
}