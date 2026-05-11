import FormErrorMessage from "./FormErrorMessage";
import { cn } from "@/lib/utils";

type TextAreaInputProps = {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
    rows?: number;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    maxLength?: number;
};

export default function TextAreaInput({
    label,
    placeholder,
    value,
    onChange,
    className,
    error,
    rows = 4,
    required,
    disabled,
    readonly,
    maxLength,
}: TextAreaInputProps) {
    const currentLength = value?.length || 0;

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-input font-semibold text-sm flex items-center gap-1">
                        {label}
                        {required && <span className="text-red-500">*</span>}
                    </label>
                    {maxLength && (
                        <span className={cn(
                            "text-xs font-medium transition-colors duration-200",
                            currentLength > maxLength * 0.9 ? "text-orange-500" : "text-dark/40"
                        )}>
                            {currentLength}/{maxLength}
                        </span>
                    )}
                </div>
            )}

            <div className="relative w-full group">
                {/* Glow effect on focus */}
                <div className={cn(
                    "absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 blur-sm transition-opacity duration-200",
                    !error && "group-focus-within:opacity-100"
                )} />

                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    disabled={disabled}
                    readOnly={readonly}
                    maxLength={maxLength}
                    className={cn(
                        "relative w-full p-4 rounded-xl text-sm font-medium leading-relaxed",
                        "bg-white border-2 transition-all duration-200",
                        "text-dark placeholder:text-placeholder",
                        "focus:outline-none focus:ring-2 focus:ring-transparent",
                        "resize-none scrollbar-thin scrollbar-thumb-secondary/20 scrollbar-track-transparent",
                        error
                            ? "border-red-300  focus:border-red-400"
                            : "border-gray/20 hover:border-secondary/40 focus:border-secondary",
                        disabled && "bg-gray/5 cursor-not-allowed opacity-60",
                        readonly && "bg-gray/5 cursor-default"
                    )}
                />
            </div>

            <FormErrorMessage message={error} />
        </div>
    );
}