import SecondaryButton from "@/components/atoms/buttons/SecondaryButton";
import SelectField from "@/components/molecules/forms/SelectField";
import SelectInput, { Option } from "@/components/molecules/forms/SelectInput";
import TextInput from "@/components/molecules/forms/TextInput";
import { useValues } from "@/contexts/GlobalContext";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import PopupActionButtons from "./PopupActionButtons";
import FormErrorMessage from "@/components/molecules/forms/FormErrorMessage";

interface AddressProps {
    initialData: {
        city: string;
        streetName: string;
        buildingNumber: string;
        stateId: string;
        postalCode?: string;
        additionalNumber?: string;
    };
    errors: Record<string, string>;
    onSave: (form: any) => void;
    close: () => void;
    isLoading: boolean;
}
export default function AddressPopup({ initialData, onSave, close, isLoading, errors }: AddressProps) {
    const { states, loadingStates } = useValues();
    const locale = useLocale();
    const options: Option[] = useMemo(
        () =>
            states.map((s) => ({
                value: s.id,
                label: locale === 'ar' ? s.name_ar : s.name,
            })),
        [states, locale]
    );
    const t = useTranslations('dashboard.account');
    const [form, setForm] = useState({
        city: initialData?.city || '',
        streetName: initialData?.streetName || '',
        buildingNumber: initialData?.buildingNumber || '',
        postalCode: initialData?.postalCode || '',
        stateId: initialData?.stateId || '',
        additionalNumber: initialData?.additionalNumber || '',
    });

    useEffect(() => {
        setForm({
            city: initialData?.city || '',
            streetName: initialData?.streetName || '',
            buildingNumber: initialData?.buildingNumber || '',
            postalCode: initialData?.postalCode || '',
            stateId: initialData?.stateId || '',
            additionalNumber: initialData?.additionalNumber || '',
        });
    }, [initialData]);


    const selectedOption = useMemo(
        () => options.find((o) => o.value === form.stateId) ?? null,
        [options, form.stateId]
    );

    const handleSubmit = (e: React.FormEvent) => {
        if (isLoading) return;
        e.preventDefault(); // prevent page reload
        onSave(form)
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <TextInput error={errors['address.buildingNumber'] ? t(errors['address.buildingNumber']) : ''} type='text' label={t('buildingNumber')} placeholder={t('placeholders.address.buildingNumber')} value={form.buildingNumber} onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })} />
                <TextInput error={errors['address.streetName'] ? t(errors['address.streetName']) : ''} type='text' label={t('streetName')} placeholder={t('placeholders.address.streetName')} value={form.streetName} onChange={(e) => setForm({ ...form, streetName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <TextInput error={errors['address.postalCode'] ? t(errors['address.postalCode']) : ''} type='text' label={t('postalCode')} placeholder={t('placeholders.address.postalCode')} value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                <TextInput error={errors['address.additionalNumber'] ? t(errors['address.additionalNumber']) : ''} type='text' label={t('additionalNumber')} placeholder={t('placeholders.address.additionalNumber')} value={form.additionalNumber} onChange={(e) => setForm({ ...form, additionalNumber: e.target.value })} />
            </div>
            <SelectField
                dropdownClassName="!max-h-[300px]"
                label={t('state')}
                options={options}
                placeholder={
                    loadingStates ? t('loading') : t('selectState')
                }
                value={selectedOption}
                onChange={(opt) => setForm({ ...form, stateId: opt.value.toString() })}
            />
            <FormErrorMessage message={errors['address.state'] ? t(errors['address.state']) : ""} />
            <TextInput error={errors['address.city'] ? t(errors['address.city']) : ''} type='text' label={t('city')} placeholder={t('placeholders.address.city')} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
            />
        </form>
    );
}