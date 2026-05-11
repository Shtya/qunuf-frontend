"use client";

/**
 * Settings.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-file: SettingsCard + Settings page.
 * Business logic: untouched. Design: complete premium overhaul. RTL-safe.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Link } from "@/i18n/navigation";
import { useDashboardHref } from "@/hooks/dashboard/useDashboardHref";
import { useTranslations } from "next-intl";
import { AiOutlineNotification } from "react-icons/ai";
import { MdPerson } from "react-icons/md";
import { IconType } from "react-icons";

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface SettingsCardProps {
  title: string;
  description: string;
  icon: IconType;
  href?: string;
}

export function SettingsCard({
  title,
  description,
  href,
  icon: Icon,
}: SettingsCardProps) {
  const content = (
    <div
      className="
        group
        flex flex-col gap-5
        p-5 md:p-6
        h-full
        rounded-2xl
        border border-[var(--gray)]
        bg-[var(--card-bg)]
        shadow-sm
        transition-all duration-200
        hover:shadow-md hover:border-[var(--secondary)]/40
        hover:-translate-y-0.5
        cursor-pointer
      "
    >
      {/* Icon container */}
      <div
        className="
          self-start
          flex items-center justify-center
          w-11 h-11
          rounded-xl
          bg-[var(--lighter)]
          border border-[var(--gray)]
          text-[var(--primary)]
          transition-colors duration-200
          group-hover:bg-[var(--primary)]/10
          group-hover:border-[var(--primary)]/20
        "
      >
        <Icon size={22} className="shrink-0" />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-[var(--dark)] leading-snug">
          {title}
        </h3>
        <p className="text-sm text-[var(--placeholder)] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      {href && (
        <div
          className="
            mt-auto self-end
            flex items-center justify-center
            w-7 h-7 rounded-full
            border border-[var(--gray)]
            text-[var(--placeholder)]
            transition-all duration-200
            group-hover:border-[var(--primary)]/30
            group-hover:text-[var(--primary)]
            group-hover:bg-[var(--primary)]/5
          "
          aria-hidden
        >
          {/* Logical arrow: points right in LTR, left in RTL */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 rounded-2xl">
      {content}
    </Link>
  ) : (
    content
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Settings() {
  const { getHref } = useDashboardHref();
  const t = useTranslations("dashboard.settings.root");

  const cards = [
    {
      key: "personalInfo",
      icon: MdPerson,
      href: getHref("account"),
    },
    {
      key: "notifications",
      icon: AiOutlineNotification,
      href: getHref("notifications"),
    },
    // {
    //   key: "payments",
    //   icon: MdOutlinePayments,
    //   href: getHref("payments"),
    // },
  ] as const;

  return (
    <div className="flex flex-col gap-8 px-1">
      {/* Page heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--dark)] leading-tight">
          {t("account")}
        </h1>
        <p className="text-sm text-[var(--placeholder)]">
          {t("accountSubtitle")}
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {cards.map(({ key, icon, href }) => (
          <SettingsCard
            key={key}
            title={t(`${key}.title`)}
            description={t(`${key}.description`)}
            icon={icon}
            href={href}
          />
        ))}
      </div>
    </div>
  );
}