'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import TextInput from '@/components/molecules/forms/TextInput';
import Uploader from '@/components/molecules/forms/Uploader';
import ActionButtons from '@/components/atoms/ActionButtons';
import { FileItem } from '@/utils/upload';
import TextAreaInput from '@/components/molecules/forms/TextAreaInput';
import toast from 'react-hot-toast';
import api from '@/libs/axios';
import { CompanyInfo } from '@/types/company';
import FormErrorMessage from '@/components/molecules/forms/FormErrorMessage';
import { useState } from 'react';

export const getAboutSectionSchema = (t: (key: string) => string) =>
    z.object({
        title_en: z
            .string().trim()
            .max(255, { message: t('validation.titleMax') })
            .nonempty({ message: t('validation.titleRequired') }),
        title_ar: z
            .string().trim()
            .max(255, { message: t('validation.titleMax') })
            .nonempty({ message: t('validation.titleRequired') }),
        content_en: z.string().trim().nonempty({ message: t('validation.contentRequired') }),
        content_ar: z.string().trim().nonempty({ message: t('validation.contentRequired') }),
        image: z.any().refine(
            (file) => file,
            t('validation.imageRequired')
        ),
    });

export type AboutSectionFormType = z.infer<ReturnType<typeof getAboutSectionSchema>>;

interface AboutSectionFormProps {
    initialData?: AboutSectionFormType;
    id: string,
    sectionKey: string,
    onCancel: () => void;
    onSave: (data: CompanyInfo) => void;
    cancelText: string;
    actionText: string;
}

export default function AboutSectionForm({
    initialData,
    id,
    sectionKey,
    onSave,
    onCancel,
    cancelText,
    actionText,
}: AboutSectionFormProps) {
    const t = useTranslations('dashboard.admin.about');
    const tUploader = useTranslations('comman.form.uploader');
    const [saving, setSaving] = useState(false)
    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<AboutSectionFormType>({
        resolver: zodResolver(getAboutSectionSchema(t)),
        defaultValues: initialData || {
            title_en: '',
            title_ar: '',
            content_en: '',
            content_ar: '',
            image: {},
        },
    });

    const handleSave = async (data: AboutSectionFormType) => {
        // show loading toast
        const toastId = toast.loading(t('saving') || 'Saving...');
        setSaving(true)
        try {
            const formData = new FormData();
            formData.append('title_en', data.title_en || '');
            formData.append('title_ar', data.title_ar || '');
            formData.append('content_en', data.content_en || '');
            formData.append('content_ar', data.content_ar || '');

            // If a file is selected, append it
            if (data.image?.file) {
                formData.append('image', data.image?.file);
            }

            let res;
            if (id) {
                res = await api.put(`/company-info/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                // Create new
                formData.append('section', sectionKey); // for new entry
                res = await api.post('/company-info', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            toast.success(t('saved') || 'Saved', { id: toastId });
            onCancel()
            onSave(res.data)
        } catch (err: any) {
            setSaving(false)
            const msg = err?.response?.data?.message || t('errors.failed') || 'Failed';
            toast.error(msg, { id: toastId });
        }
    };


    return (
        <form className="space-y-6 ">
            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    type='text'
                    label={t('form.title_en')}
                    placeholder={t('form.title_en_placeholder')}
                    value={watch('title_en') ?? ''}
                    onChange={(e) => setValue('title_en', e.target.value)}
                    error={errors.title_en?.message}
                />

                <TextInput
                    type='text'
                    label={t('form.title_ar')}
                    placeholder={t('form.title_ar_placeholder')}
                    value={watch('title_ar') ?? ''}
                    onChange={(e) => setValue('title_ar', e.target.value)}
                    error={errors.title_ar?.message}
                />
            </div>

            {/* Content Textareas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextAreaInput
                    label={t('form.content_en')}
                    placeholder={t('form.content_en_placeholder')}
                    value={watch('content_en') ?? ''}
                    onChange={(e) => setValue('content_en', e.target.value)}
                    error={errors.content_en?.message}
                    rows={6}
                />

                <TextAreaInput
                    label={t('form.content_ar')}
                    placeholder={t('form.content_ar_placeholder')}
                    value={watch('content_ar') ?? ''}
                    onChange={(e) => setValue('content_ar', e.target.value)}
                    error={errors.content_ar?.message}
                    rows={6}
                />
            </div>

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

            {/* Action Buttons */}
            <ActionButtons
                onAction={handleSubmit(handleSave)}
                onCancel={onCancel}
                actionText={actionText}
                cancelText={cancelText}
                isDisabled={saving}
            />
        </form>
    );
}
