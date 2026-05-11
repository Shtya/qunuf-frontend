import { Control, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState, KeyboardEvent, useMemo } from "react";
import { MdClose, MdAdd } from "react-icons/md";
import FormErrorMessage from "@/components/molecules/forms/FormErrorMessage";
import { cn } from "@/lib/utils";

interface Props {
    control: Control<any>;
    name: string;
    label?: string;
    placeholder?: string;
    errors: any;
    maxTags?: number;
}

export function FeaturesTagsInput({
    control,
    name,
    label,
    placeholder,
    errors,
    maxTags = 30
}: Props) {
    const t = useTranslations("dashboard.properties.form");
    const [inputValue, setInputValue] = useState("");

    const errorMessage = useMemo(() => {
        const fieldError = errors?.[name];
        if (!fieldError) return null;

        if (fieldError.message) {
            return fieldError.message;
        }

        if (typeof fieldError === 'object') {
            const nestedErrors = Object.values(fieldError);
            const firstError = nestedErrors.find((e: any) => e?.message) as any;
            return firstError?.message || null;
        }

        return null;
    }, [errors, name]);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { value = [], onChange } }) => {
                const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = inputValue.trim();

                        if (trimmed && !value.includes(trimmed) && trimmed.length <= 50 && value.length < maxTags) {
                            onChange([...value, trimmed]);
                            setInputValue("");
                        }
                    }
                };

                const removeTag = (tagToRemove: string) => {
                    onChange(value.filter((tag: string) => tag !== tagToRemove));
                };

                const canAddMore = value.length < maxTags;

                return (
                    <div className="space-y-2 w-full">
                        {label && (
                            <div className="flex items-center justify-between">
                                <label className="text-input font-semibold text-sm">
                                    {label}
                                </label>
                                <span className={cn(
                                    "text-xs font-medium transition-colors duration-200",
                                    value.length > maxTags * 0.9 ? "text-orange-500" : "text-dark/40"
                                )}>
                                    {value.length}/{maxTags}
                                </span>
                            </div>
                        )}

                        <div className="relative group">
                            {/* Glow effect on focus */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-200" />

                            <div className="relative flex flex-wrap gap-2 p-3 border-2 border-gray/20 rounded-xl bg-white min-h-[80px] transition-all duration-200 hover:border-secondary/40 focus-within:border-secondary">
                                {/* Render Tags */}
                                {value.map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="group/tag inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-secondary/10 to-primary/10 text-primary border border-secondary/20 hover:border-secondary/40 transition-all duration-200 animate-in fade-in slide-in-from-left-2"
                                        style={{
                                            animationDelay: `${index * 30}ms`,
                                        }}
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary/0 hover:bg-secondary/20 text-secondary hover:text-primary transition-all duration-200 group-hover/tag:scale-110"
                                        >
                                            <MdClose size={14} />
                                        </button>
                                    </span>
                                ))}

                                {/* Input Field */}
                                {canAddMore && (
                                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 text-secondary">
                                            <MdAdd size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            className="flex-1 outline-none bg-transparent text-sm font-medium placeholder:text-placeholder"
                                            placeholder={value.length === 0 ? placeholder : t("typeAndPressEnter")}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            maxLength={50}
                                        />
                                    </div>
                                )}

                                {!canAddMore && (
                                    <div className="flex-1 flex items-center justify-center text-xs text-dark/40 font-medium py-2">
                                        {t("maximumTagsReach")} ({maxTags})
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-dark/60">
                            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{t("featuresHint")}</span>
                        </div>

                        <FormErrorMessage message={errorMessage} />
                    </div>
                );
            }}
        />
    );
}