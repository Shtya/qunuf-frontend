export function formatLargeNumber(num: number): string {
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1)}B`;
    }
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
}


export const getSafeNumber = (input: unknown, fallback: number): number => {
    const parsed = typeof input === 'number' ? input : parseInt(String(input));
    return isNaN(parsed) ? fallback : parsed;
};

export const getSafeNumberInRange = (
    input: unknown,
    fallback: number,
    min: number,
    max: number
): number => {
    const parsed = typeof input === 'number' ? input : parseInt(String(input));
    if (isNaN(parsed)) return fallback;

    return Math.min(Math.max(parsed, min), max);
};


export const getSafeString = <T extends string>(
    input: unknown,
    allowed: Set<T>,
    fallback: T
): T => {
    return allowed.has(input as T) ? (input as T) : fallback;
};



export const generatePagination = (currentPage: number, totalPages: number) => {
    const pages = [];
    if (totalPages <= 3) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 2) {
            pages.push(1, 2, 3, "...", totalPages);
        } else if (currentPage >= totalPages - 1) {
            pages.push(1, "...");
            for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(
                1,
                "...",
                currentPage - 1,
                currentPage,
                currentPage + 1,
                "...",
                totalPages,
            );
        }
    }
    return pages;
};


export function updateUrlParams(pathname: string, params: URLSearchParams) {
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
}

export type DropMenuPosition =
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left'
    | 'bottom-center'
    | 'top-center';

export function getDropMenuPosition(position: DropMenuPosition) {
    let className = '';

    if (position === 'bottom-right') {
        className = 'top-full end-0 mt-2';
    } else if (position === 'bottom-left') {
        className = 'top-full start-0 mt-2';
    } else if (position === 'top-right') {
        className = 'bottom-full end-0 mb-2';
    } else if (position === 'top-left') {
        className = 'bottom-full start-0 mb-2';
    } else if (position === 'bottom-center') {
        className = 'top-full -start-1/2  mt-2';
    } else if (position === 'top-center') {
        className = 'bottom-full -start-1/2  mb-2';
    }

    return className;
}

// utils/string.ts
export function getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    const firstChar = words[0]?.charAt(0) || '';
    const secondChar = words[1]?.charAt(0) || '';
    return (firstChar + secondChar).toUpperCase();
}



export const saudiPhoneRegex = /^(009665|9665|\+9665|05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;

export const getTrend = (percent?: number) => {
    if (percent == null) return null;

    return {
        isUp: percent >= 0,
        value: Math.abs(percent),
    };
};
