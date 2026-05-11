'use client';

import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTranslations } from "next-intl";
import { Department } from "@/types/company";
import { resolveUrl } from "@/utils/upload";
import NavigationButtons from "@/components/atoms/NavigationButtons";
import Image from "next/image";
import ImageAlt from "@/components/atoms/ImageAlt";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AboutDepartmentsProps {
    departments: Department[];
    isArabic: boolean;
}

interface DepartmentSectionProps {
    imageSrc: string;
    title: string;
    title_en: string;
    text: string;
    isArabic: boolean;
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────

function EmptyDepartments({ t }: { t: ReturnType<typeof useTranslations> }) {
    return (
        <div
            role="status"
            aria-label={t("noDepartmentsAvailable")}
            className="flex flex-col items-center justify-center gap-6 py-20 px-8 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60"
        >
            {/* Icon */}
            <div
                className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center"
                aria-hidden="true"
            >
                <svg
                    className="w-8 h-8 text-primary/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                </svg>
            </div>

            {/* Text */}
            <div className="text-center">
                <p className="text-secondary font-semibold text-base">
                    {t("noDepartmentsTitle")}
                </p>
                <p className="text-gray-400 text-sm mt-1 max-w-xs">
                    {t("noDepartmentsDescription")}
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Department Slide
// ─────────────────────────────────────────────

function DepartmentSection({
    imageSrc,
    title,
    title_en,
    text,
    isArabic,
}: DepartmentSectionProps) {
    return (
        <article 
            className="flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl overflow-hidden bg-white shadow-[0_4px_40px_-8px_rgba(0,0,0,0.10)] border border-gray-100/80 transition-shadow duration-300 hover:shadow-[0_8px_56px_-12px_rgba(0,0,0,0.16)]"
        >
            {/* ── Image Panel ── */}
            <div className="relative w-full lg:w-[46%] shrink-0 aspect-[4/3] lg:aspect-auto lg:min-h-[420px] overflow-hidden">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 46vw"
                        priority={false}
                    />
                ) : (
                    <ImageAlt title={title_en} />
                )}

                {/* Gradient overlay — stronger at bottom */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                />

                {/* Department badge */}
                <div
                    className={`absolute bottom-5 ${isArabic ? "right-5" : "left-5"}`}
                >
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-white/80 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                        {title}
                    </span>
                </div>
            </div>

            {/* ── Content Panel ── */}
            <div className="flex-1 flex flex-col justify-center px-7 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
                {/* Accent bar */}
                <div
                    className={`h-[3px] w-12 bg-primary rounded-full mb-6 ${isArabic ? "mr-0 ml-auto lg:ml-0" : ""}`}
                    aria-hidden="true"
                />

                {/* Title */}
                <h3
                    className={`text-secondary text-2xl md:text-3xl font-bold leading-snug mb-5 ${isArabic ? "text-right font-arabic" : "text-left"}`}
                >
                    {title}
                </h3>

                {/* Divider */}
                <div
                    className="w-full h-px bg-gray-100 mb-6"
                    aria-hidden="true"
                />

                {/* Description */}
                <p
                    className={`text-gray-500 text-base md:text-[17px] leading-[1.85] ${isArabic ? "text-right font-arabic" : "text-left"}`}
                >
                    {text}
                </p>
            </div>
        </article>
    );
}

// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────

function SectionHeader({
    t,
    isArabic,
}: {
    t: ReturnType<typeof useTranslations>;
    isArabic: boolean;
}) {
    return (
        <header
            className={`flex flex-col gap-3 mb-10  `}
        >
            {/* Eyebrow label */}
            <div className="flex items-center gap-2.5">
                <div
                    className="h-[3px] w-8 bg-primary rounded-full"
                    aria-hidden="true"
                />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {t("sectionLabel")}
                </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl text-secondary leading-tight">
                <span className="font-light">{t("meetOur")}</span>{" "}
                <span className="font-extrabold">{t("department")}</span>
            </h2>
        </header>
    );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function AboutDepartments({
    departments,
    isArabic,
}: AboutDepartmentsProps) {
    const t = useTranslations("about");

    const getLocalizedText = (en: string, ar: string) =>
        isArabic ? ar : en;

    return (
        <section 
            className="relative mb-16"
            data-aos="fade-up"
            aria-labelledby="departments-heading"
        >
            {/* Subtle background mesh */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -inset-x-8 h-[420px] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(var(--color-primary-rgb),0.06),transparent)] -z-10"
            />

            {/* Header */}
            <SectionHeader t={t} isArabic={isArabic} />

            {/* Empty state */}
            {(!departments || departments.length === 0) ? (
                <EmptyDepartments t={t} />
            ) : (
                <>
                    {/* Slider */}
                    <div className="group">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            slidesPerView={1}
                            speed={700}
                            autoplay={{
                                delay: 5500,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true,
                            }}
                            navigation={{
                                nextEl: ".dept-next",
                                prevEl: ".dept-prev",
                            }}
                            pagination={{
                                clickable: true,
                                el: ".dept-pagination",
                                bulletClass:
                                    "dept-bullet inline-block h-[3px] w-5 bg-gray-200 rounded-full cursor-pointer transition-all duration-400",
                                bulletActiveClass:
                                    "!bg-primary !w-9",
                            }} 
                            spaceBetween={0}
                            className="w-full !pb-0"
                        >
                            {departments.map((item) => (
                                <SwiperSlide key={item.id}>
                                    <DepartmentSection
                                        imageSrc={resolveUrl(item.imagePath)}
                                        title={getLocalizedText(
                                            item.title_en,
                                            item.title_ar
                                        )}
                                        title_en={item.title_en}
                                        text={getLocalizedText(
                                            item.description_en,
                                            item.description_ar
                                        )}
                                        isArabic={isArabic}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Controls row */}
                    <div
                        className={`flex items-center mt-6 gap-4 ${isArabic ? "flex-row-reverse justify-start" : "justify-between"}`}
                    >
                        {/* Pagination pills */}
                        <div
                            className="dept-pagination flex items-center gap-2"
                            role="tablist"
                            aria-label={t("slideNavigation")}
                        />

                        {/* Prev / Next buttons */}
                        <NavigationButtons
                            prevClassName="dept-prev"
                            nextClassName="dept-next"
                        />
                    </div>
                </>
            )}
        </section>
    );
}