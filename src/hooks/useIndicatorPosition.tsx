import { useLayoutEffect, useRef } from "react";
import { useLocale } from "next-intl";

export function useIndicatorPosition(activeSelector: string) {
    const indicatorRef = useRef<HTMLDivElement>(null);
    const locale = useLocale();
    const isRTL = locale === "ar";

    const rafRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        const updatePosition = () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }

            rafRef.current = requestAnimationFrame(() => {
                const indicator = indicatorRef.current;
                if (!indicator) return;

                const parent = indicator.parentElement;
                if (!parent) return;

                const activeElement = parent.querySelector(activeSelector) as HTMLElement;
                if (!activeElement) return;

                const targetRect = activeElement.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();

                const top = targetRect.top - parentRect.top + parent.scrollTop;

                const offset = targetRect.left - parentRect.left + parent.scrollLeft;
                indicator.style.left = `${offset}px`;
                indicator.style.right = "auto";

                indicator.style.top = `${top}px`;
                indicator.style.width = `${targetRect.width}px`;
                indicator.style.height = `${targetRect.height}px`;
                indicator.style.transform = `none`;
            });
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            window.removeEventListener("resize", updatePosition);
        };
    }, [activeSelector ?? "", isRTL ?? false]);

    return indicatorRef;
}
