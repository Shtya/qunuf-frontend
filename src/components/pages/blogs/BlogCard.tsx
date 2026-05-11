// BlogCard.tsx — Drop-in replacement. Preserves all props and logic.
// Uses Playfair Display for titles (add to your next/font or Google Fonts import).

'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { resolveUrl } from '@/utils/upload';
import { useLocale, useTranslations } from 'next-intl';
import RichTextRenderer from '@/components/molecules/forms/editor/RichTextRenderer';
import { cn } from '@/lib/utils';

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

// ─── Arrow icon — flips automatically in RTL via rtl:rotate-180 ──────────────
function ArrowIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

// ─── Hero card (list = true) ─────────────────────────────────────────────────
function HeroBlogCard({ blog }: { blog: ViewBlog }) {
    const t = useTranslations('blogs');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const title = isAr ? blog.title_ar : blog.title_en;
    const description = isAr ? blog.description_ar : blog.description_en;

    const formattedDate = new Date(blog.created_at).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <article className="group relative grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 dark:bg-dark-card dark:border-white/10">

            {/* ── Left: Image ── */}
            <Link
                href={`/blogs/${blog.slug}`}
                className="relative block min-h-[280px] md:min-h-[420px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                aria-label={t('readBlog', { title })}
                tabIndex={0}
            >
                {/* Editorial diagonal veil */}
                <div
                    className="absolute inset-0 z-10 bg-gradient-to-br from-dark/50 via-dark/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-60"
                    aria-hidden="true"
                />

                {/* Featured pill */}
                <span className="absolute top-4 ltr:left-4 rtl:right-4 z-20 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md">
                    {t('featured')}
                </span>

                <Image
                    src={resolveUrl(blog.imagePath)}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="eager"
                    fetchPriority="high"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
            </Link>

            {/* ── Right: Content ── */}
            <div className="flex flex-col justify-center gap-5 px-7 py-8 md:px-10 md:py-12 lg:px-12">

                {/* Eyebrow row */}
                <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                    <time
                        dateTime={new Date(blog.created_at).toISOString()}
                        className="text-xs font-medium uppercase tracking-widest text-placeholder"
                    >
                        {formattedDate}
                    </time>
                </div>

                {/* Title — serif */}
                <Link
                    href={`/blogs/${blog.slug}`}
                    className="font-serif text-2xl font-bold leading-tight tracking-tight text-dark transition-colors duration-300 hover:text-secondary focus-visible:outline-none focus-visible:underline md:text-3xl lg:text-4xl"
                >
                    {title}
                </Link>

                {/* Description */}
                <div className="line-clamp-4 text-sm leading-relaxed text-grey-dark/70 md:text-base">
                    <RichTextRenderer content={description} className="prose prose-sm max-w-none" />
                </div>

                {/* Footer */}
                <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-5">
                    <Link
                        href={`/blogs/${blog.slug}`}
                        className={cn(
                            'group/cta inline-flex items-center gap-2.5 text-sm font-medium text-secondary',
                            'transition-all duration-300',
                            'focus-visible:outline-none focus-visible:underline'
                        )}
                        aria-label={t('readMore')}
                    >
                        {t('readMore')}
                        {/* Animated circle arrow */}
                        <span className={cn(
                            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                            'border-[1.5px] border-secondary text-secondary',
                            'transition-all duration-300',
                            'group-hover/cta:bg-secondary group-hover/cta:text-white',
                            'ltr:group-hover/cta:rotate-0 rtl:group-hover/cta:rotate-0',
                            'group-hover/cta:-rotate-45'
                        )}>
                            <ArrowIcon className="h-3.5 w-3.5 rtl:rotate-180" />
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
}

// ─── Grid card (list = false) ─────────────────────────────────────────────────
function GridBlogCard({ blog }: { blog: ViewBlog }) {
    const t = useTranslations('blogs');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const title = isAr ? blog.title_ar : blog.title_en;
    const description = isAr ? blog.description_ar : blog.description_en;

    const formattedDate = new Date(blog.created_at).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <article className={cn(
            'group flex w-full flex-col overflow-hidden rounded-2xl',
            'border border-border/50 bg-white dark:bg-dark-card dark:border-white/10',
            'transition-all duration-350',
            'hover:-translate-y-[3px] hover:border-border hover:shadow-xl hover:shadow-black/8',
            'focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2'
        )}>

            {/* ── Image ── */}
            <Link
                href={`/blogs/${blog.slug}`}
                className="relative block h-[200px] flex-shrink-0 overflow-hidden focus-visible:outline-none sm:h-[220px] lg:h-[240px]"
                aria-label={t('readBlog', { title })}
                tabIndex={0}
            >
                {/* Date badge */}
                <div className={cn(
                    'absolute top-3 z-10 ltr:left-3 rtl:right-3',
                    'rounded-[8px] border border-secondary/15 bg-white/92 px-2.5 py-1 backdrop-blur-sm',
                    'transition-transform duration-300 group-hover:scale-105'
                )}>
                    <time
                        dateTime={new Date(blog.created_at).toISOString()}
                        className="text-[11px] font-semibold tracking-wide text-secondary"
                    >
                        {formattedDate}
                    </time>
                </div>

                {/* Bottom gradient on hover */}
                <div
                    className="absolute inset-0 z-[1] bg-gradient-to-t from-dark/30 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                    aria-hidden="true"
                />

                <Image
                    src={resolveUrl(blog.imagePath)}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-600 group-hover:scale-[1.06]"
                />
            </Link>

            {/* ── Content ── */}
            <div className="flex flex-1 flex-col gap-2.5 p-5">

                {/* Title — serif */}
                <Link
                    href={`/blogs/${blog.slug}`}
                    className={cn(
                        'line-clamp-2 font-serif text-lg font-bold leading-snug text-dark',
                        'transition-colors duration-300 hover:text-secondary',
                        'focus-visible:outline-none focus-visible:underline'
                    )}
                >
                    {title}
                </Link>

                {/* Description */}
                <div className="line-clamp-3 text-sm leading-relaxed text-grey-dark/65">
                    <RichTextRenderer content={description} className="prose prose-sm max-w-none" />
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
                    <Link
                        href={`/blogs/${blog.slug}`}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full',
                            'border border-secondary/20 bg-secondary/8 px-3.5 py-1.5',
                            'text-xs font-medium text-secondary',
                            'transition-all duration-250 hover:bg-secondary/15 group-hover:gap-2.5',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1'
                        )}
                        aria-label={t('readMore')}
                    >
                        {t('readMore')}
                        <ArrowIcon className="h-3 w-3 flex-shrink-0 transition-transform duration-250 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

// ─── Public BlogCard ──────────────────────────────────────────────────────────
export default function BlogCard({ blog, list = false }: BlogCardProps) {
    if (list) return <HeroBlogCard blog={blog} />;
    return <GridBlogCard blog={blog} />;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function BlogCardSkeleton({ list = false }: { list?: boolean }) {
    if (list) {
        return (
            <div className="grid animate-pulse grid-cols-1 overflow-hidden rounded-2xl border border-border/50 md:grid-cols-2" aria-hidden="true">
                <div className="min-h-[280px] bg-gray-200 md:min-h-[420px]" />
                <div className="flex flex-col gap-5 p-8 md:p-12">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gray-200" />
                        <div className="h-3 w-28 rounded-full bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-6 w-4/5 rounded-lg bg-gray-200" />
                        <div className="h-6 w-3/5 rounded-lg bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-gray-100" />
                        <div className="h-4 w-5/6 rounded bg-gray-100" />
                        <div className="h-4 w-4/6 rounded bg-gray-100" />
                        <div className="h-4 w-3/6 rounded bg-gray-100" />
                    </div>
                    <div className="mt-auto border-t border-gray-100 pt-5">
                        <div className="h-8 w-28 rounded-full bg-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-pulse overflow-hidden rounded-2xl border border-border/50" aria-hidden="true">
            <div className="h-[220px] bg-gray-200" />
            <div className="flex flex-col gap-3 p-5">
                <div className="h-5 w-4/5 rounded-lg bg-gray-200" />
                <div className="h-4 w-3/5 rounded-lg bg-gray-200" />
                <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 w-full rounded bg-gray-100" />
                    <div className="h-3.5 w-5/6 rounded bg-gray-100" />
                    <div className="h-3.5 w-4/6 rounded bg-gray-100" />
                </div>
                <div className="mt-2 border-t border-gray-100 pt-4">
                    <div className="h-7 w-24 rounded-full bg-gray-200" />
                </div>
            </div>
        </div>
    );
}