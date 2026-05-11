import { useRef } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";
import FormErrorMessage from "./FormErrorMessage";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DateInputProps {
    label?: string;
    placeholder?: string;
    value?: string | Date;
    onChange: (date: Date[]) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    minDate?: Date | string;
    maxDate?: Date | string;
    mode?: "single" | "multiple" | "range";
}

export default function DateInput({
    label,
    placeholder = "Select date",
    value,
    onChange,
    error,
    required,
    disabled,
    className,
    minDate,
    maxDate,
    mode = "single",
}: DateInputProps) {
    const flatpickrRef = useRef(null);

    const handleClear = () => {
        flatpickrRef.current?.flatpickr?.clear();
        onChange([]);
    };

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {label && (
                <label className="text-input font-semibold text-sm flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative w-full group/date">
                {/* Glow effect on focus */}
                <div
                    className={cn(
                        "absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 blur-sm transition-opacity duration-200",
                        !error && "group-focus-within/date:opacity-100"
                    )}
                />

                <Flatpickr
                    ref={flatpickrRef}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    options={{
                        dateFormat: "Y-m-d",
                        disableMobile: true,
                        static: true,
                        minDate: minDate,
                        maxDate: maxDate,
                        mode: mode,
                        // Add animations
                        animate: true,
                        // Custom prev/next arrows
                        prevArrow: '<svg class="flatpickr-nav-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>',
                        nextArrow: '<svg class="flatpickr-nav-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>',
                    }}
                    className={cn(
                        "relative w-full h-[46px] px-4 pr-12 rtl:pl-12 rtl:pr-4 rounded-xl text-sm font-medium",
                        "bg-white border-2 transition-all duration-200",
                        "text-dark placeholder:text-placeholder",
                        "focus:outline-none focus:ring-2 focus:ring-transparent",
                        "cursor-pointer",
                        error
                            ? "border-red-300 bg-red-50/30 focus:border-red-400"
                            : "border-gray/20 hover:border-secondary/40 focus:border-secondary",
                        disabled && "bg-gray/5 cursor-not-allowed opacity-60",
                        "flatpickr-custom"
                    )}
                />

                {/* Icons Container */}
                <div className="absolute inset-y-0 ltr:right-2 rtl:left-2 flex items-center gap-1 pointer-events-none">
                    {/* Clear Button (shows when has value) */}
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={cn(
                                "p-1.5 rounded-lg hover:bg-red-50 text-placeholder hover:text-red-500",
                                "transition-all duration-200 pointer-events-auto",
                                "group/clear"
                            )}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Calendar Icon */}
                    <div className={cn(
                        "p-1.5 rounded-lg text-placeholder transition-colors duration-200",
                        !disabled && "group-focus-within/date:text-secondary"
                    )}>
                        <CalendarIcon size={18} />
                    </div>
                </div>
            </div>

            <FormErrorMessage message={error} />
        </div>
    );
}