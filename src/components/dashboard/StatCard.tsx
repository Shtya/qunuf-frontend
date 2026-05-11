import { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: number | string;
    trend?: string;
    /** Any valid CSS color — hex, rgba, hsl, or a CSS variable reference */
    trendColor?: string;
    trendIcon?: ReactNode;
    subtext?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function StatCard({
    icon,
    label,
    value,
    trend,
    trendColor = "rgba(47, 107, 62, 0.1)",
    trendIcon,
    subtext,
}: StatCardProps) {
    return (
        <div
            className={[
                // Base surface
                "relative group",
                "bg-card-bg rounded-2xl",
                "p-5 md:p-6",
                "h-full",
                // Stroke + shadow
                "ring-1 ring-gray/10",
                "shadow-sm hover:shadow-lg",
                // Clip decorative elements
                "overflow-hidden",
                // Transition
                "transition-all duration-300",
            ].join(" ")}
        >
            {/* ── Ambient hover glow ────────────────────────────────────── */}
            <span
                aria-hidden="true"
                className={[
                    "pointer-events-none absolute inset-0 rounded-2xl",
                    "bg-gradient-to-br from-secondary/[0.05] via-transparent to-primary/[0.07]",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-300",
                ].join(" ")}
            />

            {/* ── Decorative corner arc ─────────────────────────────────── */}
            {/*
             * RTL-aware: uses `end-0` so the arc sits at the trailing corner
             * in both LTR (top-right) and RTL (top-left).
             */}
            <span
                aria-hidden="true"
                className={[
                    "pointer-events-none absolute top-0 end-0",
                    "w-24 h-24",
                    "bg-gradient-to-bl from-secondary/10 via-secondary/5 to-transparent",
                    "rounded-es-full",              // logical: bottom-start corner of the arc shape
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-300",
                ].join(" ")}
            />

            {/* ── Card content ──────────────────────────────────────────── */}
            <div className="relative flex flex-col gap-5">

                {/* Row 1 — Icon + Label */}
                <div
                    className={[
                        "flex items-center gap-3",
                        "flex-row ",
                    ].join(" ")}
                >
                    {/* Icon well */}
                    <div className="relative shrink-0">
                        {/* Bloom glow */}
                        <span
                            aria-hidden="true"
                            className={[
                                "absolute -inset-1 rounded-full",
                                "bg-gradient-to-br from-secondary/30 to-primary/25",
                                "opacity-0 group-hover:opacity-100 blur-md",
                                "transition-opacity duration-300",
                            ].join(" ")}
                        />
                        {/* Icon surface */}
                        <div
                            className={[
                                "relative p-3 rounded-full",
                                "bg-gradient-to-br from-secondary/10 to-primary/10",
                                "shadow-sm",
                                "group-hover:scale-110",
                                "transition-transform duration-300",
                            ].join(" ")}
                        >
                            {icon}
                        </div>
                    </div>

                    {/* Label */}
                    <h3
                        className={[
                            "text-sm md:text-base font-semibold leading-snug",
                            "text-dark/70 group-hover:text-dark",
                            "text-start",           // direction-aware
                            "transition-colors duration-200",
                        ].join(" ")}
                    >
                        {label}
                    </h3>
                </div>

                {/* Row 2 — Value + Trend */}
                <div
                    className={[
                        "flex items-end gap-3",
                        // In LTR: value left, trend right. RTL: flipped.
                        "flex-row ",
                        "flex-wrap",
                    ].join(" ")}
                >
                    {/* Value */}
                    <p
                        className={[
                            "flex-1 min-w-0",
                            "text-start",           // direction-aware
                            "text-3xl md:text-4xl lg:text-[42px]",
                            "font-bold leading-none tracking-tight",
                            "text-dark",
                            "tabular-nums",
                        ].join(" ")}
                    >
                        {value}
                    </p>

                    {/* Trend + subtext stack */}
                    {(trend || subtext) && (
                        <div
                            className={[
                                "flex flex-col gap-1.5 shrink-0",
                                "items-end ",
                            ].join(" ")}
                        >
                            {trend && (
                                <TrendBadge
                                    label={trend}
                                    icon={trendIcon}
                                    color={trendColor}
                                />
                            )}
                            {subtext && (
                                <p className="text-xs text-dark/50 font-medium whitespace-nowrap">
                                    {subtext}
                                </p>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface TrendBadgeProps {
    label: string;
    icon?: ReactNode;
    color: string;
}

function TrendBadge({ label, icon, color }: TrendBadgeProps) {
    return (
        <div
            className={[
                "inline-flex items-center gap-1.5",
                "flex-row ",
                "px-2.5 py-1 rounded-lg",
                "text-xs font-semibold",
                "shadow-sm",
                "transition-transform duration-200 hover:scale-105",
            ].join(" ")}
            style={{ background: color }}
        >
            {icon && (
                <span aria-hidden="true" className="shrink-0 flex items-center">
                    {icon}
                </span>
            )}
            <span>{label}</span>
        </div>
    );
}


export function StatSkeleton() {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl",
        "bg-card-bg p-5 md:p-6 h-[110px]",
        "ring-1 ring-gray/10 shadow-sm",
        "animate-pulse",
      ].join(" ")}
    >
      {/* ambient layer */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/[0.04] via-transparent to-primary/[0.05]"
      />

      {/* decorative corner */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 end-0 w-24 h-24 rounded-es-full bg-gradient-to-bl from-secondary/10 via-secondary/5 to-transparent"
      />

      <div className="relative flex h-full items-center justify-between gap-4 ">
        {/* left side: icon + texts */}
        <div className="flex items-center gap-3  min-w-0 flex-1">
          {/* icon skeleton */}
          <div className="shrink-0 rounded-full bg-gray/10 w-12 h-12" />

          {/* label + value */}
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-3 w-24 rounded-md bg-gray/10" />
            <div className="h-8 w-20 rounded-md bg-gray/10" />
          </div>
        </div>

        {/* right side: trend + subtext */}
        <div className="flex flex-col items-end gap-2  shrink-0">
          <div className="h-6 w-16 rounded-lg bg-gray/10" />
          <div className="h-3 w-12 rounded-md bg-gray/10" />
        </div>
      </div>
    </div>
  );
}