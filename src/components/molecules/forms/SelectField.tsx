import { useEffect, useState } from 'react';
import SelectInput, { Option } from './SelectInput';
import FormErrorMessage from './FormErrorMessage';
import { cn } from '@/lib/utils';

type SelectFieldProps = {
    label: string;
    options: Option[];
    placeholder?: string;
    value?: Option | null;
    onChange?: (opt: Option) => void;
    className?: string;
    triggerClassName?: string;
    dropdownClassName?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
};

export default function SelectField({
    label,
    options,
    placeholder = 'Select',
    value,
    onChange,
    className,
    triggerClassName,
    dropdownClassName,
    error,
    required,
    disabled
}: SelectFieldProps) {
    const [internalValue, setInternalValue] = useState<Option | null>(value ?? null);

    const handleChange = (opt: Option) => {
        setInternalValue(opt);
        onChange?.(opt);
    };

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            <label className="text-input font-semibold text-sm flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative group/row">
                {/* Glow effect on focus */}
                <div className={cn(
                    "absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 blur-sm transition-opacity duration-200",
                    !error && "group-focus-within/row:opacity-100"
                )} />

                <SelectInput
                    options={options}
                    placeholder={placeholder}
                    className={cn(
                        "border-2 w-full rounded-xl transition-all duration-200",
                        error
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray/20 hover:border-secondary/40 focus-within:border-secondary"
                    )}
                    triggerClassName={cn(
                        "bg-white rounded-xl h-[46px] px-4",
                        disabled && "bg-gray/5 cursor-not-allowed opacity-60",
                        triggerClassName
                    )}
                    value={internalValue}
                    onChange={handleChange}
                    dropdownClassName={dropdownClassName}
                    disabled={disabled}
                />
            </div>

            <FormErrorMessage message={error} />
        </div>
    );
}