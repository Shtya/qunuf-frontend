'use client';

import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import Image from 'next/image';
import TextInput from '@/components/molecules/forms/TextInput';
import ActionButtons from '@/components/atoms/ActionButtons';
import { resolveUrl } from '@/utils/upload';
import TextAreaInput from '@/components/molecules/forms/TextAreaInput';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '@/libs/axios';
import FormErrorMessage from '@/components/molecules/forms/FormErrorMessage';
import { phoneSchema } from '@/utils/validation';

export const getTeamMemberSchema = (t: (key: string, params?: any) => string) =>
    z.object({
        name: z
            .string()
            .trim()
            .max(255, { message: t("validation.maxLength", { max: 255 }) })
            .nonempty({ message: t("validation.required") }),

        job: z
            .string()
            .trim()
            .max(255, { message: t("validation.maxLength", { max: 255 }) })
            .nonempty({ message: t("validation.required") }),

        description_en: z
            .string()
            .trim()
            .nonempty({ message: t("validation.required") }),

        description_ar: z
            .string()
            .trim()
            .nonempty({ message: t("validation.required") }),

        phone: phoneSchema,

        email: z
            .email({ message: t("validation.email") })
            .max(255, { message: t("validation.maxLength", { max: 255 }) })
            .nonempty({ message: t("validation.required") }),

        imagePath: z.any(),
    });



export type TeamMember = {
    name: string;
    job: string;
    description_ar: string;
    description_en: string;
    imagePath: string | File;
    phone: string;
    email: string;
}


interface TeamMemberFormProps {
    initialData?: TeamMember & { id?: string };
    onClose: () => void;
    onSuccess: (teamMember: TeamMember) => void;
}

export default function TeamMemberForm({ initialData, onClose, onSuccess }: TeamMemberFormProps) {
    const t = useTranslations("dashboard.admin.team.form");
    const isEdit = !!initialData?.id;

    const initailImage = (typeof initialData?.imagePath === 'string' ? initialData?.imagePath : '');
    const [preview, setPreview] = useState<string | undefined>(initailImage);
    const [fileName, setFileName] = useState(initailImage?.split("/").pop() ?? null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<TeamMember>({
        resolver: zodResolver(getTeamMemberSchema(t)),
        defaultValues: initialData || {
            name: "",
            job: "",
            description_en: "",
            description_ar: "",
            phone: "",
            email: "",
            imagePath: ""
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
            setValue("imagePath", file);
        }
    };

    const onSubmit = useCallback(async (data: TeamMember) => {
        const toastId = toast.loading(isEdit ? t("actions.updating") : t("actions.creating"));
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("job", data.job);
            formData.append("description_en", data.description_en);
            formData.append("description_ar", data.description_ar);
            formData.append("phone", data.phone);
            formData.append("email", data.email);
            if ((data.imagePath as any) instanceof File) {
                formData.append("image", data.imagePath);
            }

            let res;
            if (isEdit && initialData?.id) {
                res = await api.put(`/teams/${initialData.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(t("actions.updateSuccess"), { id: toastId });
            } else {
                res = await api.post("/teams", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(t("actions.createSuccess"), { id: toastId });
            }
            const teamMember = res.data;
            onClose()
            onSuccess(teamMember);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || t("actions.error"), { id: toastId });
        } finally {
            setLoading(false);
        }
    }, [isEdit, initialData, onSuccess, t]);


    return (
        <form className="space-y-6">
            {/* Image Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 overflow-hidden">
                <div className="shrink-0 w-[100px] h-[100px] bg-lighter rounded-[8px] overflow-hidden flex items-center justify-center">
                    {preview ? (
                        <Image
                            src={resolveUrl(preview)}
                            alt="Preview"
                            width={100}
                            height={100}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="text-gray-400">No Image</div>
                    )}
                </div>
                <label className="bg-lighter gap-2 text-primary px-4 py-2 rounded-[8px] cursor-pointer w-full max-w-[340px]">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
                        <div className="border border-primary rounded-[8px] px-2 py-1 w-fit">
                            {t("upload")}
                        </div>
                        <div className="text-gray-500 text-sm sm:text-base max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {fileName || t("noFile")}
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </label>
                <FormErrorMessage message={errors.imagePath?.message} />
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    type='text'
                    label={t("name")}
                    {...register("name")}
                    value={watch('name') ?? ''}
                    onChange={(e) => setValue('name', e.target.value)}
                    error={errors.name?.message}
                />
                <TextInput
                    type='text'
                    label={t("job")}
                    {...register("job")}
                    value={watch('job') ?? ''}
                    onChange={(e) => setValue('job', e.target.value)}
                    error={errors.job?.message}
                />
                <TextAreaInput
                    label={t("description_en")}
                    {...register("description_en")}
                    value={watch('description_en') ?? ''}
                    onChange={(e) => setValue('description_en', e.target.value)}
                    error={errors.description_en?.message}
                />
                <TextAreaInput
                    label={t("description_ar")}
                    {...register("description_ar")}
                    value={watch('description_ar') ?? ''}
                    onChange={(e) => setValue('description_ar', e.target.value)}
                    error={errors.description_ar?.message}
                />
                <TextInput
                    type='text'
                    label={t("phone")}
                    {...register("phone")}
                    value={watch('phone') ?? ''}
                    onChange={(e) => setValue('phone', e.target.value)}
                    error={errors.phone?.message ? t(errors.phone?.message) : null}
                />
                <TextInput
                    type='email'
                    label={t("email")}
                    {...register("email")}
                    value={watch('email') ?? ''}
                    onChange={(e) => setValue('email', e.target.value)}
                    error={errors.email?.message}
                />
            </div>

            {/* Action Buttons */}
            <ActionButtons
                onAction={handleSubmit(onSubmit)}
                onCancel={onClose}
                actionText={isEdit ? t("actions.update") : t("actions.create")}
                cancelText={t("actions.cancel")}
                isDisabled={loading}
            />
        </form>
    );
}