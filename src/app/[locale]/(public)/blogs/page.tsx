import RecentBlogs from "@/components/pages/blogs/RecentBlogs";
import PageHeroSection from "@/components/atoms/PageHeroSection";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("blogs.hero");
    return {
        title: t("title"), // 👈 localized title
    };
}
export default async function BlogsPage() {
    const t = await getTranslations('blogs.hero');


    return (
        <section
            id="blogs"
            className="relative overflow-hidden">
            <PageHeroSection
                title={t('title')}
                description={t('description')}
                buttonText={t('seeMore')}
            />
            <RecentBlogs />
        </section>
    );
}