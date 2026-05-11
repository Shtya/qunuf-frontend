'use client';

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Team } from "@/types/company";
import { resolveUrl } from "@/utils/upload";
import NavigationButtons from "@/components/atoms/NavigationButtons";
import ImageAlt from "@/components/atoms/ImageAlt";
import Image from "next/image";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface TeamSectionProps {
    teams: Team[];
    locale: string;
    isArabic: boolean;
}

interface TeamMemberCardProps {
    imageSrc: string;
    name: string;
    job: string;
    description: string;
    index: number;
    isArabic: boolean;
}

// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────

function TeamHeader({
    t,
    isArabic,
}: {
    t: ReturnType<typeof useTranslations>;
    isArabic: boolean;
}) {
    return (
        <header
            dir={isArabic ? "rtl" : "ltr"}
            className="text-center mb-12 md:mb-16 px-4"
        >
            {/* Eyebrow */}
            <p className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-5">
                <span
                    aria-hidden="true"
                    className="inline-block h-px w-6 bg-primary align-middle"
                />
                {t("yourHostsAndGuides")}
                <span
                    aria-hidden="true"
                    className="inline-block h-px w-6 bg-primary align-middle"
                />
            </p>

            {/* Headline */}
            <h2 className="leading-none">
                <span className="block font-['Playfair_Display'] font-normal text-4xl sm:text-5xl lg:text-6xl text-secondary">
                    {t("meetYour")}
                </span>
                <span className="block font-['Playfair_Display'] font-extrabold italic text-4xl sm:text-5xl lg:text-[4.25rem] text-primary mt-1">
                    {t("facilitators")}
                </span>
            </h2>
        </header>
    );
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────

function EmptyTeam({ t }: { t: ReturnType<typeof useTranslations> }) {
    return (
        <div
            role="status"
            className="flex flex-col items-center justify-center gap-5 py-20 px-8 rounded-3xl border border-dashed border-gray-200 bg-gray-50/50"
        >
            <div
                aria-hidden="true"
                className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center"
            >
                <svg
                    className="w-7 h-7 text-primary/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                </svg>
            </div>
            <div className="text-center">
                <p className="text-secondary font-semibold text-sm">
                    {t("noTeamsTitle")}
                </p>
                <p className="text-gray-400 text-xs mt-1 max-w-xs">
                    {t("noTeamsDescription")}
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Team Member Card
// ─────────────────────────────────────────────

function TeamMemberCard({
    imageSrc,
    name,
    job,
    description,
    index,
    isArabic,
}: TeamMemberCardProps) {
    const ordinal = String(index + 1).padStart(2, "0");

    return (
        <article
            dir={isArabic ? "rtl" : "ltr"}
            className="group flex flex-col w-full rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-[0_2px_20px_-6px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.16)] transition-all duration-500 hover:-translate-y-1"
        >
            {/* Image */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 shrink-0">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={name}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                ) : (
                    <ImageAlt title={name} />
                )}

                {/* Gradient overlay */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"
                />

                {/* Ordinal counter */}
                <div
                    aria-hidden="true"
                    className={`absolute top-4 ${isArabic ? "left-4" : "right-4"}`}
                >
                    <span className="font-['Playfair_Display'] italic text-white/50 text-3xl font-bold leading-none select-none">
                        {ordinal}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className={`flex flex-col flex-1 px-6 py-6 ${isArabic ? "items-end text-right" : "items-start text-left"}`}>
                {/* Accent bar */}
                <div
                    aria-hidden="true"
                    className="h-[2px] w-8 bg-primary rounded-full mb-4 origin-left group-hover:w-14 transition-all duration-500"
                />

                {/* Name */}
                <h3 className="font-['Playfair_Display'] font-normal text-2xl md:text-3xl leading-tight text-secondary mb-3">
                    {name}
                </h3>

                {/* Job badge */}
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
                    {job}
                </span>

                {/* Divider */}
                <div
                    aria-hidden="true"
                    className="w-full h-px bg-gray-100 mb-4"
                />

                {/* Description */}
                <p className="text-sm md:text-[15px] leading-relaxed text-gray-500 line-clamp-4">
                    {description}
                </p>
            </div>
        </article>
    );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function TeamSection({ teams, locale, isArabic }: TeamSectionProps) {
    const [perView, setPerView] = useState(1);
    const [activeIndex, setActiveIndex] = useState(0);

    const t = useTranslations("about");

    const getLocalizedText = (en: string, ar: string) =>
        isArabic ? ar : en;

    return (
        <section
            className="about-team relative bg-white py-16 md:py-24 overflow-hidden"
            data-aos="fade-up"
            aria-labelledby="team-heading"
        >
            {/* Subtle background radial */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(var(--color-primary-rgb),0.05),transparent)] -z-10"
            />

            {/* Header */}
            <TeamHeader t={t} isArabic={isArabic} />

            {/* Empty state */}
            {(!teams || teams.length === 0) ? (
                <div className="max-w-2xl mx-auto px-4">
                    <EmptyTeam t={t} />
                </div>
            ) : (
                <div
                    dir={isArabic ? "rtl" : "ltr"}
                    className="relative max-w-7xl mx-auto px-4"
                >
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={24}
                        navigation={{
                            nextEl: ".team-next",
                            prevEl: ".team-prev",
                        }}
                        breakpoints={{
                            0: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1280: { slidesPerView: 3 },
                        }}
                        dir={isArabic ? "rtl" : "ltr"}
                        className="!pb-2"
                        onSlideChange={(swiper) => {
                            const pv = swiper.params.slidesPerView as number;
                            setPerView(pv);
                            setActiveIndex(swiper.realIndex);
                        }}
                    >
                        {teams.map((member, idx) => (
                            <SwiperSlide key={member.id}>
                                <TeamMemberCard
                                    imageSrc={resolveUrl(member.imagePath)}
                                    name={member.name}
                                    job={member.job}
                                    description={getLocalizedText(
                                        member.description_en,
                                        member.description_ar
                                    )}
                                    index={idx}
                                    isArabic={isArabic}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation */}
                    <div
                        className={`flex mt-8 ${isArabic ? "justify-start flex-row-reverse" : "justify-end"}`}
                    >
                        <NavigationButtons
                            prevClassName="team-prev"
                            nextClassName="team-next"
                        />
                    </div>
                </div>
            )}
        </section>
    );
}