'use client';

import { useTranslations } from 'next-intl';
import TextInput from '@/components/molecules/forms/TextInput';

type MaxPriceFilterProps = {
    value?: string;
    onChange: (val: string | undefined) => void;
};

export default function MaxPriceFilter({ value, onChange }: MaxPriceFilterProps) {
    const t = useTranslations('dashboard.contracts.table.filters');

    return (
        <div className="w-full lg:w-fit">
            <TextInput
                type="number"
                // label={t('maxPrice')}
                value={value || ''}
                onChange={(e) => {
                    const val = e.target.value;
                    onChange(val === '' ? undefined : val);
                }}
                placeholder={t('maxPricePlaceholder')}
                className=''
                min={0}
            />
        </div>
    );
}

