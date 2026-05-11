import TextInput from "@/components/molecules/forms/TextInput";
import { useTranslations } from "next-intl";
import { useState } from "react";
import PopupActionButtons from "./PopupActionButtons";

interface AddressProps {
    initialData: string; // Now just a string
    errors: Record<string, string>;
    onSave: (val: string) => void;
    close: () => void;
    isLoading: boolean;
}

export default function ShortAddressPopup({ initialData, onSave, close, isLoading, errors }: AddressProps) {
    const t = useTranslations('dashboard.account');
    const [shortAddress, setShortAddress] = useState(initialData || '');

    const handleSubmit = (e: React.FormEvent) => {
        if (isLoading) return;
        e.preventDefault();
        // Send the string back to handleUpdate
        onSave(shortAddress);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 min-w-[300px]">
            <TextInput
                error={errors.shortAddress ? t(errors.shortAddress) : ''}
                type='text'
                label={t('shortAddress')}
                placeholder="e.g. RRRR1234"
                value={shortAddress}
                onChange={(e) => setShortAddress(e.target.value.toUpperCase())}
            />


            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
            />
        </form>
    );
}