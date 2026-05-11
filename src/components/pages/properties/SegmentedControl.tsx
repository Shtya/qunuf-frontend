'use client';
import SecondaryButton from "@/components/atoms/buttons/SecondaryButton";
import { useIndicatorPosition } from "@/hooks/useIndicatorPosition";

type SegmentedControlProps = {
    options: { value: string; label: string }[];
    activeValue: string;
    fallbackValue?: string | null;
    onChange: (value: string) => void;
    dataAttrKey?: string; // optional custom attribute name
    children?: string;
};

export default function SegmentedControl({
    options,
    activeValue,
    fallbackValue,
    onChange,
    dataAttrKey = "data-segment",
    children
}: SegmentedControlProps) {
    const effectiveValue = activeValue ?? fallbackValue ?? options[0]?.value;
    const activeSelector = `[${dataAttrKey}="${effectiveValue}"]`;
    const indicatorRef = useIndicatorPosition(activeSelector);

    return (
        <div className="bg-lighter relative rounded-full flex gap-2">
            <div
                ref={indicatorRef}
                id={dataAttrKey}
                className="absolute bg-primary transition-all duration-300 ease-in-out rounded-full z-0 will-change-transform"
            />
            {options.map(({ value, label }) => (
                <SecondaryButton
                    key={value}
                    {...{ [dataAttrKey]: value }} // dynamic attribute assignment
                    className={`w-full transition-colors text-nowrap z-[1] ${effectiveValue === value ? 'text-white' : 'text-black'
                        }`}
                    onClick={() => onChange(value)}
                >
                    {label}
                </SecondaryButton>
            ))}
            {children}
        </div>
    );
}
