import { TableColumnType } from '@/types/table';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

interface TableHeaderCellProps<T> {
    col: TableColumnType<T>;
    isSorted: boolean;
    isAsc: boolean;
    onSort: (key: string) => void;
}

export default function TableHeaderCell<T>({
    col,
    isSorted,
    isAsc,
    onSort,
}: TableHeaderCellProps<T>) {
    const handleClick = () => {
        if (col.sortable && col.key) {
            onSort(col.key as string);
        }
    };

    return (
        <th
            className={`
                relative px-6 py-4 text-left text-xs font-bold uppercase tracking-wider
                text-dark/80 
                ${col.sortable ? 'cursor-pointer select-none group' : ''}
                ${col.className || ''}
                transition-all duration-200
            `}
            onClick={handleClick}
        >
            <div className="flex items-center gap-2">
                {/* Label */}
                <span className={`
                    transition-colors duration-200
                    ${col.sortable ? 'group-hover:text-primary' : ''}
                    ${isSorted ? 'text-primary' : ''}
                `}>
                    {col.label}
                </span>

                {/* Sort Icon */}
                {col.sortable && (
                    <div className="relative w-4 h-4 flex items-center justify-center">
                        {isSorted ? (
                            <div className="relative">
                                {/* Glow effect on active sort */}
                                <div className="absolute -inset-1 bg-primary/30 rounded-full blur-sm" />
                                {isAsc ? (
                                    <IoChevronUp
                                        className="relative text-primary animate-in fade-in duration-200"
                                        size={16}
                                    />
                                ) : (
                                    <IoChevronDown
                                        className="relative text-primary animate-in fade-in duration-200"
                                        size={16}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <IoChevronDown
                                    className="text-dark/40 group-hover:text-secondary"
                                    size={14}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom border indicator for sorted column */}
            {isSorted && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary via-primary to-secondary animate-in slide-in-from-bottom duration-300" />
            )}
        </th>
    );
}