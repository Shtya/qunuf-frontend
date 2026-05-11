'use client';

import { FaPhone, FaEnvelope, FaEdit } from 'react-icons/fa';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { MdDelete } from 'react-icons/md';
import { resolveUrl } from '@/utils/upload';
import { getInitials } from '@/utils/helpers';
import ImageAlt from '@/components/atoms/ImageAlt';

interface TeamMemberCardProps {
  name: string;
  job: string;
  phone: string;
  email: string;
  imagePath: string;
  description_en?: string | null;
  description_ar?: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function TeamMemberCard({
  name,
  job,
  phone,
  email,
  imagePath,
  description_en,
  description_ar,
  onEdit,
  onDelete
}: TeamMemberCardProps) {
  const t = useTranslations("dashboard.admin.team");
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const description = (isArabic ? description_ar : description_en) || '';

  return (
    <div className="group relative bg-card-bg rounded-[14px] p-4 w-full max-w-xs mx-auto flex flex-col items-center gap-4 pb-6 md:pb-8 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-gray/10">

      {/* Action Buttons - Hidden until hover for a cleaner look */}
      <div className="absolute top-3 inset-x-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button
          onClick={() => onDelete()}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95"
          title={t('delete')}
        >
          <MdDelete size={18} />
        </button>
        <button
          onClick={() => onEdit()}
          className="bg-white hover:bg-gray-50 text-dark p-2 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 border border-gray/10"
          title={t('edit')}
        >
          <FaEdit size={18} />
        </button>
      </div>

      {/* Profile Image */}
      <div className="rounded-[12px] overflow-hidden w-[111px] h-[105px] shadow-sm shrink-0 mt-2">
        {imagePath ? (
          <Image
            src={resolveUrl(imagePath)}
            alt={name}
            width={111}
            height={105}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImageAlt title={name} />
        )}
      </div>

      {/* Identity */}
      <div className="space-y-1 text-center">
        <h3 className="text-dark font-bold text-lg leading-tight">{name}</h3>
        <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{job}</p>
      </div>

      <div className="w-full space-y-3 mt-2">
        {/* Clickable Phone */}
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 w-full group/link hover:translate-x-1 transition-transform duration-200"
        >
          <div className="bg-secondary shrink-0 rounded-[12px] w-9 h-9 flex items-center justify-center text-white shadow-sm group-hover/link:bg-primary transition-colors">
            <FaPhone size={14} />
          </div>
          <span className="text-dark font-medium text-sm truncate" dir="ltr">
            {phone}
          </span>
        </a>

        {/* Clickable Email */}
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 w-full group/link hover:translate-x-1 transition-transform duration-200"
        >
          <div className="bg-secondary shrink-0 rounded-[12px] w-9 h-9 flex items-center justify-center text-white shadow-sm group-hover/link:bg-primary transition-colors">
            <FaEnvelope size={14} />
          </div>
          <span className="text-dark font-medium text-sm truncate">
            {email}
          </span>
        </a>
      </div>

      {/* Description - Trimmed for UI consistency */}
      {description && (
        <p className="text-sm text-dark/60 text-center mt-2 line-clamp-3 leading-relaxed border-t border-gray/5 pt-3 w-full italic">
          "{description}"
        </p>
      )}
    </div>
  );
}
