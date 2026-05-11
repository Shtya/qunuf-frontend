import z from "zod";

type FormatOptions = {
    showTodayAs?: 'time' | 'today';
};

export const formatLastMessageTime = (
    date: string | Date | undefined,
    t?: (key: string) => string,
    options?: FormatOptions
) => {
    if (!date) return '';

    const msgDate = new Date(date);
    const now = new Date();

    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    // ✅ Today
    if (isSameDay(msgDate, now)) {
        if (options?.showTodayAs === 'today') {
            return t ? t('date.today') : 'Today';
        }

        return msgDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    // ✅ Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay(msgDate, yesterday)) {
        return t ? t('date.yesterday') : 'Yesterday';
    }

    // ✅ Different year
    if (msgDate.getFullYear() !== now.getFullYear()) {
        return msgDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    // ✅ Same year (older)
    return msgDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};


export function isWithinAdultRange(val: string | Date): boolean {
    const date = val instanceof Date ? val : new Date(val);

    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

    return date <= eighteenYearsAgo && date >= hundredYearsAgo;
}
