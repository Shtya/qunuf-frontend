'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import KeywordSearch from './KeywordSearch';
import { updateUrlParams } from '@/utils/helpers';
import { useTranslations } from 'next-intl';

type Props = {
    value: string;
    onChange: (val: string) => void;
    searchPlaceholder?: string;
    className?: string;
    variant?: 'default' | 'minimal';
};

export default function SearchField({ value, onChange, searchPlaceholder, className, variant }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations('comman');

    const { debouncedValue } = useDebounce({ value });

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentSearch = params.get('search') || '';

        if (debouncedValue.trim() !== currentSearch) {
            if (debouncedValue.trim()) {
                params.set('search', debouncedValue.trim());
            } else {
                params.delete('search');
            }

            // Sync URL without refreshing the whole page
            const newUrl = `${pathname}?${params.toString()}`;
            router.replace(newUrl, { scroll: false });
        }
    }, [debouncedValue, pathname, router, searchParams]);

    return (
        <KeywordSearch
            value={value}
            onChange={onChange}
            searchPlaceholder={searchPlaceholder ?? t('search')}
            className={className}
        />
    );
}