import PageHeroSection from "@/components/atoms/PageHeroSection";
import { getTranslations } from "next-intl/server";

export default async function LoadingProperty() {
    const tHero = await getTranslations("property.hero");
    const tDetails = await getTranslations("property.details");

    return (
        <section className="relative overflow-hidden">
            <PageHeroSection
                title={tHero("title")}
                description={tHero("description")}
                buttonText={tHero("seeMore")}
            />

            <div className="bg-highlight pb-20 sm:pb-26 lg:pb-32 px-2">
                <div className="container">
                    {/* Header skeleton */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 lg:p-10 mb-6 shadow-xs border border-gray-100 animate-pulse">
                        <div className="space-y-4">
                            <div className="h-8 sm:h-10 w-2/3 bg-gray-200 rounded" />
                            <div className="h-4 w-1/2 bg-gray-200 rounded" />
                            <div className="h-4 w-1/3 bg-gray-100 rounded" />
                        </div>
                    </div>

                    {/* Quick info + booking skeleton */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 p-4 bg-white rounded-xl shadow-xs border border-gray-100 animate-pulse">
                        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                            <div className="h-10 w-32 bg-gray-200 rounded-full" />
                            <div className="h-10 w-32 bg-gray-200 rounded-full" />
                            <div className="h-10 w-32 bg-gray-200 rounded-full" />
                        </div>
                        <div className="h-11 w-full sm:w-40 bg-secondary/60 rounded-[12px]" />
                    </div>

                    {/* Gallery skeleton */}
                    <div className="mb-8 animate-pulse">
                        <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200 rounded-2xl" />
                    </div>

                    {/* Sections skeleton */}
                    <div className="space-y-6 animate-pulse">
                        {/* Description */}
                        <div>
                            <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-100 rounded" />
                                <div className="h-4 w-11/12 bg-gray-100 rounded" />
                                <div className="h-4 w-10/12 bg-gray-100 rounded" />
                            </div>
                        </div>

                        {/* Details grid */}
                        <div>
                            <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-gray-100 rounded-lg border border-gray-100"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
                            <div className="flex flex-wrap gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-8 w-24 bg-gray-100 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Map & nearby skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="h-6 w-32 bg-gray-200 rounded" />
                                <div className="h-48 bg-gray-100 rounded-xl" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-6 w-32 bg-gray-200 rounded" />
                                <div className="space-y-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-10 bg-gray-100 rounded-lg"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}


