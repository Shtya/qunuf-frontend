'use client'
import { useTranslations } from 'next-intl';
import { useDashboardHref } from '@/hooks/dashboard/useDashboardHref';
import BreadcrumbsHeader from '@/components/atoms/BreadcrumbsHeader';
import SettingsCard from '../settings/SettingsCard';
import SavedPaymentMethods from './SavedPaymentMethods';
import { RiFundsBoxLine } from 'react-icons/ri';
import { MdOutlinePayment } from 'react-icons/md';

type TabKey = 'accounts' | 'transactions';


export default function Payments() {
    const t = useTranslations('dashboard.payments');
    const { getHref } = useDashboardHref();
    return (
        <div>
            <BreadcrumbsHeader
                title={t('title')}
                breadcrumbs={[
                    { label: t('accountSettings'), href: getHref('settings') },
                    { label: t('title') },
                ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">

                <div className="col-span-1 sm:col-span-6">

                    <SettingsCard
                        title={t('totalEarnings')}
                        description="$430.00"
                        icon={RiFundsBoxLine}

                    />
                </div>
                <div className="col-span-1 sm:col-span-6">
                    <SettingsCard
                        title={t('pendingPayments')}
                        description="$100.00"
                        icon={MdOutlinePayment}
                    />
                </div>

                <SavedPaymentMethods />
            </div>
        </div>
    );
}