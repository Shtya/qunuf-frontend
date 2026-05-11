'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'use-intl';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';
import { LuSearchX } from 'react-icons/lu';
import api from '@/libs/axios';
import { resolveUrl } from '@/utils/upload';

// ─── Inline SwiperNav ────────────────────────────────────────────────────────

type SwiperNavProps = {
  currentPage: number;
  totalPages: number;
  prevClass: string;
  nextClass: string;
  dir?: 'rtl' | 'ltr';
  prevLabel: string;
  nextLabel: string;
};

function SwiperNav({
  currentPage,
  totalPages,
  prevClass,
  nextClass,
  dir = 'ltr',
  prevLabel,
  nextLabel,
}: SwiperNavProps) {
  const disabled = totalPages <= 1;
  const btnBase =
    'flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary';
  const btnActive =
    'border-primary text-primary hover:bg-primary hover:text-white active:scale-95 cursor-pointer';
  const btnDisabled = 'border-gray-200 text-gray-300 pointer-events-none';

  return (
    <div className="flex items-center gap-3" dir={dir}>
      {/* Prev */}
      <button
        aria-label={prevLabel}
        aria-disabled={disabled}
        className={` ltr:scale-x-[-1] ${btnBase} ${disabled ? btnDisabled : btnActive} ${prevClass}`}
      >
        <GoArrowRight size={20} />
      </button>

      {/* Counter */}
      <div className="min-w-[56px] text-center select-none" aria-live="polite">
        <span className="font-bold text-base text-dark tabular-nums">
          {String(currentPage).padStart(2, '0')}
        </span>
        <span className="mx-0.5 text-gray-300 font-light">/</span>
        <span className="text-sm text-gray-400 tabular-nums">
          {String(totalPages).padStart(2, '0')}
        </span>
      </div>

      {/* Next */}
      <button
        aria-label={nextLabel}
        aria-disabled={disabled}
        className={` ltr:scale-x-[-1] ${btnBase} ${disabled ? btnDisabled : btnActive} ${nextClass}`}
      >
        <GoArrowLeft size={20} />
      </button>
    </div>
  );
}

// ─── Inline PropertyCard ──────────────────────────────────────────────────────

type PropertyCardProps = {
  id: string;
  title: string;
  address: string;
  price: number;
  imageUrl: string;
  slug: string;
  currency: string;
  period: string;
  viewLabel: string;
};

function PropertyCard({
  title,
  address,
  price,
  imageUrl,
  slug,
  currency,
  period,
  viewLabel,
}: PropertyCardProps) {
  return (
    <article className="relative w-full h-[460px] sm:h-[484px] rounded-3xl overflow-hidden group shadow-lg shadow-black/10 bg-gray-100 flex items-end">
      {/* Image */}
      <Image
        src={imageUrl || '/placeholder.jpg'}
        fill
        alt={title}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        priority={false}
      />

      {/* Gradient overlay — multi-stop for depth */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.04) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-[2] w-full p-5 sm:p-6">
        {/* Badge pill */}
        <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/15 text-white backdrop-blur-sm border border-white/20">
          {address}
        </span>

        <Link
          href={`/properties/${slug}`}
          className="block font-bold text-lg sm:text-xl text-white leading-snug hover:text-secondary transition-colors duration-150 line-clamp-2"
        >
          {title}
        </Link>

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-1  ">
          <span className="font-extrabold text-2xl text-white tabular-nums">
            {Number(price).toLocaleString()}
          </span>
          <span className="text-sm text-white/75 font-medium">
            {currency} {period}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link
            href={`/properties/${slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-secondary hover:bg-secondary-hover active:scale-95 text-white px-5 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
          >
            {viewLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="relative w-full h-[460px] sm:h-[484px] rounded-3xl overflow-hidden bg-gray-200">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 space-y-3">
        <div className="h-4 w-24 rounded-full bg-gray-300/70" />
        <div className="h-5 w-3/4 rounded-lg bg-gray-300/70" />
        <div className="h-4 w-1/3 rounded-lg bg-gray-300/70" />
        <div className="h-9 w-28 rounded-xl bg-gray-300/70 mt-4" />
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function RecentPropertiesSection() {
  const t = useTranslations('homePage.recentProperties');
  const tEnums = useTranslations('property.enums');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/properties/search', {
          params: { limit: 5, sortBy: 'created_at', sortOrder: 'DESC' },
        });
        setProperties(res.data.records);
      } catch (error) {
        console.error('Failed to fetch recent properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const getPeriod = (address: string) => {
    const isMonthly =
      address.includes('Monthly') || address.includes('شهر');
    return isMonthly
      ? locale === 'ar'
        ? '/ شهر'
        : '/ mo'
      : locale === 'ar'
      ? '/ سنة'
      : '/ yr';
  };

  return (
    <section
      className="transition-colors duration-300"
      style={{
        background:
          'linear-gradient(180deg, var(--light) 0%, color-mix(in srgb, var(--lighter) 80%, var(--light) 20%) 60%, var(--lighter) 100%)',
      }}
    >
      <div className="py-12 sm:py-16 lg:py-20 container">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between  ">

          {/* Left: Title + description */}
          <div className="max-w-xl">
            {/* Decorative accent */}
            <div className="flex items-center gap-2.5 mb-4 ">
              <span
                aria-hidden="true"
                className="block h-1 w-10 rounded-full bg-secondary"
              />
              <span className="text-xs font-semibold tracking-widest uppercase text-secondary">
                {t('eyebrow')}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark leading-tight tracking-tight">
              {t('title')}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-dark/60 leading-relaxed max-w-lg">
              {t('description')}
            </p>
          </div>

          {/* Right: Nav — only when there are properties */}
          {!loading && properties.length > 0 && (
            <div className="self-start lg:self-auto">
              <SwiperNav
                currentPage={currentPage}
                totalPages={totalPages}
                prevClass="recent-prev"
                nextClass="recent-next"
                dir={isRTL ? 'rtl' : 'ltr'}
                prevLabel={t('nav.prev')}
                nextLabel={t('nav.next')}
              />
            </div>
          )}
        </div>

        {/* ── Slider / Loading / Empty ────────────────────── */}
        <div className="mt-10 sm:mt-12">

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && properties.length === 0 && (
            <div
              role="status"
              className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/40 backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5 shadow-inner">
                <LuSearchX size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-dark">
                {t('empty.title')}
              </h3>
              <p className="mt-2 text-sm text-gray-400 max-w-xs leading-relaxed">
                {t('empty.description')}
              </p>
            </div>
          )}

          {/* Swiper */}
          {!loading && properties.length > 0 && (
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              dir={isRTL ? 'rtl' : 'ltr'}
              navigation={{
                nextEl: isRTL ? '.recent-prev' : '.recent-next',
                prevEl: isRTL ? '.recent-next' : '.recent-prev',
              }}
              breakpoints={{
                0: { slidesPerView: 1 },
                640: { slidesPerView: 1.15 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1536: { slidesPerView: 4 },
              }}
              onSlideChange={(swiper) => {
                const perView = Math.round(swiper.params.slidesPerView as number);
                setCurrentPage(Math.floor(swiper.realIndex / perView) + 1);
                setTotalPages(Math.ceil(properties.length / perView));
              }}
              onInit={(swiper) => {
                const perView = Math.round(swiper.params.slidesPerView as number);
                setTotalPages(Math.ceil(properties.length / perView));
              }}
            >
              {properties.map((property) => {
                const addressLabel = `${tEnums(`propertyType.${property.propertyType}`)} - ${tEnums(`rentType.${property.rentType}`)}`;
                const period = getPeriod(addressLabel);
                const imageUrl = property.images?.find((img: any) => img.is_primary)?.url || property.images?.[0]?.url;

                return (
                  <SwiperSlide key={property.id}>
                    <PropertyCard
                      id={property.id}
                      title={property.name}
                      address={addressLabel}
                      price={property.rentPrice}
                      imageUrl={imageUrl ? resolveUrl(imageUrl) : ''}
                      slug={property.slug}
                      currency={currency}
                      period={period}
                      viewLabel={t('card.viewProperty')}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
}
 