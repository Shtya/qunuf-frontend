import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import api from "@/libs/axios";
import PageHeroSection from "@/components/atoms/PageHeroSection";
import NoData from "@/components/atoms/NoData";
import RichTextRenderer from "@/components/molecules/forms/editor/RichTextRenderer";
import LegalSkeleton from "@/components/atoms/LegalSkeleton";

async function getTermsData() {
    try {
        const res = await api.get('/settings/public');
        return res.data;
    } catch (error) {
        console.error("Failed to fetch Terms:", error);
        return null;
    }
}

export async function generateMetadata() {
    const t = await getTranslations("footer.company");
    return { title: t("terms") };
}

export default async function TermsPage() {
    const t = await getTranslations('footer.company');
    const locale = await getLocale();
    const data = await getTermsData();

    const terms = locale === 'ar' ? data?.termsOfService_ar : data?.termsOfService_en;

    return (
        <section id="terms-of-service" className="relative overflow-hidden">
            <PageHeroSection
                title={t('terms')}
                description={t('termsDescription')}
                buttonText={t('seeMore')}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[400px]">
                {terms ? (
                    <div
                        className="prose text-lg prose-lg max-w-none text-dark whitespace-break-spaces"
                    >
                        <RichTextRenderer
                            content={terms}
                            className="text-lg leading-loose text-dark"
                            loader={<LegalSkeleton />}
                        />
                    </div>
                ) : (
                    <NoData
                        title={t('empty.title')}
                        description={t('empty.description')}
                    />
                )}
            </div>
        </section>
    );
}