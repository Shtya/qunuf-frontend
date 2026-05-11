'use client';

import { parse } from 'date-fns';
import { FilterConfig } from '@/types/table';
import DateRangePicker from '../forms/SelectDateRange';
import SearchField from '../forms/SearchField';
import useTableFilter from '@/hooks/dashboard/useTableFilter';

import { useState } from 'react';
import { CiFilter } from 'react-icons/ci';
import { IconType } from 'react-icons';
import { TableActions } from './TableActions';
import { useTranslations } from 'next-intl';
import SelectDropdown from '../forms/SelectDropdown';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/atoms/Sidebar';

export type actionButton = {
    show?: boolean;
    label?: string;
    href?: string;
    onClick?: () => void;
    MobileIcon?: IconType;
}

type Props = {
    filters: FilterConfig[];
    showSearch?: boolean;
    searchPlaceholder?: string;
    actionButton?: actionButton;
    onExport?: (limit: number) => Promise<void>;
    hasRows?: boolean;
};

export default function FilterContainer({
    filters,
    searchPlaceholder,
    onExport,
    showSearch = true,
    actionButton = { show: false },
    hasRows,
}: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const t = useTranslations('dashboard.filter.container');
    const {
        search,
        setSearch,
        allFilters,
        updateFilter,
        handleDateChange
    } = useTableFilter({ filters });

    return (
        <div className="space-y-4">
            {/* Mobile Filter Button & Actions Bar */}
            <div className="flex items-center gap-3 lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className={cn(
                        "flex-1 inline-flex items-center justify-center gap-2",
                        "px-4 py-3 rounded-xl font-semibold text-sm",
                        "bg-gradient-to-r from-secondary to-secondary-hover",
                        "hover:from-primary hover:to-primary-hover",
                        "text-white shadow-md hover:shadow-lg",
                        "transition-all duration-200",
                        "active:scale-95"
                    )}
                >
                    <CiFilter size={20} className="shrink-0" />
                    <span>{t('filter')}</span>
                </button>

                <TableActions hasRows={hasRows} actionButton={actionButton} onExport={onExport} />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
                {/* Search Field */}
                {showSearch && (
                    <div className="flex-1 min-w-[280px]">
                        <SearchField
                            value={search}
                            onChange={setSearch}
                            searchPlaceholder={searchPlaceholder}
                        />
                    </div>
                )}
 
                {filters.map((filter) => {
                    const current = allFilters[filter.key];
                    const handleChange = (value: string | undefined) => {
                        updateFilter(filter.key, value);
                    };

                    if (filter.type === 'custom' && filter.Component) {
                        const CustomComponent = filter.Component;
                        return (
                            <div key={filter.key} className="w-fit">
                                <CustomComponent value={current} onChange={handleChange} />
                            </div>
                        );
                    }

                    if (filter.type === "select" && filter.options) {
                        return (
                            <div key={filter.key} className="w-fit">
                                <SelectDropdown 
                                    label={filter.label}
                                    options={filter.options}
                                    value={current}
                                    onChange={handleChange}
                                />
                            </div>
                        );
                    }

                    if (filter.type === "dateRange") {
                        const fromDate = allFilters[`${filter.key}_from`]
                            ? parse(allFilters[`${filter.key}_from`], 'yyyy-MM-dd', new Date())
                            : undefined;
                        const toDate = allFilters[`${filter.key}_to`]
                            ? parse(allFilters[`${filter.key}_to`], 'yyyy-MM-dd', new Date())
                            : undefined;

                        return (
                            <div key={filter.key} className="w-fit">
                                <DateRangePicker
                                    value={{ startDate: fromDate, endDate: toDate }}
                                    onChange={(dates) => handleDateChange({ filter, dates })}
                                />
                            </div>
                        );
                    }

                    return null;
                })}

                {/* Desktop Actions */}
                <div className="ml-auto">
                    <TableActions hasRows={hasRows} actionButton={actionButton} onExport={onExport} />
                </div>
            </div>

            {/* Mobile Sidebar */}
            <Sidebar
                className='hidden! lg:hidden!'
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-primary">
                        <CiFilter size={24} className="shrink-0" />
                        <span className="text-lg font-bold">{t('filter')}</span>
                    </div>
                }
            >
                <div className="p-6 space-y-4">
                    {/* Mobile Search */}
                    {showSearch && (
                        <SearchField
                            value={search}
                            onChange={setSearch}
                            searchPlaceholder={searchPlaceholder}
                        />
                    )}

                    {/* Mobile Filters */}
                    {filters.map((filter) => {
                        const current = allFilters[filter.key];
                        const handleChange = (value: string | undefined) => {
                            updateFilter(filter.key, value);
                        };

                        if (filter.type === 'custom' && filter.Component) {
                            const CustomComponent = filter.Component;
                            return (
                                <div key={filter.key}>
                                    <CustomComponent value={current} onChange={handleChange} />
                                </div>
                            );
                        }

                        if (filter.type === "select" && filter.options) {
                            return (
                                <div key={filter.key}>
                                    <SelectDropdown
                                        label={filter.label}
                                        options={filter.options}
                                        value={current}
                                        onChange={handleChange}
                                    />
                                </div>
                            );
                        }

                        if (filter.type === "dateRange") {
                            const fromDate = allFilters[`${filter.key}_from`]
                                ? parse(allFilters[`${filter.key}_from`], 'yyyy-MM-dd', new Date())
                                : undefined;
                            const toDate = allFilters[`${filter.key}_to`]
                                ? parse(allFilters[`${filter.key}_to`], 'yyyy-MM-dd', new Date())
                                : undefined;

                            return (
                                <div key={filter.key}>
                                    <DateRangePicker
                                        value={{ startDate: fromDate, endDate: toDate }}
                                        onChange={(dates) => handleDateChange({ filter, dates })}
                                    />
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
            </Sidebar>
        </div>
    );
}