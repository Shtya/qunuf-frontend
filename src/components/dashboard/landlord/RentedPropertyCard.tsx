import Image from "next/image";
import { Link } from "@/i18n/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PropertyCardProps {
    imageSrc: string;
    address: string;
    date: Date;
    price: number;
    /** When provided the address becomes a link to /properties/:id */
    id?: string;
    /** ISO locale string for date formatting — defaults to "en-US" */
    locale?: string;
    /** Currency label — defaults to "SAR" */
    currency?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(date: Date, locale: string): string {
    return date.toLocaleString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function RentedPropertyCard({
    imageSrc,
    address,
    date,
    id,
    price,
    locale = "en-US",
    currency = "SAR",
}: PropertyCardProps) {
    const formattedDate = formatDate(date, locale);
    const formattedPrice = price.toLocaleString(locale);

    return (
        <article
            className={[
                // Layout — row, RTL-aware
                "group flex items-center gap-3 sm:gap-4",
                "flex-row ",
                // Spacing
                "px-3 py-3.5",
                // Surface
                "rounded-2xl",
                "hover:bg-secondary/[0.05]",
                // Transition
                "transition-all duration-200",
            ].join(" ")}
        >
            {/* ── Thumbnail ───────────────────────────────────────────── */}
            <div className="relative shrink-0">
                {/* Halo glow */}
                <span
                    aria-hidden="true"
                    className={[
                        "absolute -inset-1 rounded-full",
                        "bg-gradient-to-br from-secondary/30 to-primary/20",
                        "opacity-0 group-hover:opacity-100 blur-sm",
                        "transition-opacity duration-300",
                    ].join(" ")}
                />

                {/* Image frame */}
                <div
                    className={[
                        "relative h-14 w-14 sm:h-[58px] sm:w-[58px] shrink-0",
                        "rounded-full overflow-hidden",
                        "ring-2 ring-gray/20 group-hover:ring-secondary/40",
                        "shadow-sm",
                        "transition-all duration-300",
                    ].join(" ")}
                >
                    <Image
                        src={imageSrc}
                        fill
                        alt={address}
                        sizes="58px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                </div>
            </div>

            {/* ── Info ────────────────────────────────────────────────── */}
            <div
                className={[
                    "flex flex-col gap-1 min-w-0 flex-1",
                    // Text alignment follows reading direction
                    "items-start  ",
                ].join(" ")}
            >
                {/* Address — link or heading */}
                {id ? (
                    <Link
                        href={`/properties/${id}`}
                        className={[
                            "font-semibold text-sm sm:text-base",
                            "text-dark hover:text-primary",
                            "transition-colors duration-200",
                            "truncate max-w-full",
                            "focus-visible:outline-none focus-visible:ring-2",
                            "focus-visible:ring-primary/40 focus-visible:rounded",
                        ].join(" ")}
                    >
                        {address}
                    </Link>
                ) : (
                    <h4 className="font-semibold text-sm sm:text-base text-dark truncate max-w-full">
                        {address}
                    </h4>
                )}

                {/* Date row */}
                <div
                    className={[
                        "flex items-center gap-1.5",
                        "flex-row  ",
                        "text-dark/50 text-xs",
                    ].join(" ")}
                >
                    <CalendarIcon />
                    <time dateTime={date.toISOString()} className="truncate">
                        {formattedDate}
                    </time>
                </div>
            </div>

            {/* ── Price badge ──────────────────────────────────────────── */}
            <div className="shrink-0 ms-auto ">
                <PriceBadge price={formattedPrice} currency={currency} />
            </div>
        </article>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function CalendarIcon() {
    return (
        <svg
            aria-hidden="true"
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

interface PriceBadgeProps {
    price: string;
    currency: string;
}

/**
 * Price badge with a subtle gradient fill and a glow bloom on row-hover.
 * Uses `group` from the parent article so no extra wrapper group is needed.
 */
function PriceBadge({ price, currency }: PriceBadgeProps) {
    return (
        <div className="relative">
            {/* Bloom glow — inherits parent group-hover */}
            <span
                aria-hidden="true"
                className={[
                    "absolute -inset-1 rounded-xl",
                    "bg-gradient-to-r from-secondary/25 to-primary/20",
                    "opacity-0 group-hover:opacity-100 blur-sm",
                    "transition-opacity duration-300",
                ].join(" ")}
            />

            {/* Badge surface */}
            <div
                className={[
                    "relative flex items-baseline gap-1",
                    "px-3 py-2 rounded-xl",
                    "bg-gradient-to-br from-secondary/10 to-primary/[0.07]",
                    "border border-secondary/15 group-hover:border-secondary/35",
                    "shadow-sm",
                    "transition-all duration-200",
                ].join(" ")}
            >
                <span className="text-sm md:text-base font-bold text-dark tabular-nums whitespace-nowrap">
                    {price}
                </span>
                <span className="text-[10px] font-semibold text-dark/50 tracking-wide uppercase">
                    {currency}
                </span>
            </div>
        </div>
    );
}