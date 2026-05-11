'use client';

import { useMemo } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useValues } from '@/contexts/GlobalContext';
import Logo from '@/components/atoms/Logo';
import {
  FaFacebook,
  FaLinkedin,
  FaPinterest,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import { AiFillInstagram } from 'react-icons/ai';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ width = 'w-32', height = 'h-4' }: { width?: string; height?: string }) {
  return (
    <div
      className={`bg-white/10 animate-pulse rounded-lg ${width} ${height}`}
      aria-hidden="true"
    />
  );
}

// ─── SocialIcons ─────────────────────────────────────────────────────────────

type SocialIconsProps = {
  primary?: boolean;
  size?: number;
  itemClassName?: string;
};

function SocialIcons({ primary = true, size = 18, itemClassName = '' }: SocialIconsProps) {
  const { settings, loadingSettings } = useValues();

  const socials = useMemo(() => {
    return [
      settings?.twitter && { href: settings.twitter, Icon: FaTwitter, label: 'Twitter' },
      settings?.youtube && { href: settings.youtube, Icon: FaYoutube, label: 'YouTube' },
      settings?.instagram && { href: settings.instagram, Icon: AiFillInstagram, label: 'Instagram' },
      settings?.facebook && { href: settings.facebook, Icon: FaFacebook, label: 'Facebook' },
      settings?.linkedin && { href: settings.linkedin, Icon: FaLinkedin, label: 'LinkedIn' },
      settings?.pinterest && { href: settings.pinterest, Icon: FaPinterest, label: 'Pinterest' },
      settings?.tiktok && { href: settings.tiktok, Icon: FaTiktok, label: 'TikTok' },
    ].filter(Boolean) as {
      href: string;
      Icon: React.ComponentType<{ size: number }>;
      label: string;
    }[];
  }, [settings]);

  if (loadingSettings) {
    return (
      <div className="flex gap-2" aria-busy="true" aria-label="Loading social links">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-9 h-9 bg-white/10 animate-pulse rounded-xl" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (!socials.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {socials.map(({ href, Icon, label }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`
            w-9 h-9 flex items-center justify-center rounded-xl
            border border-white/10
            text-white/70 hover:text-white
            transition-all duration-200 hover:scale-105 active:scale-95
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
            ${primary
              ? 'bg-white/5 hover:bg-primary hover:border-primary/40'
              : 'bg-secondary hover:bg-white hover:text-secondary hover:border-transparent'
            }
            ${itemClassName}
          `}
        >
          <Icon size={size} aria-hidden={true} />
        </Link>
      ))}
    </div>
  );
}

// ─── FooterLink ───────────────────────────────────────────────────────────────

type FooterLinkProps = {
  href: string;
  label: string;
};

function FooterLink({ href, label }: FooterLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={`
          group relative inline-flex items-center gap-2
          text-[14px] sm:text-[15px] leading-snug
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded
          ${isActive ? 'text-primary font-semibold' : 'text-white/65 hover:text-white'}
        `}
      >
        {/* Animated leading dash */}
        <span
          className={`
            inline-block w-3 h-[1.5px] rounded-full
            transition-all duration-300
            ${isActive ? 'bg-primary w-4' : 'bg-white/30 group-hover:bg-white/60 group-hover:w-4'}
          `}
          aria-hidden="true"
        />
        {label}
      </Link>
    </li>
  );
}

// ─── FooterSection ────────────────────────────────────────────────────────────

function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <h2 className="mb-5 text-white font-bold text-[15px] uppercase tracking-[0.12em] relative">
        {title}
        {/* Underline accent */}
        <span className="absolute -bottom-2 start-0 w-6 h-0.5 rounded-full bg-primary" aria-hidden="true" />
      </h2>
      {children}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { settings, loadingSettings } = useValues();

  return (
    <footer className="relative overflow-hidden" aria-label={t('ariaLabel')}>

      {/* Background layer */}
      <div
        className="absolute inset-0 bg-[url('/footer.jpg')] bg-cover bg-[center_30%] z-[1]"
        style={{ filter: 'grayscale(1) brightness(0.3) contrast(1.2)' }}
        aria-hidden="true"
      />

      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-slate-950/60 via-slate-950/50 to-slate-950/80"
        aria-hidden="true"
      />

      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px z-[3] bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden="true" />

      {/* Content */}
      <div className="container relative z-[4] py-16 sm:py-20 px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 text-center sm:text-start">

          {/* ── Brand column ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            {/* Logo */}
            <div>
              <Logo />
            </div>

            {/* Description */}
            <div className="max-w-[300px] sm:max-w-none">
              {loadingSettings ? (
                <div className="space-y-2.5" aria-busy="true">
                  <Skeleton width="w-full" height="h-4" />
                  <Skeleton width="w-5/6" height="h-4" />
                  <Skeleton width="w-4/6" height="h-4" />
                </div>
              ) : (
                <p className="text-[14px] sm:text-[15px] text-white/60 leading-relaxed">
                  {isAr ? settings?.description_ar : settings?.description_en}
                </p>
              )}
            </div>

            {/* Social links */}
            <SocialIcons />
          </div>

          {/* ── About column ─────────────────────────────────────────────── */}
          <FooterSection title={t('about.title')}>
            <ul className="flex flex-col gap-3.5 mt-2">
              <FooterLink href="/#home" label={t('about.menu')} />
              <FooterLink href="/#features" label={t('about.features')} />
              <FooterLink href="/blogs" label={t('about.blogs')} />
              <FooterLink href="/contact" label={t('about.support')} />
            </ul>
          </FooterSection>

          {/* ── Company column ───────────────────────────────────────────── */}
          <FooterSection title={t('company.title')}>
            <ul className="flex flex-col gap-3.5 mt-2">
              <FooterLink href="/about" label={t('company.about')} />
              <FooterLink href="/terms" label={t('company.terms')} />
              <FooterLink href="/privacy" label={t('company.privacy')} />
            </ul>
          </FooterSection>

          {/* ── Contact column ───────────────────────────────────────────── */}
          <FooterSection title={t('contact.title')}>
            <ul className="flex flex-col gap-4 mt-2 items-center sm:items-start">

              {/* Address */}
              <li className="flex items-start gap-2.5 text-white/60 max-w-[220px] sm:max-w-none">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {loadingSettings ? (
                  <Skeleton width="w-44" height="h-4" />
                ) : (
                  <span className="text-[14px] sm:text-[15px] leading-snug">{settings?.address}</span>
                )}
              </li>

              {/* Phone */}
              <li className="flex items-center gap-2.5 text-white/60">
                <svg className="w-4 h-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {loadingSettings ? (
                  <Skeleton width="w-32" height="h-4" />
                ) : (
                  settings?.contactPhone && (
                    <a
                      href={`tel:${settings.contactPhone}`}
                      dir="ltr"
                      className="text-[14px] sm:text-[15px] hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    >
                      {settings.contactPhone}
                    </a>
                  )
                )}
              </li>

              {/* Email */}
              <li className="flex items-center gap-2.5 text-white/60">
                <svg className="w-4 h-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {loadingSettings ? (
                  <Skeleton width="w-40" height="h-4" />
                ) : (
                  settings?.contactEmail && (
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-[14px] sm:text-[15px] hover:text-white transition-colors duration-200 break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    >
                      {settings.contactEmail}
                    </a>
                  )
                )}
              </li>
            </ul>
          </FooterSection>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────────── */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
          <p className="text-[13px] text-white/35">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-[13px] text-white/35 hover:text-white/70 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
            >
              {t('company.terms')}
            </Link>
            <span className="text-white/20" aria-hidden="true">·</span>
            <Link
              href="/privacy"
              className="text-[13px] text-white/35 hover:text-white/70 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
            >
              {t('company.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}