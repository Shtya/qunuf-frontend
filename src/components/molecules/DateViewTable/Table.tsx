'use client';

import React, { ComponentType, useMemo, useState } from 'react';
import { TableColumnType, TableRowType } from '@/types/table';
import { ChildTypeProps, MenuActionItem } from './MenuActionList';
import NoRowsFound from './NoRowsFound';
import TableRow from './TableRow';
import TableHeader from './TableHeader';
import Popup from "@/components/atoms/Popup";

interface TableProps<T = Record<string, any>> {
    columns: TableColumnType<T>[];
    rows: TableRowType<T>[];
    showActions?: boolean;
    setRows?: React.Dispatch<React.SetStateAction<TableRowType<T>[] | null>>;
    actionsMenuItems?: (row: T, onClose?: () => void) => MenuActionItem[];
    fetchRows?: (signal?: AbortSignal) => Promise<void>;
    loading?: boolean;
}

export default function Table<T = Record<string, any>>({
    columns,
    rows,
    actionsMenuItems,
    showActions = false,
    setRows,
    fetchRows,
    loading = false
}: TableProps<T>) {

    const allColumns = useMemo(() => {
        const normalized = columns.map((col) => ({
            ...col,
            sortable: col.sortable ?? true,
        }));

        return showActions
            ? [...normalized, { key: 'actions' as keyof T, label: '', className: 'w-24', sortable: false }]
            : normalized;
    }, [columns, showActions]);

    const [popupState, setPopupState] = useState<{
        Child?: ComponentType<ChildTypeProps>;
        row?: T;
    }>({});
    const [menuOpen, setMenuOpen] = useState(false);

    function handleOpenPopup(Child: ComponentType<ChildTypeProps>, row: T) {
        setPopupState({ Child, row });
        setMenuOpen(true);
    }

    function handleClosePopup() {
        setMenuOpen(false);
        setPopupState({});
    }

    return (
        <div className="relative">
            {/* Modern table container with subtle shadow and border */}
            <div className="overflow-hidden rounded-2xl border border-gray/10 bg-white shadow-sm">
                <div className="overflow-x-auto thin-scrollbar">
                    <table className="min-w-full table-fixed whitespace-nowrap">
                        <TableHeader<T> columns={allColumns} />
                        <tbody className="divide-y divide-gray/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={allColumns.length}>
                                        <div className="flex items-center justify-center py-16">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={allColumns.length}>
                                        <NoRowsFound />
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, idx) => (
                                    <TableRow<T>
                                        key={idx}
                                        row={row}
                                        idx={idx}
                                        allColumns={allColumns}
                                        showActions={showActions}
                                        actionsMenuItems={actionsMenuItems}
                                        setRows={setRows}
                                        fetchRows={fetchRows}
                                        onOpenPopup={handleOpenPopup}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popup for actions */}
            {popupState.Child && (
                <Popup onClose={handleClosePopup} show={menuOpen}>
                    <popupState.Child
                        row={popupState.row!}
                        setRows={setRows}
                        fetchRows={fetchRows}
                        onClose={handleClosePopup}
                    />
                </Popup>
            )}
        </div>
    );
}