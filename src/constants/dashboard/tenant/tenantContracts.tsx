
import ContractViewer from '@/components/dashboard/ContractViewer';
import { PropertyCell } from '@/components/molecules/properties/PropertyCell';
import { TenantContractRow } from '@/types/dashboard/tenant';
import { ContractStatus } from '@/types/global';
import { TableColumnType } from '@/types/table';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';


export const TenantContractColumns = (t: ReturnType<typeof useTranslations>): TableColumnType<TenantContractRow>[] => [
    {
        key: 'property',
        label: t('property'),
        cell(value) {
            return <PropertyCell {...value} />;
        }
    },
    {
        key: 'status',
        label: t('status'),
        cell(value) {
            const isFree = value as ContractStatus === 'free';
            return (
                <div className="relative">
                    <div>
                        {isFree ? (
                            <div className="bg-[#ECFDF3] text-[#027A48] flex items-center gap-1 rounded-[16px] w-fit px-2">
                                <div className="w-[6px] h-[6px] bg-[#027A48] rounded-full"></div>
                                <span>{t('free')}</span>
                            </div>
                        ) : (
                            <div className="bg-[#ECFDF3] text-[#FF5F57] flex items-center gap-1 rounded-[16px] w-fit px-2">
                                <div className="w-[6px] h-[6px] bg-[#FF5F57] rounded-full"></div>
                                <span>{t('reserved')}</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    },
    {
        key: 'startDate',
        label: t('startBooking'),
        cell: (value) => format(new Date(value), 'dd MMM yyyy')
    },
    {
        key: 'endDate',
        label: t('endBooking'),
        cell: (value) => format(new Date(value), 'dd MMM yyyy')
    },
    {
        key: 'publishedAt',
        label: t('published'),
        cell: (value) => format(new Date(value), 'dd MMM yyyy')
    },
    {
        key: 'price',
        label: t('price'),
        cell: (value) => `${value.toLocaleString()} $`
    },
    {
        key: 'contract',
        label: t('contract'),
        cell: (value) => (
            <ContractViewer images={value as { src: string; alt?: string }[]} />
        )
    },
    {
        key: 'location',
        label: t('location')
    }
];
