import { Controller, useFieldArray } from "react-hook-form";
import { MdAdd, MdDelete, MdPlace } from "react-icons/md";
import TextInput from "@/components/molecules/forms/TextInput";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const NearbyFacilitiesSection = ({
    control,
    name,
    label,
    errors,
    maxFacilities = 8
}: {
    control: any;
    name: string;
    label: string;
    errors: any;
    maxFacilities?: number;
}) => {
    const t = useTranslations("dashboard.properties.form");
    const { fields, append, remove } = useFieldArray({
        control,
        name: name
    });

    const getFieldError = (index: number, field: string) => {
        return errors?.[name]?.[index]?.[field]?.message;
    };

    const canAddMore = fields.length < maxFacilities;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                        <MdPlace className="text-secondary" size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-dark">{label}</h4>
                </div>
                <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-lg transition-colors duration-200",
                    fields.length >= maxFacilities * 0.8
                        ? "bg-orange-100 text-orange-600"
                        : "bg-secondary/10 text-secondary"
                )}>
                    {fields.length}/{maxFacilities}
                </span>
            </div>

            {/* Facilities List */}
            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        // FIXED: Replaced manual opacity: 0 with standard animation class
                        className="group relative animate__animated animate__fadeIn"
                        style={{
                            animationDelay: `${index * 50}ms`,
                            animationDuration: '0.3s'
                        }}
                    >
                        {/* Hover background */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                        <div className="relative flex gap-3 items-start p-4 border-2 border-gray/10 rounded-xl bg-white transition-all duration-200 group-hover:border-secondary/30 group-hover:shadow-sm">
                            {/* Index Badge */}
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {index + 1}
                            </div>

                            {/* Input Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                <Controller
                                    control={control}
                                    name={`${name}.${index}.name`}
                                    render={({ field }) => (
                                        <TextInput
                                            {...field}
                                            placeholder={t("facilityName")}
                                            label={t("facilityName")}
                                            error={getFieldError(index, 'name')}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name={`${name}.${index}.distance_km`}
                                    render={({ field }) => (
                                        <TextInput
                                            type="number"
                                            {...field}
                                            placeholder={t("distanceKm")}
                                            label={t("distanceKm")}
                                            suffix="km"
                                            min={0}
                                            step={0.1}
                                            error={getFieldError(index, 'distance_km')}
                                        />
                                    )}
                                />
                            </div>

                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className={cn(
                                    "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                                    "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white",
                                    "transition-all duration-200 group/delete",
                                    "opacity-0 group-hover:opacity-100",
                                    "hover:shadow-md active:scale-95"
                                )}
                            >
                                <MdDelete size={20} className="group-hover/delete:scale-110 transition-transform duration-200" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Button */}
            {canAddMore && (
                <button
                    type="button"
                    // Ensure you are passing the correct object structure
                    onClick={() => append({ name: "", distance_km: 0 })}
                    className={cn(
                        "group w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
                        "border-2 border-dashed border-gray/20 hover:border-secondary",
                        "bg-white hover:bg-gradient-to-r hover:from-secondary/5 hover:to-primary/5",
                        "text-secondary font-semibold text-sm transition-all duration-200",
                        "hover:shadow-sm active:scale-[0.98]"
                    )}
                >
                    <div className="w-6 h-6 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center transition-colors duration-200">
                        <MdAdd size={18} className="group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <span>{t("addFacility")}</span>
                </button>
            )}

            {!canAddMore && (
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Maximum facilities reached ({maxFacilities})
                </div>
            )}
        </div>
    );
};

export default NearbyFacilitiesSection;