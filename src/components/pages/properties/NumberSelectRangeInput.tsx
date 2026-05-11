import { useEffect, useMemo, useState } from "react";
import PropertySelectInput from "./PropertySelectInput";
import PropertyFilterInputWrapper from "./PropertyFilterInputWrapper";
import useMinMaxOption from "@/hooks/useMinMaxOption";

type Option = {
    label: string;
    value: number;
};

type NumberSelectRangeInputProps = {
    min: number;
    max: number;
    range: { min: number; max: number };
    label: string;
    options: Option[];
    onChange: (range: { min: number | null; max: number | null }) => void;
};
export default function NumberSelectRangeInput({
    min,
    max,
    range,
    label,
    options,
    onChange,
}: NumberSelectRangeInputProps) {
    const [localMin, setLocalMin] = useState<number>();
    const [localMax, setLocalMax] = useState<number>();
    const { minOption, maxOption } = useMinMaxOption(options);

    const selectedMinOpt = useMemo(() => {
        return options.find(opt => opt.value === localMin);
    }, [options, localMin]);

    const selectedMaxOpt = useMemo(() => {
        return options.find(opt => opt.value === localMax);
    }, [options, localMax]);


    useEffect(() => {
        const minOpt = options.find((opt) => opt.value === min);
        const maxOpt = options.find((opt) => opt.value === max);

        setLocalMin(minOpt ? minOpt.value : range.min);
        setLocalMax(maxOpt ? maxOpt.value : range.max);
    }, [min, max, options, range.max, range.min]);

    const rangeMin = range?.min ?? Number.MIN_SAFE_INTEGER;
    const rangeMax = range?.max ?? Number.MAX_SAFE_INTEGER;

    const validateAndUpdate = (minOpt: number | string | undefined, maxOpt: number | string | undefined) => {
        if (options.length === 0) return;
        const parsedMin = minOpt ? Number(minOpt) : null;
        const parsedMax = maxOpt ? Number(maxOpt) : null;

        const validMin =
            parsedMin !== null ? Math.max(rangeMin, Math.min(parsedMin, parsedMax ?? rangeMax)) : null;
        const validMax =
            parsedMax !== null ? Math.min(rangeMax, Math.max(parsedMax, parsedMin ?? rangeMin)) : null;

        const finalMinOpt = options.find((opt) => opt.value === validMin) ?? null;
        const finalMaxOpt = options.find((opt) => opt.value === validMax) ?? null;

        setLocalMin(finalMinOpt?.value);
        setLocalMax(finalMaxOpt?.value);

        onChange({ min: validMin, max: validMax });
    };


    return (
        <PropertyFilterInputWrapper label={label}>
            <div className="flex gap-5 w-full">
                <PropertySelectInput
                    options={options}
                    value={selectedMinOpt ?? minOption}
                    onChange={(opt) => {
                        const updatedMin = opt;
                        validateAndUpdate(updatedMin.value, localMax);
                    }}
                    placeholder="Min"
                    className="flex-1"
                />
                <PropertySelectInput
                    options={options}
                    value={selectedMaxOpt ?? maxOption}
                    onChange={(opt) => {
                        const updatedMax = opt;
                        validateAndUpdate(localMin, updatedMax.value);
                    }}
                    placeholder="Max"
                    className="flex-1"
                />
            </div>
        </PropertyFilterInputWrapper>
    );
}
