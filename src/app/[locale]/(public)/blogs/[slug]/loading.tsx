import { BlogCardSkeleton } from "@/components/pages/blogs/RecentBlogs";
import PageHeader from "@/components/atoms/PageHeader";
import PageHeroSection from "@/components/atoms/PageHeroSection";
import { getTranslations } from "next-intl/server";


export default async function LoadingBlog() {
    const t = await getTranslations('blogs');
    return (
        <section
            className="relative overflow-hidden">
            <PageHeroSection
                title={t('blog')}
                description={t('hero.description')}
                buttonText={t('hero.seeMore')}
            />

            <div className="bg-highlight pb-20 sm:pb-26 lg:pb-32 px-2">
                <div className="container">
                    <PageHeader title={t('blogs')} className="bg-highlight" />
                    <BlogCardSkeleton list />
                    <h1 className="font-bold text-3xl md:text-4xl lg:text-[50px] mb-3 text-secondary">
                        {t('our')} <span className="text-black">{t('recentBlogs')}</span>
                    </h1>

                    {/* Cursor paginated blogs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 mt-6 justify-center mx-4">
                        {Array.from({ length: 4 }).map((_, i) => <BlogCardSkeleton key={i} />)}

                    </div>
                </div>
            </div>
        </section>
    );
}

