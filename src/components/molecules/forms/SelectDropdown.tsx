'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { IoCheckmark } from 'react-icons/io5';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Keyframes — injected once, scoped with prefix to avoid collisions
// ─────────────────────────────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes sd-fade-drop {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
@keyframes sd-item-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0);    }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Option {
    label: string;
    value: string;
}

interface SelectDropdownProps {
    /** Placeholder shown when no option is selected */
    label: string;
    options: Option[];
    value?: string;
    onChange: (value: string | undefined) => void;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SelectDropdown({
    label,
    options,
    value,
    onChange,
    className = '',
}: SelectDropdownProps) {
    const [isOpen, setIsOpen]   = useState(false);
    const dropdownRef           = useRef<HTMLDivElement>(null);
    const listboxId             = useId();

    const selectedOption = options.find((opt) => opt.value === value);

    // ── Click-outside close ──────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Keyboard navigation ──────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((v) => !v);
        }
    };

    const handleSelect = (optValue: string) => {
        onChange(optValue);
        setIsOpen(false);
    };

    // ─────────────────────────────────────────────────────────────────────

    return (
        <>
            <style>{KEYFRAMES}</style>

            <div
                ref={dropdownRef}
                className={cn('relative w-full lg:w-[220px]', className)}
            >
                {/* ── Trigger button ──────────────────────────────────── */}
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    onClick={() => setIsOpen((v) => !v)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        // Layout
                        'group relative flex items-center justify-between gap-2',
                        'flex-row ',
                        'w-full h-[45px] px-4 rounded-xl',
                        // Surface
                        'bg-white',
                        'ring-2 transition-all duration-200',
                        // Active/open state
                        isOpen
                            ? 'ring-secondary/40 shadow-sm shadow-secondary/10'
                            : 'ring-gray/15 hover:ring-secondary/30',
                        // Press feedback
                        'active:scale-[0.985]',
                        // Focus ring
                        'focus-visible:outline-none focus-visible:ring-secondary/50',
                    )}
                >
                    {/* Hover glow bloom */}
                    <span
                        aria-hidden="true"
                        className={cn(
                            'pointer-events-none absolute -inset-0.5 -z-10',
                            'rounded-xl blur-sm',
                            'bg-gradient-to-r from-secondary/15 to-primary/15',
                            'opacity-0 group-hover:opacity-100',
                            'transition-opacity duration-200',
                        )}
                    />

                    {/* Label / selected value */}
                    <span
                        className={cn(
                            'flex-1 min-w-0 truncate text-sm font-medium text-start',
                            'transition-colors duration-150',
                            selectedOption ? 'text-dark' : 'text-dark/40',
                        )}
                    >
                        {selectedOption ? selectedOption.label : label}
                    </span>

                    {/* Chevron */}
                    <FaChevronDown
                        aria-hidden="true"
                        className={cn(
                            'shrink-0 text-[11px]',
                            'transition-all duration-250',
                            isOpen
                                ? 'rotate-180 text-secondary'
                                : 'rotate-0 text-dark/35 group-hover:text-secondary/70',
                        )}
                    />
                </button>

                {/* ── Dropdown panel ───────────────────────────────────── */}
                {isOpen && (
                    <div
                        id={listboxId}
                        role="listbox"
                        aria-label={label}
                        className={cn(
                            'absolute z-50 w-full mt-2',
                            'bg-white rounded-xl',
                            'ring-1 ring-gray/15',
                            'shadow-xl shadow-dark/[0.08]',
                            'overflow-hidden',
                        )}
                        style={{
                            animation: 'sd-fade-drop 180ms cubic-bezier(0.4,0,0.2,1) both',
                        }}
                    >
                        <div className="max-h-60 overflow-y-auto thin-scrollbar py-1">
                            {options.map((option, index) => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            // Layout
                                            'w-full px-4 py-2.5',
                                            'flex items-center justify-between gap-2',
                                            'flex-row ',
                                            'text-sm font-medium text-start',
                                            // States
                                            'transition-colors duration-100',
                                            'focus-visible:outline-none focus-visible:bg-secondary/8',
                                            isSelected
                                                ? 'bg-gradient-to-r from-secondary/12 to-primary/10 text-primary'
                                                : 'text-dark hover:bg-secondary/[0.05]',
                                        )}
                                        style={{
                                            animation: `sd-item-in 200ms ${index * 25}ms cubic-bezier(0.4,0,0.2,1) both`,
                                        }}
                                    >
                                        <span className="truncate">{option.label}</span>

                                        {/* Checkmark — RTL: appears on trailing (left) side */}
                                        <span
                                            className={cn(
                                                'shrink-0 transition-all duration-150',
                                                isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
                                            )}
                                        >
                                            <IoCheckmark
                                                aria-hidden="true"
                                                className="text-primary"
                                                size={16}
                                            />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}