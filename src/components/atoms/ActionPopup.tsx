import { IoIosInformationCircleOutline } from "react-icons/io";
import { IconType } from "react-icons";

import ActionButtons from "./ActionButtons";
import { ReactNode } from "react";

interface ActionPopupProps {
    title: string | ReactNode;
    subtitle?: string | ReactNode;
    MainIcon: IconType;
    mainIconColor?: string;
    note?: string;
    cancelText?: string;
    actionText: string;
    isDisabled?: boolean;
    onCancel: () => void;
    onAction: () => void;
}

export default function ActionPopup({
    title,
    subtitle,
    isDisabled,
    MainIcon,
    mainIconColor = 'var(--light)',
    note,
    cancelText = "Cancel",
    actionText,
    onCancel,
    onAction,
}: ActionPopupProps) {
    return (
        <div className="md:min-w-lg lg:min-w-xl mx-auto ">
            {/* Icon */}
            <div className="flex justify-center mb-2 ">
                <MainIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" style={{ color: mainIconColor }} />
            </div>

            {/* Title + Subtitle */}
            <div className="text-center flex flex-col gap-2 mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-base sm:text-lg font-medium">{subtitle}</p>
                )}
            </div>

            {/* Info note */}
            {note && (
                <div className="flex gap-2 items-start ">
                    <IoIosInformationCircleOutline className="w-5 h-5 md:w-6 md:h-6 text-input" />
                    <p className="text-sm sm:text-base text-input">{note}</p>
                </div>
            )}

            {/* Buttons */}
            <ActionButtons
                onAction={onAction}
                onCancel={onCancel}
                actionText={actionText}
                cancelText={cancelText}
                isDisabled={isDisabled}
            />
        </div>
    );
}
