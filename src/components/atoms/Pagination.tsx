'use client';

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";   // Font Awesome chevrons
import { MdMoreHoriz } from "react-icons/md";                 // Material Design horizontal ellipsis

import { useLocale, useTranslations } from 'next-intl';

export interface BuildPageTokensParams {
  /** Current active page (1-based index) */
  page: number;

  /** Total number of pages */
  totalPages: number;

  /** Number of sibling pages to show around the current page */
  siblingCount?: number;

  /** Number of boundary pages to always show at start and end */
  boundaryCount?: number;
}



function buildPageTokens({ page, totalPages, siblingCount = 1, boundaryCount = 1 }: BuildPageTokensParams) {
  if (totalPages <= 1) return [1];

  // 1) Collect pages we always want to show:
  const pages: Set<number> = new Set();

  // left boundary
  for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) pages.add(i);

  // siblings around current page
  const left = Math.max(1, page - siblingCount);
  const right = Math.min(totalPages, page + siblingCount);
  for (let i = left; i <= right; i++) pages.add(i);

  // right boundary
  for (let i = Math.max(totalPages - boundaryCount + 1, 1); i <= totalPages; i++) pages.add(i);

  // 2) Sort the pages we chose
  const sorted = Array.from(pages).sort((a, b) => a - b);

  // 3) Build tokens with smart gaps: 
  const tokens = [];
  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = sorted[i - 1];

    if (i === 0) {
      tokens.push(curr);
      continue;
    }

    if (curr - prev === 1) {
      tokens.push(curr);
    } else if (curr - prev === 2) {
      tokens.push(prev + 1, curr); // fill single hole (fixes the “2 after 1” case)
    } else {
      tokens.push('right-ellipsis', curr); // generic gap
    }
  }

  // Normalize: turn the first gap token into 'left-ellipsis'
  if (tokens.includes('right-ellipsis')) {
    const idx = tokens.indexOf('right-ellipsis');
    tokens[idx] = 'left-ellipsis';
  }

  return tokens;
}
const btnVariants = {
  initial: { y: 0, scale: 1, opacity: 0, yOffset: 8 },
  in: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  hover: { scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 18 } },
  tap: { scale: 0.98 },
};

const dotVariants = {
  hover: { scale: 1.06, transition: { type: 'spring', stiffness: 300, damping: 18 } },
};

interface PaginationProps {
  page: number;

  totalPages: number;

  setPage: (page: number) => void;

  className?: string;

  /** Number of sibling pages to show around the current page */
  siblingCount?: number;

  /** Number of boundary pages to always show at start and end */
  boundaryCount?: number;

  /** Whether pagination is in loading state */
  loading?: boolean;

  /** Whether to show records count */
  total: number;

  /** How many pages to jump when clicking ellipsis */
  jumpBy?: number;

  limit: number
}


export default function Pagination({
  page,
  totalPages,
  setPage,
  className = '',
  siblingCount = 1,
  boundaryCount = 1,
  loading = false,
  total = 0,
  jumpBy = 5, // how many pages to jump when clicking ellipsis
  limit,
}: PaginationProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const t = useTranslations('dashboard.pagination');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  // hooks always run
  const tokens = useMemo(
    () => buildPageTokens({ page, totalPages, siblingCount, boundaryCount }),
    [page, totalPages, siblingCount, boundaryCount]
  );

  const goTo = useCallback(
    (p: number) => {
      const next = Math.min(Math.max(1, p), totalPages);
      setPage(next);
    },
    [setPage, totalPages]
  );

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(page - 1);
      if (e.key === 'ArrowRight') goTo(page + 1);
    },
    [page, goTo]
  );

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [onKey]);

  // safe conditional render AFTER hooks
  if (totalPages <= 1) {
    return null;
  };
  if (!loading && (total ?? 0) === 0) return null;

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  return (
    <div className={`flex justify-between flex-col-reverse flex-nowrap md:flex-row md:items-center gap-3 mt-8 ${className}`}>
      <span className="text-sm text-dark lg:text-nowrap max-md:text-center">
        {t('showing', {
          start: startEntry,
          end: endEntry,
          total: total
        })}
      </span>

      <nav
        ref={navRef}
        className="
        flex items-center flex-wrap sm:flex-nowrap gap-1 
        rounded-2xl border max-md:justify-center
        bg-[var(--color-lighter)] 
        border-[var(--color-gray)] 
        shadow-sm px-2 py-1
      "
        aria-label="Pagination"
        role="navigation"
        tabIndex={0}
      >
        {/* Prev */}
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 1 || loading}
          aria-label={t('previous')}
          className="
          h-9 w-9 flex items-center justify-center rounded-lg
          text-[var(--color-gray-dark)]
          bg-[var(--color-highlight)]
          hover:bg-[var(--color-lightGold)]
          disabled:opacity-30
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
        "
        >
          {isRtl ? <FaChevronRight className="h-4 w-4" /> : <FaChevronLeft className="h-4 w-4" />}
        </button>

        {/* Pages */}
        {tokens.map((token, i) => {
          if (token === 'left-ellipsis' || token === 'right-ellipsis') {
            const jumpTarget =
              token === 'left-ellipsis'
                ? Math.max(1, page - jumpBy)
                : Math.min(totalPages, page + jumpBy);

            return (
              <button
                key={`${token}-${i}`}
                type="button"
                disabled={loading}
                onClick={() => goTo(jumpTarget)}
                aria-label={
                  token === 'left-ellipsis'
                    ? t('jumpBack', { count: jumpBy })
                    : t('jumpForward', { count: jumpBy })
                }
                className="
                h-9 min-w-9 px-2 flex items-center justify-center rounded-lg
                text-[var(--color-gray-dark)]
                bg-[var(--color-highlight)]
                hover:bg-[var(--color-lightGold)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
              "
              >
                <MdMoreHoriz className="w-4 h-4" />
              </button>
            );
          }

          const isActive = token === page;

          return (
            <button
              key={token}
              type="button"
              onClick={() => goTo(token as number)}
              disabled={loading}
              aria-current={isActive ? 'page' : undefined}
              className={`
              h-9 min-w-9 px-3 flex items-center justify-center rounded-lg text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
              ${isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-highlight)] text-[var(--color-gray-dark)] hover:bg-[var(--color-lightGold)]'
                }
            `}
            >
              {token}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages || loading}
          aria-label={t('next')}
          className="
          h-9 w-9 flex items-center justify-center rounded-lg
          text-[var(--color-gray-dark)]
          bg-[var(--color-highlight)]
          hover:bg-[var(--color-lightGold)]
          disabled:opacity-30
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
        "
        >
          {isRtl ? <FaChevronLeft className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
        </button>
      </nav>
    </div>
  );
}