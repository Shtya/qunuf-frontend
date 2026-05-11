'use client';

import { useSearchParams } from 'next/navigation';
import { FilterConfig, TableColumnType, TableRowType } from '@/types/table';
import TableSkeleton from './TableSkeleton';
import { useEffect, useState } from 'react';
import FilterContainer, { actionButton } from './FilterContainer';
import Table from './Table';
import TableError from './TableError';
import { MenuActionItem } from './MenuActionList';
import TablePagination from './TablePagination';
import DashboardCard from '@/components/dashboard/DashboardCard';

type DataViewProps<T = Record<string, any>> = {
    columns: TableColumnType<T>[];
    filters?: FilterConfig[];
    showSearch?: boolean;
    searchPlaceholder?: string;
    actionsMenuItems?: (row: T, onClose?: () => void) => MenuActionItem[];
    showActions?: boolean;
    pageSize?: number;
    actionButton?: actionButton;
    getRows: (signal?: AbortSignal) => Promise<{
        rows: TableRowType<T>[];
        error?: Error | null;
        totalCount?: number;
    }>;
    onExport?: (limit: number) => Promise<void>;
    onFetchRowsReady?: (fetchRows: (signal?: AbortSignal) => Promise<void>) => void;
};

export default function DataView<T = Record<string, any>>({
    columns,
    filters = [],
    showSearch = true,
    searchPlaceholder,
    actionsMenuItems,
    showActions = false,
    pageSize = 10,
    actionButton,
    getRows,
    onExport,
    onFetchRowsReady
}: DataViewProps<T>) {
    const searchParams = useSearchParams();
    const [rows, setRows] = useState<TableRowType<T>[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalRowsCount, setTotalRowsCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchRows = async (signal?: AbortSignal) => {
        setIsLoading(true);
        try {
            const { rows, error, totalCount } = await getRows(signal);
            setTotalRowsCount(totalCount ?? 0);
            setError(error ? error.message : null);
            setRows(rows);
        } finally {
            if (!signal || !signal.aborted) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchRows(controller.signal);
        return () => controller.abort();
    }, [getRows]);

    useEffect(() => {
        if (onFetchRowsReady) {
            onFetchRowsReady(fetchRows);
        }
    }, [onFetchRowsReady]);

    const pageParam = searchParams.get('page');
    const currentPage = pageParam ? parseInt(pageParam) : 1;

    const startEntry = (currentPage - 1) * pageSize + 1;
    const endEntry = Math.min(currentPage * pageSize, totalRowsCount);
    const pageCount = Math.ceil(totalRowsCount / pageSize);

    return (
        <DashboardCard className="space-y-6">
            {/* Filters Section */}
            <FilterContainer
                filters={filters}
                showSearch={showSearch}
                searchPlaceholder={searchPlaceholder}
                actionButton={actionButton}
                onExport={onExport}
                hasRows={rows && rows.length > 0}
            />

            {/* Table Section */}
            <div className="space-y-4">
                {isLoading ? (
                    <TableSkeleton columns={columns} rowCount={pageSize} showActions={showActions} />
                ) : error ? (
                    <TableError message={error} onRetry={fetchRows} />
                ) : (
                    <Table<T>
                        columns={columns}
                        setRows={setRows}
                        rows={rows ?? []}
                        showActions={showActions}
                        actionsMenuItems={actionsMenuItems}
                        fetchRows={fetchRows}
                        loading={isLoading}
                    />
                )}

                {/* Pagination */}
                {!isLoading && !error && (
                    <TablePagination
                        pageCount={pageCount}
                        pageSize={pageSize}
                        total={totalRowsCount}
                    />
                )}
            </div>
        </DashboardCard>
    );
}