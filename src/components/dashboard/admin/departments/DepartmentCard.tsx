'use client';

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { resolveUrl } from "@/utils/upload";
import { getInitials } from "@/utils/helpers";

interface DepartmentCardProps {
    title_en: string;
    title_ar: string;
    description_en?: string | null;
    description_ar?: string | null;
    imagePath?: string | null;
    onEdit: () => void;
    onDelete: () => void;
}


export default function DepartmentCard({
    title_en,
    title_ar,
    description_en,
    description_ar,
    imagePath,
    onEdit,
    onDelete
}: DepartmentCardProps) {
    const t = useTranslations("dashboard.admin.departments");
    const locale = useLocale();
    const isArabic = locale === "ar";

    const title = isArabic ? title_ar : title_en;
    const description = (isArabic ? description_ar : description_en) || "";

    return (
        <div className="group relative bg-card-bg rounded-[14px] p-4 flex flex-col gap-4 w-full transition-all duration-300 hover:shadow-xl border border-gray/10 transform-gpu">

            {/* 1. Actions - Hidden until hover for a cleaner grid */}
            <div className="absolute top-6 inset-x-6 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <button
                    onClick={onDelete}
                    className="bg-red-600 text-white p-2.5 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                    <MdDelete size={18} />
                </button>
                <button
                    onClick={onEdit}
                    className="bg-white text-dark p-2.5 rounded-xl shadow-lg border border-gray/10 hover:scale-110 active:scale-95 transition-all"
                >
                    <FaEdit size={18} />
                </button>
            </div>

            {/* 2. Image Section - Matching your preferred 12px radius */}
            <div className="relative w-full h-[200px] md:h-[240px] rounded-[12px] overflow-hidden shrink-0 shadow-sm">
                {imagePath ? (
                    <Image
                        src={resolveUrl(imagePath)}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-2xl">
                        {title.charAt(0)}
                    </div>
                )}

                {/* Subtle gradient for depth, removed the heavy mix-blend */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* 3. Text Content */}
            <div className="flex flex-col gap-2 px-1 pb-2">
                <h3 className="text-xl md:text-2xl font-bold text-dark group-hover:text-primary transition-colors duration-200">
                    {title}
                </h3>

                {description && (
                    <p className="text-dark/70 text-sm md:text-base leading-relaxed line-clamp-3">
                        {description}
                    </p>
                )}
            </div>

            {/* Subtle "Learn More" or indicator if needed, or just white space for "trim" look */}
            <div className="h-1 w-0 bg-secondary rounded-full group-hover:w-12 transition-all duration-500" />
        </div>
    );
}