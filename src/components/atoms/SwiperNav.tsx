'use client';

import React from 'react';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';

/**
 * TYPES & INTERFACES
 */
type Direction = 'rtl' | 'ltr';

interface TranslationKeys {
  previous: string;
  next: string;
  pageCounter: string;
}

interface SwiperNavProps {
  currentPage: number;
  totalPages: number;
  prevClass: string;
  nextClass: string;
  dir?: Direction;
  // Included i18n prop to make it production-ready for localization
  translations?: TranslationKeys;
}

/**
 * DEFAULT TRANSLATIONS
 * In a real app, these would come from your i18n provider
 */
const DEFAULT_T: TranslationKeys = {
  previous: 'Previous slide',
  next: 'Next slide',
  pageCounter: 'Page {{current}} of {{total}}',
};

export default function SwiperNav({
  currentPage = 1,
  totalPages = 1,
  prevClass,
  nextClass,
  dir = 'ltr',
  translations = DEFAULT_T,
}: SwiperNavProps) {
  const isDisabled = totalPages <= 1;
  const isRTL = dir === 'rtl';

  // Helper to pad numbers for a premium "dashboard" look
  const formatNum = (num: number) => String(num).padStart(2, '0');

  /**
   * ICON LOGIC:
   * To handle RTL properly, we use the logical direction.
   * In LTR: Next = Right, Prev = Left.
   * In RTL: Next = Left, Prev = Right.
   * We use scale-x-[-1] to flip icons based on direction for better maintainability.
   */
  const IconBack = isRTL ? GoArrowRight : GoArrowLeft;
  const IconForward = isRTL ? GoArrowLeft : GoArrowRight;

  const buttonBaseClasses = `
    ${prevClass} ${nextClass}
    group relative flex items-center justify-center
    h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14
    rounded-full transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
    disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale
    active:scale-90
  `;

  const themeClasses = `
    bg-white border border-slate-200/60
    text-slate-700 shadow-sm hover:shadow-md
    hover:border-primary/30 hover:bg-primary hover:text-white
  `;

  return (
    <nav
      dir={dir}
      aria-label="Carousel Navigation"
      className="inline-flex items-center gap-2 sm:gap-4 md:gap-5 select-none"
    >
      {/* PREVIOUS BUTTON */}
      <button
        type="button"
        disabled={isDisabled}
        aria-label={translations.previous}
        className={`${buttonBaseClasses} ${themeClasses} ${prevClass} !flex`}
      >
        <IconBack 
          className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" 
        />
      </button>

      {/* REFINED COUNTER */}
      <div 
        className="flex items-center h-10 sm:h-12 px-4 rounded-full bg-slate-50/50 border border-slate-200/50 backdrop-blur-md shadow-inner"
        aria-live="polite"
      >
        <div className="flex items-baseline gap-1 font-mono tabular-nums">
          <span className="text-sm sm:text-base font-bold text-slate-900 leading-none">
            {formatNum(currentPage)}
          </span>
          <span className="text-xs sm:text-sm text-slate-400 font-medium px-0.5">
            /
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-500 leading-none">
            {formatNum(totalPages)}
          </span>
        </div>
      </div>

      {/* NEXT BUTTON */}
      <button
        type="button"
        disabled={isDisabled}
        aria-label={translations.next}
        className={`${buttonBaseClasses} ${themeClasses} ${nextClass} !flex`}
      >
        <IconForward 
          className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" 
        />
      </button>
    </nav>
  );
}