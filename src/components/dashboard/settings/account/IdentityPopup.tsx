'use client'
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import TextInput from '@/components/molecules/forms/TextInput';
import SelectField from '@/components/molecules/forms/SelectField';
import { User } from '@/types/dashboard/user';
import PopupActionButtons from './PopupActionButtons';
import { useValues } from '@/contexts/GlobalContext';
import { Option } from '@/components/molecules/forms/SelectInput';
import { IdentityType } from '@/types/global';
import FormErrorMessage from '@/components/molecules/forms/FormErrorMessage';

interface IdentityProps {
    user: User;
    onSave: (form: any) => void;
    errors: Record<string, string>;
    close: () => void;
    isLoading: boolean;
}
export function IdentityPopup({ user, onSave, close, isLoading, errors }: IdentityProps) {
    const t = useTranslations('dashboard.account');
    const locale = useLocale();
    const { countries, loadingCountries } = useValues();
    const [form, setForm] = useState({
        identityType: user?.identityType || 'national_id',
        identityNumber: user?.identityNumber || '',
        identityIssueCountryId: user?.identityIssueCountry?.id || '',
        identityOtherType: user?.identityOtherType || '',
    });
    const options: Option[] = useMemo(
        () =>
            countries.map((c) => ({
                value: c.id,
                label: locale === 'ar' ? c.name_ar : c.name,
            })),
        [countries, locale]
    );


    const identityOptions: Option[] = useMemo(
        () =>
            [
                { label: t(`identityTypeGroup.${IdentityType.NATIONAL_ID}`), value: IdentityType.NATIONAL_ID },
                { label: t(`identityTypeGroup.${IdentityType.RESIDENCY}`), value: IdentityType.RESIDENCY },
                { label: t(`identityTypeGroup.${IdentityType.PREMIUM_RESIDENCY}`), value: IdentityType.PREMIUM_RESIDENCY },
                { label: t(`identityTypeGroup.${IdentityType.GCC_ID}`), value: IdentityType.GCC_ID },
                { label: t(`identityTypeGroup.${IdentityType.PASSPORT}`), value: IdentityType.PASSPORT },
                { label: t(`identityTypeGroup.${IdentityType.OTHER}`), value: IdentityType.OTHER }
            ],
        [countries, locale]
    );

    const selectedyIssueCountryId = useMemo(
        () => options.find((o) => o.value === form.identityIssueCountryId) ?? null,
        [options, form.identityIssueCountryId]
    );


    useEffect(() => {
        setForm({
            identityType: user?.identityType || 'national_id',
            identityNumber: user?.identityNumber || '',
            identityIssueCountryId: user?.identityIssueCountry?.id || '',
            identityOtherType: user?.identityOtherType || '',
        });
    }, [user]);



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        onSave(form)
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                    label={t('identityType')}
                    placeholder={t('placeholders.identityType')}
                    options={identityOptions}
                    value={identityOptions.find(o => o.value === form.identityType)}
                    onChange={(opt) => setForm({ ...form, identityType: opt.value.toString() })}
                />
                <FormErrorMessage message={errors.identityType ? t(errors.identityType) : ""} />
                <TextInput
                    error={errors.identityNumber ? t(errors.identityNumber) : ''}
                    type='text'
                    label={t('identityNumber')}
                    placeholder={t('placeholders.identityType')}
                    value={form.identityNumber}
                    onChange={(e) => setForm({ ...form, identityNumber: e.target.value })}
                />
            </div>

            {form.identityType === IdentityType.OTHER && <TextInput
                error={errors.identityOtherType ? t(errors.identityOtherType) : ''}
                type='text'
                label={t('identityOtherType')}
                placeholder={t('placeholders.identityOtherType')}
                value={form.identityOtherType}
                onChange={(e) => setForm({ ...form, identityOtherType: e.target.value })}
            />}

            <SelectField
                label={t('identityIssueCountry')}
                dropdownClassName="!max-h-[300px]"
                options={options}
                value={selectedyIssueCountryId}
                placeholder={
                    loadingCountries ? t('loading') : t('selectNationality')
                }
                onChange={(opt) => setForm({ ...form, identityIssueCountryId: opt.value.toString() })}
            />
            <FormErrorMessage message={errors.identityIssueCountry ? t(errors.identityIssueCountry) : ""} />

            <PopupActionButtons
                onCancel={close}
                isLoading={isLoading}
            />
        </form>
    );
}