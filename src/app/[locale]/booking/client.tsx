'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  BOOKING FLOW — Single-File Redesign v2
 *  - Portal-based PortalSelect (fixes overflow-hidden issue)
 *  - Premium flat card UI with brand color accents
 *  - Full RTL/LTR support
 *  - Mobile-first responsive
 *  - All business logic preserved
 * ═══════════════════════════════════════════════════════════════
 */

import {
  JSX, ComponentType, ReactNode,
  useRef, useState, useEffect, useMemo, useTransition,
  useCallback, 
} from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { usePathname, useRouter, Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { useValues } from '@/contexts/GlobalContext';
import { IdentityType } from '@/types/global';
import { PropertyStatus, PropertyType, RentType } from '@/types/dashboard/properties';
import api from '@/libs/axios';
import toast from 'react-hot-toast';
import { IoMdCheckmark } from 'react-icons/io';
import {
  FiChevronDown, FiCheck, FiSearch, FiAlertCircle,
  FiCalendar, FiX, FiUser, FiFileText, FiDollarSign,
  FiHome, FiGlobe,
} from 'react-icons/fi';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { cn } from '@/lib/utils';
import { saudiPhoneRegex } from '@/utils/helpers';
import { isWithinAdultRange } from '@/utils/date';
import { createPortal } from 'react-dom';

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */

export type Option = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  disabled?: boolean;
};

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════════ */

const GLOBAL_STYLES = `
  /* Flatpickr overrides */
  .flatpickr-calendar {
    border-radius: 16px !important;
    border: 1px solid rgba(0,0,0,.08) !important;
    box-shadow: 0 16px 48px -8px rgba(0,0,0,.14), 0 4px 12px -2px rgba(0,0,0,.06) !important;
    font-family: inherit !important;
    overflow: hidden !important;
  }
  .flatpickr-month { background: transparent !important; }
  .flatpickr-current-month { font-weight: 700 !important; }
  .flatpickr-day.selected,
  .flatpickr-day.selected:hover {
    background: var(--secondary) !important;
    border-color: var(--secondary) !important;
    border-radius: 8px !important;
  }
  .flatpickr-day:hover {
    background: color-mix(in srgb, var(--secondary) 10%, transparent) !important;
    border-radius: 8px !important;
  }
  .flatpickr-day.today { border-color: var(--secondary) !important; border-radius: 8px !important; }

  /* Portal dropdown - lives in body, never clipped */
  .bk-portal-dd {
    position: fixed !important;
    z-index: 99999 !important;
    background: #ffffff;
    border-radius: 14px;
    border: 1.5px solid rgba(0,0,0,.08);
    box-shadow: 0 20px 60px -10px rgba(0,0,0,.16), 0 6px 20px -4px rgba(0,0,0,.08);
    overflow: hidden;
    animation: bkSlideIn 160ms cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes bkSlideIn {
    from { opacity: 0; transform: translateY(-8px) scale(.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  /* Custom scrollbar */
  .bk-scroll::-webkit-scrollbar { width: 4px; }
  .bk-scroll::-webkit-scrollbar-track { background: transparent; }
  .bk-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 4px; }

  /* Input */
  .bk-inp {
    width: 100%; height: 50px;
    padding: 0 14px;
    border: 1.5px solid rgba(0,0,0,.1);
    border-radius: 11px;
    background: #fff;
    font-size: 14px; font-weight: 500;
    color: var(--dark, #18181b);
    transition: border-color 160ms, box-shadow 160ms;
    outline: none;
    font-family: inherit;
  }
  .bk-inp::placeholder { color: rgba(0,0,0,.28); font-weight: 400; }
  .bk-inp:hover:not(:disabled) { border-color: color-mix(in srgb, var(--secondary) 55%, transparent); }
  .bk-inp:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3.5px color-mix(in srgb, var(--secondary) 13%, transparent);
  }
  .bk-inp.err { border-color: #f87171 !important; background: #fff8f8; }
  .bk-inp.err:focus { box-shadow: 0 0 0 3.5px rgba(248,113,113,.18) !important; }
  .bk-inp:disabled { background: #f4f5f6; cursor: not-allowed; opacity: .55; }

  /* Select trigger */
  .bk-sel {
    width: 100%; height: 50px;
    padding: 0 14px;
    border: 1.5px solid rgba(0,0,0,.1);
    border-radius: 11px;
    background: #fff;
    font-size: 14px; font-weight: 500;
    color: var(--dark, #18181b);
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    cursor: pointer;
    transition: border-color 160ms, box-shadow 160ms;
    outline: none;
    text-align: start; /* respects dir attribute */
  }
  .bk-sel:hover:not(:disabled) { border-color: color-mix(in srgb, var(--secondary) 55%, transparent); }
  .bk-sel.open {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3.5px color-mix(in srgb, var(--secondary) 13%, transparent);
  }
  .bk-sel.err { border-color: #f87171 !important; background: #fff8f8; }
  .bk-sel:disabled { background: #f4f5f6; cursor: not-allowed; opacity: .55; }
  .bk-sel.ph { color: rgba(0,0,0,.28); font-weight: 400; }

  /* Search in dropdown */
  .bk-dd-search {
    width: 100%; height: 36px;
    border: 1px solid rgba(0,0,0,.1);
    border-radius: 8px;
    background: #f7f8fa;
    font-size: 13px; font-weight: 400;
    outline: none;
    font-family: inherit;
  }
  .bk-dd-search:focus { border-color: var(--secondary); background: #fff; }

  /* Option */
  .bk-opt {
    width: 100%;
    padding: 10px 14px;
    font-size: 14px; font-weight: 500;
    color: var(--dark, #18181b);
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    cursor: pointer;
    background: transparent; border: none;
    text-align: start;
    transition: background 90ms;
    font-family: inherit;
  }
  .bk-opt:hover { background: rgba(0,0,0,.04); }
  .bk-opt.sel {
    background: color-mix(in srgb, var(--secondary) 9%, transparent);
    color: var(--secondary); font-weight: 700;
  }
  .bk-opt:disabled { opacity: .4; cursor: not-allowed; }

  /* Btn primary */
  .bk-btn-p {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    height: 50px; padding: 0 32px;
    border-radius: 11px; border: none;
    background: var(--secondary);
    color: #fff; font-size: 14px; font-weight: 700; letter-spacing: .01em;
    cursor: pointer;
    transition: filter 160ms, transform 110ms;
    box-shadow: 0 4px 18px color-mix(in srgb, var(--secondary) 32%, transparent);
    font-family: inherit;
  }
  .bk-btn-p:hover:not(:disabled) { filter: brightness(1.07); }
  .bk-btn-p:active:not(:disabled) { transform: scale(.98); }
  .bk-btn-p:disabled { opacity: .42; cursor: not-allowed; box-shadow: none; }

  /* Btn ghost */
  .bk-btn-g {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    height: 50px; padding: 0 28px;
    border-radius: 11px;
    border: 1.5px solid rgba(0,0,0,.1);
    background: transparent;
    color: rgba(0,0,0,.45); font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: background 130ms, border-color 130ms, color 130ms, transform 110ms;
    font-family: inherit;
  }
  .bk-btn-g:hover { background: rgba(0,0,0,.04); border-color: rgba(0,0,0,.18); color: rgba(0,0,0,.65); }
  .bk-btn-g:active { transform: scale(.98); }

  /* Card */
  .bk-card {
    background: #fff;
    border-radius: 16px;
    border: 1.5px solid rgba(0,0,0,.06);
    overflow: visible; /* Important: never clip, dropdowns escape */
  }
  .bk-card-head {
    padding: 14px 18px;
    border-bottom: 1px solid rgba(0,0,0,.05);
    display: flex; align-items: center; gap: 10px;
  }
  .bk-card-ico {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--secondary) 11%, transparent);
    color: var(--secondary);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .bk-card-title {
    font-size: 12px; font-weight: 800;
    text-transform: uppercase; letter-spacing: .07em;
    color: color-mix(in srgb, var(--secondary) 75%, #000);
  }
  .bk-card-body { padding: 18px; }

  /* Label */
  .bk-lbl {
    display: block;
    font-size: 13px; font-weight: 700;
    color: rgba(0,0,0,.52);
    margin-bottom: 7px;
  }

  /* Error */
  .bk-err {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 600;
    color: #e53e3e;
    margin-top: 6px;
  }

  /* Hint */
  .bk-hint {
    font-size: 12px; font-weight: 500;
    color: rgba(0,0,0,.35);
    margin-top: 6px;
    line-height: 1.6;
  }

  /* Step */
  .bk-step {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700;
    border: 2px solid transparent;
    transition: all 280ms cubic-bezier(.16,1,.3,1);
    flex-shrink: 0;
  }
  .bk-step-idle { background: #f0f1f3; color: rgba(0,0,0,.3); border-color: #e5e7eb; }
  .bk-step-active {
    background: var(--secondary); color: #fff; border-color: var(--secondary);
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--secondary) 17%, transparent);
  }
  .bk-step-done { background: var(--secondary); color: #fff; border-color: var(--secondary); }

  /* Textarea */
  .bk-ta {
    width: 100%; padding: 13px 14px;
    border: 1.5px solid rgba(0,0,0,.1); border-radius: 11px;
    background: #fff; font-size: 14px; font-weight: 500;
    color: var(--dark, #18181b); line-height: 1.75;
    transition: border-color 160ms, box-shadow 160ms;
    outline: none; resize: vertical; font-family: inherit;
  }
  .bk-ta::placeholder { color: rgba(0,0,0,.28); font-weight: 400; }
  .bk-ta:hover { border-color: color-mix(in srgb, var(--secondary) 55%, transparent); }
  .bk-ta:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3.5px color-mix(in srgb, var(--secondary) 13%, transparent);
  }

  /* Info label/value */
  .bk-il { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: rgba(0,0,0,.32); margin-bottom: 2px; }
  .bk-iv { font-size: 14px; font-weight: 600; color: var(--dark, #18181b); }
  .bk-iv-accent { font-size: 18px; font-weight: 800; color: var(--secondary); }

  /* Spinner */
  @keyframes bkSpin { to { transform: rotate(360deg); } }
  .bk-spin {
    width: 34px; height: 34px;
    border: 3px solid rgba(0,0,0,.07);
    border-top-color: var(--secondary);
    border-radius: 50%;
    animation: bkSpin .75s linear infinite;
  }

  /* Fade up */
  @keyframes bkFU { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .bk-fu { animation: bkFU 300ms cubic-bezier(.16,1,.3,1) both; }

  /* Terms */
  .bk-terms {
    max-height: 280px; overflow-y: auto;
    background: #f7f8fa; border-radius: 9px;
    padding: 14px; border: 1px solid rgba(0,0,0,.05);
    font-size: 13px; line-height: 1.85;
    color: rgba(0,0,0,.55); white-space: pre-wrap; word-break: break-word;
  }

  /* Responsive */
  @media (max-width: 599px) {
    .bk-g2 { grid-template-columns: 1fr !important; }
    .bk-actions { flex-direction: column !important; }
    .bk-btn-p, .bk-btn-g { width: 100% !important; min-width: unset !important; }
  }
`;

/* ══════════════════════════════════════════════════════════════
   PORTAL
══════════════════════════════════════════════════════════════ */

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* ══════════════════════════════════════════════════════════════
   FORM ERROR MESSAGE
══════════════════════════════════════════════════════════════ */

function Err({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="bk-err">
      <FiAlertCircle size={12} />
      <span>{message}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEXT INPUT
══════════════════════════════════════════════════════════════ */

function TextInput({ label, placeholder, value, className, onChange, error,
  required, disabled, readOnly, type = 'text', min, max, ...props }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} className={className}>
      {label && (
        <label className="bk-lbl">
          {label}
          {required && <span style={{ color: '#e53e3e', marginInlineStart: 2 }}>*</span>}
        </label>
      )}
      <input
        {...props}
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} readOnly={readOnly}
        disabled={disabled} required={required} min={min} max={max}
        className={cn('bk-inp', error && 'err')}
      />
      <Err message={error} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PORTAL SELECT — key fix: dropdown exits overflow-hidden parent
══════════════════════════════════════════════════════════════ */

type PSProps = {
  options: Option[];
  placeholder?: string;
  value?: Option | null;
  onChange?: (opt: Option) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

function PortalSelect({
  options, placeholder = 'Select…', value, onChange,
  label, error, required, disabled, className,
}: PSProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const tSearch = useTranslations ? useTranslations('common') : null;
  const t = useTranslations("common")
  const computePos = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const MAX_DROP_H = 280;
    const below = window.innerHeight - r.bottom;
    const above = r.top;
    const openUp = below < MAX_DROP_H && above > below;
    setPos({
      top: openUp ? r.top - 8 : r.bottom + 6,
      left: isRTL ? r.right - r.width : r.left,
      width: r.width,
      openUp,
    });
  }, [isRTL]);

  const openDrop = () => {
    if (disabled) return;
    computePos();
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 70);
  };

  const closeDrop = useCallback(() => { setOpen(false); setSearch(''); }, []);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t)) {
        const dd = document.querySelector('.bk-portal-dd');
        if (!dd?.contains(t)) closeDrop();
      }
    };
    const onScroll = () => computePos();
    const onResize = () => closeDrop();
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, closeDrop, computePos]);

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handlePick = (opt: Option) => {
    if (opt.disabled) return;
    onChange?.(opt);
    closeDrop();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} className={className}>
      {label && (
        <label className="bk-lbl">
          {label}
          {required && <span style={{ color: '#e53e3e', marginInlineStart: 2 }}>*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={open ? closeDrop : openDrop}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn('bk-sel', open && 'open', error && 'err', !value && 'ph')}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'start' }}>
          {value ? value.label : placeholder}
        </span>
        <FiChevronDown
          size={16}
          style={{
            flexShrink: 0,
            transition: 'transform 200ms',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            color: open ? 'var(--secondary)' : 'rgba(0,0,0,.32)',
          }}
        />
      </button>

      <Err message={error} />

      {open && (
        <Portal>
          <div
            className="bk-portal-dd bk-scroll"
            role="listbox"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp ? window.innerHeight - pos.top : undefined,
              left: pos.left,
              width: Math.max(pos.width, 220),
              transformOrigin: pos.openUp ? 'bottom center' : 'top center',
            }}
          >
            {/* Search */}
            <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
              <div style={{ position: 'relative' }}>
                <FiSearch
                  size={13}
                  style={{
                    position: 'absolute',
                    top: '50%', transform: 'translateY(-50%)',
                    ...(isRTL ? { right: 10 } : { left: 10 }),
                    color: 'rgba(0,0,0,.32)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t("Search…")}
                  className="bk-dd-search"
                  style={{
                    ...(isRTL
                      ? { paddingRight: 30, paddingLeft: 10 }
                      : { paddingLeft: 30, paddingRight: 10 }),
                  }}
                />
              </div>
            </div>

            {/* Options */}
            <div
              className="bk-scroll"
              style={{ maxHeight: 224, overflowY: 'auto', padding: '4px 0' }}
            >
              {filtered.length === 0 ? (
                <div style={{
                  padding: '22px 14px', textAlign: 'center',
                  fontSize: 13, color: 'rgba(0,0,0,.35)', fontWeight: 500,
                }}>
                  No results
                </div>
              ) : filtered.map(opt => {
                const isSel = value?.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    onClick={() => handlePick(opt)}
                    disabled={opt.disabled}
                    className={cn('bk-opt', isSel && 'sel')}
                  >
                    <span style={{
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1, textAlign: 'start',
                    }}>
                      {opt.label}
                    </span>
                    {isSel && <FiCheck size={14} style={{ color: 'var(--secondary)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DATE INPUT
══════════════════════════════════════════════════════════════ */

interface DateInputProps {
  label?: string; placeholder?: string; value?: string | Date;
  onChange: (date: Date[]) => void; error?: string; required?: boolean;
  disabled?: boolean; className?: string; minDate?: Date | string;
  maxDate?: Date | string; mode?: 'single' | 'multiple' | 'range';
}

function DateInput({ label, placeholder = 'Select date', value, onChange, error,
  required, disabled, className, minDate, maxDate, mode = 'single' }: DateInputProps) {
  const fpRef = useRef<any>(null);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} className={className}>
      {label && (
        <label className="bk-lbl">
          {label}
          {required && <span style={{ color: '#e53e3e', marginInlineStart: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <Flatpickr
          ref={fpRef}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          options={{
            dateFormat: 'Y-m-d',
            disableMobile: true,
            static: false,
            minDate, maxDate, mode,
          }}
          className={cn('bk-inp', error && 'err')}
          style={{
            ...(isRTL ? { paddingLeft: 40 } : { paddingRight: 40 }),
          }}
        />
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          ...(isRTL ? { left: 12 } : { right: 12 }),
          display: 'flex', alignItems: 'center', gap: 6,
          pointerEvents: 'none', zIndex: 1,
        }}>
          {value && !disabled && (
            <button
              type="button"
              onClick={() => { fpRef.current?.flatpickr?.clear(); onChange([]); }}
              style={{
                pointerEvents: 'all', background: 'none', border: 'none',
                cursor: 'pointer', padding: 4, borderRadius: 6,
                color: 'rgba(0,0,0,.3)', display: 'flex',
              }}
            >
              <FiX size={13} />
            </button>
          )}
          <FiCalendar size={15} style={{ color: 'rgba(0,0,0,.28)' }} />
        </div>
      </div>
      <Err message={error} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECONDARY BUTTON
══════════════════════════════════════════════════════════════ */

type SBProps = {
  children: ReactNode; className?: string; onClick?: () => void;
  href?: string; type?: 'button' | 'submit' | 'reset';
  disabled?: boolean; variant?: 'primary' | 'ghost';
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

function SecondaryButton({ children, className, onClick, href, type = 'button', disabled, variant = 'ghost', ...props }: SBProps) {
  const cls = cn(variant === 'primary' ? 'bk-btn-p' : 'bk-btn-g', className);
  if (href) return <Link href={href} className={cls} {...props}>{children}</Link>;
  return <button type={type} disabled={disabled} onClick={onClick} className={cls}>{children}</button>;
}

/* ══════════════════════════════════════════════════════════════
   STEP TITLE
══════════════════════════════════════════════════════════════ */

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }} className="bk-fu">
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.2, color: 'var(--dark, #18181b)', margin: 0 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,.42)', lineHeight: 1.7, maxWidth: 460, margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FORM ACTIONS
══════════════════════════════════════════════════════════════ */

interface FAProps {
  onConfirm?: () => void; onCancel: () => void;
  confirmLabel?: string; cancelLabel?: string;
  isDisabled?: boolean; type?: 'button' | 'submit';
}

function FormActions({ onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  isDisabled = false, type = 'button' }: FAProps) {
  return (
    <div className="bk-actions" style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 8 }}>
      {type === 'submit'
        ? <button type="submit" disabled={isDisabled} className="bk-btn-p" style={{ minWidth: 200 }}>{confirmLabel}</button>
        : <button type="button" onClick={onConfirm} disabled={isDisabled} className="bk-btn-p" style={{ minWidth: 200 }}>{confirmLabel}</button>
      }
      <button type="button" onClick={onCancel} className="bk-btn-g" style={{ minWidth: 150 }}>{cancelLabel}</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION CARD
══════════════════════════════════════════════════════════════ */

function SectionCard({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="bk-card  bk-fu">
      <div className="bk-card-head">
        {icon && <div className="bk-card-ico">{icon}</div>}
        <span className="bk-card-title">{title}</span>
      </div>
      <div className="bk-card-body">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   INFO ROW
══════════════════════════════════════════════════════════════ */

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ padding: '5px 0' }}>
      <div className="bk-il">{label}</div>
      <div className="bk-iv">{value}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOGO
══════════════════════════════════════════════════════════════ */

function Logo({ className, small }: { className?: string; small?: boolean }) {
  const t = useTranslations('header');
  return (
    <Link href="/" className={cn('flex items-center flex-shrink-0', className)}>
      <span style={{ fontSize: small ? 18 : 21, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-.025em' }}>
        {t('logo')}
      </span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOCALE SWITCHER
══════════════════════════════════════════════════════════════ */

function LocaleSwitcher({ Trigger }: { Trigger?: ComponentType<{ onClick: () => void; disabled: boolean; lang?: string }> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('root');
  const pathname = usePathname();
  const params = useParams();
  const sp = useSearchParams();
  const currentLocale = useLocale();
  const nextLocale = currentLocale === routing.locales[0] ? routing.locales[1] : routing.locales[0];

  const toggle = () => startTransition(() => {
    const q: Record<string, string> = {};
    sp.forEach((v, k) => { q[k] = v; });
    // @ts-expect-error — runtime
    router.replace({ pathname, params, query: q }, { locale: nextLocale });
  });

  if (Trigger) return <Trigger onClick={toggle} disabled={isPending} lang={t('lang')} />;

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="bk-btn-g"
      style={{ height: 38, padding: '0 14px', gap: 7, borderRadius: 9, fontSize: 12 }}
    >
      <FiGlobe size={14} style={{ color: 'var(--secondary)' }} />
      <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', fontSize: 11 }}>
        {nextLocale}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEPPER
══════════════════════════════════════════════════════════════ */

function Stepper({ steps, active }: { steps: number[]; active: number }) {
  const trackW = `calc(${steps.length - 1} * 88px)`;
  const progress = `calc(${trackW} * ${(active - 1) / (steps.length - 1)})`;

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
      <div style={{ position: 'absolute', height: 2, background: '#e9ecef', top: 21, left: '50%', width: trackW, transform: 'translateX(-50%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', height: 2, background: 'var(--secondary)', top: 21, left: '50%', width: progress, transform: 'translateX(-50%)', zIndex: 1, transition: 'width 420ms cubic-bezier(.16,1,.3,1)' }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 88 }}>
        {steps.map(s => {
          const done = s < active;
          const cur = s === active;
          return (
            <div key={s} className={cn('bk-step', done ? 'bk-step-done' : cur ? 'bk-step-active' : 'bk-step-idle')}>
              {done ? <IoMdCheckmark size={20} /> : s}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VALIDATION SCHEMA
══════════════════════════════════════════════════════════════ */

const schema = z.object({
  phoneNumber: z.string().regex(saudiPhoneRegex, 'validation.invalidPhone').min(1, 'validation.required'),
  nationalityId: z.uuid('validation.required').min(1, 'validation.required'),
  identityType: z.string().min(1, 'validation.required'),
  identityOtherType: z.string().optional(),
  identityNumber: z.string().min(3, 'validation.min3').max(20, 'validation.max20').regex(/^[a-zA-Z0-9]*$/, 'validation.alphanumeric'),
  identityIssueCountryId: z.uuid('validation.required').min(1, 'validation.required'),
  birthDate: z.union([z.date(), z.undefined()])
    .refine(v => v !== undefined, { message: 'validation.required' })
    .refine(v => isWithinAdultRange(v), { message: 'validation.invalidBirthDate' }),
  shortAddress: z.string().length(8, 'validation.shortAddressLength')
    .regex(/^[A-Z]{4}\d{4}$|^[0-9]{8}$/, 'validation.shortAddressInvalid')
    .min(1, 'validation.required'),
}).superRefine((data, ctx) => {
  if (data.identityType === IdentityType.OTHER) {
    if (!data.identityOtherType || data.identityOtherType.length < 1) {
      ctx.addIssue({ path: ['identityOtherType'], message: 'validation.required', code: z.ZodIssueCode.custom }); return;
    }
    if (data.identityOtherType.length < 3)
      ctx.addIssue({ path: ['identityOtherType'], message: 'validation.min3', code: z.ZodIssueCode.custom });
  }
});

type FormData = z.infer<typeof schema>;

/* ══════════════════════════════════════════════════════════════
   STEP 1
══════════════════════════════════════════════════════════════ */

function Step1({ nextStep }: { nextStep: () => void }) {
  const t = useTranslations('bookings.fullDetails');
  const tA = useTranslations('dashboard.account');
  const locale = useLocale();
  const { user, setCurrentUser } = useAuth();
  const { countries, loadingCountries } = useValues();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        phoneNumber: user?.phoneNumber || '',
        nationalityId: user?.nationalityId || '',
        identityType: user?.identityType || IdentityType.NATIONAL_ID,
        identityOtherType: user?.identityOtherType || '',
        identityNumber: user?.identityNumber || '',
        identityIssueCountryId: user?.identityIssueCountryId || '',
        birthDate: user?.birthDate ? new Date(user.birthDate) : undefined,
        shortAddress: user?.shortAddress || '',
      },
    });

  useEffect(() => {
    if (user) reset({
      phoneNumber: user.phoneNumber || '',
      nationalityId: user.nationalityId || '',
      identityType: user.identityType || IdentityType.NATIONAL_ID,
      identityOtherType: user.identityOtherType || '',
      identityNumber: user.identityNumber || '',
      identityIssueCountryId: user.identityIssueCountryId || '',
      birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
      shortAddress: user.shortAddress || '',
    });
  }, [user, reset]);

  const idType = watch('identityType');

  const idOpts: Option[] = useMemo(() => [
    { label: tA(`identityTypeGroup.${IdentityType.NATIONAL_ID}`), value: IdentityType.NATIONAL_ID },
    { label: tA(`identityTypeGroup.${IdentityType.RESIDENCY}`), value: IdentityType.RESIDENCY },
    { label: tA(`identityTypeGroup.${IdentityType.PREMIUM_RESIDENCY}`), value: IdentityType.PREMIUM_RESIDENCY },
    { label: tA(`identityTypeGroup.${IdentityType.GCC_ID}`), value: IdentityType.GCC_ID },
    { label: tA(`identityTypeGroup.${IdentityType.PASSPORT}`), value: IdentityType.PASSPORT },
    { label: tA(`identityTypeGroup.${IdentityType.OTHER}`), value: IdentityType.OTHER },
  ], [tA]);

  const countryOpts: Option[] = useMemo(
    () => countries.map(c => ({ value: c.id, label: locale === 'ar' ? c.name_ar : c.name })),
    [countries, locale]
  );

  const selNat = useMemo(() => countryOpts.find(o => o.value === watch('nationalityId')) ?? null, [countryOpts, watch('nationalityId')]);
  const selIssue = useMemo(() => countryOpts.find(o => o.value === watch('identityIssueCountryId')) ?? null, [countryOpts, watch('identityIssueCountryId')]);
  const selIdType = useMemo(() => idOpts.find(o => o.value === idType) ?? null, [idOpts, idType]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const tid = toast.loading(tA('messages.updating'));
    try {
      const res = await api.put('/users/profile', data);
      setCurrentUser(res.data);
      toast.success(tA('messages.updateSuccess'), { id: tid });
      nextStep();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || tA('messages.updateError'), { id: tid });
    } finally { setSubmitting(false); }
  };

  const today = new Date();
  const maxD = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minD = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <StepTitle title={t('title')} subtitle={t('subtitle')} />
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SectionCard title={t('sectionTitle')} icon={<FiUser size={15} />}>
          <div className="bk-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Controller control={control} name="phoneNumber" render={({ field }) => (
              <TextInput {...field} label={tA('phone')} placeholder={tA('placeholders.phoneNumber')}
                error={errors.phoneNumber ? tA(errors.phoneNumber.message) : ''} />
            )} />
            <Controller control={control} name="nationalityId" render={({ field }) => (
              <PortalSelect label={tA('nationality')} options={countryOpts} value={selNat}
                onChange={o => field.onChange(o.value.toString())}
                placeholder={loadingCountries ? tA('loading') : tA('selectNationality')}
                error={errors.nationalityId ? tA(errors.nationalityId.message) : ''} />
            )} />
            <Controller control={control} name="identityType" render={({ field }) => (
              <PortalSelect label={tA('identityType')} options={idOpts} value={selIdType}
                onChange={o => { field.onChange(o.value.toString()); if (o.value !== IdentityType.OTHER) setValue('identityOtherType', ''); }}
                placeholder={tA('placeholders.identityType')}
                error={errors.identityType ? tA(errors.identityType.message) : ''} />
            )} />
            <Controller control={control} name="identityNumber" render={({ field }) => (
              <TextInput {...field} label={tA('identityNumber')} placeholder={tA('placeholders.identityNumber')}
                error={errors.identityNumber ? tA(errors.identityNumber.message) : ''} />
            )} />
            {idType === IdentityType.OTHER && (
              <Controller control={control} name="identityOtherType" render={({ field }) => (
                <TextInput {...field} label={tA('identityOtherType')} placeholder={tA('placeholders.identityOtherType')}
                  error={errors.identityOtherType ? tA(errors.identityOtherType.message) : ''} />
              )} />
            )}
            <Controller control={control} name="identityIssueCountryId" render={({ field }) => (
              <PortalSelect label={tA('identityIssueCountry')} options={countryOpts} value={selIssue}
                onChange={o => field.onChange(o.value.toString())}
                placeholder={loadingCountries ? tA('loading') : tA('placeholders.identityIssueCountryId')}
                error={errors.identityIssueCountryId ? tA(errors.identityIssueCountryId.message) : ''} />
            )} />
            <Controller control={control} name="birthDate" render={({ field: { onChange, value } }) => (
              <DateInput value={value} minDate={minD} maxDate={maxD}
                onChange={dates => onChange(dates[0])}
                label={tA('birthDate')} placeholder={tA('placeholders.birthDate')}
                error={errors.birthDate ? tA(errors.birthDate.message) : ''} />
            )} />
            <Controller control={control} name="shortAddress" render={({ field }) => (
              <TextInput {...field} onChange={e => field.onChange(e.target.value.toUpperCase())}
                label={tA('shortAddress')} placeholder="e.g. RRRR1234"
                error={errors.shortAddress ? tA(errors.shortAddress.message) : ''} />
            )} />
          </div>
        </SectionCard>
        <FormActions type="submit"
          confirmLabel={submitting ? tA('messages.updating') : t('confirm')}
          cancelLabel={t('cancel')}
          onCancel={() => router.push('/properties')}
          isDisabled={submitting} />
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 2
══════════════════════════════════════════════════════════════ */

type S2Props = { nextStep: () => void; property: { id: string; rentType: RentType; status: PropertyStatus }; setCreatedContract: (c: any) => void; };

function Step2({ nextStep, property, setCreatedContract }: S2Props) {
  const t = useTranslations('bookings.contractDetails');
  const router = useRouter();
  const { settings, loadingSettings } = useValues();
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(1);
  const [proposedTerms, setProposedTerms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (settings?.defaultContractTerms) setProposedTerms(settings.defaultContractTerms as string); }, [settings]);

  const isMonthly = property?.rentType === RentType.MONTHLY;
  const min = 1, max = isMonthly ? 12 : 1;
  const durDisabled = !isMonthly;

  const minStart = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; };

  const submit = async () => {
    if (!property.id) { toast.error(t('errors.noProperty')); return; }
    if (!startDate) { toast.error(t('errors.noStartDate')); return; }
    if (!duration || duration < min || duration > max) { toast.error(t('errors.invalidDuration')); return; }
    const sel = new Date(startDate), today = new Date();
    today.setHours(0, 0, 0, 0);
    if (sel <= today) { toast.error(t('errors.startDatePast')); return; }
    setSubmitting(true);
    const tid = toast.loading(t('creating'));
    try {
      const res = await api.post('/contracts', { propertyId: property.id, startDate, duration, proposedTerms: proposedTerms || undefined });
      setCreatedContract(res.data);
      sessionStorage.setItem('createdContract', JSON.stringify(res.data));
      toast.success(t('created'), { id: tid });
      nextStep();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('errors.createFailed'), { id: tid });
    } finally { setSubmitting(false); }
  };

  if (loadingSettings) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div className="bk-spin" /><span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,.38)' }}>{t('loading')}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <StepTitle title={t('title')} subtitle={t('subtitle')} />
      <SectionCard title={t('fields.startDate.label')} icon={<FiCalendar size={15} />}>
        <DateInput placeholder={t('fields.startDate.placeholder')} value={startDate} minDate={minStart()} required
          onChange={ds => setStartDate(ds[0] ? ds[0].toISOString().split('T')[0] : '')} />
      </SectionCard>
      <SectionCard title={t('fields.duration.label')} icon={<FiFileText size={15} />}>
        <TextInput type="number" placeholder={t('fields.duration.placeholder')} value={duration}
          onChange={(e: any) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= min && v <= max) setDuration(v); }}
          min={min} max={max} disabled={durDisabled} required />
        <div className="bk-hint">{isMonthly ? t('fields.duration.hint.monthly', { min, max }) : t('fields.duration.hint.yearly')}</div>
      </SectionCard>
      <SectionCard title={t('fields.proposedTerms.label')} icon={<FiFileText size={15} />}>
        <textarea value={proposedTerms} onChange={e => setProposedTerms(e.target.value)}
          placeholder={t('fields.proposedTerms.placeholder')} rows={8} className="bk-ta" />
        <div className="bk-hint">{t('fields.proposedTerms.hint')}</div>
      </SectionCard>
      <FormActions confirmLabel={submitting ? t('creating') : t('confirm')} cancelLabel={t('cancel')}
        onConfirm={submit} onCancel={() => router.push('/properties')} isDisabled={submitting || !startDate || !duration} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 3
══════════════════════════════════════════════════════════════ */

function Step3({ nextStep, createdContract }: { nextStep: () => void; createdContract: any }) {
  const tE = useTranslations('property.enums');
  const t = useTranslations('bookings.contractReview');
  const locale = useLocale();

  if (!createdContract) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <p style={{ color: 'rgba(0,0,0,.38)', fontSize: 14 }}>{t('noContract')}</p>
    </div>
  );

  const { propertySnapshot: prop, landlordSnapshot: ll } = createdContract;
  const fD = (d: string) => new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const fC = (n: any) => new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 }).format(Number(n));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 760, margin: '0 auto' }}>
      <StepTitle title={t('title')} subtitle={t('subtitle')} />
      <SectionCard title={t('sections.property')} icon={<FiHome size={15} />}>
        <div className="bk-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 28px' }}>
          <InfoRow label={t('fields.propertyName')} value={prop?.name} />
          <InfoRow label={t('fields.propertyType')} value={`${tE(`propertyType.${prop?.type}`)} — ${tE(`subType.${prop?.type === PropertyType.RESIDENTIAL ? 'residential' : 'commercial'}.${prop?.subType}`)}`} />
          <InfoRow label={t('fields.area')} value={`${prop?.area} m²`} />
          <InfoRow label={t('fields.capacity')} value={prop?.capacity} />
          <InfoRow label={t('fields.location')} value={prop?.stateName} />
          <InfoRow label={t('fields.furnished')} value={prop?.isFurnished ? t('yes') : t('no')} />
        </div>
      </SectionCard>
      <SectionCard title={t('sections.rentalPeriod')} icon={<FiCalendar size={15} />}>
        <div className="bk-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 28px' }}>
          <InfoRow label={t('fields.startDate')} value={fD(createdContract.startDate)} />
          <InfoRow label={t('fields.endDate')} value={fD(createdContract.endDate)} />
          <InfoRow label={t('fields.duration')} value={`${createdContract.durationInMonths} ${t('months')}`} />
          <InfoRow label={t('fields.rentType')} value={createdContract.rentType === RentType.MONTHLY ? t('monthly') : t('yearly')} />
        </div>
      </SectionCard>
      <SectionCard title={t('sections.financial')} icon={<FiDollarSign size={15} />}>
        <div className="bk-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 28px' }}>
          <InfoRow label={t('fields.totalAmount')} value={<span className="bk-iv-accent">{fC(createdContract.totalAmount)}</span>} />
          <InfoRow label={t('fields.securityDeposit')} value={fC(createdContract.securityDeposit)} />
          <InfoRow label={t('fields.platformFee')} value={`${createdContract.platformFeePercentage}% (${fC(createdContract.platformFeeAmount)})`} />
        </div>
      </SectionCard>
      <SectionCard title={t('sections.landlord')} icon={<FiUser size={15} />}>
        <div className="bk-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 28px' }}>
          <InfoRow label={t('fields.name')} value={ll?.name} />
          <InfoRow label={t('fields.email')} value={ll?.email} />
          <InfoRow label={t('fields.phone')} value={ll?.phoneNumber} />
        </div>
      </SectionCard>
      {createdContract.currentTerms && (
        <SectionCard title={t('sections.terms')} icon={<FiFileText size={15} />}>
          <div className="bk-terms bk-scroll">{createdContract.currentTerms}</div>
        </SectionCard>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <button onClick={nextStep} className="bk-btn-p" style={{ minWidth: 220 }}>{t('done')}</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 4
══════════════════════════════════════════════════════════════ */

function Step4() {
  const t = useTranslations('bookings.step4');
  const router = useRouter();
  const [contractId, setContractId] = useState<string | null>(null);

  useEffect(() => {
    try { const s = sessionStorage.getItem('createdContract'); if (s) setContractId(JSON.parse(s).id); } catch { /* noop */ }
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '40px 20px', textAlign: 'center' }} className="bk-fu">
      <Image src="/payment-completed.png" width={320} height={246} alt={t('imageAlt')}
        style={{ width: 'min(300px, 80vw)', height: 'auto' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 440, width: '100%' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.025em', color: 'var(--dark, #18181b)', margin: 0 }}>{t('imageAlt')}</h2>
        <div className="bk-card" style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,.5)', lineHeight: 1.8, marginBottom: 6 }}>{t('message.line1')}</p>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,.5)', lineHeight: 1.8, marginBottom: 6 }}>{t('message.line2')}</p>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,.5)', lineHeight: 1.8 }}>{t('message.line3')}</p>
        </div>
      </div>
      <button onClick={() => router.push(contractId ? `/dashboard/contracts?view=${contractId}` : '/dashboard/contracts')}
        className="bk-btn-p" style={{ minWidth: 220 }}>
        {t('viewContract')}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BOOKING CLIENT
══════════════════════════════════════════════════════════════ */

const STEPS = [1, 2, 3];

interface SPProps {
  nextStep: () => void; property: any;
  createdContract: any; setCreatedContract: (c: any) => void;
}

const stepMap: Record<number, (p: SPProps) => JSX.Element> = {
  1: p => <Step1 {...p} />,
  2: p => <Step2 {...p} />,
  3: p => <Step3 {...p} />,
};

export default function BookingClient() {
  const [active, setActive] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const sp = useSearchParams();
  const router = useRouter();
  const t = useTranslations('bookings');

  useEffect(() => {
    const check = async () => {
      const pid = sp.get('property');
      if (!pid) { toast.error(t('eligibility.errors.noProperty')); router.push('/properties'); return; }
      try {
        setChecking(true);
        const res = await api.get(`/contracts/check-eligibility/${pid}`);
        if (!res.data.allowed) {
          toast.error(res.data.message || t('eligibility.errors.notAllowed'));
          router.push(res.data.contractId ? `/dashboard/contracts?view=${res.data.contractId}` : '/properties');
          return;
        }
        setProperty(res.data?.property);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || t('eligibility.errors.checkFailed'));
        router.push('/properties');
      } finally { setChecking(false); }
    };
    check();
  }, [sp, router, t]);

  const nextStep = () => { if (active < STEPS.length) setActive(p => p + 1); else setCompleted(true); };

  const Shell = ({ children }: { children: ReactNode }) => (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f6f7f9' }}>
        <header style={{
          background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)',
          padding: '0 24px', height: 62,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <Logo />
          <LocaleSwitcher />
        </header>
        <main style={{ flex: 1, maxWidth: 820, width: '100%', margin: '0 auto', padding: '36px 20px 64px', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </>
  );

  if (checking) return (
    <Shell>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div className="bk-spin" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,.38)' }}>{t('eligibility.checking')}</span>
        </div>
      </div>
    </Shell>
  );

  return (
    <Shell>
      {!completed ? (
        <>
          <Stepper steps={STEPS} active={active} />
          {stepMap[active]({ nextStep, property, createdContract: contract, setCreatedContract: setContract })}
        </>
      ) : (
        <Step4 />
      )}
    </Shell>
  );
}