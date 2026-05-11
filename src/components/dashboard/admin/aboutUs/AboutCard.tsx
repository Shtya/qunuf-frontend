'use client';

import Image from 'next/image';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useState } from 'react';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import { CompanySection, type CompanyInfo } from '@/types/company';
import { resolveUrl } from '@/utils/upload';
import { MdEdit } from 'react-icons/md';


interface AboutCardProps {
    sectionKey: CompanySection;
    item: CompanyInfo | null;
    onOpen: ({ sectionKey, item }: { sectionKey: string | null, item: CompanyInfo | null }) => void;
}

export default function AboutCard({ sectionKey, item, onOpen }: AboutCardProps) {
    const t = useTranslations('dashboard.admin.about');
    const locale = useLocale();
    const isArabic = locale === 'ar';

    const title = item ? (isArabic ? item.title_ar : item.title_en) : t(`${sectionKey}.defaultTitle`);
    const description = item ? (isArabic ? item.content_ar : item.content_en) : '';

    function handleOpen() {
        onOpen({ sectionKey, item });
    }

    return (
        <div className="group relative flex flex-col md:flex-row bg-card-bg rounded-[14px] w-full mx-auto overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 transform-gpu border border-transparent hover:border-gray/10">

            {/* Image Section - Consistent with BlogCard */}
            <div className="relative w-full md:w-[250px] h-[250px] shrink-0 m-3 rounded-[12px] overflow-hidden shadow-sm">
                <Image
                    src={item?.imagePath ? resolveUrl(item?.imagePath) : '/no-image.png'}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Subtle Glass Overlay on hover */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 p-5 md:p-6 text-center md:text-start min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                        <h2 className="font-bold text-[26px] sm:text-[30px] text-dark leading-tight group-hover:text-primary transition-colors duration-200">
                            {title}
                        </h2>

                        <div className="h-1 w-12 bg-secondary/20 rounded-full group-hover:w-20 transition-all duration-500" />
                    </div>

                    {/* Desktop Action - Floating Edit Button */}
                    <button
                        onClick={handleOpen}
                        className="hidden md:flex items-center gap-2 bg-white text-dark p-2.5 rounded-xl shadow-md border border-gray/10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <MdEdit size={20} />
                    </button>
                </div>

                <div className="mt-6 flex-1">
                    <p className="text-base sm:text-lg text-dark/70 leading-relaxed whitespace-pre-line line-clamp-4 md:line-clamp-none">
                        {description || t('noContent')}
                    </p>
                </div>

                {/* Mobile Action - Wide Button */}
                <div className="mt-6 md:hidden">
                    <SecondaryButton
                        onClick={handleOpen}
                        className="w-full bg-secondary hover:bg-secondary-hover font-bold text-lighter py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                        <MdEdit size={18} />
                        {t('edit')}
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
}