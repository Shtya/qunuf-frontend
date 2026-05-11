'use client';

// ─────────────────────────────────────────────────────────────────────────────
// RecentBlogs.tsx — Single unified file
// Components: RecentBlogs · BlogCard (hero + grid) · BlogCardSkeleton
//             FetchMoreBlogs · PageHeader · AnimatedSecondaryButton · AnimatedBall
// ─────────────────────────────────────────────────────────────────────────────

import api from '@/libs/axios';
import { MdArticle } from 'react-icons/md';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { resolveUrl } from '@/utils/upload';
import { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import RichTextRenderer from '@/components/molecules/forms/editor/RichTextRenderer';
import { cn } from '@/lib/utils';
import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — single source of truth, change here → updates everywhere
// ─────────────────────────────────────────────────────────────────────────────

// Softer radius that matches the rest of the page (not sharp, not pill)
const R      = 'rounded-[14px]';
// Hairline border — barely visible, never harsh
const BORDER = 'border border-gray-200/60 dark:border-white/[0.06]';
// Card surface
const BG     = 'bg-white dark:bg-zinc-900';
// Resting shadow — just barely lifts the card
const SHADE  = 'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]';
// Hover — smooth lift, no abrupt jump
const HOVER  = 'hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]';
const TRANS  = 'transition-all duration-400 ease-out';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ViewBlog {
    id: string;
    slug: string;
    imagePath: string;
    title_ar: string;
    title_en: string;
    description_ar?: string;
    description_en?: string;
    created_at: string | Date;
}

interface BlogCardProps {
    blog: ViewBlog;
    list?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader
// ─────────────────────────────────────────────────────────────────────────────

export function PageHeader({ title, className }: { title: string; className?: string }) {
    return (
        <div className={cn('flex flex-col items-center gap-2.5 py-10 md:py-14', className)}>
            <div className="flex items-center gap-4">
                <span className="block h-px w-7 rounded-full bg-gray-300/70" aria-hidden="true" />
                <h1 className="select-none text-2xl font-semibold tracking-wide text-[#616161] md:text-3xl lg:text-4xl">
                    {title}
                </h1>
                <span className="block h-px w-7 rounded-full bg-gray-300/70" aria-hidden="true" />
            </div>
            {/* Brand accent */}
            <span
                className="block h-[2px] w-10 rounded-full bg-gradient-to-r from-secondary/50 via-primary to-secondary/50"
                aria-hidden="true"
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedBall
// ─────────────────────────────────────────────────────────────────────────────

type AnimatedBallProps = {
    position: 'start' | 'end';
    large?: boolean;
    variant?: 'white' | 'highlight';
    offset?: number;
};

export function AnimatedBall({ position, large = true, variant = 'white', offset = 0 }: AnimatedBallProps) {
    const size = large
        ? 'w-[60px] sm:w-[70px] 2xl:w-[75px] h-[60px] sm:h-[70px] 2xl:h-[75px]'
        : 'w-[55px] xl:w-[65px] h-[55px] xl:h-[65px]';

    const color = variant === 'white' ? 'bg-white/90' : 'bg-highlight';

    const style: React.CSSProperties = {
        position: 'absolute',
        bottom: `${-40 + offset}px`,
        [position === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: `${-20 + offset}px`,
    };

    const hoverCls =
        position === 'start'
            ? 'group-hover:-translate-y-1.5 ltr:group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5'
            : 'group-hover:-translate-y-1.5 ltr:group-hover:-translate-x-1.5 rtl:group-hover:translate-x-1.5';

    return (
        <div
            className={cn(color, size, 'rounded-full transition-all duration-300 ease-out group-hover:scale-105', hoverCls)}
            style={style}
            aria-hidden="true"
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedSecondaryButton
// ─────────────────────────────────────────────────────────────────────────────

type AnimatedSecondaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    className?: string;
    position?: 'start' | 'end';
    primary?: boolean;
    large?: boolean;
    showBall?: boolean;
    loading?: boolean;
};

export function AnimatedSecondaryButton({
    children,
    className = '',
    position = 'start',
    primary = false,
    large = true,
    showBall = true,
    loading = false,
    disabled,
    ...props
}: AnimatedSecondaryButtonProps) {
    return (
        <button
            {...props}
            disabled={loading || disabled}
            aria-busy={loading}
            className={cn(
                'group relative overflow-hidden rounded-xl font-medium text-white',
                'transition-all duration-300 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                primary
                    ? 'bg-primary hover:bg-primary-hover focus-visible:ring-primary'
                    : 'bg-secondary hover:bg-secondary-hover focus-visible:ring-secondary',
                large
                    ? 'h-[48px] w-[160px] text-sm sm:h-[52px] sm:w-[200px] sm:text-base 2xl:w-[242px]'
                    : 'h-[42px] w-[130px] text-sm lg:w-[160px]',
                loading || disabled ? 'cursor-not-allowed opacity-60' : 'active:scale-[0.98]',
                className
            )}
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}
        >
            <span className="relative z-10 select-none">{children}</span>
            {showBall && (
                <>
                    <AnimatedBall position={position} large={large} variant="white" offset={5} />
                    <AnimatedBall position={position} large={large} variant="highlight" offset={0} />
                </>
            )}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ArrowIcon — RTL-aware via rtl:rotate-180
// ─────────────────────────────────────────────────────────────────────────────

function ArrowIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('rtl:rotate-180', className)}
            aria-hidden="true"
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// BlogCardSkeleton
// ─────────────────────────────────────────────────────────────────────────────

export function BlogCardSkeleton({ list = false }: { list?: boolean }) {
    if (list) {
        return (
            <div
                className={cn('grid animate-pulse grid-cols-1 overflow-hidden md:grid-cols-2', R, BORDER, BG)}
                aria-hidden="true"
            >
                <div className="min-h-[260px] bg-gray-100 dark:bg-zinc-800 md:min-h-[400px]" />
                <div className="flex flex-col gap-5 p-7 md:p-10">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-zinc-700" />
                        <div className="h-3 w-28 rounded-full bg-gray-200 dark:bg-zinc-700" />
                    </div>
                    <div className="space-y-2.5">
                        <div className="h-6 w-4/5 rounded-lg bg-gray-200 dark:bg-zinc-700" />
                        <div className="h-6 w-3/5 rounded-lg bg-gray-200 dark:bg-zinc-700" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-gray-100 dark:bg-zinc-800" />
                        <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-zinc-800" />
                        <div className="h-4 w-4/6 rounded bg-gray-100 dark:bg-zinc-800" />
                        <div className="h-4 w-3/6 rounded bg-gray-100 dark:bg-zinc-800" />
                    </div>
                    <div className="mt-auto border-t border-gray-100 pt-5 dark:border-zinc-800">
                        <div className="h-7 w-28 rounded-full bg-gray-200 dark:bg-zinc-700" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('animate-pulse overflow-hidden', R, BORDER, BG)} aria-hidden="true">
            <div className="h-[195px] bg-gray-100 dark:bg-zinc-800 sm:h-[210px]" />
            <div className="flex flex-col gap-3 p-5">
                <div className="h-5 w-4/5 rounded-lg bg-gray-200 dark:bg-zinc-700" />
                <div className="space-y-2 pt-0.5">
                    <div className="h-3.5 w-full rounded bg-gray-100 dark:bg-zinc-800" />
                    <div className="h-3.5 w-5/6 rounded bg-gray-100 dark:bg-zinc-800" />
                    <div className="h-3.5 w-4/6 rounded bg-gray-100 dark:bg-zinc-800" />
                </div>
                <div className="mt-2 border-t border-gray-100 pt-4 dark:border-zinc-800">
                    <div className="h-7 w-24 rounded-full bg-gray-200 dark:bg-zinc-700" />
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HeroBlogCard — list = true
// ─────────────────────────────────────────────────────────────────────────────

function HeroBlogCard({ blog }: { blog: ViewBlog }) {
    const t = useTranslations('blogs');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const title = isAr ? blog.title_ar : blog.title_en;
    const description = isAr ? blog.description_ar : blog.description_en;

    const formattedDate = new Date(blog.created_at).toLocaleDateString(locale, {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <article className={cn(
            'group relative grid grid-cols-1 overflow-hidden md:grid-cols-2',
            R, BORDER, BG, SHADE, TRANS, HOVER
        )}>
            {/* ── Image (left half on md+) ── */}
            <Link
                href={`/blogs/${blog.slug}`}
                className="relative block min-h-[260px] overflow-hidden md:min-h-[400px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                aria-label={t('readBlog', { title })}
            >
                {/* Very soft top-left veil — editorial feel without blocking image */}
                <div
                    className="absolute inset-0 z-10 bg-gradient-to-br from-black/18 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
                    aria-hidden="true"
                />

                {/* Frosted "Featured" tag */}
                <span className={cn(
                    'absolute top-3.5 z-20 ltr:left-3.5 rtl:right-3.5',
                    'rounded-[8px] border border-white/20 bg-white/10 px-2.5 py-1',
                    'text-[10.5px] font-medium tracking-wider text-white backdrop-blur-[8px]'
                )}>
                    {t('featured')}
                </span>

                <Image
                    src={resolveUrl(blog.imagePath)}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="eager"
                    fetchPriority="high"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
            </Link>

            {/* ── Content (right half on md+) ── */}
            <div className="flex flex-col justify-center gap-5 px-7 py-8 md:px-9 md:py-10 lg:px-11">

                {/* Eyebrow */}
                <div className="flex items-center gap-2">
                    <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-secondary opacity-75" aria-hidden="true" />
                    <time
                        dateTime={new Date(blog.created_at).toISOString()}
                        className="text-[11px] font-medium uppercase tracking-[0.09em] text-gray-400"
                    >
                        {formattedDate}
                    </time>
                </div>

                {/* Title */}
                <Link
                    href={`/blogs/${blog.slug}`}
                    className={cn(
                        'font-serif text-2xl font-bold leading-[1.25] tracking-tight text-dark',
                        'transition-colors duration-300 hover:text-secondary',
                        'focus-visible:outline-none focus-visible:underline',
                        'md:text-[1.85rem] lg:text-[2rem]'
                    )}
                >
                    {title}
                </Link>

                {/* Description */}
                <div className="line-clamp-4 text-[0.875rem] leading-[1.75] text-gray-500 dark:text-gray-400 md:text-[0.9375rem]">
                    <RichTextRenderer content={description} className="prose prose-sm max-w-none" />
                </div>

                {/* Footer CTA */}
                <div className="mt-1 flex items-center border-t border-gray-100 pt-5 dark:border-white/[0.05]">
                    <Link
                        href={`/blogs/${blog.slug}`}
                        className={cn(
                            'group/cta inline-flex items-center gap-2.5',
                            'text-sm font-medium text-secondary',
                            'transition-all duration-300',
                            'focus-visible:outline-none focus-visible:underline'
                        )}
                        aria-label={t('readMore')}
                    >
                        {t('readMore')}
                        {/* Circle arrow — rotates 45° on hover */}
                        <span className={cn(
                            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                            'border border-secondary/35',
                            'transition-all duration-300',
                            'group-hover/cta:border-secondary group-hover/cta:bg-secondary group-hover/cta:text-white group-hover/cta:-rotate-45'
                        )}>
                            <ArrowIcon className="h-3 w-3" />
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// GridBlogCard — list = false
// ─────────────────────────────────────────────────────────────────────────────

function GridBlogCard({ blog }: { blog: ViewBlog }) {
    const t = useTranslations('blogs');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const title = isAr ? blog.title_ar : blog.title_en;
    const description = isAr ? blog.description_ar : blog.description_en;

    const formattedDate = new Date(blog.created_at).toLocaleDateString(locale, {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <article className={cn(
            'group flex w-full flex-col overflow-hidden',
            R, BORDER, BG, SHADE, TRANS, HOVER,
            'focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2'
        )}>
            {/* ── Image ── */}
            <Link
                href={`/blogs/${blog.slug}`}
                className="relative block h-[195px] flex-shrink-0 overflow-hidden focus-visible:outline-none sm:h-[210px]"
                aria-label={t('readBlog', { title })}
            >
                {/* Date badge — same border language as card: hairline, soft radius */}
                <div className={cn(
                    'absolute top-3 z-10 ltr:left-3 rtl:right-3',
                    'rounded-[8px] border border-white/25 bg-white/82 px-2.5 py-[5px] backdrop-blur-[5px]',
                    'transition-colors duration-300 group-hover:bg-white/94',
                    'dark:bg-black/40 dark:border-white/10'
                )}>
                    <time
                        dateTime={new Date(blog.created_at).toISOString()}
                        className="text-[10.5px] font-semibold leading-none tracking-wide text-secondary"
                    >
                        {formattedDate}
                    </time>
                </div>

                {/* Subtle bottom scrim — only appears on hover */}
                <div
                    className="absolute inset-0 z-[1] bg-gradient-to-t from-black/18 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                    aria-hidden="true"
                />

                <Image
                    src={resolveUrl(blog.imagePath)}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
            </Link>

            {/* ── Body ── */}
            <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">

                {/* Title */}
                <Link
                    href={`/blogs/${blog.slug}`}
                    className={cn(
                        'line-clamp-2 font-serif text-[1.0625rem] font-bold leading-snug text-dark',
                        'transition-colors duration-300 hover:text-secondary',
                        'focus-visible:outline-none focus-visible:underline'
                    )}
                >
                    {title}
                </Link>

                {/* Description */}
                <div className="line-clamp-3 text-[0.8125rem] leading-relaxed text-gray-500 dark:text-gray-400">
                    <RichTextRenderer content={description} className="prose prose-sm max-w-none" />
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center border-t border-gray-100 pt-3.5 dark:border-white/[0.05]">
                    <Link
                        href={`/blogs/${blog.slug}`}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full',
                            'border border-secondary/15 bg-secondary/[0.06] px-3.5 py-1.5',
                            'text-[11.5px] font-medium text-secondary',
                            'transition-all duration-250 hover:bg-secondary/[0.12] group-hover:gap-2.5',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1'
                        )}
                        aria-label={t('readMore')}
                    >
                        {t('readMore')}
                        <ArrowIcon className="h-[11px] w-[11px] flex-shrink-0 transition-transform duration-250 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// BlogCard — public dispatcher
// ─────────────────────────────────────────────────────────────────────────────

export function BlogCard({ blog, list = false }: BlogCardProps) {
    if (list) return <HeroBlogCard blog={blog} />;
    return <GridBlogCard blog={blog} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
    const t = useTranslations('blogs');
    return (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center" role="status" aria-live="polite">
            <div className="mb-5 rounded-full bg-gray-100 p-5 dark:bg-zinc-800">
                <MdArticle size={40} className="text-gray-400" aria-hidden="true" />
            </div>
            <h2 className="mb-1.5 text-lg font-semibold text-gray-700 dark:text-gray-300">
                {t('empty.title')}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
                {t('empty.description')}
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FetchMoreBlogs
// ─────────────────────────────────────────────────────────────────────────────

interface FetchMoreBlogsProps {
    recentId: string;
    InitailBlogs: ViewBlog[];
    initialCursor: string;
    initialHasMore: boolean;
}

function FetchMoreBlogs({ recentId, InitailBlogs, initialCursor, initialHasMore }: FetchMoreBlogsProps) {
    const t = useTranslations('blogs');

    const [blogs, setBlogs]     = useState<ViewBlog[]>(InitailBlogs || []);
    const [cursor, setCursor]   = useState<string>(initialCursor);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    const controllerRef = useRef<AbortController | null>(null);

    const fetchBlogs = useCallback(async () => {
        if (!hasMore) return;
        controllerRef.current?.abort();
        controllerRef.current = new AbortController();
        setLoading(true);
        try {
            const res = await api.get(
                `/blogs?${cursor ? `cursor=${cursor}&` : ''}limit=9`,
                { signal: controllerRef.current.signal }
            );
            const { items: fetchedBlogs, nextCursor, hasMore: serverHasMore } = res.data;
            setBlogs(prev => [...prev, ...fetchedBlogs]);
            setCursor(nextCursor || null);
            setHasMore(serverHasMore);
        } catch (err) {
            if ((err as any)?.name === 'CanceledError') return;
            console.error('Error fetching blogs:', err);
        } finally {
            setLoading(false);
        }
    }, [cursor, hasMore]);

    const filteredBlogs = useMemo(
        () => blogs.filter(blog => blog.id !== recentId),
        [blogs, recentId]
    );

    return (
        <section aria-label={t('recentBlogs')}>
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {loading && blogs.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => <BlogCardSkeleton key={i} />)
                    : filteredBlogs.map(blog => <BlogCard key={blog.id} blog={blog} />)
                }
            </div>

            {hasMore && (
                <div className="mt-10 flex justify-center">
                    <AnimatedSecondaryButton
                        large
                        position="end"
                        loading={loading}
                        showBall={false}
                        onClick={fetchBlogs}
                        aria-label={loading ? t('loadingMore') : t('loadMore')}
                    >
                        {loading ? t('loadingMore') : t('loadMore')}
                    </AnimatedSecondaryButton>
                </div>
            )}
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// RecentBlogs — page root
// ─────────────────────────────────────────────────────────────────────────────

export default function RecentBlogs({ slug }: { slug?: string }) {
    const t = useTranslations('blogs');

    const [recentBlog, setRecentBlog]         = useState<ViewBlog | null>(null);
    const [blogs, setBlogs]                   = useState<ViewBlog[]>([]);
    const [cursor, setCursor]                 = useState<string>('');
    const [hasMore, setHasMore]               = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setInitialLoading(true);
            try {
                const [recentRes, blogsRes] = await Promise.all([
                    slug ? api.get(`/blogs/${slug}`) : api.get('/blogs/recent'),
                    api.get('/blogs?limit=9'),
                ]);
                setRecentBlog(recentRes.data);
                setBlogs(blogsRes.data.items || []);
                setCursor(blogsRes.data.nextCursor || '');
                setHasMore(blogsRes.data.hasMore || false);
            } catch (err) {
                console.error('Error fetching blogs:', err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchInitialData();
    }, [slug]);

    // ── Loading ──
    if (initialLoading) {
        return (
            <div className="px-4 pb-20 sm:pb-28 lg:pb-36">
                <div className="container mx-auto max-w-7xl">
                    <PageHeader title={t('blogs')} />
                    <BlogCardSkeleton list />
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => <BlogCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    // ── Empty ──
    if (!recentBlog && blogs.length === 0) {
        return <EmptyState />;
    }

    return (
        <main className="px-3 pb-20 sm:pb-28 lg:pb-36">
            <div className="container pt-20 mx-auto">

                {/* <PageHeader title={t('blogs')} /> */}

                {recentBlog && <BlogCard blog={recentBlog} list />}

                <h2 className="mb-6 mt-12 text-3xl font-bold leading-tight text-secondary md:text-4xl lg:mt-16 lg:text-[2.6rem]">
                    {t('our')}{' '}
                    <span className="text-dark">{t('recentBlogs')}</span>
                </h2>

                {recentBlog && (
                    <FetchMoreBlogs
                        InitailBlogs={blogs}
                        initialCursor={cursor}
                        initialHasMore={hasMore}
                        recentId={recentBlog.id}
                    />
                )}

            </div>
        </main>
    );
}