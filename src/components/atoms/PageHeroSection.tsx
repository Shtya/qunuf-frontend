'use client';

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PageHeroSectionProps {
    title: string;
    description?: string;
    buttonText?: string;
    buttonHref?: string;
    imageSrc?: string;
    onButtonClick?: () => void;
}

// ─────────────────────────────────────────────
// Arrow Icon (RTL-aware)
// ─────────────────────────────────────────────

function ArrowIcon() {
    return (
        <svg
            className="relative z-10 w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 rtl:group-hover:translate-x-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
        </svg>
    );
}

// ─────────────────────────────────────────────
// CTA Button
// ─────────────────────────────────────────────

interface CtaButtonProps {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function CtaButton({ label, onClick }: CtaButtonProps) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={cn(
                "group relative inline-flex items-center justify-center gap-2.5",
                "rounded-full px-7 py-3.5 text-sm sm:text-base font-semibold",
                "bg-primary text-white overflow-hidden",
                "transition-all duration-300 ease-out",
                "hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25",
                "hover:scale-[1.03] active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "min-h-[48px] min-w-[140px]"
            )}
        >
            {/* Sweep shine — respects RTL */}
            <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full rtl:-translate-x-full rtl:group-hover:translate-x-full transition-transform duration-700"
            />
            <span className="relative z-10">{label}</span>
            <ArrowIcon />
        </button>
    );
}

// ─────────────────────────────────────────────
// Trust Signals
// ─────────────────────────────────────────────

function TrustSignals({ t }: { t: ReturnType<typeof useTranslations> }) {
    return (
        <div
            className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2"
            aria-label={t("trustBadgesLabel")}
            style={{ animationDelay: "0.9s" }}
        >
            <div className="flex items-center gap-2">
                <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0"
                />
                <span className="text-sm font-medium text-grey-dark">
                    {t("trusted")}
                </span>
            </div>

            <div
                aria-hidden="true"
                className="h-5 w-px bg-gray-200 hidden sm:block"
            />

            <div className="flex items-center gap-2">
                <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:75ms] shrink-0"
                />
                <span className="text-sm font-medium text-grey-dark">
                    {t("satisfaction")}
                </span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Floating Quality Badge
// ─────────────────────────────────────────────

function QualityBadge({ t }: { t: ReturnType<typeof useTranslations> }) {
    return (
        <div
            className={cn(
                "absolute -bottom-5 -start-5",
                "bg-dashboard-bg rounded-2xl shadow-xl p-3.5",
                "border border-secondary/20",
                "hover:scale-105 transition-transform duration-300 cursor-default",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            role="img"
            aria-label={`${t("quality")} ${t("guaranteed")}`}
        >
            <div className="flex items-center gap-3">
                <div
                    aria-hidden="true"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0"
                >
                    <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <div className="leading-tight">
                    <p className="text-[11px] font-medium text-placeholder">
                        {t("quality")}
                    </p>
                    <p className="text-base font-bold text-dark">
                        {t("guaranteed")}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function PageHeroSection({
    title,
    description,
    buttonText,
    buttonHref,
    imageSrc = "/main.jpg",
    onButtonClick,
}: PageHeroSectionProps) {
    const t = useTranslations("hero");
    const resolvedButtonText = buttonText ?? t("cta");

    const handleDefaultClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onButtonClick) {
            onButtonClick();
            return;
        }
        const heroSection = e.currentTarget.closest("section");
        const nextSection = heroSection?.nextElementSibling;
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
        }
    };

    return (
        <section
            className="relative overflow-hidden"
            aria-label={t("sectionLabel")}
        >
            {/* ── Keyframe animations ── */}
            <style>{`
                @keyframes heroFadeUp {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes heroFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes heroSlideRight {
                    from { opacity: 0; transform: translateX(-18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes heroSlideLeft {
                    from { opacity: 0; transform: translateX(18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .hero-fade-up   { animation: heroFadeUp   0.7s cubic-bezier(.22,.68,0,1.2) both; }
                .hero-fade-in   { animation: heroFadeIn   0.8s ease both; }
                .hero-slide-right { animation: heroSlideRight 0.7s cubic-bezier(.22,.68,0,1.2) both; }
                .hero-slide-left  { animation: heroSlideLeft  0.7s cubic-bezier(.22,.68,0,1.2) both; }
            `}</style>

            {/* ── Background gradient ── */}
            <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(135deg, var(--lighter) 0%, var(--highlight) 55%, var(--lighter) 100%)`,
                }}
            />

            {/* ── Gradient mesh orbs ── */}
            <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden pointer-events-none"
            >
                <div className="absolute -top-10 start-0 w-72 h-72 bg-lightGold/20 rounded-full blur-3xl hero-fade-in" style={{ animationDelay: "0s", animationDuration: "1.2s" }} />
                <div className="absolute bottom-10 end-8 w-96 h-96 bg-secondary/15 rounded-full blur-3xl hero-fade-in" style={{ animationDelay: "0.3s", animationDuration: "1.2s" }} />
                <div className="absolute top-1/2 start-1/3 w-64 h-64 bg-light/10 rounded-full blur-3xl hero-fade-in" style={{ animationDelay: "0.6s", animationDuration: "1.2s" }} />
            </div>

            {/* ── Subtle dot grid ── */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(var(--secondary) 1px, transparent 1px)`,
                    backgroundSize: "36px 36px",
                }}
            />

            {/* ── Main content ── */}
            <div className="relative container mx-auto px-5 sm:px-8 lg:px-12 min-h-[75vh] flex items-center py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16 xl:gap-20 items-center w-full">

                    {/* ── Left: Text ── */}
                    <div className="max-w-xl w-full flex flex-col gap-5 sm:gap-6 text-start">

                        {/* Eyebrow badge */}
                        <div
                            className="inline-flex items-center gap-2.5 hero-slide-right"
                            style={{ animationDelay: "0s" }}
                            role="doc-subtitle"
                        >
                            <div className="w-7 h-px bg-gradient-to-r from-secondary to-transparent rtl:bg-gradient-to-l shrink-0" />
                            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-secondary uppercase select-none">
                                {t("eyebrow")}
                            </span>
                        </div>

                        {/* Heading — word-by-word hover */}
                        <h1
                            className="text-[1.75rem] sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold leading-[1.15] tracking-tight text-dark hero-slide-right"
                            style={{ animationDelay: "0.12s" }}
                        >
                            {title.split(" ").map((word, index) => (
                                <span
                                    key={index}
                                    className="inline-block me-[0.25em] last:me-0 hover:text-primary transition-colors duration-300 will-change-transform"
                                >
                                    {word}
                                </span>
                            ))}
                        </h1>

                        {/* Description */}
                        {description && (
                            <p
                                className="text-base sm:text-lg leading-relaxed text-input font-medium max-w-md hero-slide-right"
                                style={{ animationDelay: "0.24s" }}
                            >
                                {description}
                            </p>
                        )}

                        {/* CTA */}
                        <div
                            className="pt-1 hero-fade-up"
                            style={{ animationDelay: "0.38s" }}
                        >
                            {buttonHref ? (
                                <a href={buttonHref} tabIndex={-1}>
                                    <CtaButton
                                        label={resolvedButtonText}
                                        onClick={handleDefaultClick}
                                    />
                                </a>
                            ) : (
                                <CtaButton
                                    label={resolvedButtonText}
                                    onClick={handleDefaultClick}
                                />
                            )}
                        </div>

                        {/* Trust signals */}
                        <div
                            className="hero-fade-up"
                            style={{ animationDelay: "0.5s" }}
                        >
                            <TrustSignals t={t} />
                        </div>
                    </div>

                    {/* ── Right: Image ── */}
                    <div
                        className="relative flex justify-center lg:justify-end hero-slide-left"
                        style={{ animationDelay: "0.18s" }}
                    >
                        {/* Glow ring */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 flex items-center justify-center lg:justify-end pointer-events-none"
                        >
                            <div className="w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] lg:w-[520px] lg:h-[520px] rounded-full bg-gradient-to-br from-secondary/20 via-light/10 to-transparent blur-2xl animate-pulse" />
                        </div>

                        {/* Frame + image */}
                        <div className="relative group max-w-[500px] w-full">

                            {/* Corner accent — top-start */}
                            <div
                                aria-hidden="true"
                                className="absolute -top-3 -start-3 w-12 h-12 border-t-[3px] border-s-[3px] border-secondary rounded-ss-2xl opacity-60 transition-all duration-500 group-hover:w-16 group-hover:h-16 group-hover:opacity-100"
                            />
                            {/* Corner accent — bottom-end */}
                            <div
                                aria-hidden="true"
                                className="absolute -bottom-3 -end-3 w-12 h-12 border-b-[3px] border-e-[3px] border-primary rounded-ee-2xl opacity-60 transition-all duration-500 group-hover:w-16 group-hover:h-16 group-hover:opacity-100"
                            />

                            {/* Image container */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-secondary/20 transition-all duration-500 group-hover:shadow-secondary/30 group-hover:scale-[1.015]">
                                <Image
                                    src={imageSrc}
                                    alt={t("imageAlt")}
                                    width={600}
                                    height={600}
                                    priority
                                    className="object-contain w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Directional shine sweep */}
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/15 transition-all duration-700 -translate-x-full group-hover:translate-x-full"
                                />
                            </div>

                            {/* Floating quality badge */}
                            <QualityBadge t={t} />
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Bottom fade ── */}
            <div
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none"
            />
        </section>
    );
}