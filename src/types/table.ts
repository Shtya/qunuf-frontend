import { ComponentType } from "react";


export type TableColumnType<T = Record<string, any>> = {
    key: keyof T;
    label: string;
    className?: string;
    sortable?: boolean;
    cell?: (value: any, row?: T, setRows?: React.Dispatch<React.SetStateAction<TableRowType<T>[] | null>>) => React.ReactNode;
    sortKey?: string;
};

export type TableRowType<T = Record<string, any>> = T;

export type BaseFilterKeys = 'sort' | 'dir' | 'search' | 'page' | 'limit';

export type FilterConfig = {
    key: string;
    label: string;
    type: 'select' | 'dateRange' | 'custom';
    options?: { label: string; value: string }[];
    default?: string | { startDate?: Date; endDate?: Date };
    Component?: ComponentType<{
        value?: string;
        onChange: (val: string | undefined) => void;
    }>;
};