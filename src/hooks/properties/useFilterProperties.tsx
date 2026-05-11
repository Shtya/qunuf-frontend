// useFilterProperties.tsx
import { useSearchParams } from "next/navigation";
import { Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { getSafeNumberInRange } from "@/utils/helpers";
import {
    FilterState,
    MAX_PRICE, MIN_PRICE, MAX_SCQUAREFEET, MIN_SCQUAREFEET, MAX_YEARBUILD, MIN_YEARBUILD,
    bedroomValues, bathroomValues, periodValues, propertyTypeValues, furnishedValues, featureKeys,
} from "@/constants/properties/constant";
import { useLocalizedOptionsGroups } from "../useLocalizedOptionsGroups";
import { useValues } from "@/contexts/GlobalContext";
import { useLocale, useTranslations } from "next-intl";
import { Option } from "@/components/molecules/forms/SelectInput";
import { CommercialSubType, PropertyType, RentType, ResidentialSubType } from "@/types/dashboard/properties";
import { usePathname, useRouter } from "@/i18n/navigation";
import { createContext } from 'react';

const defaultFilters: FilterState = {
    location: "all",
    period: RentType.MONTHLY,
    type: PropertyType.RESIDENTIAL,
    subtype: [],
    furnished: "furnished",
    bathroom: 'all',
    bedroom: 'all',
    features: [],
    priceMin: MIN_PRICE,
    priceMax: MAX_PRICE,
    scquarefeetMin: MIN_SCQUAREFEET,
    scquarefeetMax: MAX_SCQUAREFEET,
    yearBuiltMin: MIN_YEARBUILD,
    yearBuiltMax: MAX_YEARBUILD,
};

function useFilterProperties() {
    const tForm = useTranslations("dashboard.properties.form");
    const tEnums = useTranslations("property.enums");
    const t = useTranslations("property.filter");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const locale = useLocale()
    const { states, loadingStates: loadingLocations } = useValues();
    const locations: Option[] = useMemo(
        () => [
            {
                value: "all",
                label: t("location.any"),
            },
            ...states.map((s) => ({
                value: s.id,
                label: locale === "ar" ? s.name_ar : s.name,
            })),
        ],
        [states, locale, t]
    );

    // localized option groups
    const { bedrooms,
        bathrooms,
        periods,
        propertyTypes,
        furnishedTypes
    } = useLocalizedOptionsGroups(
        [
            { key: 'bedrooms', translationPath: 'bedrooms', options: [...bedroomValues], },
            { key: 'bathrooms', translationPath: 'bathrooms', options: [...bathroomValues], },
            { key: 'periods', translationPath: 'rentalPeriod', options: [...periodValues], },
            { key: 'propertyTypes', translationPath: 'propertyType', options: [...propertyTypeValues], },
            { key: 'furnishedTypes', translationPath: 'furnishedType', options: [...furnishedValues], }
        ],
        'property.filter'
    );

    const yearOptions = useMemo(() => {
        const years: { label: string; value: number }[] = [];
        for (let year = MAX_YEARBUILD; year >= MIN_YEARBUILD; year--) {
            years.push({
                label: year.toString(),
                value: year,
            });
        }
        return years;
    }, []);

    const featureOptions = useMemo(
        () =>
            featureKeys.map((key) => ({
                value: key,
                label: tForm(`${key}`),
            })),
        [tForm]
    );

    // initialize filters from URL once
    const [filters, setFilters] = useState<FilterState>(() => {
        const rawPriceMin = getSafeNumberInRange(searchParams.get("priceMin"), defaultFilters.priceMin, MIN_PRICE, MAX_PRICE);
        const rawPriceMax = getSafeNumberInRange(searchParams.get("priceMax"), defaultFilters.priceMax, MIN_PRICE, MAX_PRICE);
        const priceMin = Math.min(rawPriceMin, rawPriceMax);
        const priceMax = Math.max(rawPriceMin, rawPriceMax);

        const rawSqftMin = getSafeNumberInRange(searchParams.get("scquarefeetMin"), defaultFilters.scquarefeetMin, MIN_SCQUAREFEET, MAX_SCQUAREFEET);
        const rawSqftMax = getSafeNumberInRange(searchParams.get("scquarefeetMax"), defaultFilters.scquarefeetMax, MIN_SCQUAREFEET, MAX_SCQUAREFEET);
        const scquarefeetMin = Math.min(rawSqftMin, rawSqftMax);
        const scquarefeetMax = Math.max(rawSqftMin, rawSqftMax);

        const rawYearMin = getSafeNumberInRange(searchParams.get("yearBuiltMin"), defaultFilters.yearBuiltMin, MIN_YEARBUILD, MAX_YEARBUILD);
        const rawYearMax = getSafeNumberInRange(searchParams.get("yearBuiltMax"), defaultFilters.yearBuiltMax, MIN_YEARBUILD, MAX_YEARBUILD);
        const yearBuiltMin = Math.min(rawYearMin, rawYearMax);
        const yearBuiltMax = Math.max(rawYearMin, rawYearMax);

        const type = searchParams.get("type") || defaultFilters.type;
        const period = searchParams.get("period") || defaultFilters.period;
        const furnished = searchParams.get("furnished") || defaultFilters.furnished;
        const bathroom = searchParams.get("bathroom") || defaultFilters.bathroom;
        const bedroom = searchParams.get("bedroom") || defaultFilters.bedroom;

        const subtype = (searchParams.get("subtype")?.split(",").filter(Boolean) || defaultFilters.subtype)
        const features = (searchParams.get("features")?.split(",").filter(Boolean) || defaultFilters.features)

        return {
            location: searchParams.get("location") || locations?.[0]?.value.toString(),
            period,
            type,
            subtype,
            furnished,
            bathroom,
            bedroom,
            features,
            priceMin,
            priceMax,
            scquarefeetMin,
            scquarefeetMax,
            yearBuiltMin,
            yearBuiltMax,
        };
    });

    const subTypeOptions = useMemo(() => {
        const isCommercial = filters.type === PropertyType.COMMERCIAL;
        const subTypeEnum = isCommercial ? CommercialSubType : ResidentialSubType;
        const path = isCommercial ? "commercial" : "residential";

        return Object.values(subTypeEnum).map(val => ({
            label: tEnums(`subType.${path}.${val}`),
            value: val
        }));
    }, [filters.type, tEnums]);

    const activeLocation = useMemo(() => locations.find(o => o.value === filters.location), [filters.location, locations])

    useEffect(() => {
        // 1. Initialize params from the current search to preserve non-filter keys
        const params = new URLSearchParams(searchParams.toString());

        // 2. Map all current filters to the URL
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // Only set if array has items, otherwise clear from URL
                if (value.length > 0) {
                    params.set(key, value.join(","));
                } else {
                    params.delete(key);
                }
            } else if (value === undefined || value === null || value === 'all' || value === '') {
                // Remove defaults or empty values to keep URL trimmed
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        // 3. Only update the router if the string has actually changed
        const newQuery = params.toString();
        const currentQuery = searchParams.toString();

        if (newQuery !== currentQuery) {
            router.replace(`${pathname}?${newQuery}`, {
                scroll: false,
                // @ts-ignore - shallow is specific to some Next.js router wrappers
                shallow: true
            });
        }
    }, [filters, pathname, router, searchParams]);

    const updateFilter = useCallback((updates: Partial<FilterState> | keyof FilterState, value?: any) => {
        const patch = typeof updates === "string" ? ({ [updates]: value } as Partial<FilterState>) : updates;

        setFilters((prev) => {
            const next = { ...prev, ...patch };
            return next;
        });
    }, []);

    const toggleSubtype = useCallback((value: string) => {
        setFilters(prev => {
            const exists = prev.subtype.includes(value);
            const nextSubtypes = exists ? prev.subtype.filter(v => v !== value) : [...prev.subtype, value];

            return { ...prev, subtype: nextSubtypes };
        });
    }, []);

    const toggleFeature = useCallback((value: string) => {
        setFilters(prev => {
            const exists = prev.features.includes(value);
            const nextFeatures = exists ? prev.features.filter(v => v !== value) : [...prev.features, value];
            return { ...prev, features: nextFeatures };
        });
    }, []);

    const updateType = useCallback((value: string) => {
        if (value !== 'residential' && value !== 'commercial') return;
        setFilters(prev => {
            if (prev.type !== value) {
                const next = { ...prev, type: value, subtype: [] };
                return next;
            }
            return prev;
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    // return memoized object so context consumers don't re-render on every parent render
    return useMemo(() => ({
        filters,
        activeLocation,
        loadingLocations,
        locations,
        subtypes: subTypeOptions,
        bedrooms,
        bathrooms,
        features: featureOptions,
        periods,
        propertyTypes,
        furnishedTypes,
        yearOptions,
        updateFilter,
        toggleSubtype,
        toggleFeature,
        updateType,
        resetFilters
    }), [
        filters, activeLocation, loadingLocations, locations, subTypeOptions,
        bedrooms, bathrooms, featureOptions, periods, propertyTypes, furnishedTypes, yearOptions,
        updateFilter, toggleSubtype, toggleFeature, updateType, resetFilters
    ]);
}

interface FilterContextType {
    filters: FilterState;
    activeLocation: any;
    loadingLocations: boolean;
    locations: any[];
    subtypes: any[];
    bedrooms: any[];
    bathrooms: any[];
    features: any[];
    periods: any[];
    propertyTypes: any[];
    furnishedTypes: any[];
    yearOptions: any[];
    updateFilter: {
        (key: keyof FilterState, value: any): void;
        (updates: Partial<FilterState>): void;
    };
    toggleSubtype: (value: string) => void;
    toggleFeature: (value: string) => void;
    updateType: (value: string) => void;
    resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType>({
    filters: defaultFilters,
    activeLocation: null,
    loadingLocations: true,
    locations: [],
    subtypes: [],
    bedrooms: [],
    bathrooms: [],
    features: [],
    periods: [],
    propertyTypes: [],
    furnishedTypes: [],
    yearOptions: [],
    updateFilter: () => { },
    toggleSubtype: () => { },
    toggleFeature: () => { },
    updateType: () => { },
    resetFilters: () => { },
});

export function FilterProvider({ children }: { children: ReactNode }) {
    const filterData = useFilterProperties();

    return (
        <FilterContext.Provider value={filterData}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter(): FilterContextType {
    const context = useContext(FilterContext);

    if (!context) {
        throw new Error('useFilter must be used within a FilterProvider');
    }

    return context;
}
