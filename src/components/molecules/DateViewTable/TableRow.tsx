import { TableColumnType, TableRowType } from "@/types/table";
import { ActionList, ChildTypeProps, MenuActionItem } from "./MenuActionList";
import { ComponentType } from "react";

interface TableRowProps<T> {
    row: T;
    idx: number;
    allColumns: TableColumnType<T>[];
    showActions?: boolean;
    setRows?: React.Dispatch<React.SetStateAction<TableRowType<T>[] | null>>;
    actionsMenuItems?: (row: T, onClose: () => void) => MenuActionItem[];
    onOpenPopup?: (Child: ComponentType<ChildTypeProps>, row: T) => void;
    fetchRows?: (signal?: AbortSignal) => Promise<void>;
}

export default function TableRow<T>({
    row,
    idx,
    allColumns,
    showActions,
    setRows,
    actionsMenuItems,
    onOpenPopup,
    fetchRows
}: TableRowProps<T>) {
    return (
        <tr className="group/row transition-all duration-200 hover:bg-gradient-to-r hover:from-secondary/5 hover:to-primary/5">
            {allColumns.map((col, index) => {
                const value = col.key ? row[col.key] : '';

                return (
                    <td
                        key={index}
                        className={`
                            relative py-4 px-6 text-dark/90 font-medium text-sm
                            transition-all duration-200
                            ${col.className || ''}
                            ${index === 0 ? 'ltr:rounded-l-xl rtl:rounded-r-xl' : ''}
                            ${index === allColumns.length - 1 ? 'ltr:rounded-r-xl rtl:rounded-l-xl' : ''}
                        `}
                    >
                        {/* Hover gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/5 to-primary/0 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10">
                            {col.key === 'actions' && showActions ? (
                                <ActionList
                                    onOpenPopup={onOpenPopup}
                                    setRows={setRows}
                                    fetchRows={fetchRows}
                                    row={row}
                                    items={actionsMenuItems?.(row, () => { })}
                                />
                            ) : col.cell ? (
                                col.cell?.(value, row, setRows)
                            ) : value !== undefined ? (
                                <span className="group-hover/row:text-dark transition-colors duration-200">
                                    {value as React.ReactNode}
                                </span>
                            ) : (
                                <span className="text-gray/40 text-xs">—</span>
                            )}
                        </div>
                    </td>
                );
            })}
        </tr>
    );
}