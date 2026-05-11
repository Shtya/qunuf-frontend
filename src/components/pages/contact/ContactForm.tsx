"use client";

import { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { ContactSelect } from "./ContactSelect";
import { FiPhoneCall } from "react-icons/fi";
import { HiOutlineMailOpen } from "react-icons/hi";
import { LiaFaxSolid } from "react-icons/lia";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import api from "@/libs/axios";
import { phoneSchema } from "@/utils/validation";
import { useValues } from "@/contexts/GlobalContext";
import FormErrorMessage from "@/components/molecules/forms/FormErrorMessage";


const contactSchema = z.object({
    name: z.string().min(1, 'required'),
    email: z.email('email').optional(),
    phone: phoneSchema,
    message: z.string().min(1, 'required'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
    const t = useTranslations('contact.form');
    const { settings } = useValues();
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            message: '',
        },
    });

    const onSubmit = async (data: ContactFormValues) => {
        const toastId = toast.loading(t('sending'));
        try {
            const res = await api.post('/contact-us', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message,
            });

            // Show success toast from response message if available
            toast.success(t('success'), { id: toastId });

            toast.success(t('success'), { id: toastId });
            reset();
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('error'), { id: toastId });
        }
    };

    return (
        <form className="col-span-4 p-6 sm:p-8 md:p-10 lg:my-20" onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <h1 className="font-bold text-3xl sm:text-4xl md:text-[50px] lg:text-[54px] mb-3">
                {t('getIn')} <span className="text-secondary">{t('touch')}</span>
            </h1>
            <p className="font-semibold text-[14px] mb-6">{t('headerMessage')}</p>

            {/* Inputs */}
            <div className="grid grid-cols-1 gap-5">
                <ContactInput
                    id="name"
                    label={t('name')}
                    required
                    error={errors.name?.message && t(`validation.${errors.name.message}`)}
                    {...register('name')}
                />
                <ContactInput
                    id="email"
                    label={t('email')}
                    type="email"
                    error={errors.email?.message && t(`validation.${errors.email.message}`)}
                    {...register('email')}
                />
                <ContactInput
                    id="phone"
                    label={t('phone')}
                    required
                    error={errors.phone?.message && t(`validation.${errors.phone.message}`)}
                    {...register('phone')}
                />

                <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                        <ContactSelect
                            id="message"
                            placeholder={t('message.label')}
                            options={[
                                { value: 'Friend Referral', label: t('message.options.friend_referral') },
                                { value: 'Social Media', label: t('message.options.social_media') },
                                { value: 'Search Engine', label: t('message.options.search_engine') },
                                { value: 'other', label: t('message.options.other') },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.message?.message && t(`validation.${errors.message.message}`)}
                        />
                    )}
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-5 group relative transition bg-primary hover:bg-primary-hover text-white uppercase
          w-full h-[45px] sm:h-[50px] 2xl:h-[53px] overflow-hidden
          rounded-xl font-medium`}
                style={{ boxShadow: '0px 4px 12px 0px #0000001F' }}
            >
                {t('send')}
            </button>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center mt-14">
                <ContactInfo
                    icon={<FiPhoneCall size={28} />}
                    label={t('phone')}
                    value={settings?.contactPhone || t('noData')}
                />
                <ContactInfo
                    icon={<LiaFaxSolid size={28} />}
                    label={t('fax')}
                    value={settings?.fax || t('noData')}
                />
                <ContactInfo
                    icon={<HiOutlineMailOpen size={28} />}
                    label={t('email')}
                    value={settings?.contactEmail || t('noData')}
                />
            </div>
        </form>
    );
}

type ContactInfoProps = {
    icon: ReactNode;
    label: string;
    value: string;
    wrapperClassName?: string;
    valueClassName?: string;
};
function ContactInfo({
    icon,
    label,
    value,
    wrapperClassName = "",
    valueClassName = "text-[#DD5471]",
}: ContactInfoProps) {
    return (
        <div className={`flex gap-3 sm:gap-4 items-start sm:items-center ${wrapperClassName}`}>
            <div className="flex justify-start items-start sm:items-center gap-2 sm:gap-4">
                {icon}
                <div className="flex flex-col gap-[2px] text-[14px] sm:text-[15px]">
                    <p className="uppercase text-black text-[13px] sm:text-[15px]">{label}</p>
                    <p className={valueClassName}>{value}</p>
                </div>
            </div>
        </div>
    );
}


function ContactInput({
    id,
    label,
    // value, // We don't need this manually if using register()
    type = "text",
    wrapperClassName = "",
    required = false,
    error,
    ...props
}: {
    id: string;
    label: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    wrapperClassName?: string;
    error?: string | undefined,
    required?: boolean;
}) {
    return (
        <div className="w-full">
            <div
                className={`relative flex flex-col border-[1px] py-3 px-[20px] transition-all duration-200 ${wrapperClassName} ${error ? 'border-red-500' : 'border-[#E0E0E0] focus-within:border-primary'
                    }`}
            >
                {/* 1. The Input MUST have the "peer" class and a placeholder=" " */}
                <input
                    id={id}
                    type={type}
                    placeholder=" " // CRITICAL: This allows :placeholder-shown to work
                    className="peer focus:outline-0 text-sm font-medium text-primary caret-primary bg-transparent pt-2"
                    {...props}
                />

                {/* 2. The Label uses "peer" selectors to move up */}
                <label
                    htmlFor={id}
                    className={`absolute start-[20px] transition-all duration-200 pointer-events-none 
                        /* Default: Floated position (top) */
                        top-2 text-xs text-primary
                        
                        /* If the placeholder IS SHOWN (meaning input is empty) AND NOT focused, move to middle */
                        peer-placeholder-shown:top-1/2 
                        peer-placeholder-shown:-translate-y-1/2 
                        peer-placeholder-shown:text-sm 
                        peer-placeholder-shown:text-gray-400
                        
                        /* If focused, always move back up (overrides the empty state) */
                        peer-focus:top-2 
                        peer-focus:-translate-y-0 
                        peer-focus:text-xs 
                        peer-focus:text-primary
                    `}
                >
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
            </div>
            <FormErrorMessage message={error} />
        </div>
    );
}