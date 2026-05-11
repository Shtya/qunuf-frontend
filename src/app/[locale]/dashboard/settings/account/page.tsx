'use client'

import Account from "@/components/dashboard/settings/account/Account";
import BreadcrumbsHeader from "@/components/atoms/BreadcrumbsHeader";
import { useDashboardHref } from "@/hooks/dashboard/useDashboardHref";
import { useTranslations } from "next-intl";

 
export default function AccountPage() {
    const t = useTranslations('dashboard.account');
    const { getHref } = useDashboardHref();

    return (
        <>
            <BreadcrumbsHeader title={t('title')} breadcrumbs={[
                { label: t('accountSettings'), href: getHref('settings') },
                { label: t('title') }]} />

            <Account />
        </>
    );
}
