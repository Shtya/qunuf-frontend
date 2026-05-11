'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LuSearch } from 'react-icons/lu';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface KeywordSearchProps {
    value: string;
    onChange: (val: string) => void;
    searchPlaceholder?: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    className?: string;
    variant?: 'default' | 'minimal';
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function KeywordSearch({
    value,
    onChange,
    searchPlaceholder = '...',
    inputRef,
    className,
    variant = 'default',
}: KeywordSearchProps) {
    const [isFocused, setIsFocused] = useState(false);
    const isMinimal = variant === 'minimal';

    return (
        <div
            className={cn(
                // Layout
                "relative flex items-center gap-2.5",
                "flex-row ",
                "px-3.5 py-2.5 rounded-2xl",
                // Width: base + +50px on focus via max-w transition
                // We use a CSS custom-property trick via inline style below
                // so Tailwind's purge doesn't strip the dynamic value.
                "transition-all duration-300 ease-out",
                // Variant styles
                isMinimal
                    ? [
                        "bg-gray-50/80 border border-transparent",
                        "focus-within:bg-white",
                        "focus-within:ring-2 focus-within:ring-secondary/25",
                        "focus-within:border-secondary/20",
                    ].join(" ")
                    : [
                        "bg-white border border-gray/15",
                        "shadow-sm",
                        "focus-within:border-secondary/50",
                        "focus-within:shadow-md focus-within:shadow-secondary/10",
                    ].join(" "),
                className,
            )}
            style={{
                // Base width: 320px. Expand by 50px to 370px when focused.
                // Using CSS width + transition lets us bypass Tailwind's
                // arbitrary-value purge concern and keeps the animation smooth.
                width: isFocused ? '370px' : '320px',
                maxWidth: '100%',           // never overflow on small screens
                transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms ease, border-color 200ms ease',
            }}
        >
            {/* Search icon */}
            <LuSearch
                aria-hidden="true"
                className={cn(
                    "shrink-0 w-4 h-4",
                    "transition-colors duration-200",
                    isFocused ? "text-secondary" : "text-dark/35",
                )}
            />

            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                value={value}
                placeholder={searchPlaceholder}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                    "flex-1 min-w-0 bg-transparent",
                    "text-sm font-medium text-dark",
                    "placeholder:text-dark/35",
                    "focus:outline-none",
                    // Direction-aware text alignment
                    "text-start",
                )}
            />

            {/* Clear button — appears when there is a value */}
            {value && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onChange('')}
                    className={cn(
                        "shrink-0 flex items-center justify-center",
                        "w-4 h-4 rounded-full",
                        "text-dark/35 hover:text-dark/70",
                        "transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40",
                    )}
                >
                    {/* ✕ icon inline — no extra icon import */}
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                        <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
                    </svg>
                </button>
            )}
        </div>
    );
}