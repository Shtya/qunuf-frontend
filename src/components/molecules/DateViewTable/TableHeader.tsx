'use client';

import React from 'react';
import { TableColumnType } from '@/types/table';
import { usePathname, useSearchParams } from 'next/navigation';
import { updateUrlParams } from '@/utils/helpers';
import TableHeaderCell from './TableHeaderCell';

interface TableHeaderProps<T> {
    columns: TableColumnType<T>[];
}

export default function TableHeader<T>({ columns }: TableHeaderProps<T>) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const sort = searchParams.get('sort');
    const dir = searchParams.get('dir') ?? 'asc';

    const handleSort = (key: string) => {
        const isSameKey = sort === key;
        const newDir = isSameKey && dir === 'asc' ? 'desc' : 'asc';

        const updated = {
            ...Object.fromEntries(searchParams.entries()),
            sort: key,
            dir: newDir,
        };

        const params = new URLSearchParams(updated);
        updateUrlParams(pathname, params);
    };

    return (
        <thead className="bg-gradient-to-r from-secondary/10 to-primary/10 border-b border-gray/10">
            <tr>
                {columns.map((col, index) => {
                    const isSorted = sort === col.key;
                    const isAsc = dir === 'asc';

                    return (
                        <TableHeaderCell<T>
                            key={index}
                            col={col}
                            isSorted={isSorted}
                            isAsc={isAsc}
                            onSort={handleSort}
                        />
                    );
                })}
            </tr>
        </thead>
    );
}