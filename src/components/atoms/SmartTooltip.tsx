'use client';

import { DropMenuPosition, getDropMenuPosition } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";

interface SmartTooltipProps {
    value: ReactNode;
    position?: DropMenuPosition;
    maxLength?: number | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", number>>;
    className?: string;
}

export default function SmartTooltip({
    value,
    position = "top-left",
    maxLength = 15,
    className,
}: SmartTooltipProps) {
    const resolveMaxLength = () => {
        if (typeof maxLength === "number") return maxLength;

        const width = window.innerWidth;

        if (width < 640 && maxLength.xs) return maxLength.xs;
        if (width < 768 && maxLength.sm) return maxLength.sm;
        if (width < 1024 && maxLength.md) return maxLength.md;
        if (width < 1280 && maxLength.lg) return maxLength.lg;
        if (maxLength.xl) return maxLength.xl;

        return 15; // fallback
    };

    const [limit, setLimit] = useState(() => resolveMaxLength());

    // Update limit on mount + resize
    useEffect(() => {
        const handleResize = () => {
            const newLimit = resolveMaxLength();
            if (newLimit !== limit) setLimit(newLimit);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [maxLength]);

    // If not a string, just render it
    if (typeof value !== "string") {
        return <>{value}</>;
    }

    // If string is short enough, no tooltip needed
    // if (value.length <= limit) {
    //     return <span className={className}>{value}</span>;
    // }

    // Collapse text for display
    const collapsed = value.slice(0, limit) + "…";
    const positionClassName = getDropMenuPosition(position);

    return (
        <div className="relative group/tooltip inline-block">
            {/* Collapsed text */}
            <span className={cn(
                "cursor-help transition-colors duration-200 group-hover/tooltip:text-primary",
                className
            )}>
                {collapsed}
            </span>

            {/* Tooltip */}
            <div
                className={cn(
                    "absolute z-50 w-max px-3 py-2 rounded-xl text-sm font-medium",
                    "bg-gradient-to-br from-primary to-primary-hover text-white shadow-xl",
                    "opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible",
                    "transition-all duration-200 ease-out",
                    "pointer-events-none",
                    // Animation based on position
                    position.includes("top") && "group-hover/tooltip:translate-y-0 translate-y-1",
                    position.includes("bottom") && "group-hover/tooltip:translate-y-0 -translate-y-1",
                    position.includes("left") && "group-hover/tooltip:translate-x-0 translate-x-1",
                    position.includes("right") && "group-hover/tooltip:translate-x-0 -translate-x-1",
                    positionClassName
                )}
            >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-primary-hover/50 rounded-xl blur-md opacity-75 -z-10" />

                {/* Arrow indicator */}
                <div className={cn(
                    "absolute w-2 h-2 bg-primary rotate-45",
                    position.includes("top") && "bottom-[-4px] left-1/2 -translate-x-1/2",
                    position.includes("bottom") && "top-[-4px] left-1/2 -translate-x-1/2",
                    position.includes("left") && position.includes("top") && "right-[-4px] top-2",
                    position.includes("right") && position.includes("top") && "left-[-4px] top-2"
                )} />

                {/* Content */}
                <span className="relative break-words">{value}</span>
            </div>
        </div>
    );
}