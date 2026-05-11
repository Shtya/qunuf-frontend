'use client';

/**
 * FilterProperties.tsx — Premium Redesign
 *
 * Single-file refactor with premium card design matching BasedOnLocationSection.
 * All business logic preserved. RTL/LTR fully supported.
 */

import React, {
	ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { HiOutlineAdjustmentsHorizontal, HiXMark } from 'react-icons/hi2';
import { FiChevronDown, FiUsers } from 'react-icons/fi';
import { IoMdCheckmark } from 'react-icons/io';
import { FaBed } from 'react-icons/fa';
import { LuBath, LuSearchX } from 'react-icons/lu';

// ─── External deps ──────────────────────────────────────────────────────────
import api from '@/libs/axios';
import { resolveUrl } from '@/utils/upload';
import { Property } from '@/types/dashboard/properties';
import {
	MAX_PRICE,
	MIN_PRICE,
	MAX_SCQUAREFEET,
	MIN_SCQUAREFEET,
	MAX_YEARBUILD,
	MIN_YEARBUILD,
	FilterState,
} from '@/constants/properties/constant';
import { FilterProvider, useFilter } from '@/hooks/properties/useFilterProperties';
import { useDebounce } from '@/hooks/useDebounce';
import useMinMaxOption from '@/hooks/useMinMaxOption';
// import { useIndicatorPosition } from '@/hooks/useIndicatorPosition';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import Pagination from '@/components/molecules/DateViewTable/Pagination';
import Tooltip from '@/components/atoms/Tooltip';
import PriceRangeSlider from '@/components/molecules/forms/PriceRangeSlider';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';

// ─── Translation Keys Type ───────────────────────────────────────────────────
type TranslationKey = string;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toSafeNumber = (value: unknown): number => {
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
};

// ─── mapFiltersToDto (preserved logic) ───────────────────────────────────────
const mapFiltersToDto = (filters: FilterState, page: string | number) => {
	const dto: Record<string, string> = {
		page: page.toString(),
		limit: '12',
	};
	const addIfValid = (dtoKey: string, value: unknown, transform?: (v: unknown) => unknown) => {
		if (value !== undefined && value !== null && value !== 'all' && value !== '') {
			if (Array.isArray(value) && value.length === 0) return;
			dto[dtoKey] = String(transform ? transform(value) : value);
		}
	};

	addIfValid('stateId', filters.location);
	addIfValid('rentType', filters.period);
	addIfValid('propertyType', filters.type);
	addIfValid('subTypes', filters.subtype, (v) => (v as string[]).join(','));
	addIfValid('features', filters.features, (v) => (v as string[]).join(','));
	addIfValid('bathroom', filters.bathroom);
	addIfValid('bedroom', filters.bedroom);
	addIfValid('isFurnished', filters.furnished);
	addIfValid('minPrice', filters.priceMin);
	addIfValid('maxPrice', filters.priceMax);
	addIfValid('minArea', filters.scquarefeetMin);
	addIfValid('maxArea', filters.scquarefeetMax);
	addIfValid('minYear', filters.yearBuiltMin);
	addIfValid('maxYear', filters.yearBuiltMax);

	return dto;
};

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── FilterSection wrapper ──────────────────────────────────────────────────
function FilterSection({
	label,
	children
}: {
	label: string;
	children: ReactNode
}) {
	return (
		<div className="flex flex-col gap-3">
			<span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
				{label}
			</span>
			{children}
		</div>
	);
}

// ─── Divider ────────────────────────────────────────────────────────────────
function Divider() {
	return (
		<div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
	);
}

// ─── PropertySelectInput ─────────────────────────────────────────────────────
export type Option = { label: string; value: string | number };

type SelectProps = {
	options: Option[];
	placeholder?: string;
	className?: string;
	dir?: 'ltr' | 'rtl';
	value?: Option | null;
	fallbackValue?: Option | null;
	onChange?: (opt: Option) => void;
};

function PropertySelectInput({
	options,
	className = '',
	placeholder = 'common.select',
	dir = 'ltr',
	fallbackValue,
	value,
	onChange,
}: SelectProps) {
	const t = useTranslations('property');
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef<HTMLDivElement>(null);
	useOutsideClick(selectRef, () => setIsOpen(false));

	const displayLabel = value?.label ?? fallbackValue?.label ?? t(placeholder);

	return (
		<div className={`relative w-full ${className}`} dir={dir} ref={selectRef}>
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((o) => !o)}
				className="
          w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 gap-2
          bg-white border border-gray-200/80 hover:border-primary/50
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
          transition-all duration-200 shadow-sm hover:shadow
        "
			>
				<span className="text-sm font-medium text-gray-700 truncate ltr:text-left rtl:text-right">
					{displayLabel}
				</span>
				<FiChevronDown
					className={`
            w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 
            ${isOpen ? 'rotate-180' : ''}
          `}
				/>
			</button>

			{isOpen && (
				<ul
					role="listbox"
					className="
            absolute top-full ltr:left-0 rtl:right-0 mt-1.5 w-full
            bg-white border border-gray-100 rounded-xl shadow-xl z-50
            overflow-y-auto max-h-56 py-1
            animate-in fade-in slide-in-from-top-2 duration-150
          "
				>
					{options.map((opt) => {
						const isSelected = opt.value === (value?.value ?? fallbackValue?.value);
						return (
							<li
								key={opt.value}
								role="option"
								aria-selected={isSelected}
								onClick={() => { onChange?.(opt); setIsOpen(false); }}
								className={`
                  px-4 py-2.5 text-sm cursor-pointer
                  transition-colors duration-100
                  ${isSelected
										? 'bg-primary/8 text-primary font-medium'
										: 'text-gray-700 hover:bg-gray-50 hover:text-primary'
									}
                `}
							>
								{opt.label}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}

// ─── SegmentedControl ────────────────────────────────────────────────────────
type SegmentedControlProps = {
	options: { value: string; label: string }[];
	activeValue: string;
	fallbackValue?: string | null;
	onChange: (value: string) => void;
	dataAttrKey?: string;
};

 
 

function useIndicatorPosition(
  containerRef: React.RefObject<HTMLDivElement>,
  activeValue: string,
  dataAttrKey: string
) {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const activeEl = container.querySelector<HTMLElement>(
      `[${dataAttrKey}="${activeValue}"]`
    );
    if (!activeEl) return;

    indicator.style.left = `${activeEl.offsetLeft}px`;
    indicator.style.width = `${activeEl.offsetWidth}px`;
  }, [activeValue, containerRef, dataAttrKey]);

  return indicatorRef;
}

export function SegmentedControl({
  options,
  activeValue,
  fallbackValue,
  onChange,
  dataAttrKey = "data-segment",
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectiveValue = activeValue ?? fallbackValue ?? options[0]?.value;
  const indicatorRef = useIndicatorPosition(containerRef, effectiveValue, dataAttrKey);

  return (
    <div
      ref={containerRef}
      className="relative flex rounded-full bg-gray-100/80 p-1 gap-1"
    >
      {/* Sliding indicator — position driven by measured DOM offsets */}
      <div
        ref={indicatorRef}
        className="absolute top-1 bottom-1 rounded-full bg-primary shadow-sm transition-all duration-250 ease-[cubic-bezier(0.35,0,0.25,1)]"
        aria-hidden="true"
      />

      {options.map(({ value, label }) => (
        <button
          key={value}
          {...{ [dataAttrKey]: value }}
          role="radio"
          aria-checked={effectiveValue === value}
          onClick={() => onChange(value)}
          className={`
            relative z-10 flex-1 text-xs font-semibold py-2 px-3
            rounded-full transition-colors duration-200 text-nowrap
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
            ${effectiveValue === value
              ? "text-white"
              : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── SelectableCheckboxList ──────────────────────────────────────────────────
type CheckboxOption = { label: string; value: string };

function SelectableCheckboxList({
	options,
	selectedValues,
	onToggle,
}: {
	options: CheckboxOption[];
	selectedValues: string[];
	onToggle: (v: string) => void;
}) {
	const selectedSet = new Set(selectedValues);

	return (
		<div className="flex flex-col gap-2">
			{options.map(({ label, value }) => {
				const isSelected = selectedSet.has(value);
				return (
					<button
						key={value}
						type="button"
						role="checkbox"
						aria-checked={isSelected}
						onClick={() => onToggle(value)}
						className="
              flex items-center gap-3 w-fit 
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 
              rounded-lg group py-0.5
            "
					>
						<span
							className={`
                flex items-center justify-center rounded-md w-5 h-5 shrink-0
                border transition-all duration-200
                ${isSelected
									? 'border-primary bg-primary shadow-sm shadow-primary/20'
									: 'border-gray-200 bg-white group-hover:border-primary/40'
								}
              `}
						>
							{isSelected && <IoMdCheckmark size={12} className="text-white" />}
						</span>
						<span className={`
              text-sm transition-colors
              ${isSelected ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}
            `}>
							{label}
						</span>
					</button>
				);
			})}
		</div>
	);
}

// ─── SelectablePillGroup ─────────────────────────────────────────────────────
function SelectablePillGroup({
	options,
	activeValue,
	onSelect,
}: {
	options: { label: string; value: string }[];
	activeValue: string | string[];
	onSelect: (v: string) => void;
}) {
	const activeSet = useMemo(
		() => (Array.isArray(activeValue) ? new Set(activeValue) : null),
		[activeValue],
	);

	return (
		<div className="flex flex-wrap gap-2">
			{options.map(({ label, value }) => {
				const isActive = activeSet ? activeSet.has(value) : value === activeValue;
				return (
					<button
						key={value}
						type="button"
						aria-pressed={isActive}
						onClick={() => onSelect(value)}
						className={`
              py-1.5 px-3.5 text-sm font-medium rounded-full border 
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
              ${isActive
								? 'bg-primary text-white border-primary shadow-sm shadow-primary/15'
								: 'bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary'
							}
            `}
					>
						{label}
					</button>
				);
			})}
		</div>
	);
}

// ─── NumberRangeInput ────────────────────────────────────────────────────────
function NumberRangeInput({
	min,
	max,
	range,
	onChange,
	showProgress = true,
	label,
	placeholderMin,
	placeholderMax,
}: {
	min: number;
	max: number;
	range?: { min: number; max: number };
	showProgress?: boolean;
	label: string;
	placeholderMin?: string;
	placeholderMax?: string;
	onChange: (range: { min: number; max: number }) => void;
}) {
	const t = useTranslations('property');
	const [localValues, setLocalValues] = useState<[number, number]>([min, max]);

	useEffect(() => { setLocalValues([min, max]); }, [min, max]);

	const { debouncedValue } = useDebounce({ value: localValues, delay: 500 });

	useEffect(() => {
		const [dMin, dMax] = debouncedValue;
		const validMin = Math.max(range?.min ?? 0, Math.min(dMin, dMax));
		const validMax = Math.min(range?.max ?? 1_000_000, Math.max(dMax, dMin));
		if (validMin !== min || validMax !== max) onChange({ min: validMin, max: validMax });
	}, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleInput = (index: 0 | 1, val: string) => {
		const copy: [number, number] = [...localValues];
		copy[index] = Number(val);
		setLocalValues(copy);
	};

	return (
		<FilterSection label={label}>
			<div className="flex gap-3 w-full">
				<input
					type="number"
					placeholder={placeholderMin || t('filter.min')}
					value={localValues[0]}
					onChange={(e) => handleInput(0, e.target.value)}
					className="
            w-1/2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-700
            bg-white border border-gray-200/80 hover:border-primary/50
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
            transition-all duration-200 shadow-sm
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none
          "
				/>
				<input
					type="number"
					placeholder={placeholderMax || t('filter.max')}
					value={localValues[1]}
					onChange={(e) => handleInput(1, e.target.value)}
					className="
            w-1/2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-700
            bg-white border border-gray-200/80 hover:border-primary/50
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
            transition-all duration-200 shadow-sm
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none
          "
				/>
			</div>
			{showProgress && (
				<PriceRangeSlider
					value={{ min: localValues[0], max: localValues[1] }}
					range={range}
					onChange={(val) => setLocalValues([val.min, val.max])}
				/>
			)}
		</FilterSection>
	);
}

// ─── NumberSelectRangeInput ───────────────────────────────────────────────────
function NumberSelectRangeInput({
	min,
	max,
	range,
	label,
	options,
	onChange,
}: {
	min: number;
	max: number;
	range: { min: number; max: number };
	label: string;
	options: { label: string; value: number }[];
	onChange: (r: { min: number | null; max: number | null }) => void;
}) {
	const t = useTranslations('property');
	const [localMin, setLocalMin] = useState<number | undefined>();
	const [localMax, setLocalMax] = useState<number | undefined>();
	const { minOption, maxOption } = useMinMaxOption(options);

	const selectedMinOpt = useMemo(() => options.find((o) => o.value === localMin), [options, localMin]);
	const selectedMaxOpt = useMemo(() => options.find((o) => o.value === localMax), [options, localMax]);

	useEffect(() => {
		const minOpt = options.find((o) => o.value === min);
		const maxOpt = options.find((o) => o.value === max);
		setLocalMin(minOpt ? minOpt.value : range.min);
		setLocalMax(maxOpt ? maxOpt.value : range.max);
	}, [min, max, options, range.max, range.min]);

	const rangeMin = range?.min ?? Number.MIN_SAFE_INTEGER;
	const rangeMax = range?.max ?? Number.MAX_SAFE_INTEGER;

	const validateAndUpdate = (
		minOpt: number | string | undefined,
		maxOpt: number | string | undefined,
	) => {
		if (options.length === 0) return;
		const parsedMin = minOpt != null ? Number(minOpt) : null;
		const parsedMax = maxOpt != null ? Number(maxOpt) : null;
		const validMin = parsedMin !== null ? Math.max(rangeMin, Math.min(parsedMin, parsedMax ?? rangeMax)) : null;
		const validMax = parsedMax !== null ? Math.min(rangeMax, Math.max(parsedMax, parsedMin ?? rangeMin)) : null;
		const finalMinOpt = options.find((o) => o.value === validMin) ?? null;
		const finalMaxOpt = options.find((o) => o.value === validMax) ?? null;
		setLocalMin(finalMinOpt?.value);
		setLocalMax(finalMaxOpt?.value);
		onChange({ min: validMin, max: validMax });
	};

	return (
		<FilterSection label={label}>
			<div className="flex gap-3 w-full">
				<PropertySelectInput
					options={options}
					value={selectedMinOpt ?? minOption}
					onChange={(opt) => validateAndUpdate(opt.value, localMax)}
					placeholder="filter.min"
					className="flex-1"
				/>
				<PropertySelectInput
					options={options}
					value={selectedMaxOpt ?? maxOption}
					onChange={(opt) => validateAndUpdate(localMin, opt.value)}
					placeholder="filter.max"
					className="flex-1"
				/>
			</div>
		</FilterSection>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER SIDEBAR PANEL
// ═══════════════════════════════════════════════════════════════════════════
function FilterPanel({
	open,
	onClose,
	children,
	title,
}: {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	title: string;
}) {
	const locale = useLocale();
	const isRTL = locale === 'ar';

	// Lock body scroll when open
	useEffect(() => {
		if (open) document.body.style.overflow = 'hidden';
		else document.body.style.overflow = '';
		return () => { document.body.style.overflow = ''; };
	}, [open]);

	return (
		<>
			<div
				aria-hidden="true"
				onClick={onClose}
				className={`
          fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm
          transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className={`
          fixed top-0 ${isRTL ? 'left-0' : 'right-0'} 
          h-full w-full sm:max-w-[380px] bg-white
          flex flex-col shadow-2xl shadow-gray-900/10
          transition-transform z-[10000000000000] duration-300 ease-out
          ${open
						? 'translate-x-0'
						: isRTL ? '-translate-x-full' : 'translate-x-full'
					}
        `}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
					<h2 className="text-base font-bold text-gray-900">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close filters"
						className="
              flex items-center justify-center w-9 h-9 rounded-full
              bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
            "
					>
						<HiXMark className="w-5 h-5" />
					</button>
				</div>

				{/* Scrollable Body */}
				<div className="flex-1 overflow-y-auto overscroll-contain">
					{children}
				</div>
			</div>
		</>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER PROPERTIES (main filter component)
// ═══════════════════════════════════════════════════════════════════════════
function FilterProperties() {
	const tA = useTranslations('dashboard.account');
	const t = useTranslations('property');

	const {
		filters,
		activeLocation,
		loadingLocations,
		locations,
		yearOptions,
		subtypes,
		bedrooms,
		bathrooms,
		features,
		periods,
		propertyTypes,
		furnishedTypes,
		updateFilter,
		toggleSubtype,
		toggleFeature,
		updateType,
		resetFilters,
	} = useFilter();

	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Count active filters for badge
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (filters.location && filters.location !== 'all') count++;
		if (filters.period && filters.period !== 'yearly') count++;
		if (filters.type && filters.type !== 'residential') count++;
		if (filters.subtype?.length) count++;
		if (filters.furnished && filters.furnished !== 'furnished') count++;
		if (filters.bathroom && filters.bathroom !== 'all') count++;
		if (filters.bedroom && filters.bedroom !== 'all') count++;
		if (filters.features?.length) count++;
		return count;
	}, [filters]);

	return (
		<>
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setSidebarOpen(true)}
				aria-label={t('filter.title')}
				className="
          relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl
          border border-gray-200/80 bg-white hover:border-primary/50 
          hover:shadow-lg hover:shadow-primary/5
          text-sm font-semibold text-gray-700 hover:text-primary
          transition-all duration-200 shadow-sm
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
        "
			>
				<HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
				<span>{t('filter.title')}</span>
				{activeFilterCount > 0 && (
					<span className="
            absolute -top-2 ltr:-right-2 rtl:-left-2
            flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full
            bg-primary text-white text-[10px] font-bold shadow-sm shadow-primary/30
          ">
						{activeFilterCount}
					</span>
				)}
			</button>

			{/* Sidebar Drawer */}
			<FilterPanel
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				title={t('filter.title')}
			>
				<div className="flex flex-col gap-5 p-5">
					{/* Subtitle + Reset */}
					<div className="flex items-center justify-between">
						<p className="text-xs text-gray-400">{t('filter.subtitle')}</p>
						<button
							type="button"
							onClick={resetFilters}
							className="
                text-xs font-semibold text-primary hover:text-primary/70
                underline underline-offset-2 transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded
              "
						>
							{t('filter.reset')}
						</button>
					</div>

					<Divider />

					{/* Location */}
					<FilterSection label={t('filter.location.title')}>
						<PropertySelectInput
							options={locations}
							value={activeLocation}
							fallbackValue={locations?.[0]}
							placeholder={loadingLocations ? tA('loading') : tA('selectState')}
							onChange={(option) => updateFilter('location', option.value.toString())}
						/>
					</FilterSection>

					<Divider />

					{/* Rental Period */}
					<FilterSection label={t('filter.rentalPeriod.title')}>
						<SegmentedControl
							dataAttrKey="data-period"
							options={periods}
							fallbackValue="yearly"
							activeValue={filters.period}
							onChange={(value) => updateFilter('period', value)}
						/>
					</FilterSection>

					<Divider />

					{/* Property Type */}
					<FilterSection label={t('filter.propertyType.title')}>
						<SegmentedControl
							dataAttrKey="data-property-type"
							options={propertyTypes}
							fallbackValue="residential"
							activeValue={filters.type}
							onChange={updateType}
						/>
						{subtypes.length > 0 && (
							<SelectableCheckboxList
								options={subtypes}
								selectedValues={filters.subtype}
								onToggle={toggleSubtype}
							/>
						)}
					</FilterSection>

					<Divider />

					{/* Furnished Type */}
					<FilterSection label={t('filter.furnishedType.title')}>
						<SegmentedControl
							dataAttrKey="data-furnished-type"
							options={furnishedTypes}
							fallbackValue="furnished"
							activeValue={filters.furnished}
							onChange={(value) => updateFilter('furnished', value)}
						/>
					</FilterSection>

					<Divider />

					{/* Bathrooms */}
					<FilterSection label={t('filter.bathrooms.title')}>
						<SelectablePillGroup
							options={bathrooms}
							activeValue={filters.bathroom}
							onSelect={(value) => updateFilter('bathroom', value)}
						/>
					</FilterSection>

					<Divider />

					{/* Bedrooms */}
					<FilterSection label={t('filter.bedrooms.title')}>
						<SelectablePillGroup
							options={bedrooms}
							activeValue={filters.bedroom}
							onSelect={(value) => updateFilter('bedroom', value)}
						/>
					</FilterSection>

					<Divider />

					{/* Price Range */}
					<NumberRangeInput
						label={t('filter.priceRange')}
						min={filters.priceMin}
						max={filters.priceMax}
						range={{ min: MIN_PRICE, max: MAX_PRICE }}
						placeholderMin={t('filter.priceMin')}
						placeholderMax={t('filter.priceMax')}
						onChange={({ min, max }) => updateFilter({ priceMin: min, priceMax: max })}
					/>

					<Divider />

					{/* Square Feet */}
					<NumberRangeInput
						label={t('filter.squareFeet')}
						min={filters.scquarefeetMin}
						max={filters.scquarefeetMax}
						range={{ min: MIN_SCQUAREFEET, max: MAX_SCQUAREFEET }}
						placeholderMin={t('filter.areaMin')}
						placeholderMax={t('filter.areaMax')}
						onChange={({ min, max }) => updateFilter({ scquarefeetMin: min, scquarefeetMax: max })}
					/>

					<Divider />

					{/* Year Built */}
					<NumberSelectRangeInput
						label={t('filter.yearBuilt')}
						min={filters.yearBuiltMin}
						max={filters.yearBuiltMax}
						range={{ min: MIN_YEARBUILD, max: MAX_YEARBUILD }}
						options={yearOptions}
						onChange={({ min, max }) => updateFilter({ yearBuiltMin: min, yearBuiltMax: max })}
					/>

					<Divider />

					{/* Features */}
					<FilterSection label={t('filter.features.title')}>
						<SelectablePillGroup
							options={features}
							activeValue={filters.features}
							onSelect={toggleFeature}
						/>
					</FilterSection>

					{/* Bottom padding */}
					<div className="h-4" />
				</div>
			</FilterPanel>
		</>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// FACILITY CHIP COMPONENT (from BasedOnLocationSection)
// ═══════════════════════════════════════════════════════════════════════════
type FacilityChipProps = {
	icon: React.ReactNode;
	value: number | string;
	label: string;
};

function FacilityChip({ icon, value, label }: FacilityChipProps) {
	const cleanValue = typeof value === 'number' ? Math.trunc(value) : value;

	return (
		<Tooltip content={`${label}: ${cleanValue}`}>
			<div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/[0.06] text-primary min-w-0 transition-all duration-200 hover:bg-primary/10">
				<span className="shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
				<span className="text-[11px] sm:text-xs font-semibold truncate whitespace-nowrap">
					{cleanValue}
				</span>
			</div>
		</Tooltip>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTY CARD (Redesigned to match BasedOnLocationSection)
// ═══════════════════════════════════════════════════════════════════════════
function PropertyCardGrid({
	property,
	locale
}: {
	property: any;
	locale: string;
}) {
	const t = useTranslations('property');
	const tEnums = useTranslations('property.enums');
	const tCard = useTranslations('property.card');
	const isRTL = locale === 'ar';
	const currency = isRTL ? 'ر.س' : 'SAR';

	const displayImage = property.images?.find((img) => img.is_primary)?.url || property.images?.[0]?.url;

	const bathroomsCount = toSafeNumber(property.facilities?.bathrooms);
	const bedroomsCount = toSafeNumber(property.facilities?.bedrooms);
	const livingRoomsCount = toSafeNumber(property.facilities?.livingRooms);
	const areaValue = toSafeNumber(property.area);

	const locationText = property.city?.[locale as 'ar' | 'en']
		|| property.district?.[locale as 'ar' | 'en']
		|| property.complexName
		|| '';

	const rentTypeLabel = tEnums(`rentType.${property.rentType}`);

	return (
		<Link
			href={`/properties/${property.slug}`}
			className="group block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
		>
			<article className="
        w-full h-full border border-gray-100 rounded-2xl overflow-hidden 
        flex flex-col bg-white 
        transition-all duration-300 
        hover:shadow-xl hover:shadow-gray-900/5 hover:-translate-y-1 hover:border-primary/20
      ">
				{/* Image Container */}
				<div className="relative overflow-hidden rounded-t-2xl">
					<Image
						src={displayImage ? resolveUrl(displayImage) : '/placeholder-property.jpg'}
						alt={property.name}
						width={411}
						height={260}
						className="
              w-full h-[200px] sm:h-[220px] lg:h-[240px] object-cover 
              transition-transform duration-500 ease-out 
              group-hover:scale-105
            "
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					/>

					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />

					{/* Rent Type Badge */}
					<span className={`
            absolute top-3 ${isRTL ? 'right-3' : 'left-3'}
            px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
            bg-white/95 backdrop-blur-sm text-primary shadow-sm
          `}>
						{rentTypeLabel}
					</span>
				</div>

				{/* Content */}
				<div className="flex flex-col gap-3 p-4 sm:p-5 flex-1">
					{/* Price Row */}
					<div className="flex items-baseline gap-1.5">
						<span className="font-extrabold text-xl lg:text-2xl text-primary tabular-nums">
							{Number(property.rentPrice || 0).toLocaleString(locale)}
						</span>
						<span className="text-xs sm:text-sm text-gray-400 font-medium">
							{currency} / {rentTypeLabel}
						</span>
					</div>

					{/* Title */}
					<h3 className="font-bold text-base lg:text-lg text-gray-900 leading-snug truncate group-hover:text-primary transition-colors duration-150">
						{property.name}
					</h3>

					{/* Location */}
					{locationText && (
						<p className="text-xs sm:text-sm font-medium text-gray-400 truncate">
							{locationText}
						</p>
					)}

					{/* Divider */}
					<div className="border-t border-gray-100 mt-auto pt-3">
						<div className="grid grid-cols-4 gap-1.5 sm:gap-2">
							<FacilityChip
								icon={<FaBed />}
								value={bedroomsCount}
								label={tCard('bedrooms')}
							/>
							<FacilityChip
								icon={<LuBath />}
								value={bathroomsCount}
								label={tCard('bathrooms')}
							/>
							<FacilityChip
								icon={
									<svg width="14" height="14" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M16.52 0.5H4.147C3.136 0.502 2.167 0.904 1.452 1.619.738 2.334.335 3.303.333 4.313V16.687C.335 17.698.738 18.666 1.452 19.381 2.167 20.096 3.136 20.498 4.147 20.5H16.52c1.011-.002 1.98-.404 2.695-1.119.714-.715 1.117-1.683 1.118-2.694V4.313c-.001-1.01-.404-1.979-1.118-2.694C18.5.904 17.531.502 16.52.5zM19 16.687c-.002.657-.263 1.287-.728 1.751-.465.465-1.095.727-1.752.729H4.147c-.657-.002-1.287-.264-1.752-.729-.465-.464-.726-1.094-.728-1.751V4.313c.002-.657.263-1.287.728-1.751.465-.465 1.095-.727 1.752-.729H16.52c.657.002 1.287.264 1.752.729.465.464.726 1.094.728 1.751v12.374z" fill="currentColor" />
										<path d="M16.933 11.849c-.195 0-.381.077-.519.215-.137.138-.214.324-.214.519v2.75L5.5 4.633H8.25c.195 0 .381-.077.519-.215.137-.138.215-.324.215-.519 0-.194-.078-.381-.215-.518C8.631 3.244 8.445 3.167 8.25 3.167H3.506c-.135 0-.263.053-.358.148-.095.095-.148.223-.148.358V8.417c0 .195.077.381.214.519.138.137.324.215.519.215.194 0 .381-.078.518-.215.138-.138.215-.324.215-.519V5.667L15.166 16.367H12.416c-.195 0-.381.077-.519.214-.137.138-.214.324-.214.519 0 .194.077.381.214.518.138.138.324.215.519.215H17.16c.134 0 .263-.053.358-.148.095-.095.148-.224.148-.358v-4.744c0-.195-.077-.381-.214-.519-.138-.138-.324-.215-.519-.215z" fill="currentColor" />
									</svg>
								}
								value={areaValue}
								label={tCard('area')}
							/>
							<FacilityChip
								icon={<FiUsers />}
								value={livingRoomsCount}
								label={tCard('livingRooms')}
							/>
						</div>
					</div>
				</div>
			</article>
		</Link>
	);
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function PropertyGridSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
			{[...Array(8)].map((_, i) => (
				<div key={i} className="w-full rounded-2xl overflow-hidden border border-gray-100 bg-white">
					<style>{`
            @keyframes shimmer {
              0%  { background-position: -200% 0; }
              100%{ background-position:  200% 0; }
            }
            .shimmer-effect {
              background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
            }
          `}</style>
					<div className="shimmer-effect h-[200px] sm:h-[220px] lg:h-[240px]" />
					<div className="p-4 sm:p-5 flex flex-col gap-3">
						<div className="h-6 w-1/2 shimmer-effect rounded-lg" />
						<div className="h-5 w-3/4 shimmer-effect rounded-lg" />
						<div className="h-4 w-1/3 shimmer-effect rounded-lg" />
						<div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100 mt-auto">
							{[...Array(4)].map((_, j) => (
								<div key={j} className="h-6 shimmer-effect rounded-full" />
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyStateResult() {
	const t = useTranslations('property');

	return (
		<div
			role="status"
			className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50"
		>
			<div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 border border-gray-100">
				<LuSearchX size={28} className="text-gray-400" />
			</div>
			<h3 className="text-lg font-bold text-gray-900">{t('grid.emptyTitle')}</h3>
			<p className="text-gray-400 mt-2 max-w-sm text-sm leading-relaxed">
				{t('grid.emptyMessage')}
			</p>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTIES LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
function PropertiesList() {
	const locale = useLocale();
	const t = useTranslations('property');
	const { filters } = useFilter();
	const { debouncedValue: debouncedFilters } = useDebounce({ value: filters, delay: 300 });
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const isRTL = locale === 'ar';

	const [properties, setProperties] = useState<Property[]>([]);
	const page = searchParams.get('page') || 1;
	const [pagination, setPagination] = useState({ limit: 12, total: 0, totalPages: 1 });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProperties = async () => {
			setLoading(true);
			try {
				const dtoParams = mapFiltersToDto(debouncedFilters, page);
				const queryString = new URLSearchParams(dtoParams).toString();
				const res = await api.get(`/properties/search?${queryString}`);
				const { records, pagination: serverPagination } = res.data;
				setProperties(records || []);
				setPagination((p) => ({
					...p,
					total: serverPagination?.total || 0,
					totalPages: serverPagination?.totalPages || 1,
				}));
			} catch (error) {
				console.error('Search failed', error);
				setProperties([]);
			} finally {
				setLoading(false);
			}
		};
		fetchProperties();
	}, [debouncedFilters, page]); // eslint-disable-line react-hooks/exhaustive-deps

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('page', newPage.toString());
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<section className="mt-20 mb-12 sm:mt-24 px-4 sm:px-6" aria-labelledby="properties-title">
			<div className="max-w-screen-2xl mx-auto">
				{/* Header Row */}
				<div className="flex flex-col gap-6 mb-10 lg:grid lg:grid-cols-[auto_1fr] lg:items-start">

					{/* Filter trigger column */}
					<div className={`z-[45] relative flex items-start ${isRTL ? 'justify-end lg:justify-start' : 'justify-start'}`}>
						<FilterProperties />
					</div>

					<div className="flex flex-col gap-5">
						{/* Page Header */}
						<div className="flex flex-col gap-2">
							<h1
								id="properties-title"
								className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight"
							>
								{t('filter.header')}
							</h1>
							{!loading && properties.length > 0 && (
								<p className="text-sm text-gray-400">
									{t('filter.resultsCount', { count: pagination.total })}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="min-h-[400px]">
					{loading ? (
						<PropertyGridSkeleton />
					) : !properties?.length ? (
						<EmptyStateResult />
					) : (
						<div className="flex flex-col gap-8">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
								{properties.map((property) => (
									<PropertyCardGrid
										key={property.id}
										property={property}
										locale={locale}
									/>
								))}
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="flex justify-center pt-4">
									<Pagination
										currentPage={Number(page)}
										pageCount={pagination.totalPages}
										onPageChange={handlePageChange}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function PropertySearchPage() {
	return (
		<FilterProvider>
			<PropertiesList />
		</FilterProvider>
	);
}