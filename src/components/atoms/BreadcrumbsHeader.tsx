import { Link } from '@/i18n/navigation';
import { MdChevronRight } from 'react-icons/md';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbsHeaderProps {
  breadcrumbs: Breadcrumb[];
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export default function BreadcrumbsHeader({
  breadcrumbs,
  title,
  children,
  className,
}: BreadcrumbsHeaderProps) {
  return (
    <div className={cn('mb-8 flex flex-col gap-3', className)}>

      {/* ── Breadcrumbs + Actions ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        <nav
          aria-label="Breadcrumb"
          className="flex items-center flex-wrap gap-0.5"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={index} className="flex items-center gap-0.5">

                {/* Separator */}
                {index > 0 && (
                  <MdChevronRight
                    size={16}
                    className="text-[var(--dark)]/25 rtl:rotate-180 shrink-0 mx-0.5"
                    aria-hidden
                  />
                )}

                {/* Last / non-linked crumb */}
                {isLast || !item.href ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold select-none',
                      isLast
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'text-[var(--dark)]/50'
                    )}
                  >
                    {item.label}
                  </span>
                ) : (
                  /* Linked crumb */
                  <Link
                    href={item.href}
                    className="
                      px-2.5 py-1 rounded-lg
                      text-xs font-semibold
                      text-[var(--dark)]/55
                      hover:text-[var(--primary)]
                      hover:bg-[var(--primary)]/8
                      transition-colors duration-150
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--primary)]/40
                    "
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Actions slot */}
        {children && (
          <div className="flex items-center gap-2 flex-wrap">
            {children}
          </div>
        )}
      </div>

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Accent bar — logical side (start), flips automatically in RTL */}
        <span
          className="
            shrink-0
            self-stretch
            w-[3px] rounded-full
            bg-gradient-to-b from-[var(--secondary)] via-[var(--primary)] to-[var(--secondary)]
          "
          aria-hidden
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--dark)] leading-tight tracking-tight">
          {title}
        </h1>
      </div>

    </div>
  );
}