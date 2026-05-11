'use client';

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast"; // Assuming you have a toaster

// UI Components (from your PropertiesForm example)
import TextInput from "@/components/molecules/forms/TextInput";
import TextAreaInput from "@/components/molecules/forms/TextAreaInput";
import SecondaryButton from "@/components/atoms/buttons/SecondaryButton";

// Schema and Types

import { Settings } from "@/types/dashboard/settings"; // Your interface

import { z } from "zod";
import api from "@/libs/axios";
import LocationInput from "@/components/molecules/forms/LocationInput";
import { MdDescription, MdGavel, MdInfoOutline, MdPlace, MdSecurity, MdShare } from "react-icons/md";
import FormSection from "@/components/molecules/forms/FormSection";
import Actions from "@/components/molecules/forms/Actions";
import RichTextEditor from "@/components/molecules/forms/editor/RichTextEditor";
import { EditorState } from "lexical";

const numberFromInput = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) return undefined;
        if (typeof value === "string") return Number(value);
        return value;
    },
    z.number()
);


export const settingsSchema = z.object({
    name: z.string().min(1, { message: "required" }).nullable().optional(),
    contactEmail: z
        .email({ message: "email.invalid" })
        .nullable()
        .optional()
        .or(z.literal("")), // Allow empty string or valid email
    contactPhone: z.string().nullable().optional(),
    fax: z.string().nullable().optional(),
    address: z.string().nullable().optional(),

    // Numeric fields
    platformPercent: z
        .string()
        .refine((val) => {
            if (!val) return false; // empty string is invalid
            const num = Number(val);
            return !isNaN(num) && num >= 0 && num <= 100;
        }, {
            message: "percent.invalid", // single message from localization
        }),
    position: z.object({
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
    }),

    // Localized Text Areas
    defaultContractTerms: z.string().nullable().optional(),
    description_en: z.string().nullable().optional(),
    description_ar: z.string().nullable().optional(),
    privacyPolicy_en: z.any().nullable().optional(),
    privacyPolicy_ar: z.any().nullable().optional(),
    termsOfService_en: z.any().nullable().optional(),
    termsOfService_ar: z.any().nullable().optional(),

    // Social Media
    facebook: z.url({ message: "url.invalid" }).nullable().optional().or(z.literal("")),
    twitter: z.url({ message: "url.invalid" }).nullable().optional().or(z.literal("")),
    instagram: z.url({ message: "url.invalid" }).nullable().optional().or(z.literal("")),
    linkedin: z.url({ message: "url.invalid" }).nullable().optional().or(z.literal("")),
    pinterest: z.url({ message: "url.invalid" }).nullable().optional().or(z.literal("")),
    tiktok: z.url({ message: "url.invalid" }).nullable().optional().or(z.literal("")),
    youtube: z.url({ message: "url.invalid" }).nullable().optional().or(z.literal("")),

});

export type SettingsFormType = z.infer<typeof settingsSchema>;

export default function SettingsForm() {
    const t = useTranslations("dashboard.admin.settings");

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<SettingsFormType>({
        resolver: zodResolver(settingsSchema),

        defaultValues: {
            name: "",
            contactEmail: "",
            contactPhone: "",
            fax: "",
            address: "",
            position: {
                lat: 0,
                lng: 0,
            },
            platformPercent: "0",
            description_en: "",
            description_ar: "",
            privacyPolicy_en: null,
            privacyPolicy_ar: null,
            termsOfService_en: null,
            termsOfService_ar: null,
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            pinterest: "",
            tiktok: "",
            youtube: "",
        },
    });
    // Inside your SettingsForm component
    const privacyEnRef = useRef<EditorState | null>(null);
    const privacyArRef = useRef<EditorState | null>(null);
    const termsEnRef = useRef<EditorState | null>(null);
    const termsArRef = useRef<EditorState | null>(null);
    // 1. Fetch Settings on Mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsFetching(true);
                const res = await api.get<Settings>("settings");

                // Reset form with fetched data
                const data = {
                    ...res.data,
                    platformPercent: res.data.platformPercent?.toString() ?? "",
                    position: {
                        lat: Number(res.data.latitude) || 0,
                        lng: Number(res.data.longitude) || 0,
                    }
                }
                if (res.data) {
                    reset(data);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
                toast.error(t("messages.fetchError"));
            } finally {
                setIsFetching(false);
            }
        };

        fetchSettings();
    }, [reset, t]);

    // 2. Handle Update (PUT)
    const onSubmit = async (data: SettingsFormType) => {
        const toastId = toast.loading(t("messages.updating"));

        try {
            setIsLoading(true);
            const payload = {
                ...data,
                latitude: data.position?.lat,
                longitude: data.position?.lng,
                privacyPolicy_en: privacyEnRef.current ? privacyEnRef.current.toJSON() : data.privacyPolicy_en,
                privacyPolicy_ar: privacyArRef.current ? privacyArRef.current.toJSON() : data.privacyPolicy_ar,
                termsOfService_en: termsEnRef.current ? termsEnRef.current.toJSON() : data.termsOfService_en,
                termsOfService_ar: termsArRef.current ? termsArRef.current.toJSON() : data.termsOfService_ar,
            }
            await api.put("settings", payload);

            toast.success(t("messages.updateSuccess"), {
                id: toastId,
            });
        } catch (error) {
            console.error("Failed to update settings", error);

            toast.error(t("messages.updateError"), {
                id: toastId,
            });
        } finally {
            setIsLoading(false);
        }
    };


    if (isFetching) {
        return (
            <div className="container mx-auto pb-10 px-4 animate-pulse">
                {/* Header Skeleton */}
                <div className="mb-8 border-s-2 border-gray-200 ps-8 py-2 space-y-3">
                    <div className="h-10 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
                {/* Section Skeletons */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="mb-10 p-6 border border-gray-100 rounded-2xl space-y-6">
                        <div className="h-6 bg-gray-200 rounded w-1/4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-12 bg-gray-50 rounded-lg" />
                            <div className="h-12 bg-gray-50 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="container mx-auto pb-10 px-4">
            {/* Main Header */}
            <div className="mb-8 border-s-2 border-secondary ps-8 py-2">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black text-dark tracking-tighter leading-none">
                        {t("title")}
                    </h1>
                    <p className="text-[15px] font-medium text-dark/40 max-w-xl leading-relaxed">
                        {t("description")}
                    </p>
                </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                {/* --- General Information Section --- */}

                <FormSection title={t("sections.general")} subtitle={t("subtitles.basicInfo")} icon={<MdInfoOutline size={20} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller control={control} name="name" render={({ field }) => (
                            <TextInput {...field} label={t("fields.name")} placeholder={t("placeholders.name")} error={errors.name?.message && t(errors.name.message)} />
                        )} />
                        <Controller control={control} name="platformPercent" render={({ field }) => (
                            <TextInput type="number" {...field} label={t("fields.platformPercent")} error={errors.platformPercent?.message && t(errors.platformPercent.message)} />
                        )} />
                    </div>
                </FormSection>

                {/* --- Descriptions Section --- */}
                <FormSection title={t("sections.description")} subtitle={t("subtitles.descriptions")} icon={<MdDescription size={20} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller control={control} name="description_en" render={({ field }) => (
                            <TextAreaInput {...field} rows={6} label={t("fields.description_en")} placeholder={t("placeholders.description_en")} />
                        )} />
                        <Controller control={control} name="description_ar" render={({ field }) => (
                            <TextAreaInput {...field} rows={6} label={t("fields.description_ar")} placeholder={t("placeholders.description_ar")} />
                        )} />
                    </div>
                </FormSection>

                <FormSection title={t("sections.defaultContractTerms")} subtitle={t("subtitles.contractTerms")} icon={<MdGavel size={20} />}>
                    <Controller control={control} name="defaultContractTerms" render={({ field }) => (
                        <TextAreaInput {...field} rows={12} label={t("fields.defaultContractTerms")} placeholder={t("placeholders.defaultContractTerms")} />
                    )} />
                </FormSection>

                {/* --- Contact Info & Location --- */}
                <FormSection title={t("sections.contactAndLocation")} subtitle={t("subtitles.contactAndLocation")} icon={<MdPlace size={20} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller control={control} name="contactEmail" render={({ field }) => (
                            <TextInput type="email" {...field} label={t("fields.contactEmail")} error={errors.contactEmail?.message && t(errors.contactEmail.message)} />
                        )} />
                        <Controller control={control} name="contactPhone" render={({ field }) => (
                            <TextInput {...field} label={t("fields.contactPhone")} />
                        )} />
                        <Controller control={control} name="fax" render={({ field }) => (
                            <TextInput {...field} label={t("fields.fax")} />
                        )} />
                        <Controller control={control} name="address" render={({ field }) => (
                            <TextInput {...field} label={t("fields.address")} />
                        )} />
                        <div className="md:col-span-2">
                            <LocationInput showAddress={false} control={control} name="position" />
                        </div>
                    </div>
                </FormSection>

                {/* --- Legal (Terms & Privacy) --- */}
                <FormSection
                    title={t("sections.legal")}
                    subtitle={t("subtitles.legal")}
                    icon={<MdSecurity size={20} />}
                >
                    <div className="grid grid-cols-1 gap-10">
                        {/* Privacy Policy Group */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-gray-100 pb-8">
                            <Controller
                                control={control}
                                name="privacyPolicy_en"
                                render={({ field }) => (
                                    <RichTextEditor
                                        label={t("fields.privacyPolicy_en")}
                                        value={field.value}
                                        editorStateRef={privacyEnRef}
                                        minHeight="400px"
                                        error={errors.privacyPolicy_en?.message.toString()}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="privacyPolicy_ar"
                                render={({ field }) => (
                                    <RichTextEditor
                                        label={t("fields.privacyPolicy_ar")}
                                        value={field.value}
                                        editorStateRef={privacyArRef}
                                        minHeight="400px"
                                        error={errors.privacyPolicy_ar?.message.toString()}
                                        className="rtl-editor" // Apply RTL styling if necessary
                                    />
                                )}
                            />
                        </div>

                        {/* Terms of Service Group */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Controller
                                control={control}
                                name="termsOfService_en"
                                render={({ field }) => (
                                    <RichTextEditor
                                        label={t("fields.termsOfService_en")}
                                        value={field.value}
                                        editorStateRef={termsEnRef}
                                        minHeight="400px"
                                        error={errors.termsOfService_en?.message.toString()}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="termsOfService_ar"
                                render={({ field }) => (
                                    <RichTextEditor
                                        label={t("fields.termsOfService_ar")}
                                        value={field.value}
                                        editorStateRef={termsArRef}
                                        minHeight="400px"
                                        error={errors.termsOfService_ar?.message.toString()}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </FormSection>

                {/* 6. Social Media Links */}
                <FormSection title={t("sections.social")} subtitle={t("subtitles.social")} icon={<MdShare size={20} />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["facebook", "twitter", "instagram", "linkedin", "pinterest", "tiktok", "youtube"].map((social) => (
                            <Controller key={social} control={control} name={social as any} render={({ field }) => (
                                <TextInput {...field} label={t(`fields.${social}`)} placeholder="https://..." />
                            )} />
                        ))}
                    </div>
                </FormSection>

                <Actions onSave={handleSubmit(onSubmit)} isLoading={isLoading} />
            </form>
        </div>
    );
}