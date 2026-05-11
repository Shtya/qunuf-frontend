import SecondaryButton from "@/components/atoms/buttons/SecondaryButton";

interface FormActionsProps {
    onConfirm?: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isDisabled?: boolean;
    type?: 'button' | 'submit'; // Add type prop
}

export default function FormActions({
    onConfirm,
    onCancel,
    confirmLabel = 'Book Now',
    cancelLabel = 'Cancel',
    isDisabled = false,
    type = 'button',
}: FormActionsProps) {
    return (
        <div className="flex flex-wrap justify-center gap-4 ">
            {type === 'submit' ? (
                <button
                    type="submit"
                    disabled={isDisabled}
                    className="bg-secondary hover:bg-secondary-hover text-white py-2 lg:py-3 w-full sm:w-[323px] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                    {confirmLabel}
                </button>
            ) : (
                <SecondaryButton
                    onClick={onConfirm}
                    className="bg-secondary hover:bg-secondary-hover text-white py-2 lg:py-3 w-full sm:w-[323px]"
                    disabled={isDisabled}
                >
                    {confirmLabel}
                </SecondaryButton>
            )}

            <SecondaryButton
                onClick={onCancel}
                className="bg-[#F5F6F8] hover:bg-[#E9EAEC] text-[#B3B3B3] py-2 lg:py-3 w-full sm:w-[323px]"
            >
                {cancelLabel}
            </SecondaryButton>
        </div>
    );
}
