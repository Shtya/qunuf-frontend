import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import api from "@/libs/axios";
import PageHeroSection from "@/components/atoms/PageHeroSection";
import NoData from "@/components/atoms/NoData";
import RichTextRenderer from "@/components/molecules/forms/editor/RichTextRenderer";
import LegalSkeleton from "@/components/atoms/LegalSkeleton";

async function getPrivacyData() {
    try {
        const res = await api.get('/settings/public');
        return res.data;
    } catch (error) {
        console.error("Failed to fetch Privacy Policy:", error);
        return null;
    }
}

export async function generateMetadata() {
    const t = await getTranslations("footer.company");
    return { title: t("privacy") };
}

export default async function PrivacyPage() {
    const t = await getTranslations('footer.company');
    const locale = await getLocale();
    const data = await getPrivacyData();

    // Mapping to privacyPolicy fields
    const privacyContent = locale === 'ar' ? data?.privacyPolicy_ar : data?.privacyPolicy_en;

    return (
        <section id="privacy-policy" className="relative overflow-hidden">
            <PageHeroSection
                title={t('privacy')}
                description={t('privacyDescription')}
                buttonText={t('seeMore')}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[400px]">
                {privacyContent ? (
                    <div
                        className="prose text-lg prose-lg max-w-none text-dark whitespace-break-spaces"
                    >
                        <RichTextRenderer
                            content={privacyContent}
                            className="text-lg leading-loose text-dark"
                            loader={<div>
                                <LegalSkeleton />
                            </div>}
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