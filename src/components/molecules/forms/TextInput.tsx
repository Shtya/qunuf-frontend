'use client';

import { cn } from '@/lib/utils';

 
/* ── Component ───────────────────────────────────────────────────── */
export default function TextInput({
  label,
  placeholder,
  value,
  className,
  onChange,
  error,
  required,
  disabled,
  readOnly,
  suffix,
  prefix,
  type = 'text',
  ...props
}: any) {
  const hasError = !!error;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>

      {/* ── Label ── */}
      {label && (
        <label className="text-sm font-semibold text-[color:var(--input)] flex items-center gap-1 select-none ltr:text-left rtl:text-right">
          {label}
          {required && (
            <span className="text-red-500 leading-none" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* ── Input wrapper ── */}
      <div className="relative w-full group/row">

        {/* Ambient glow — appears on focus when there's no error */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute -inset-0.5 rounded-xl bg-[color:var(--secondary)]/20 opacity-0 blur transition-opacity duration-300 pointer-events-none',
            !hasError && 'group-focus-within/row:opacity-100'
          )}
        />

        {/* Prefix adornment */}
        {prefix && (
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-y-0 flex items-center px-3.5 pointer-events-none z-10',
              'border-e border-[color:var(--gray)]/15 text-[color:var(--dark)]/50 font-medium text-sm',
              'ltr:left-0 rtl:right-0'
            )}
          >
            {prefix}
          </div>
        )}

        {/* Input */}
        <input
          {...props}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-required={required}
          className={cn(
            'relative w-full min-h-[48px] rounded-xl text-sm font-medium',
            'bg-white border-2 transition-all duration-200',
            'text-[color:var(--dark)] placeholder:text-[color:var(--placeholder)]',
            // Horizontal padding — base
            'ltr:pl-3.5 ltr:pr-3.5 rtl:pr-3.5 rtl:pl-3.5',
            // Prefix padding compensation
            prefix && 'ltr:pl-[52px] rtl:pr-[52px]',
            // Suffix padding compensation
            suffix && 'ltr:pr-[52px] rtl:pl-[52px]',
            // Focus
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--secondary)]/50 focus-visible:ring-offset-1',
            // Border states
            hasError
              ? 'border-red-300 bg-red-50/40 hover:border-red-400 focus:border-red-400'
              : [
                  'border-[color:var(--gray)]/20',
                  'hover:border-[color:var(--secondary)]/40',
                  'focus:border-[color:var(--secondary)]',
                ],
            // Disabled / ReadOnly
            disabled && 'bg-slate-50 cursor-not-allowed opacity-50',
            readOnly && 'bg-slate-50 cursor-default select-all'
          )}
        />

        {/* Suffix adornment */}
        {suffix && (
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-y-0 flex items-center px-3.5 pointer-events-none z-10',
              'border-s border-[color:var(--gray)]/15 text-[color:var(--dark)]/50 font-medium text-sm',
              'ltr:right-0 rtl:left-0'
            )}
          >
            {suffix}
          </div>
        )}
      </div>

      {/* ── Error message ── */}
      {hasError && (
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
 