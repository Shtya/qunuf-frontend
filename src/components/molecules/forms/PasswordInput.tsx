import { cn } from '@/lib/utils';
import { InputHTMLAttributes, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import FormErrorMessage from './FormErrorMessage';

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function PasswordInput({
    label,
    placeholder,
    value,
    error,
    onChange,
    required,
    disabled,
    className,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowPassword((prev) => !prev);
    };

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {label && (
                <label className="text-input font-semibold text-sm flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative w-full group/row">
                {/* Glow effect on focus - Matches TextInput */}
                <div className={cn(
                    "absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 blur-sm transition-opacity duration-200",
                    !error && "group-focus-within/row:opacity-100"
                )} />

                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "relative w-full h-[46px] px-4 rounded-xl text-sm font-medium",
                        "bg-white border-2 transition-all duration-200",
                        "text-dark placeholder:text-placeholder",
                        "focus:outline-none focus:ring-2 focus:ring-transparent",
                        // RTL support for the eye icon padding
                        'rtl:pl-12 ltr:pr-12',
                        error
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray/20 hover:border-secondary/40 focus:border-secondary",
                        disabled && "bg-gray/5 cursor-not-allowed opacity-60"
                    )}
                />

                {/* Visibility Toggle Button */}
                <button
                    type="button"
                    onMouseDown={toggleVisibility}
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 text-lg transition-colors duration-200",
                        "text-dark/40 hover:text-secondary focus:outline-none",
                        "ltr:right-4 rtl:left-4"
                    )}
                >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>

            <FormErrorMessage message={error} />
        </div>
    );
}