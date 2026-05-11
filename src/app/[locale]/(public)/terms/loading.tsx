import React from "react";
import { getTranslations } from "next-intl/server";
import PageHeroSection from "@/components/atoms/PageHeroSection";
import LegalSkeleton from "@/components/atoms/LegalSkeleton";


export default async function LoadingTerms() {
    const t = await getTranslations('footer.company');

    return (
        <section className="relative overflow-hidden">
            <PageHeroSection
                title={t('terms')}
                description={t('termsDescription')}
                buttonText={t('seeMore')}
            />

            <div className="bg-white">
                <LegalSkeleton />
            </div>
        </section>
    );
}