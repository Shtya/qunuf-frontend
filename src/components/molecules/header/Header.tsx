'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  ComponentType,
  useTransition,
} from 'react';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useParams, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useAuth } from '@/contexts/AuthContext';
import { FiBell, FiFileText, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import { resolveUrl } from '@/utils/upload';
import { UserRole } from '@/constants/user';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── FallbackImage ──────────────────────────────────────────────────────── */
interface FallbackImageProps {
  src?: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  defaultImage?: string;
  className?: string;
}

const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  alt = 'User',
  width = 40,
  height = 40,
  fill = false,
  defaultImage = '/users/default-user.png',
  className = 'w-10 h-10 rounded-full object-cover',
}) => {
  const [hasError, setHasError] = useState(false);
  const imageSrc =
    !hasError && typeof src === 'string' && src.trim() !== '' ? src : defaultImage;

  return !hasError ? (
    <Image
      src={imageSrc}
      alt={alt}
      {...(fill ? { fill: true } : { width, height })}
      className={className}
      onError={() => setHasError(true)}
    />
  ) : (
    <Image
      src={imageSrc}
      alt={alt}
      {...(fill ? { fill: true } : { width, height })}
      className={className}
    />
  );
};

/* ─── Logo (with GSAP 3D tilt on hover) ─────────────────────────────────── */
interface LogoProps {
  className?: string;
  small?: boolean;
}

export function Logo({ className, small = false }: LogoProps) {
  const t = useTranslations('header');
  const wrapRef = useRef<HTMLDivElement>(null);

  const textSize = small
    ? 'text-[18px] sm:text-[20px] lg:text-[22px]'
    : 'text-[22px] sm:text-[26px] lg:text-[28px]';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 22;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -22;
    gsap.to(el, {
      rotateY: x,
      rotateX: y,
      duration: 0.35,
      ease: 'power2.out',
      transformPerspective: 500,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(wrapRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', display: 'inline-block' }}
    >
      <Link
        href="/"
        className={cn('flex items-center flex-shrink-0 group', className)}
        aria-label={t('logo')}
      >
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary me-2 shadow-sm shadow-primary/30 group-hover:shadow-primary/50 transition-shadow duration-200"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 13L6 5L10 10L12 7L14 13H2Z" fill="white" strokeLinejoin="round" />
          </svg>
        </span>
        <h1
          className={cn(
            textSize,
            'font-extrabold text-slate-900 tracking-tight',
            'group-hover:text-primary transition-colors duration-200',
          )}
        >
          {t('logo')}
        </h1>
      </Link>
    </div>
  );
}

/* ─── LocaleSwitcher ─────────────────────────────────────────────────────── */
interface LocaleSwitcherProps {
  Trigger?: ComponentType<{ onClick: () => void; disabled: boolean; lang?: string }>;
}

function LocaleSwitcher({ Trigger }: LocaleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('root');
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentLocale = useLocale();

  const nextLocale =
    currentLocale === routing.locales[0] ? routing.locales[1] : routing.locales[0];

  function toggleLocale() {
    startTransition(() => {
      const paramsObj: Record<string, string> = {};
      searchParams.forEach((value, key) => { paramsObj[key] = value; });
      router.replace(
        // @ts-expect-error — Next validates params at runtime
        { pathname, params, query: paramsObj },
        { locale: nextLocale },
      );
    });
  }

  if (Trigger) {
    return <Trigger onClick={toggleLocale} disabled={isPending} lang={t('lang')} />;
  }

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      aria-label={`Switch to ${nextLocale}`}
      className={cn(
        'group relative flex items-center gap-1.5 h-9 px-3 rounded-xl',
        'bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300',
        'text-slate-700 font-bold text-xs uppercase tracking-widest',
        'transition-all duration-200 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:opacity-50 disabled:pointer-events-none',
      )}
    >
      <svg
        width="16" height="16" viewBox="0 0 28 28" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-secondary group-hover:rotate-12 transition-transform duration-300 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M14 27.3333C12.1777 27.3333 10.4555 26.9831 8.83329 26.2827C7.21107 25.5822 5.79463 24.6267 4.58396 23.416C3.37329 22.2053 2.41774 20.7889 1.71729 19.1667C1.01685 17.5444 0.666626 15.8222 0.666626 14C0.666626 12.1556 1.01685 10.428 1.71729 8.81733C2.41774 7.20667 3.37329 5.79556 4.58396 4.584C5.79463 3.37244 7.21107 2.41689 8.83329 1.71733C10.4555 1.01778 12.1777 0.667555 14 0.666666C15.8444 0.666666 17.5724 1.01689 19.184 1.71733C20.7955 2.41778 22.2062 3.37333 23.416 4.584C24.6257 5.79467 25.5813 7.20578 26.2826 8.81733C26.984 10.4289 27.3342 12.1556 27.3333 14C27.3333 15.8222 26.9831 17.5444 26.2826 19.1667C25.5822 20.7889 24.6266 22.2058 23.416 23.4173C22.2053 24.6289 20.7942 25.5844 19.1826 26.284C17.5711 26.9836 15.8435 27.3333 14 27.3333ZM14 24.6C14.5777 23.8 15.0777 22.9667 15.5 22.1C15.9222 21.2333 16.2666 20.3111 16.5333 19.3333H11.4666C11.7333 20.3111 12.0777 21.2333 12.5 22.1C12.9222 22.9667 13.4222 23.8 14 24.6ZM10.5333 24.0667C10.1333 23.3333 9.78351 22.572 9.48396 21.7827C9.1844 20.9933 8.93418 20.1769 8.73329 19.3333H4.79996C5.4444 20.4444 6.25018 21.4111 7.21729 22.2333C8.1844 23.0556 9.28974 23.6667 10.5333 24.0667ZM17.4666 24.0667C18.7111 23.6667 19.8168 23.0556 20.784 22.2333C21.7511 21.4111 22.5564 20.4444 23.2 19.3333H19.2666C19.0666 20.1778 18.8168 20.9947 18.5173 21.784C18.2177 22.5733 17.8675 23.3342 17.4666 24.0667ZM3.66663 16.6667H8.19996C8.13329 16.2222 8.08352 15.7836 8.05063 15.3507C8.01774 14.9178 8.00085 14.4676 7.99996 14C7.99907 13.5324 8.01596 13.0827 8.05063 12.6507C8.08529 12.2187 8.13507 11.7796 8.19996 11.3333H3.66663C3.55552 11.7778 3.4724 12.2169 3.41729 12.6507C3.36218 13.0844 3.33418 13.5342 3.33329 14C3.3324 14.4658 3.3604 14.916 3.41729 15.3507C3.47418 15.7853 3.55729 16.224 3.66663 16.6667ZM10.8666 16.6667H17.1333C17.2 16.2222 17.2502 15.7836 17.284 15.3507C17.3177 14.9178 17.3342 14.4676 17.3333 14C17.3324 13.5324 17.3155 13.0827 17.2826 12.6507C17.2497 12.2187 17.2 11.7796 17.1333 11.3333H10.8666C10.8 11.7778 10.7502 12.2169 10.7173 12.6507C10.6844 13.0844 10.6675 13.5342 10.6666 14C10.6657 14.4658 10.6826 14.916 10.7173 15.3507C10.752 15.7853 10.8017 16.224 10.8666 16.6667ZM19.8 16.6667H24.3333C24.4444 16.2222 24.528 15.7836 24.584 15.3507C24.64 14.9178 24.6675 14.4676 24.6666 14C24.6657 13.5324 24.6382 13.0827 24.584 12.6507C24.5297 12.2187 24.4462 11.7796 24.3333 11.3333H19.8C19.8666 11.7778 19.9168 12.2169 19.9506 12.6507C19.9844 13.0844 20.0008 13.5342 20 14C19.9991 14.4658 19.9822 14.916 19.9493 15.3507C19.9164 15.7853 19.8666 16.224 19.8 16.6667ZM19.2666 8.66667H23.2C22.5555 7.55555 21.7502 6.58889 20.784 5.76667C19.8177 4.94444 18.712 4.33333 17.4666 3.93333C17.8666 4.66667 18.2168 5.428 18.5173 6.21733C18.8177 7.00667 19.0675 7.82311 19.2666 8.66667ZM11.4666 8.66667H16.5333C16.2666 7.68889 15.9222 6.76667 15.5 5.9C15.0777 5.03333 14.5777 4.2 14 3.4C13.4222 4.2 12.9222 5.03333 12.5 5.9C12.0777 6.76667 11.7333 7.68889 11.4666 8.66667ZM4.79996 8.66667H8.73329C8.93329 7.82222 9.18351 7.00533 9.48396 6.216C9.7844 5.42667 10.1342 4.66578 10.5333 3.93333C9.28885 4.33333 8.18307 4.44444 7.21596 5.76667C6.24885 6.58889 5.44351 7.55555 4.79996 8.66667Z"
          fill="currentColor"
        />
      </svg>
      <span className="leading-none">{nextLocale.toUpperCase()}</span>
    </button>
  );
}

/* ─── Magnetic Nav Link ──────────────────────────────────────────────────── */
interface MagneticNavLinkProps {
  label: string;
  href: string;
  active: boolean;
}

function MagneticNavLink({ label, href, active }: MagneticNavLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.28;
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.28;
    gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.55)' });
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative px-3 py-1.5 rounded-lg text-[14.5px] font-medium tracking-[0.01em]',
        'transition-colors duration-150 outline-none inline-block',
        'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
        active
          ? 'text-primary bg-primary/[0.07] font-semibold'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
      )}
    >
      {label}
      {/* Underline draw on hover */}
      {!active && (
        <span
          aria-hidden="true"
          className="absolute bottom-0.5 ltr:left-3 rtl:right-3 h-[1.5px] w-0 bg-primary rounded-full transition-all duration-300 group-hover:w-[calc(100%-24px)]"
          style={{
            transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      )}
      {active && (
        <span
          className="absolute bottom-0.5 start-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

/* ─── CTA Button with shimmer loop ──────────────────────────────────────── */
interface CTAButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function CTAButton({ href, onClick, children, className = '', disabled }: CTAButtonProps) {
  const shimmerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !shimmerRef.current) return;

    /* Looping shimmer glint every 4s */
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 2.5 });
    tl.fromTo(
      shimmerRef.current,
      { x: '-110%' },
      { x: '210%', duration: 0.9, ease: 'power2.inOut' },
    );

    return () => { tl.kill(); };
  }, []);

  const base = cn(
    'relative overflow-hidden inline-flex items-center justify-center gap-2',
    'px-5 py-2 rounded-xl h-9',
    'text-sm font-semibold tracking-wide',
    'transition-all duration-200 active:scale-95',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    className,
  );

  const shimmer = (
    <span
      ref={shimmerRef}
      aria-hidden="true"
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
    />
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {shimmer}
        {children}
      </Link>
    );
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={base}>
      {shimmer}
      {children}
    </button>
  );
}

/* ─── Role badge styles ──────────────────────────────────────────────────── */
const roleStyles: Record<UserRole, string> = {
  [UserRole.ADMIN]:    'text-red-500     bg-red-50     border-red-100',
  [UserRole.LANDLORD]: 'text-blue-500    bg-blue-50    border-blue-100',
  [UserRole.TENANT]:   'text-emerald-500 bg-emerald-50 border-emerald-100',
};

/* ═══════════════════════════════════════════════════════════════════════════
   HEADER  (main)
═══════════════════════════════════════════════════════════════════════════ */
export default function Header() {
  const pathname = usePathname();
  const { role, logout, LoggingOut, user } = useAuth();
  const t = useTranslations('header');

  const [isPinned,     setIsPinned]     = useState(false);
  const [isHidden,     setIsHidden]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const headerRef   = useRef<HTMLDivElement>(null);
  const innerBarRef = useRef<HTMLDivElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);
  const toggleRef   = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* Mobile nav link refs for stagger */
  const mobileLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useOutsideClick([menuRef, toggleRef, userMenuRef], () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  });

  /* ── GSAP entrance animation ── */
  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !innerBarRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerBarRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', delay: 0.05 },
      );
    });

    return () => ctx.revert();
  }, []);

  /* ── Scroll-based pinning & hide-on-scroll-down ── */
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setIsPinned(y > 16);
      if (Math.abs(y - lastY) > 8) {
        setIsHidden(y > lastY && y > 80);
        lastY = y;
      }
    };
    const onResize = () => setIsPinned(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* ── Escape closes mobile menu ── */
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMenuOpen(false);
  }, []);
  useEffect(() => {
    if (menuOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, onKeyDown]);

  /* ── Mobile menu stagger animation ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const links = mobileLinkRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (!links.length) return;

    if (menuOpen) {
      gsap.fromTo(
        links,
        { opacity: 0, x: -18 },
        {
          opacity: 1, x: 0,
          duration: 0.38,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.12,
        },
      );
    } else {
      gsap.set(links, { opacity: '', x: '' });
    }
  }, [menuOpen]);

  /* ── Nav links ── */
  const navLinks = [
    { label: t('nav.home'),       href: '/' },
    { label: t('nav.realEstate'), href: '/properties' },
    { label: t('nav.blog'),       href: '/blogs' },
    { label: t('nav.about'),      href: '/about' },
    { label: t('nav.contact'),    href: '/contact' },
    ...(role ? [{ label: t('nav.dashboard'), href: '/dashboard' }] : []),
  ];

  async function onLogout() {
    await logout();
  }

  return (
    <header
      id="main-header"
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 md:top-4 z-[10]',
        'transition-transform duration-300 will-change-transform',
        isHidden ? '-translate-y-[120%]' : 'translate-y-0',
      )}
    >
      {/* ── Inner bar ─────────────────────────────────────────────────────── */}
      <div
        ref={innerBarRef}
        className={cn(
          'mx-auto flex w-full items-center justify-between gap-3',
          'px-4 sm:px-6 lg:px-8 py-2.5 md:py-3',
          'transition-all duration-300',
          'md:max-w-5xl xl:max-w-[1208px] md:rounded-2xl',
          isPinned
            ? 'bg-white/90 shadow-xl shadow-slate-900/[0.06] backdrop-blur-md ring-1 ring-black/[0.06]'
            : 'bg-white/75 shadow-md shadow-slate-900/[0.04] backdrop-blur-sm ring-1 ring-black/[0.04]',
        )}
      >
        {/* Logo with 3D tilt */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav
          className="navbar hidden md:flex items-center gap-1 ms-4 me-auto"
          aria-label={t('nav.ariaLabel')}
        >
          {navLinks.map(({ label, href }) => (
            <MagneticNavLink
              key={href}
              label={label}
              href={href}
              active={pathname === href}
            />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* ── Authenticated user button ── */}
          {role && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                aria-label={t('userMenu.ariaLabel')}
                className={cn(
                  'flex items-center gap-2 p-1.5 pe-3 rounded-xl border',
                  'transition-all duration-200 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary/40',
                  userMenuOpen
                    ? 'bg-slate-100 border-primary/20 ring-2 ring-primary/10 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm',
                )}
              >
                <div className="relative shrink-0">
                  <FallbackImage
                    src={user.imagePath ? resolveUrl(user.imagePath) : '/users/default-user.png'}
                    alt={user.name}
                    width={34}
                    height={34}
                    className="rounded-lg object-cover ring-1 ring-slate-200"
                    defaultImage="/users/default-user.png"
                  />
                  <span
                    className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
                    aria-hidden="true"
                  />
                </div>
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-[13px] font-semibold text-slate-800 max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <span
                    className={cn(
                      'text-[9px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded-md border mt-0.5',
                      roleStyles[user.role] ?? 'text-slate-500 bg-slate-50 border-slate-200',
                    )}
                  >
                    {t(`roles.${user.role}`)}
                  </span>
                </div>
                <FiChevronDown
                  className={cn(
                    'hidden lg:block w-3.5 h-3.5 text-slate-400 ms-0.5 transition-transform duration-200',
                    userMenuOpen && 'rotate-180 text-primary',
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* User dropdown */}
              {userMenuOpen && (
                <div
                  role="menu"
                  aria-label={t('userMenu.ariaLabel')}
                  className={cn(
                    'absolute top-[calc(100%+8px)] z-[70]',
                    'end-0 start-auto',
                    'w-60',
                    'bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100',
                    'py-1.5 overflow-hidden',
                    'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150',
                  )}
                >
                  <div className="lg:hidden px-4 py-3 bg-slate-50 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className={cn('text-[10px] uppercase tracking-widest font-extrabold mt-0.5', roleStyles[user.role]?.split(' ')[0])}>
                      {t(`roles.${user.role}`)}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/settings/account"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <FiUser className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    {t('userMenu.profile')}
                  </Link>

                  <Link
                    href="/dashboard/notifications"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <FiBell className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{t('userMenu.notifications')}</span>
                    {user.notificationUnreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {user.notificationUnreadCount > 99 ? '99+' : user.notificationUnreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/dashboard/contracts"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <FiFileText className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    {t('userMenu.contracts')}
                  </Link>

                  <div className="h-px bg-slate-100 mx-2 my-1" role="separator" />

                  <button
                    role="menuitem"
                    onClick={onLogout}
                    disabled={LoggingOut}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-[13.5px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <FiLogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {LoggingOut ? t('nav.loggingOut') : t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Sign-in CTA with shimmer ── */
            <CTAButton
              href="/auth/sign-in"
              className="bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/30 hover:shadow-primary/50 focus-visible:ring-primary/40 text-[13.5px]"
            >
              {t('nav.login')}
            </CTAButton>
          )}

          <LocaleSwitcher />

          {/* Mobile hamburger */}
          <button
            ref={toggleRef}
            id="menu-toggle"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              'md:hidden flex items-center justify-center w-9 h-9 rounded-xl',
              'text-slate-700 border border-slate-200',
              'hover:bg-slate-100 transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              menuOpen && 'bg-slate-100 border-slate-300',
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                menuOpen ? 'rotate-90' : 'rotate-0',
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.mobileMenuLabel')}
        aria-hidden={!menuOpen}
        className={cn(
          'md:hidden fixed inset-x-0 top-0 z-40',
          'transition-[opacity,visibility] duration-300 ease-out motion-reduce:transition-none',
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-slate-900/40 backdrop-blur-[3px]',
            'transition-opacity duration-300 motion-reduce:transition-none',
            menuOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          ref={menuRef}
          className={cn(
            'fixed inset-x-0 top-0 z-50',
            'origin-top rounded-b-3xl',
            'bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-black/[0.05]',
            'pt-safe pb-6',
            'transition-transform duration-300 ease-out motion-reduce:transition-none',
            menuOpen ? 'translate-y-0' : '-translate-y-3',
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <Logo />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label={t('nav.closeMenu')}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links — stagger animated */}
          <nav className="mt-1 px-3" aria-label={t('nav.ariaLabel')}>
            {navLinks.map(({ label, href }, i) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  ref={(el) => { mobileLinkRefs.current[i] = el; }}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  style={{ opacity: 0 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5',
                    'text-[15px] font-medium tracking-[0.01em]',
                    'transition-colors duration-150',
                    active
                      ? 'text-primary bg-primary/[0.07] font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50',
                  )}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  )}
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* CTA — shown only when not logged in */}
          {!role && (
            <div className="px-5 pt-3 border-t border-slate-100 mt-2">
              <CTAButton
                href="/auth/sign-in"
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/30 focus-visible:ring-primary/40 h-11 text-[15px]"
              >
                {t('nav.login')}
              </CTAButton>
            </div>
          )}

          <div className="h-[env(safe-area-inset-bottom)]" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}