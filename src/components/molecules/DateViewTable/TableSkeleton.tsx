'use client';

import React from 'react';
import { TableColumnType } from '@/types/table';
import { cn } from '@/lib/utils';

type TableSkeletonProps<T = Record<string, any>> = {
    columns: TableColumnType<T>[];
    rowCount?: number;
    showActions?: boolean;
};

export default function TableSkeleton<T = Record<string, any>>({
    columns,
    rowCount = 5,
    showActions = false,
}: TableSkeletonProps<T>) {
    const allColumns: TableColumnType<T>[] = showActions
        ? [...columns, { key: 'actions' as keyof T, label: '', className: 'w-24', sortable: false }]
        : columns;

    return (
        <div className="relative">
            {/* Modern table container */}
            <div className="overflow-hidden rounded-2xl border border-gray/10 bg-white shadow-sm">
                <div className="overflow-x-auto thin-scrollbar">
                    <table className="min-w-full table-fixed whitespace-nowrap">
                        {/* Header Skeleton */}
                        <thead className="bg-gradient-to-r from-secondary/10 to-primary/10 border-b border-gray/10">
                            <tr>
                                {allColumns.map((col, index) => (
                                    <th
                                        key={String(col.key)}
                                        className={cn(
                                            "px-6 py-4 text-left",
                                            col.className || ''
                                        )}
                                    >
                                        <div className="h-4 bg-gradient-to-r from-gray/20 to-gray/10 rounded-md w-24 animate-pulse" />
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Body Skeleton */}
                        <tbody className="divide-y divide-gray/5">
                            {Array.from({ length: rowCount }).map((_, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="group/row transition-all duration-200"
                                    style={{
                                        animationDelay: `${rowIndex * 50}ms`,
                                        animation: 'fadeIn 0.3s ease-out forwards',
                                        opacity: 0
                                    }}
                                >
                                    {allColumns.map((col, colIndex) => (
                                        <td
                                            key={String(col.key)}
                                            className={cn(
                                                "relative py-4 px-6 transition-all duration-200",
                                                col.className || '',
                                                colIndex === 0 ? 'rounded-l-xl' : '',
                                                // colIndex === allColumns.length - 1 ? 'rounded-r-xl' : ''
                                            )}
                                        >
                                            {/* Skeleton content with varied widths */}
                                            <div
                                                className="h-4 bg-gradient-to-r from-gray/15 via-gray/25 to-gray/15 rounded-md animate-shimmer"
                                                style={{
                                                    width: `${Math.random() * 40 + 60}%`,
                                                    backgroundSize: '200% 100%',
                                                }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Loading overlay with pulsing indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-[1px] pointer-events-none">
                <div className="relative">
                    {/* Outer glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 via-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse" />

                    {/* Spinner */}
                    <div className="relative w-12 h-12 rounded-full border-4 border-gray/10 border-t-secondary animate-spin" />
                </div>
            </div>
        </div>
    );
}

// Add shimmer animation to your global CSS or tailwind config
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }

// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }