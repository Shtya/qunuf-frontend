'use client';

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CiExport } from "react-icons/ci";
import { cn } from "@/lib/utils";

 
import { Link } from "@/i18n/navigation";
import Dropdown, { MenuProps, TriggerProps } from "../../atoms/Dropdown";
import Tooltip from "../../atoms/Tooltip";
import Popup from "../../atoms/Popup";
import SecondaryButton from "../../atoms/buttons/SecondaryButton";

// ─────────────────────────────────────────────────────────────────────────────
// Re-exported TableActions types (consumed by FilterContainer etc.)
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionButton {
    show?: boolean;
    href?: string;
    onClick?: () => void;
    label?: string;
    MobileIcon?: React.ElementType;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared style tokens
// ─────────────────────────────────────────────────────────────────────────────

const cls = {
    // Trigger button shared surface
    triggerBase: [
        "flex items-center gap-2 flex-row rtl:flex-row-reverse",
        "border border-gray/20 bg-dashboard-bg",
        "px-4 py-2.5 rounded-xl text-sm font-semibold",
        "transition-all duration-150",
        "hover:border-secondary/50 hover:bg-secondary/[0.04]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "active:scale-[0.97]",
    ].join(" "),

    // Mobile icon-only trigger
    mobileIconBtn: [
        "p-2.5 rounded-xl",
        "border border-gray/20 bg-dashboard-bg",
        "transition-all duration-150 active:scale-[0.97]",
        "hover:border-secondary/50 hover:bg-secondary/[0.04]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40",
    ].join(" "),

    // Menu panel wrapper
    menuPanel: [
        "space-y-5 bg-dashboard-bg",
        "p-4 md:p-5 rounded-2xl",
        "w-full max-w-sm",
        // Entry animation via inline keyframe below
    ].join(" "),

    // Radio option row
    radioRow: [
        "inline-flex items-center gap-2.5",
        "flex-row rtl:flex-row-reverse",
        "cursor-pointer group",
        "p-2 rounded-xl",
        "hover:bg-secondary/[0.05]",
        "transition-colors duration-150",
    ].join(" "),

    radioInput: [
        "w-4 h-4 shrink-0",
        "border-secondary text-secondary",
        "focus:ring-secondary accent-secondary",
    ].join(" "),

    numberInput: [
        "w-full py-2 px-3 rounded-xl",
        "border border-gray/20",
        "text-sm font-medium text-dark",
        "focus:border-secondary focus:ring-2 focus:ring-secondary/15",
        "outline-none transition-all duration-150",
        "disabled:bg-gray/5 disabled:cursor-not-allowed",
    ].join(" "),

    primaryBtn: [
        "inline-flex items-center justify-center gap-2",
        "bg-primary hover:bg-primary-hover text-white",
        "rounded-xl py-2.5 px-6 text-sm font-semibold",
        "shadow-sm shadow-primary/15",
        "transition-all duration-150 active:scale-[0.97]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    ].join(" "),

    ghostBtn: [
        "inline-flex items-center justify-center",
        "text-dark/55 hover:text-dark hover:bg-gray/[0.08]",
        "rounded-xl py-2.5 px-5 text-sm font-semibold",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray/30",
    ].join(" "),
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ExportExcel — public export
// ─────────────────────────────────────────────────────────────────────────────

export function ExportExcel({
    hasRows,
    onExport,
		actionButton,
}: {
    hasRows?: boolean;
    onExport?: (limit: number) => Promise<void>;
		actionButton ?:any
}) {
    const [showPopup, setShowPopup] = useState(false);
    const t = useTranslations("dashboard.filter.export");
    const disabled = !hasRows;

    return (
        <>
            {/* ── Desktop: inline dropdown ──────────────────────────── */}
            <Dropdown
                className="hidden md:block"
                Trigger={(props: TriggerProps) => (
                    <ExportTrigger {...props} disabled={disabled} />
                )}
                Menu={(props: MenuProps) => (
                    <ExportMenu disabled={disabled} {...props} onExport={onExport} />
                )}
                position="bottom-right"
            />

            {/* ── Mobile: icon button + bottom sheet popup ──────────── */}
            <div className="block md:hidden">
                <Tooltip content={t("trigger")}>
                    <button
                        type="button"
                        disabled={disabled}
                        aria-label={t("trigger")}
                        className={cls.mobileIconBtn}
                        onClick={() => setShowPopup(true)}
                    >
                        <CiExport size={22} className="shrink-0 text-secondary" />
                    </button>
                </Tooltip>
            </div>

            <Popup show={showPopup} onClose={() => setShowPopup(false)}>
                <ExportMenu
                    disabled={disabled}
                    onClose={() => setShowPopup(false)}
                    onExport={onExport}
                />
            </Popup>
        </>
    );
}

// Keep legacy default export alias so existing imports don't break
export default ExportExcel;

// ─────────────────────────────────────────────────────────────────────────────
// ExportTrigger — desktop dropdown trigger
// ─────────────────────────────────────────────────────────────────────────────

function ExportTrigger({
    isOpen,
    onToggle,
    disabled,
}: TriggerProps & { disabled: boolean }) {
    const t = useTranslations("dashboard.filter.export");

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onToggle}
            aria-expanded={isOpen}
            className={cn(
                cls.triggerBase,
                "text-dark",
                isOpen && "border-secondary ring-2 ring-secondary/15 bg-secondary/[0.04]",
            )}
        >
            <CiExport
                size={18}
                className={cn(
                    "shrink-0 text-secondary transition-transform duration-200",
                    isOpen && "scale-110",
                )}
            />
            <span className="whitespace-nowrap">{t("trigger")}</span>
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExportMenu — shared between desktop dropdown and mobile popup
// ─────────────────────────────────────────────────────────────────────────────

function ExportMenu({
    onClose,
    onExport,
    disabled,
}: {
    disabled: boolean;
    onClose?: () => void;
    onExport?: (limit: number) => Promise<void>;
}) {
    const t          = useTranslations("dashboard.filter.export");
    const searchParams = useSearchParams();
    const instanceId = useId();

    const [isLoading, setLoading] = useState(false);
    const [scope, setScope]       = useState<"current" | "more">("current");
    const [maxRows, setMaxRows]   = useState(100);

    async function handleExport() {
        if (!onExport) return;
        setLoading(true);
        const currentLimit = Number(searchParams.get("limit")) || 10;
        const limitToSend  = scope === "current" ? currentLimit : maxRows;
        await onExport(limitToSend);
        setLoading(false);
        onClose?.();
    }

    const isMoreScope = scope === "more";

    return (
        <div className={cls.menuPanel}>

            {/* ── Section label ─────────────────────────────────────── */}
            <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                {t("scope")}
            </p>

            {/* ── Scope radio group ─────────────────────────────────── */}
            <fieldset className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <legend className="sr-only">{t("scope")}</legend>

                {(["current", "more"] as const).map((s) => (
                    <label key={s} className={cls.radioRow}>
                        <input
                            type="radio"
                            name={`export-scope-${instanceId}`}
                            className={cls.radioInput}
                            checked={scope === s}
                            onChange={() => setScope(s)}
                        />
                        <span className="text-sm font-medium text-dark select-none">
                            {t(s === "current" ? "currentTable" : "moreData")}
                        </span>
                    </label>
                ))}
            </fieldset>

            {/* ── Row limit input (only active when scope = 'more') ─── */}
            <div
                className={cn(
                    "space-y-2 transition-all duration-200",
                    !isMoreScope && "opacity-40 grayscale pointer-events-none select-none",
                )}
            >
                <label
                    htmlFor={`max-rows-${instanceId}`}
                    className="block text-sm font-semibold text-dark"
                >
                    {t("rowLimit")}
                </label>
                <input
                    id={`max-rows-${instanceId}`}
                    type="number"
                    min={1}
                    max={1000}
                    className={cls.numberInput}
                    value={maxRows}
                    disabled={!isMoreScope}
                    onChange={(e) =>
                        setMaxRows(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))
                    }
                />
                <p className="text-xs text-dark/40">{t("rowLimitHint")}</p>
            </div>

            {/* ── Footer actions ────────────────────────────────────── */}
            <div
                className={[
                    "flex items-center gap-2.5 pt-4",
                    "flex-row rtl:flex-row-reverse",
                    "border-t border-gray/10",
                ].join(" ")}
            >
                <button
                    type="button"
                    className={cls.primaryBtn}
                    disabled={disabled || isLoading}
                    onClick={handleExport}
                >
                    {isLoading ? (
                        <>
                            {/* Inline spinner — no extra dep */}
                            <svg
                                aria-hidden="true"
                                className="w-4 h-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12" cy="12" r="10"
                                    stroke="currentColor" strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                />
                            </svg>
                            {t("exporting")}
                        </>
                    ) : (
                        t("export")
                    )}
                </button>
                <button type="button" className={cls.ghostBtn} onClick={onClose}>
                    {t("cancel")}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TableActions — public export
// ─────────────────────────────────────────────────────────────────────────────

interface TableActionsProps {
    hasRows?: boolean;
    actionButton: ActionButton;
    onExport?: (limit: number) => Promise<void>;
}

export function TableActions({ hasRows, actionButton, onExport }: TableActionsProps) {
    const { show, href, onClick, label, MobileIcon } = actionButton;
    const showAction = show && (href || onClick) && label && MobileIcon;

    const btnCls = [
        "flex items-center justify-center",
        "w-10 h-10 rounded-xl",
        "bg-primary hover:bg-primary-hover",
        "border border-primary/20",
        "transition-all duration-150 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    ].join(" ");

    return (
        <div
            className={[
                "flex items-center gap-3",
                "flex-row rtl:flex-row-reverse",
            ].join(" ")}
        >
            {/* Export control */}
            <ExportExcel hasRows={hasRows} onExport={onExport} />

            {/* Primary action button */}
            {showAction && (
                <div>
                    {/* Desktop: labelled button */}
                    {href ? (
                        <SecondaryButton
                            href={href}
                            className={[
                                "max-md:hidden",
                                "bg-primary hover:bg-primary-hover text-white",
                                "max-lg:w-full",
                            ].join(" ")}
                        >
                            {label}
                        </SecondaryButton>
                    ) : (
                        <button
                            type="button"
                            onClick={onClick}
                            className={[
                                "max-md:hidden",
                                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
                                "bg-primary hover:bg-primary-hover text-white",
                                "transition-all duration-150 active:scale-[0.97]",
                            ].join(" ")}
                        >
                            {label}
                        </button>
                    )}

                    {/* Mobile: icon-only with tooltip */}
                    <div className="block md:hidden">
                        <Tooltip content={label}>
                            {href ? (
                                <Link
                                    href={href}
                                    aria-label={label}
                                    className={btnCls}
                                >
                                    {MobileIcon && (
                                        <MobileIcon size={20} className="shrink-0 text-white" />
                                    )}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onClick}
                                    aria-label={label}
                                    className={btnCls}
                                >
                                    {MobileIcon && (
                                        <MobileIcon size={20} className="shrink-0 text-white" />
                                    )}
                                </button>
                            )}
                        </Tooltip>
                    </div>
                </div>
            )}
        </div>
    );
}