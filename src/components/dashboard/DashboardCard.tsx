import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface DashboardCardProps {
    /** Card section title */
    title?: string;
    /** Label text for the "view all" link */
    linkLabel?: string;
    /** Destination href for the header link */
    linkHref?: string;
    /** Card body content */
    children?: ReactNode;
    /** Additional Tailwind classes applied to the root element */
    className?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function DashboardCard({
    title,
    linkLabel,
    linkHref,
    children,
    className = "",
}: DashboardCardProps) {
    const hasHeader = title || (linkLabel && linkHref);

    return (
        <article
            className={[
                // Layout
                "relative group flex flex-col overflow-hidden",
                // Shape & surface
                "rounded-2xl bg-card-bg",
                // Border — uses a subtle ring so it doesn't add layout space
                "ring-1 ring-gray/10",
                // Shadow system: resting → hover
                "shadow-sm hover:shadow-lg",
                // Transition
                "transition-all duration-300 ease-out",
                // GPU hint only — no transform by default to avoid stacking-context issues
                "will-change-transform",
                className,
            ].join(" ")}
        >
            {/* ── Decorative accent bar (top edge) ───────────────────── */}
            {/*
             * A thin 2 px gradient line at the top edge that slides in from
             * transparent on mount and becomes visible on hover.
             * It lives outside the card's padding so it never pushes content.
             */}
            <span
                aria-hidden="true"
                className={[
                    "absolute inset-x-0 top-0 h-0.5 z-20",
                    "bg-gradient-to-r from-primary/0 via-secondary to-primary/0",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-500 ease-out",
                ].join(" ")}
            />

            {/* ── Ambient glow overlay ─────────────────────────────────── */}
            {/*
             * A very subtle inner-gradient layer that shifts slightly on hover
             * giving the card a "lit from within" feel without feeling garish.
             */}
            <span
                aria-hidden="true"
                className={[
                    "pointer-events-none absolute inset-0 z-0 rounded-2xl",
                    "bg-gradient-to-br from-secondary/[0.04] via-transparent to-primary/[0.06]",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-400",
                ].join(" ")}
            />

            {/* ── Header ───────────────────────────────────────────────── */}
            {hasHeader && (
                <header
                    className={[
                        "relative z-10 shrink-0",
                        "flex items-center justify-between gap-3",
                        "flex-row rtl:flex-row-reverse",          // ← RTL flip
                        "px-5 md:px-6 pt-5 md:pt-6 pb-4",
                        "border-b border-gray/10",
                        // Frosted glass effect on the header strip
                        "bg-card-bg/70 backdrop-blur-sm",
                    ].join(" ")}
                >
                    {/* Title */}
                    {title && (
                        <h3
                            className={[
                                "min-w-0 flex-1",
                                "text-start",                      // ← direction-aware
                                "font-bold text-lg md:text-xl",
                                "text-dark leading-snug tracking-tight",
                                "line-clamp-1",
                            ].join(" ")}
                        >
                            {title}
                        </h3>
                    )}

                    {/* Header link */}
                    {linkLabel && linkHref && (
                        <Link
                            href={linkHref}
                            className={[
                                "group/link shrink-0",
                                // Touch-friendly tap area without visual bloat
                                "inline-flex items-center gap-1.5 py-1 px-0.5 -my-1",
                                "text-sm font-semibold",
                                "text-secondary hover:text-primary",
                                "transition-colors duration-200",
                                "focus-visible:outline-none focus-visible:ring-2",
                                "focus-visible:ring-primary/40 focus-visible:rounded",
                            ].join(" ")}
                        >
                            <span>{linkLabel}</span>
                            {/* Chevron — mirrors in RTL so it always points "forward" */}
                            <ChevronIcon />
                        </Link>
                    )}
                </header>
            )}

            {/* ── Scrollable body ───────────────────────────────────────── */}
            <div
                className={[
                    "relative z-10 flex-1 overflow-y-auto",
                    "custom-scrollbar",
                    "px-5 md:px-6 py-4 md:py-5",
                ].join(" ")}
            >
                {children}
            </div>
        </article>
    );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/**
 * A chevron arrow that auto-mirrors in RTL via `rtl:rotate-180`,
 * and nudges forward on parent hover via the group/link peer.
 */
function ChevronIcon() {
    return (
        <svg
            aria-hidden="true"
            className={[
                "w-4 h-4 shrink-0",
                // RTL: point left instead of right
                "rtl:rotate-180",
                // Subtle forward nudge on link hover
                "transition-transform duration-200",
                "group-hover/link:translate-x-0.5 rtl:group-hover/link:-translate-x-0.5",
                "rtl:group-hover/link:translate-x-0",  // reset the ltr translate in rtl
            ].join(" ")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 5l7 7-7 7" />
        </svg>
    );
}