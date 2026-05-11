import { useMemo } from "react";

type Option = {
    label: string;
    value: string;
};

type SelectablePillGroupProps = {
    options: Option[];
    activeValue: string | string[]; // 👈 unified type
    onSelect: (value: string) => void;
};
export default function SelectablePillGroup({
    options,
    activeValue,
    onSelect,
}: SelectablePillGroupProps) {
    const activeSet = useMemo(() => {
        return Array.isArray(activeValue) ? new Set(activeValue) : null;
    }, [activeValue]);

    return (
        <div className="flex flex-wrap gap-4">
            {options.map(({ label, value }) => {
                const isActive = activeSet ? activeSet.has(value) : value === activeValue;

                return (
                    <button
                        key={value}
                        onClick={() => onSelect(value)}
                        className={`transition-colors py-[6px] px-[13px] min-w-[52px] text-sm text-dark rounded-full w-fit 
              ${isActive ? "text-white bg-primary" : "bg-lighter"}`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
