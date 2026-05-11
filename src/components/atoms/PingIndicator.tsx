// components/PingIndicator.tsx
import React from "react";

interface PingIndicatorProps {
    top?: string;         // e.g. "top-1/5" or "top-2"
    start?: string;       // e.g. "start-2/3" or "start-4"
    size?: string;        // e.g. "size-2" or "w-3 h-3"
    color?: string;       // e.g. "#EB5757"
}

const PingIndicator: React.FC<PingIndicatorProps> = ({
    top = "top-1/5",
    start = "start-3/5",
    size = "size-2",
    color = "#EB5757",
}) => {
    return (
        <span className={`absolute ${top} ${start} flex ${size}`}>
            <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75`}
                style={{ backgroundColor: color }}
            ></span>
            <span
                className={`absolute inline-flex ${size} rounded-full`}
                style={{ backgroundColor: color }}
            ></span>
        </span>
    );
};

export default PingIndicator;
