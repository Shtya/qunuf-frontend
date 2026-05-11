import { useEffect, useState } from "react";
import PropertyFilterInputWrapper from "./PropertyFilterInputWrapper";
import PriceRangeSlider from "@/components/molecules/forms/PriceRangeSlider";
import { useDebounce } from "@/hooks/useDebounce";

type NumberRangeInputProps = {
    min: number;
    max: number;
    range?: { min: number, max: number }
    showProgress?: boolean
    label: string

    onChange: (range: { min: number; max: number }) => void;
};
export default function NumberRangeInput({ min, max, range, onChange, showProgress = true, label }: NumberRangeInputProps) {
    // 1. Unified local state for instant visual feedback
    const [localValues, setLocalValues] = useState<[number, number]>([min, max]);

    // Sync with external changes (e.g., Reset button or URL change)
    useEffect(() => {
        setLocalValues([min, max]);
    }, [min, max]);

    // 2. Debounce the local state
    const { debouncedValue } = useDebounce({ value: localValues, delay: 500 });

    // 3. Only trigger the parent onChange when the debounced value settles
    useEffect(() => {
        const [dMin, dMax] = debouncedValue;
        // Ensure values stay within the allowed range
        const validMin = Math.max(range?.min ?? 0, Math.min(dMin, dMax));
        const validMax = Math.min(range?.max ?? 1000000, Math.max(dMax, dMin));

        if (validMin !== min || validMax !== max) {
            onChange({ min: validMin, max: validMax });
        }
    }, [debouncedValue]);

    const handleInputChange = (index: 0 | 1, val: string) => {
        const numVal = Number(val);
        const newValues: [number, number] = [...localValues];
        newValues[index] = numVal;
        setLocalValues(newValues);
    }
    return (
        <PropertyFilterInputWrapper label={label}>
            <div className="flex gap-5 w-full">
                <input
                    placeholder="Min"
                    value={localValues[0]}
                    onChange={(e) => handleInputChange(0, e.target.value)}
                    className="w-1/2  rounded-md p-2.5 bg-white border border-lightGold text-[16px] text-placeholder"
                />
                <input
                    type="number"
                    placeholder="Max"
                    value={localValues[1]}
                    onChange={(e) => handleInputChange(1, e.target.value)}
                    className="w-1/2  rounded-md p-2.5 bg-white border border-lightGold text-[16px] text-placeholder"
                />
            </div>
            {showProgress && (
                <PriceRangeSlider
                    // Pass the local "hot" state so the slider moves instantly
                    value={{ min: localValues[0], max: localValues[1] }}
                    range={range}
                    // Update local state directly on slide
                    onChange={(val) => setLocalValues([val.min, val.max])}
                />
            )}
        </PropertyFilterInputWrapper>

    );
}