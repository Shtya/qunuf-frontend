'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import api from '@/libs/axios';
import { toast } from 'react-hot-toast';
import { resolveUrl } from '@/utils/upload';
import FormErrorMessage from '@/components/molecules/forms/FormErrorMessage';
import TextInput from '@/components/molecules/forms/TextInput';
import TextAreaInput from '@/components/molecules/forms/TextAreaInput';
import ActionButtons from '@/components/atoms/ActionButtons';
import Uploader from '@/components/molecules/forms/Uploader';

export const getDepartmentSchema = (t: (key: string, params?: any) => string) =>
    z.object({
        title_en: z
            .string()
            .trim()
            .max(255, { message: t("validation.maxLength", { max: 255 }) })
            .nonempty({ message: t("validation.required") }),
        title_ar: z
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
        image: z.any(),
    });


export type DepartmentFormType = z.infer<ReturnType<typeof getDepartmentSchema>>;

interface DepartmentFormProps {
    initialData?: DepartmentFormType & { id?: string };
    onClose: () => void;
    onSuccess: (dep: DepartmentFormType) => void;
}

export default function DepartmentForm({ initialData, onClose, onSuccess }: DepartmentFormProps) {
    const t = useTranslations("dashboard.admin.departments.form");
    const tUploader = useTranslations('comman.form.uploader');
    const isEdit = !!initialData?.id;

    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<DepartmentFormType>({
        resolver: zodResolver(getDepartmentSchema(t)),
        defaultValues: initialData || {
            title_en: "",
            title_ar: "",
            description_en: "",
            description_ar: "",
            image: {},
        }
    });

    const onSubmit = useCallback(async (data: DepartmentFormType) => {
        const toastId = toast.loading(
            isEdit ? t("actions.updating") : t("actions.creating")
        );
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title_en", data.title_en);
            formData.append("title_ar", data.title_ar);
            formData.append("description_en", data.description_en);
            formData.append("description_ar", data.description_ar);

            // If a file is selected, append it
            if (data.image?.file) {
                formData.append('image', data.image?.file);
            }

            let res;
            if (isEdit && initialData?.id) {
                res = await api.put(`/departments/${initialData.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(t("actions.updateSuccess"), { id: toastId });
            } else {
                res = await api.post(`/departments`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(t("actions.createSuccess"), { id: toastId });
            }

            const department = res.data;
            onClose();
            onSuccess(department);

        } catch (err: any) {
            toast.error(err?.response?.data?.message || t("actions.error"), { id: toastId });
        } finally {
            setLoading(false);
        }

    }, [isEdit, initialData, onSuccess, t]);

    return (
        <form className="space-y-6">
            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <TextInput
                    type='text'
                    label={t("title_en")}
                    {...register("title_en")}
                    value={watch("title_en") ?? ""}
                    onChange={(e) => setValue("title_en", e.target.value)}
                    error={errors.title_en?.message}
                />

                <TextInput
                    type='text'
                    label={t("title_ar")}
                    {...register("title_ar")}
                    value={watch("title_ar") ?? ""}
                    onChange={(e) => setValue("title_ar", e.target.value)}
                    error={errors.title_ar?.message}
                />

                <TextAreaInput
                    label={t("description_en")}
                    {...register("description_en")}
                    value={watch("description_en") ?? ""}
                    onChange={(e) => setValue("description_en", e.target.value)}
                    error={errors.description_en?.message}
                />

                <TextAreaInput
                    label={t("description_ar")}
                    {...register("description_ar")}
                    value={watch("description_ar") ?? ""}
                    onChange={(e) => setValue("description_ar", e.target.value)}
                    error={errors.description_ar?.message}
                />

                <div className='md:col-span-2'>

                    {/* Image Upload */}
                    <Uploader
                        control={control}
                        name="image"
                        accept="image/*"
                        allowMultiple={false}
                        rules={[
                            tUploader('rules.maxSize', { size: 10 }),
                            tUploader('rules.maxFiles', { count: 1 }),
                        ]}
                        maxFiles={1}
                        maxSizeMB={10}
                    />
                    <FormErrorMessage message={errors.image?.message as string} />
                </div>
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
