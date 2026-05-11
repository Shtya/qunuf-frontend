'use client';

import { useEffect, useMemo, useState } from "react";
import FormActions from "./StepActions";
import StepTitle from "./StepTitle";
import { useTranslations, useLocale } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextInput from "@/components/molecules/forms/TextInput";
import SelectField from "@/components/molecules/forms/SelectField";
import { Option } from "@/components/molecules/forms/SelectInput";
import { useAuth } from "@/contexts/AuthContext";
import { useValues } from "@/contexts/GlobalContext";
import { IdentityType } from "@/types/global";
import api from "@/libs/axios";
import toast from "react-hot-toast";
import FormErrorMessage from "@/components/molecules/forms/FormErrorMessage";
import { saudiPhoneRegex } from "@/utils/helpers";
import { isWithinAdultRange } from "@/utils/date";
import { useRouter } from "@/i18n/navigation";
import DateInput from "@/components/molecules/forms/DateInput";

// Saudi Phone Regex

const bookingUserSchema = z.object({
    phoneNumber: z.string()
        .regex(saudiPhoneRegex, "validation.invalidPhone")
        .min(1, "validation.required"),

    nationalityId: z.uuid("validation.required").min(1, "validation.required"),

    identityType: z.string()
        .min(1, "validation.required"),

    identityOtherType: z.string().optional(),

    identityNumber: z.string()
        .min(3, "validation.min3")
        .max(20, "validation.max20")
        .regex(/^[a-zA-Z0-9]*$/, "validation.alphanumeric"),

    identityIssueCountryId: z
        .uuid("validation.required")
        .min(1, "validation.required"),

    birthDate: z.union([z.date(), z.undefined()])
        .refine((val) => val !== undefined, {
            message: "validation.required",
        })
        .refine((val) => isWithinAdultRange(val), {
            message: "validation.invalidBirthDate",
        }),
    shortAddress: z.string()
        .length(8, "validation.shortAddressLength")
        .regex(/^[A-Z]{4}\d{4}$|^[0-9]{8}$/, "validation.shortAddressInvalid")
        .min(1, "validation.required"),
}).superRefine((data, ctx) => {
    if (data.identityType === IdentityType.OTHER) {
        if (!data.identityOtherType || data.identityOtherType.length < 1) {
            ctx.addIssue({
                path: ['identityOtherType'],
                message: 'validation.required',
                code: z.ZodIssueCode.custom,
            });
            return;
        }
        if (data.identityOtherType.length < 3) {
            ctx.addIssue({
                path: ['identityOtherType'],
                message: 'validation.min3',
                code: z.ZodIssueCode.custom,
            });
        }
    }
});

type BookingUserFormData = z.infer<typeof bookingUserSchema>;

export default function Step1({ nextStep }: { nextStep: () => void }) {
    const t = useTranslations('bookings.fullDetails');
    const tAccount = useTranslations('dashboard.account');
    const locale = useLocale();
    const { user, setCurrentUser } = useAuth();
    const { countries, loadingCountries } = useValues();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<BookingUserFormData>({
        resolver: zodResolver(bookingUserSchema),
        defaultValues: {
            phoneNumber: user?.phoneNumber || '',
            nationalityId: user?.nationalityId || '',
            identityType: user?.identityType || IdentityType.NATIONAL_ID,
            identityOtherType: user?.identityOtherType || '',
            identityNumber: user?.identityNumber || '',
            identityIssueCountryId: user?.identityIssueCountryId || '',
            birthDate: user?.birthDate ? new Date(user.birthDate) : undefined,
            shortAddress: user?.shortAddress || '',
        },
    });

    // Update form when user data loads
    useEffect(() => {
        if (user) {
            reset({
                phoneNumber: user.phoneNumber || '',
                nationalityId: user.nationalityId || '',
                identityType: user.identityType || IdentityType.NATIONAL_ID,
                identityOtherType: user.identityOtherType || '',
                identityNumber: user.identityNumber || '',
                identityIssueCountryId: user.identityIssueCountryId || '',
                birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
                shortAddress: user.shortAddress || '',
            });
        }
    }, [user, reset]);

    const selectedIdentityType = watch('identityType');

    // Options for identity types
    const identityOptions: Option[] = useMemo(
        () => [
            { label: tAccount(`identityTypeGroup.${IdentityType.NATIONAL_ID}`), value: IdentityType.NATIONAL_ID },
            { label: tAccount(`identityTypeGroup.${IdentityType.RESIDENCY}`), value: IdentityType.RESIDENCY },
            { label: tAccount(`identityTypeGroup.${IdentityType.PREMIUM_RESIDENCY}`), value: IdentityType.PREMIUM_RESIDENCY },
            { label: tAccount(`identityTypeGroup.${IdentityType.GCC_ID}`), value: IdentityType.GCC_ID },
            { label: tAccount(`identityTypeGroup.${IdentityType.PASSPORT}`), value: IdentityType.PASSPORT },
            { label: tAccount(`identityTypeGroup.${IdentityType.OTHER}`), value: IdentityType.OTHER }
        ],
        [tAccount]
    );

    // Options for countries (nationality and issue country)
    const countryOptions: Option[] = useMemo(
        () =>
            countries.map((c) => ({
                value: c.id,
                label: locale === 'ar' ? c.name_ar : c.name,
            })),
        [countries, locale]
    );

    const selectedNationality = useMemo(
        () => countryOptions.find((o) => o.value === watch('nationalityId')) ?? null,
        [countryOptions, watch('nationalityId')]
    );

    const selectedIssueCountry = useMemo(
        () => countryOptions.find((o) => o.value === watch('identityIssueCountryId')) ?? null,
        [countryOptions, watch('identityIssueCountryId')]
    );

    const selectedIdentityTypeOption = useMemo(
        () => identityOptions.find((o) => o.value === selectedIdentityType) ?? null,
        [identityOptions, selectedIdentityType]
    );

    const onSubmit = async (data: BookingUserFormData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(tAccount('messages.updating'));

        try {
            // Update user profile
            const res = await api.put("/users/profile", data);
            setCurrentUser(res.data);
            toast.success(tAccount("messages.updateSuccess"), { id: toastId });
            nextStep();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || tAccount("messages.updateError"), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date();

    // Maximum date (User must be at least 18 years old)
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
        .toISOString().split("T")[0];

    // Minimum date (User cannot be older than 100 years)
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
        .toISOString().split("T")[0];

    return (
        <div className="flex-1 flex flex-col justify-between gap-12">
            <div className="space-y-4 md:space-y-6 lg:space-y-14">
                <StepTitle title={t('title')} subtitle={t('subtitle')} />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <h1 className="text-dark font-semibold text-[28px] sm:text-[32px] md:text-[36px] leading-[100%] tracking-normal">
                        {t('sectionTitle')}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Phone Number */}
                        <Controller
                            control={control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <div>
                                    <TextInput
                                        {...field}
                                        label={tAccount('phone')}
                                        placeholder={tAccount('placeholders.phoneNumber')}
                                        error={errors.phoneNumber ? tAccount(errors.phoneNumber.message) : ''}
                                        className="book-input"
                                    />
                                </div>
                            )}
                        />
                        {/* Nationality */}
                        <Controller
                            control={control}
                            name="nationalityId"
                            render={({ field }) => (
                                <div>
                                    <SelectField
                                        label={tAccount('nationality')}
                                        options={countryOptions}
                                        value={selectedNationality}
                                        onChange={(opt) => field.onChange(opt.value.toString())}
                                        placeholder={loadingCountries ? tAccount('loading') : tAccount('selectNationality')}
                                        dropdownClassName="!max-h-[300px]"
                                        className="book-input"
                                    />
                                    <FormErrorMessage message={errors.nationalityId ? tAccount(errors.nationalityId.message) : ""} />
                                </div>
                            )}
                        />

                        {/* Identity Type */}
                        <Controller
                            control={control}
                            name="identityType"
                            render={({ field }) => (
                                <div>
                                    <SelectField
                                        label={tAccount('identityType')}
                                        options={identityOptions}
                                        value={selectedIdentityTypeOption}
                                        onChange={(opt) => {
                                            field.onChange(opt.value.toString());
                                            if (opt.value !== IdentityType.OTHER) {
                                                setValue('identityOtherType', '');
                                            }
                                        }}
                                        placeholder={tAccount('placeholders.identityType')}
                                        className="book-input"
                                    />
                                    <FormErrorMessage message={errors.identityType ? tAccount(errors.identityType.message) : ""} />
                                </div>
                            )}
                        />

                        {/* Identity Number */}
                        <Controller
                            control={control}
                            name="identityNumber"
                            render={({ field }) => (
                                <div>
                                    <TextInput
                                        {...field}
                                        label={tAccount('identityNumber')}
                                        placeholder={tAccount('placeholders.identityNumber')}
                                        error={errors.identityNumber ? tAccount(errors.identityNumber.message) : ''}
                                        className="book-input"
                                    />
                                </div>
                            )}
                        />

                        {/* Identity Other Type (conditional) */}
                        {selectedIdentityType === IdentityType.OTHER && (
                            <Controller
                                control={control}
                                name="identityOtherType"
                                render={({ field }) => (
                                    <div>
                                        <TextInput
                                            {...field}
                                            label={tAccount('identityOtherType')}
                                            placeholder={tAccount('placeholders.identityOtherType')}
                                            error={errors.identityOtherType ? tAccount(errors.identityOtherType.message) : ''}
                                            className="book-input"
                                        />
                                    </div>
                                )}
                            />
                        )}

                        {/* Identity Issue Country */}
                        <Controller
                            control={control}
                            name="identityIssueCountryId"
                            render={({ field }) => (
                                <div>
                                    <SelectField
                                        label={tAccount('identityIssueCountry')}
                                        options={countryOptions}
                                        value={selectedIssueCountry}
                                        onChange={(opt) => field.onChange(opt.value.toString())}
                                        placeholder={loadingCountries ? tAccount('loading') : tAccount('placeholders.identityIssueCountryId')}
                                        dropdownClassName="!max-h-[300px]"
                                        className="book-input"
                                    />
                                    <FormErrorMessage message={errors.identityIssueCountryId ? tAccount(errors.identityIssueCountryId.message) : ""} />
                                </div>
                            )}
                        />

                        {/* Birth Date */}
                        <Controller
                            control={control}
                            name="birthDate"
                            render={({ field: { onChange, value } }) => (
                                <DateInput
                                    value={value}
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    onChange={(dates) => onChange(dates[0])} // Passes Date object to RHF
                                    label={tAccount('birthDate')}
                                    placeholder={tAccount('placeholders.birthDate')}
                                    error={errors.birthDate ? tAccount(errors.birthDate.message) : ''}
                                    className="book-input"
                                />
                            )}
                        />

                        {/* Short Address */}
                        <Controller
                            control={control}
                            name="shortAddress"
                            render={({ field }) => (
                                <div>
                                    <TextInput
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        label={tAccount('shortAddress')}
                                        placeholder="e.g. RRRR1234"
                                        error={errors.shortAddress ? tAccount(errors.shortAddress.message) : ''}
                                        className="book-input"
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <FormActions
                        type="submit"
                        confirmLabel={isSubmitting ? tAccount('messages.updating') : t('confirm')}
                        cancelLabel={t('cancel')}
                        onCancel={() => router.push('/properties')}
                        isDisabled={isSubmitting}
                    />
                </form>
            </div>
        </div>
    );
}
