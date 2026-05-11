'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { FaBed } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { LuBath, LuSearchX } from 'react-icons/lu';
import api from '@/libs/axios';
import { resolveUrl } from '@/utils/upload';
import { updateUrlParams } from '@/utils/helpers';

// ─── Types ────────────────────────────────────────────────────────────────────

type RentType = 'yearly' | 'monthly';

type PropertyPreview = {
  id: string;
  title: string;
  address: string;
  location: string;
  price: number;
  imageUrl: string;
  bathrooms: number;
  bedrooms: number;
  guests: number;
  rate: number;
  isMonthly: boolean;
  slug: string;
};

// ─── Inline: Shimmer Skeleton ─────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
      <style>{`
        @keyframes shimmer {
          0%  { background-position: -200% 0; }
          100%{ background-position:  200% 0; }
        }
        .shimmer-card {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
      `}</style>
      <div className="shimmer-card absolute inset-0 z-10 rounded-2xl" />
      <div className="h-[220px] lg:h-[260px] w-full bg-gray-200 rounded-t-2xl" />
      <div className="p-5 space-y-3">
        <div className="h-6 w-1/2 bg-gray-200 rounded-lg" />
        <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />
        <div className="h-4 w-1/3 bg-gray-200 rounded-lg" />
        <div className="flex gap-3 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 flex-1 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

// ─── Inline: Facility Chip ────────────────────────────────────────────────────

type FacilityChipProps = {
  icon: React.ReactNode;
  text: string;
};

function FacilityChip({ icon, text }: FacilityChipProps) {
  return (
    <div
      title={text}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-primary/[0.06] text-primary min-w-0"
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-xs font-semibold truncate whitespace-nowrap">
        {text}
      </span>
    </div>
  );
}

// ─── Inline: PropertyCardPreview ─────────────────────────────────────────────

type CardProps = {
  property: PropertyPreview;
  locale: 'ar' | 'en';
  currency: string;
  periodLabel: string;
};

function PropertyCardPreview({
  property,
  currency,
  periodLabel,
}: CardProps) {
  const t = useTranslations('homePage.basedOnLocationSection');

  const bathroomsCount = toSafeNumber(property.bathrooms);
  const bedroomsCount = toSafeNumber(property.bedrooms);
  const guestsCount = toSafeNumber(property.guests);

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
    >
      <article className="w-full h-full border border-[#ECF1F8] rounded-2xl overflow-hidden flex flex-col bg-white transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.08] hover:-translate-y-1 hover:border-primary/20">
        {/* Image */}
        <div className="overflow-hidden rounded-t-2xl">
          <Image
            src={property.imageUrl ? resolveUrl(property.imageUrl) : '/placeholder.jpg'}
            alt={property.title}
            width={411}
            height={260}
            className="w-full h-[220px] lg:h-[260px] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 flex-1">
          {/* Price row */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-xl lg:text-2xl text-dark tabular-nums">
              {Number(property.price || 0).toLocaleString()}
            </span>
            <span className="text-sm text-dark/50 font-medium">
              {currency} / {periodLabel}
            </span>
          </div>

          {/* Title */}
          <p className="font-bold text-base lg:text-lg text-dark leading-snug truncate whitespace-nowrap group-hover:text-primary transition-colors duration-150">
            {property.title}
          </p>

          {/* Location */}
          {property.location && (
            <p className="text-xs sm:text-sm font-medium text-dark/45 truncate">
              {property.location}
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 mt-auto pt-3">
            <div className="grid grid-cols-3 gap-2">
              <FacilityChip
                icon={<LuBath size={14} />}
                text={t('facility.bathrooms', { count: bathroomsCount })}
              />
              <FacilityChip
                icon={<FiUsers size={14} />}
                text={t('facility.guests', { count: guestsCount })}
              />
              <FacilityChip
                icon={<FaBed size={14} />}
                text={t('facility.bedrooms', { count: bedroomsCount })}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const RENT_TYPES: RentType[] = ['monthly', 'yearly'];

export default function BasedOnLocationSection() {
  const locale = useLocale();
  const t = useTranslations('homePage.basedOnLocationSection');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRTL = locale === 'ar';
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRentalType, setActiveRentalType] = useState<RentType>(
    (searchParams.get('rentalType') as RentType) || 'monthly'
  );

  useEffect(() => {
    const fetchByLocation = async () => {
      setLoading(true);
      try {
        const res = await api.get('/properties/search', {
          params: {
            rentType: activeRentalType,
            limit: 12,
            sortBy: 'created_at',
            sortOrder: 'DESC',
          },
        });
        setProperties(res.data.records || []);
      } catch (error) {
        console.error('Location fetch failed', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchByLocation();
  }, [activeRentalType]);

  const handleFilterClick = (value: RentType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('rentalType', value);
    setActiveRentalType(value);
    updateUrlParams(pathname, params);
  };

  return (
    <section className="mt-10 sm:mt-14" aria-labelledby="location-section-title">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className={`flex items-center gap-2.5 `}>
            <span aria-hidden="true" className="block h-1 w-10 rounded-full bg-secondary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-secondary">
              {t('eyebrow')}
            </span>
          </div>

          <h2
            id="location-section-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark leading-tight tracking-tight"
          >
            {t('title')}
          </h2>

          <p className="text-sm sm:text-base text-dark/60 leading-relaxed max-w-2xl">
            {t('description')}
          </p>
        </div>

        {/* Rental Type Toggle */}
        <div className={`flex items-center gap-4 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div
            role="tablist"
            aria-label={t('toggle.label')}
            className="inline-flex rounded-xl bg-lighter p-1.5 shadow-inner"
          >
            {RENT_TYPES.map((type) => {
              const isActive = activeRentalType === type;

              return (
                <button
                  key={type}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleFilterClick(type)}
                  className={`px-6 sm:px-8 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1 ${
                    isActive
                      ? 'bg-secondary text-white shadow-sm'
                      : 'text-dark hover:text-secondary'
                  }`}
                >
                  {t(type)}
                </button>
              );
            })}
          </div>

          <span className="text-sm font-medium text-dark/60 hidden sm:block">
            {t('rent')}
          </span>
        </div>

        {/* Content */}
        <div className="my-10 min-h-[400px]" role="tabpanel">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && properties.length === 0 && (
            <div
              role="status"
              className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50"
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 border border-gray-100">
                <LuSearchX size={30} className="text-gray-400" />
              </div>

              <h3 className="text-lg font-bold text-dark">{t('empty.title')}</h3>
              <p className="text-gray-400 mt-2 max-w-xs text-sm leading-relaxed">
                {t('empty.description')}
              </p>
            </div>
          )}

          {!loading && properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {properties.map((property) => (
                <PropertyCardPreview
                  key={property.id}
                  property={{
                    id: property.id,
                    title: property.name || '',
                    address: property.address || '',
                    location: property.city?.[locale] || property.district?.[locale] || '',
                    price: toSafeNumber(property.rentPrice),
                    imageUrl: property.images?.[0]?.url || '',
                    bathrooms: toSafeNumber(property.facilities?.bathrooms),
                    bedrooms: toSafeNumber(property.facilities?.bedrooms),
                    guests: toSafeNumber(property.capacity),
                    rate: toSafeNumber(property.rating || 5),
                    isMonthly: activeRentalType === 'monthly',
                    slug: property.slug,
                  }}
                  locale={locale as 'ar' | 'en'}
                  currency={currency}
                  periodLabel={activeRentalType === 'monthly' ? t('monthly') : t('yearly')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}