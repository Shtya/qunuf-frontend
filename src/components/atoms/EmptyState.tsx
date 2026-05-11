import { Link } from "@/i18n/navigation";
import { FiSearch } from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
    /** Headline displayed below the icon */
    title?: string;
    /** Supporting paragraph (optional) */
    message?: string;
    /** CTA label — omit to hide the button entirely */
    actionLabel?: string;
    /** Called on button click when `href` is not provided */
    onAction?: () => void;
    /** When provided, the CTA renders as a <Link> instead of <button> */
    href?: string;
    /** Extra Tailwind classes merged onto the CTA element */
    actionClassName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyframes (injected once — avoids a separate CSS file)
// ─────────────────────────────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes es-spin-slow  { to { transform: translate(-50%,-50%) rotate(360deg);  } }
@keyframes es-spin-ccw   { to { transform: translate(-50%,-50%) rotate(-360deg); } }
@keyframes es-pulse-ring { 0%,100% { opacity:.18; } 50% { opacity:.32; } }
@keyframes es-float-icon { 0%,100% { transform: translateY(0);  } 50% { transform: translateY(-4px); } }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function EmptyState({
    title = "No data found",
    message,
    actionLabel,
    onAction,
    href,
    actionClassName = "",
}: EmptyStateProps) {
    return (
        <>
            {/* Inject keyframes once */}
            <style>{KEYFRAMES}</style>

            <div
                className={[
                    "relative flex min-h-[360px] w-full items-center justify-center",
                    "overflow-hidden rounded-2xl",
                    "px-6 py-16 md:py-24",
                ].join(" ")}
            >
                {/* ── Decorative animated background ─────────────────────── */}
                <svg
                    aria-hidden="true"
                    width="320"
                    height="320"
                    viewBox="0 0 320 320"
                    fill="none"
                    className="pointer-events-none absolute left-1/2 top-1/2"
                    style={{
                        transform: "translate(-50%,-50%)",
                        zIndex: 0,
                    }}
                >
                    <defs>
                        <radialGradient
                            id="es-bg-glow"
                            cx="50%"
                            cy="50%"
                            r="50%"
                        >
                            <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Soft radial fill */}
                    <circle cx="160" cy="160" r="140" fill="url(#es-bg-glow)" />

                    {/* Pulsing dashed outer ring */}
                    <circle
                        cx="160"
                        cy="160"
                        r="130"
                        stroke="var(--secondary)"
                        strokeOpacity="0.18"
                        strokeWidth="1"
                        strokeDasharray="6 10"
                        fill="none"
                        style={{
                            transformOrigin: "160px 160px",
                            animation: "es-spin-slow 28s linear infinite",
                        }}
                    />

                    {/* Counter-rotating mid ring */}
                    <circle
                        cx="160"
                        cy="160"
                        r="96"
                        stroke="var(--secondary)"
                        strokeOpacity="0.12"
                        strokeWidth="1"
                        strokeDasharray="3 14"
                        fill="none"
                        style={{
                            transformOrigin: "160px 160px",
                            animation: "es-spin-ccw 18s linear infinite",
                        }}
                    />

                    {/* Static inner solid ring */}
                    <circle
                        cx="160"
                        cy="160"
                        r="60"
                        stroke="var(--secondary)"
                        strokeOpacity="0.10"
                        strokeWidth="1"
                        fill="none"
                        style={{ animation: "es-pulse-ring 4s ease-in-out infinite" }}
                    />
                </svg>

                {/* ── Content column ──────────────────────────────────────── */}
                <div
                    className={[
                        "relative z-10",
                        "mx-auto flex w-full max-w-sm flex-col items-center",
                        "gap-0",
                    ].join(" ")}
                >
                    {/* Icon */}
                    <div
                        className="mb-8"
                        style={{ animation: "es-float-icon 4s ease-in-out infinite" }}
                    >
                        <IconWell />
                    </div>

                    {/* Text */}
                    <div className="mb-7 flex flex-col items-center gap-2.5 text-center">
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-dark md:text-2xl">
                            {title}
                        </h2>
                        {message && (
                            <p className="max-w-xs text-sm leading-relaxed text-dark/55 md:text-base">
                                {message}
                            </p>
                        )}
                    </div>

                    {/* CTA */}
                    {actionLabel && (
                        <ActionCTA
                            label={actionLabel}
                            href={href}
                            onAction={onAction}
                            className={actionClassName}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Three-layer icon well:
 *   1. Outer halo ring  — very faint, large radius
 *   2. Mid fill disk    — soft gradient
 *   3. Inner icon box   — the actual icon sits here
 */
function IconWell() {
    return (
        <div className="relative flex items-center justify-center" role="img" aria-label="">
            {/* Layer 1 — halo */}
            <div
                className={[
                    "absolute h-28 w-28 rounded-full",
                    "bg-secondary/[0.07]",
                    "ring-1 ring-secondary/15",
                ].join(" ")}
            />

            {/* Layer 2 — mid fill */}
            <div
                className={[
                    "absolute h-[84px] w-[84px] rounded-full",
                    "bg-gradient-to-br from-secondary/20 to-secondary/10",
                ].join(" ")}
            />

            {/* Layer 3 — icon container */}
            <div
                className={[
                    "relative flex h-16 w-16 items-center justify-center",
                    "rounded-2xl",
                    "bg-gradient-to-br from-secondary/25 via-secondary/15 to-transparent",
                    "shadow-[0_4px_24px_-4px_var(--secondary)] shadow-secondary/30",
                    "ring-1 ring-secondary/25",
                    "transition-all duration-300",
                    "group-hover:scale-105 group-hover:shadow-lg",
                ].join(" ")}
            >
                <FiSearch
                    size={28}
                    className="text-secondary"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

interface ActionCTAProps {
    label: string;
    href?: string;
    onAction?: () => void;
    className?: string;
}

/**
 * Renders either a <Link> or a <button> depending on whether `href` is set.
 * Shared styling lives here so there's zero duplication.
 */
function ActionCTA({ label, href, onAction, className = "" }: ActionCTAProps) {
    const sharedClass = [
        "group relative inline-flex items-center justify-center",
        "px-7 py-3 rounded-xl",
        "bg-gradient-to-r from-secondary to-secondary-hover",
        "hover:from-primary hover:to-primary-hover",
        "text-white text-sm font-semibold",
        "shadow-md hover:shadow-lg",
        "transition-all duration-200",
        // Focus ring for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        className,
    ].join(" ");

    const inner = (
        <>
            {/* Glow bloom */}
            <span
                aria-hidden="true"
                className={[
                    "absolute inset-0 rounded-xl",
                    "bg-primary/25 opacity-0 blur-md",
                    "group-hover:opacity-100",
                    "transition-opacity duration-200",
                ].join(" ")}
            />
            <span className="relative">{label}</span>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={sharedClass}>
                {inner}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onAction} className={sharedClass}>
            {inner}
        </button>
    );
}