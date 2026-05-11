'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MdCalendarToday, MdDelete, MdEdit, MdKeyboardArrowDown } from 'react-icons/md';
import { useLocale, useTranslations } from 'next-intl';
import { resolveUrl } from '@/utils/upload';
import { Blog } from '@/types/dashboard/blog';
import SecondaryButton from '@/components/atoms/buttons/SecondaryButton';
import RichTextRenderer from '@/components/molecules/forms/editor/RichTextRenderer';
import { cn } from '@/lib/utils';

interface BlogContentCardProps {
    block: Blog
    onEdit: () => void;
    onDelete: () => void;
}

export default function BlogContentCard({ block, onEdit, onDelete }: BlogContentCardProps) {
    const locale = useLocale();
    const t = useTranslations('comman');
    const [isExpanded, setIsExpanded] = useState(false);

    const isAr = locale === 'ar';
    const title = isAr ? block.title_ar : block.title_en;
    const description = isAr ? block.description_ar : block.description_en;


    // const displayedText = isExpanded ? description : `${description?.slice(0, CHAR_LIMIT)}...`;

    const formattedDate = new Date(block.created_at).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="group relative flex flex-col md:flex-row gap-6 bg-card-bg rounded-[14px] p-4 transition-all duration-300 hover:shadow-xl transform-gpu">

            {/* Image Section */}
            <div className="relative w-full md:w-[240px] h-[240px] rounded-xl overflow-hidden shrink-0 shadow-sm">
                <Image
                    src={resolveUrl(block.imagePath)}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                        {/* Date with Icon */}
                        <div className="flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wider">
                            <MdCalendarToday size={14} />
                            <span>{formattedDate}</span>
                        </div>

                        <h2 className="font-bold text-2xl sm:text-3xl text-dark group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-tight">
                            {title}
                        </h2>
                    </div>

                    {/* Desktop Actions (Hidden until hover) */}
                    <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <ActionButton onClick={onEdit} icon={<MdEdit />} color="bg-primary" />
                        <ActionButton onClick={onDelete} icon={<MdDelete />} color="bg-red-500" />
                    </div>
                </div>

                <div className="mt-4 flex-1">
                    <div
                        className={cn(
                            "relative transition-all duration-500 ease-in-out overflow-hidden",
                            // When not expanded, trim the height and hide overflow
                            isExpanded ? "max-h-[10000px]" : "max-h-[300px]"
                        )}
                    >
                        <RichTextRenderer
                            content={description}
                            className="text-base sm:text-lg text-dark/70 leading-relaxed"
                        />

                        {/* The Fade Gradient: Only show when collapsed to signal more content */}
                        {!isExpanded && (
                            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-card-bg to-transparent" />
                        )}
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-3 flex items-center gap-1 text-secondary font-bold text-sm hover:underline transition-all"
                    >
                        {isExpanded ? t('seeLess') : t('seeMore')}
                        <MdKeyboardArrowDown
                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            size={20}
                        />
                    </button>

                </div>

                {/* Mobile Actions (Always visible) */}
                <div className="flex md:hidden gap-3 mt-6 pt-4 border-t border-gray/5">
                    <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary py-2.5 rounded-xl font-bold text-sm">
                        <MdEdit size={18} /> {t('edit')}
                    </button>
                    <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-2.5 rounded-xl font-bold text-sm">
                        <MdDelete size={18} /> {t('delete')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper Mini-Component for actions
function ActionButton({ onClick, icon, color }: { onClick: () => void, icon: React.ReactNode, color: string }) {
    return (
        <button
            onClick={onClick}
            className={`${color} text-white p-2.5 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all duration-200`}
        >
            {icon}
        </button>
    );
}