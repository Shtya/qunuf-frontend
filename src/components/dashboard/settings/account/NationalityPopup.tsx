'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useValues } from '@/contexts/GlobalContext';
import PopupActionButtons from './PopupActionButtons';
import { Option } from '@/components/molecules/forms/SelectInput';
import SelectField from '@/components/molecules/forms/SelectField';
import FormErrorMessage from '@/components/molecules/forms/FormErrorMessage';

interface Props {
    value?: string | null; // nationalityId
    error?: string;
    isLoading: boolean;
    onSave: (countryId: string) => void;
    close: () => void;
}

export function NationalityPopup({ value, error, isLoading, onSave, close }: Props) {
    const t = useTranslations('dashboard.account');
    const locale = useLocale();
    const { countries, loadingCountries } = useValues();

    const options: Option[] = useMemo(
        () =>
            countries.map((c) => ({
                value: c.id,
                label: locale === 'ar' ? c.name_ar : c.name,
            })),
        [countries, locale]
    );

    const selectedOption = useMemo(
        () => options.find((o) => o.value === value) ?? null,
        [options, value]
    );

    const [selected, setSelected] = useState<Option | null>(selectedOption);

    useEffect(() => {
        setSelected(selectedOption);
    }, [selectedOption]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        onSave(selected.value.toString());
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <SelectField
                label={t('nationality')}
                dropdownClassName="!max-h-[300px]"
                options={options}
                value={selected}
                onChange={setSelected}
                placeholder={
                    loadingCountries ? t('loading') : t('selectNationality')
                }
                className="w-full"
            />

            <FormErrorMessage message={error ? t(error) : ""} />
            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
            />
        </form>
    );
}
