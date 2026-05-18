'use client';

import { useRef, useState } from 'react';
import { FiChevronDown, FiCheck, FiSearch } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useOutsideClick } from '@/hooks/useOutsideClick';

/* ── Types ───────────────────────────────────────────────────────── */
export type Option = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type SelectProps = {
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsLabel?: string;
  noOptionsDescription?: string;
  className?: string;
  dir?: 'ltr' | 'rtl';
  value?: Option | null;
  triggerClassName?: string;
  dropdownClassName?: string;
  onChange?: (opt: Option) => void;
  openDirection?: 'top' | 'bottom';
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
};

/* ── Component ───────────────────────────────────────────────────── */
export default function SelectInput({
  options,
  className,
  placeholder = 'اختر',
  searchPlaceholder = 'Search…',
  noOptionsLabel = 'No options found',
  noOptionsDescription = 'Try a different search term.',
  dir ,
  value,
  triggerClassName = '',
  onChange,
  dropdownClassName = '',
  openDirection = 'bottom',
  label,
  error,
  required,
  disabled,
  searchable = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useOutsideClick(selectRef, () => {
    setIsOpen(false);
    setSearchQuery('');
  });

  const handleSelect = (opt: Option) => {
    if (opt.disabled) return;
    onChange?.(opt);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    if (next && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  };

  const filteredOptions = searchQuery
    ? options.filter((o) =>
        o.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const dropdownPositionClass =
    openDirection === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5';

  return (
    <div
      className={cn('flex flex-col gap-1.5 w-full', className)}
      {...(dir ? { dir } : {})}
    >
      {/* ── Label ── */}
      {label && (
        <label className=" text-sm font-semibold text-[color:var(--input)] flex items-center gap-1 select-none">
          {label}
          {required && (
            <span className="text-red-500 md: leading-none" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative" ref={selectRef}>
        {/* Ambient glow — only when open and no error */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute -inset-0.5 rounded-xl bg-[color:var(--secondary)]/20 opacity-0 blur transition-opacity duration-300 pointer-events-none',
            !error && isOpen && 'opacity-100'
          )}
        />

        {/* ── Trigger Button ── */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={!!error}
          className={cn(
            'relative w-full min-h-[48px] px-3.5 rounded-xl text-sm font-medium',
            'bg-white border-2 transition-all duration-200 ',
            'flex items-center  justify-between gap-2',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--secondary)]/50 focus-visible:ring-offset-1',
            error
              ? 'border-red-300 bg-red-50/40 hover:border-red-400'
              : isOpen
              ? 'border-[color:var(--secondary)] shadow-md shadow-[color:var(--secondary)]/10'
              : 'border-[color:var(--gray)]/20 hover:border-[color:var(--secondary)]/40',
            disabled && 'bg-slate-50 cursor-not-allowed opacity-50',
            triggerClassName
          )}
        >
          {/* Left: icon + label */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {value?.icon && (
              <span className="flex-shrink-0 text-[color:var(--secondary)]" aria-hidden="true">
                {value.icon}
              </span>
            )}
            <span
              className={cn(
                'truncate flex-1 ltr:text-left rtl:text-right',
                value ? 'text-[color:var(--dark)]' : 'text-[color:var(--placeholder)]'
              )}
            >
              {value ? value.label : placeholder}
            </span>
          </div>

          {/* Right: chevron */}
          <FiChevronDown
            aria-hidden="true"
            className={cn(
              'w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-250',
              isOpen && 'rotate-180 text-[color:var(--secondary)]'
            )}
          />
        </button>

        {/* ── Dropdown ── */}
        {isOpen && (
          <div
            role="listbox"
            aria-label={label ?? placeholder}
            className={cn(
              'absolute ltr:left-0 rtl:right-0 ltr:right-0 rtl:left-0 z-[100]',
              'bg-white rounded-xl shadow-2xl shadow-black/10',
              'border border-[color:var(--secondary)]/15',
              'overflow-hidden',
              // Pure Tailwind enter animation — no external animate.css needed
              'animate-in fade-in-0 slide-in-from-top-1 duration-150',
              dropdownPositionClass,
              dropdownClassName
            )}
          >
            {/* Search */}
            {searchable && (
              <div className=" p-2.5 border-b border-slate-100">
                <div className="relative">
                  <FiSearch
                    aria-hidden="true"
                    className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={cn(
                      'w-full h-9 text-sm rounded-lg bg-slate-50',
                      'border border-slate-200',
                      'ltr:pl-8 ltr:pr-3 rtl:pr-8 rtl:pl-3',
                      'focus:outline-none focus:border-[color:var(--secondary)]/50 focus:bg-white',
                      'placeholder:text-[color:var(--placeholder)] transition-colors duration-150'
                    )}
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-[280px] overflow-y-auto scroll-smooth py-1.5">
              {filteredOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center gap-2">
                  <span className="text-2xl select-none" aria-hidden="true">🔍</span>
                  <p className="text-sm font-semibold text-slate-600">{noOptionsLabel}</p>
                  <p className="text-xs text-slate-400">{noOptionsDescription}</p>
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = value?.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt)}
                      disabled={opt.disabled}
                      className={cn(
                        'w-full px-3.5 py-2.5 text-sm font-medium',
                        'flex items-center justify-between gap-2 ',
                        'ltr:text-left rtl:text-right  flex-1',
                        'transition-colors duration-150', 
                        isSelected
                          ? [
                              'bg-[color:var(--secondary)]/8 text-[color:var(--secondary)]',
                              'ltr:border-l-2 rtl:border-r-2 border-[color:var(--secondary)]',
                              'ltr:pl-[13px] rtl:pr-[13px]', // compensate for border width
                            ]
                          : opt.disabled
                          ? 'opacity-40 cursor-not-allowed text-slate-400'
                          : 'text-[color:var(--dark)] hover:bg-slate-50 active:bg-slate-100'
                      )}
                    >
                      {/* Icon + label */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {opt.icon && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              'flex-shrink-0 transition-colors',
                              isSelected ? 'text-[color:var(--secondary)]' : 'text-slate-400'
                            )}
                          >
                            {opt.icon}
                          </span>
                        )}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      {/* Check mark */}
                      {isSelected && (
                        <FiCheck
                          aria-hidden="true"
                          className="w-4 h-4 flex-shrink-0 text-[color:var(--secondary)]"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 ltr:text-left rtl:text-right"
        >
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
 