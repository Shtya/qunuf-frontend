import SecondaryButton from "./buttons/SecondaryButton";

interface ActionButtonsProps {
    onAction: () => void;
    onCancel?: () => void;
    actionText: string;
    cancelText?: string;
    isDisabled?: boolean;
    className?: string; // optional wrapper class
}

export default function ActionButtons({
    onAction,
    onCancel,
    actionText,
    cancelText = 'Cancel',
    isDisabled = false,
    className = '',
}: ActionButtonsProps) {
    return (
        <div className={`flex flex-col sm:flex-row gap-3 sm:gap-2 items-center mt-6  text-nowrap ${className}`}>
            {onCancel && (
                <SecondaryButton
                    className="border border-gray-500 text-gray-700 w-full sm:w-auto sm:flex-1 max-w-[320px]"
                    onClick={onCancel}
                >
                    {cancelText}
                </SecondaryButton>
            )}
            <SecondaryButton
                className="bg-secondary hover:bg-secondary-hover text-white w-full sm:w-auto sm:flex-1 max-w-[320px]"
                onClick={onAction}
                disabled={isDisabled}
            >
                {actionText}
            </SecondaryButton>
        </div>
    );
}
