'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { generatePagination, updateUrlParams } from '@/utils/helpers';

 
interface PaginationProps {
    currentPage: number;
    pageCount: number;
    onPageChange: (page: number) => void;
		pageSize ?: any
		total ?: any
}

interface TablePaginationProps {
    pageCount: number;
    pageSize: number;
    total: number;
}

 
const ICON_PROPS = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
};

function IconChevronFirst({ flip , className }:any) {
    return (
        <svg className={cn("w-3.5 h-3.5 shrink-0", className , flip && "rotate-180")} viewBox="0 0 16 16" {...ICON_PROPS}>
            <path d="M7 3L3 8l4 5M13 3L9 8l4 5" />
        </svg>
    );
}
function IconChevronLeft({ flip , className }:any) {
    return (
        <svg className={cn("w-3.5 h-3.5 shrink-0, className ", flip && "rotate-180")} viewBox="0 0 16 16" {...ICON_PROPS}>
            <path d="M10 3L6 8l4 5" />
        </svg>
    );
}
function IconChevronRight({ flip , className }:any) {
    return (
        <svg className={cn("w-3.5 h-3.5 shrink-0", className , flip && "rotate-180")} viewBox="0 0 16 16" {...ICON_PROPS}>
            <path d="M6 3l4 5-4 5" />
        </svg>
    );
}
function IconChevronLast({ flip , className }:any) {
    return (
        <svg className={cn("w-3.5 h-3.5 shrink-0, className ", flip && "rotate-180")} viewBox="0 0 16 16" {...ICON_PROPS}>
            <path d="M3 3l4 5-4 5M9 3l4 5-4 5" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared base classes for all page buttons
// ─────────────────────────────────────────────────────────────────────────────

const pgBase = [
    "inline-flex items-center justify-center",
    "h-9 rounded-[10px]",
    "text-[13px] font-medium tabular-nums",
    "border border-gray/15 bg-white",
    "transition-all duration-150",
    "active:scale-[0.93]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30",
    "disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none",
].join(" ");

// ─────────────────────────────────────────────────────────────────────────────
// Pagination — pure UI, no URL coupling
// ─────────────────────────────────────────────────────────────────────────────

export function Pagination({ currentPage, pageCount, onPageChange , pageSize }: PaginationProps) {
    const t = useTranslations("dashboard.pagination");

    if (pageCount <= 1) return null;

    const atStart = currentPage === 1;
    const atEnd   = currentPage === pageCount;

    return (
        <nav aria-label={t("navigation")} className="flex items-center flex-wrap gap-1">

            {/* ── First ──────────────────────────────────────────────── */}
            <NavButton
                onClick={() => onPageChange(1)}
                disabled={atStart}
                label={t("firstPage")}
                className="w-9"
            > 
                <IconChevronLast  className=" ltr:scale-x-[-1] rtl:block" />
            </NavButton>

            {/* ── Previous ────────────────────────────────────────────── */}
            <NavButton
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={atStart}
                label={t("previous")}
                className="gap-1.5 w-9"
            > 
                <IconChevronRight className=" ltr:scale-x-[-1] rtl:block" /> 
            </NavButton>

            {/* ── Page numbers ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1" role="group" aria-label={t("pageNumbers")}>
                {generatePagination(currentPage, pageCount).map((item, idx) =>
                    item === "..." ? (
                        <span
                            key={`ellipsis-${idx}`}
                            aria-hidden="true"
                            className="w-8 h-9 inline-flex items-center justify-center text-[13px] text-dark/30 select-none tracking-[.05em]"
                        >
                            ···
                        </span>
                    ) : (
                        <PageNumberButton
                            key={`page-${item}`}
                            page={Number(item)}
                            isActive={currentPage === item}
                            onClick={() => onPageChange(Number(item))}
                            ariaLabel={t("goToPage", { page: item })}
                        />
                    )
                )}
            </div>

            {/* ── Next ─────────────────────────────────────────────────── */}
            <NavButton
                onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
                disabled={atEnd}
                label={t("next")}
                className="w-9"
            > 
                <IconChevronLeft  className="ltr:scale-x-[-1] rtl:block" />
            </NavButton>

            {/* ── Last ─────────────────────────────────────────────────── */}
            <NavButton
                onClick={() => onPageChange(pageCount)}
                disabled={atEnd}
                label={t("lastPage")}
                className="w-9"
            > 
                <IconChevronFirst className="ltr:scale-x-[-1] rtl:block" />
            </NavButton>
        </nav>
    );
}

 

// ─────────────────────────────────────────────────────────────────────────────
// NavButton
// ─────────────────────────────────────────────────────────────────────────────

interface NavButtonProps {
    onClick: () => void;
    disabled: boolean;
    label: string;
    className?: string;
    children: React.ReactNode;
}

function NavButton({ onClick, disabled, label, className, children }: NavButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className={cn(
                pgBase,
                "text-dark/55 hover:bg-gray/5 hover:text-dark hover:border-gray/25",
                className,
            )}
        >
            {children}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageNumberButton
// ─────────────────────────────────────────────────────────────────────────────

interface PageNumberButtonProps {
    page: number;
    isActive: boolean;
    onClick: () => void;
    ariaLabel: string;
}

function PageNumberButton({ page, isActive, onClick, ariaLabel }: PageNumberButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            aria-current={isActive ? "page" : undefined}
            className={cn(
                pgBase,
                "min-w-[36px] px-2.5",
                isActive
                    ? [
                        "bg-secondary border-secondary text-white",
                        // Soft teal shadow — uses the brand color directly
                        "shadow-[0_2px_8px_rgba(29,158,117,.26)]",
                        "hover:bg-primary hover:border-primary",
                    ].join(" ")
                    : "text-dark/65 hover:bg-gray/5 hover:text-dark hover:border-gray/25",
            )}
        >
            {page}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TablePagination — URL-coupled controller
// ─────────────────────────────────────────────────────────────────────────────

export default function TablePagination({ pageCount, pageSize, total }: TablePaginationProps) {
    const t            = useTranslations("dashboard.pagination");
    const searchParams = useSearchParams();
    const pathname     = usePathname();

    const currentPage = Number(searchParams.get("page")) || 1;
    const startEntry  = (currentPage - 1) * pageSize + 1;
    const endEntry    = Math.min(currentPage * pageSize, total);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        updateUrlParams(pathname, params);
    };

    if (total === 0) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-4 pt-5 mt-4",
                "flex-col-reverse lg:flex-row lg:justify-between",
                "border-t border-gray/10",
            )}
        >
            {/* ── Controls ─────────────────────────────────────────────── */}
            <div className="flex-1 flex justify-center lg:justify-start">
                {pageCount > 1 ? (
                    <Pagination
                        currentPage={currentPage}
                        pageCount={pageCount}
                        onPageChange={handlePageChange}
                    />
                ) : (
                    // Maintain layout height even when there's only one page
                    <div aria-hidden="true" className="h-9" />
                )}
            </div>

            {/* ── Entry badge ─────────────────────────────────────────── */}
            <EntryBadge
                start={startEntry}
                end={endEntry}
                total={total}
                showingLabel={t("showing")}
                ofLabel={t("of")}
                ariaLabel={t("showingEntries", { start: startEntry, end: endEntry, total })}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// EntryBadge — "Showing 1–10 of 248"
// ─────────────────────────────────────────────────────────────────────────────

interface EntryBadgeProps {
    start: number;
    end: number;
    total: number;
    showingLabel: string;
    ofLabel: string;
    ariaLabel: string;
}

function EntryBadge({ start, end, total, showingLabel, ofLabel, ariaLabel }: EntryBadgeProps) {
    return (
        <div
            aria-live="polite"
            aria-label={ariaLabel}
            className={cn(
                "inline-flex items-center gap-2",
                "flex-row rtl:flex-row-reverse",
                "px-3.5 py-[7px] rounded-xl",
                "bg-card-bg border border-gray/15",
                "transition-colors duration-200 hover:border-gray/25",
            )}
        >
            {/* Live pulse dot */}
            <span aria-hidden="true" className="relative flex h-[7px] w-[7px] shrink-0">
                <span className="animate-ping absolute inset-0 rounded-full bg-secondary opacity-22" />
                <span className="relative flex h-[7px] w-[7px] rounded-full bg-secondary" />
            </span>

            {/* Text */}
            <p
                className={cn(
                    "flex items-baseline gap-[5px] text-[13px] text-dark/55",
                    "flex-row rtl:flex-row-reverse",
                )}
            >
                {/* "Showing" — visually hidden on very small screens */}
                <span className="hidden sm:inline">{showingLabel}</span>

                {/* Highlighted range chip */}
                <span
                    className={cn(
                        "inline-flex items-baseline gap-[3px]",
                        "flex-row rtl:flex-row-reverse",
                        "px-2 py-[2px] rounded-[7px]",
                        "bg-secondary/[0.07] border border-secondary/[0.13]",
                    )}
                >
                    <span className="text-primary font-medium tabular-nums text-[13px]">{start}</span>
                    <span className="text-dark/25 text-[12px]">–</span>
                    <span className="text-primary font-medium tabular-nums text-[13px]">{end}</span>
                </span>

                <span className="text-dark/30">{ofLabel}</span>

                <span className="text-dark font-medium tabular-nums text-[13px]">{total}</span>
            </p>
        </div>
    );
}