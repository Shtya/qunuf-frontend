import { cn } from '@/lib/utils';
import React from 'react';

interface PaginationButtonProps {
    label: string;
    icon: React.ReactNode;
    iconPosition?: 'left' | 'right';
    isDisabled: boolean;
    currentPage: number;
    onPageChange: () => void;
}

export default function PaginationButton({
    label,
    icon,
    iconPosition = 'left',
    isDisabled,
    onPageChange,
}: PaginationButtonProps) {
    return (
        <button
            onClick={isDisabled ? undefined : onPageChange}
            disabled={isDisabled}
            className={cn(
                "group relative flex items-center gap-2 px-4 py-2.5 rounded-xl",
                "text-sm font-semibold transition-all duration-200",
                !isDisabled && "active:scale-95",
                // IMPROVED DISABLED STATE:
                isDisabled
                    ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-100" // Removed opacity-60, used solid grays
                    : "bg-white border border-gray/20 text-dark hover:border-secondary hover:bg-gradient-to-r hover:from-secondary/5 hover:to-primary/5 hover:shadow-sm"
            )}
            aria-label={label}
            aria-disabled={isDisabled}
        >
            {/* Hover glow effect - only for enabled state */}
            {!isDisabled && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/0 via-secondary/10 to-primary/0 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-200 -z-10" />
            )}

            {/* Icon and Label */}
            {iconPosition === 'left' && (
                <span className={cn(
                    "transition-transform duration-200",
                    !isDisabled && "group-hover:scale-110"
                )}>
                    {icon}
                </span>
            )}

            <span className="hidden sm:inline">{label}</span>

            {iconPosition === 'right' && (
                <span className={cn(
                    "transition-transform duration-200",
                    !isDisabled && "group-hover:scale-110"
                )}>
                    {icon}
                </span>
            )}
        </button>
    );
}