'use client'

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/constants/user";
import { Link } from "@/i18n/navigation";
import { ReactNode } from "react";

// ─── PrimaryButton (inlined) ──────────────────────────────────────────────────
type PrimaryButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  ariaLabel?: string;
};

function PrimaryButton({
  children,
  className = "",
  onClick,
  href,
  type = "button",
  disabled,
  ariaLabel,
  ...props
}: PrimaryButtonProps) {
  const base = [
    "inline-flex items-center justify-center gap-2",
    "min-h-[44px] px-5 sm:px-7 py-2.5 sm:py-3",
    "rounded-full font-semibold text-sm sm:text-base",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    "disabled:opacity-50 disabled:pointer-events-none",
    "select-none",
  ].join(" ");

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={`${base} ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
export default function Features() {
  const t = useTranslations("homePage.features");
  const { role } = useAuth();

  const landlordHref =
    role === UserRole.LANDLORD
      ? "/dashboard/properties/add"
      : "/auth/sign-up?type=landlord";

  const contractHref =
    role === UserRole.LANDLORD
      ? "/dashboard/contracts"
      : "/auth/sign-up?type=landlord";

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 items-stretch">

          {/* ── 1. Hero text ─────────────────────────────────────────── */}
          <div className="flex flex-col justify-center gap-4 sm:gap-5 py-2 sm:py-4">
            <h2
              id="features-heading"
              className="
                text-3xl sm:text-4xl lg:text-5xl xl:text-[55px]
                font-bold text-dark leading-tight tracking-tight
              "
            >
              {t("mainTitle")}
            </h2>
            <p className="text-sm sm:text-base text-dark/70 leading-relaxed max-w-[520px]">
              {t("mainDescription")}
            </p>
          </div>

          {/* ── 2. Hero image ─────────────────────────────────────────── */}
          <div className="relative w-full h-[240px] sm:h-[280px] md:h-full min-h-[240px] rounded-2xl overflow-hidden group">
            <Image
              src="/home.png"
              alt={t("imageAlt")}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {/* overlay gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* ── 3. Card — Advertise your rental ───────────────────────── */}
          <FeatureCard
            bg="bg-secondary"
            title={t("card1.title")}
            description={t("card1.description")}
            buttonLabel={t("card1.button")}
            href={landlordHref}
            decoratorVariant="rings"
          />

          {/* ── 4. Card — 100% Online rental ──────────────────────────── */}
          <FeatureCard
            bg="bg-primary"
            title={t("card2.title")}
            description={t("card2.description")}
            buttonLabel={t("card2.button")}
            href={contractHref}
            decoratorVariant="dots"
          />

        </div>
      </div>
    </section>
  );
}

// ─── FeatureCard ──────────────────────────────────────────────────────────────
type FeatureCardProps = {
  bg: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  decoratorVariant: "rings" | "dots";
};

function FeatureCard({
  bg,
  title,
  description,
  buttonLabel,
  href,
  decoratorVariant,
}: FeatureCardProps) {
  return (
    <div
      className={`
        relative
        ${bg}
        flex flex-col items-center justify-center text-center
        gap-4 sm:gap-5
        p-6 sm:p-8 lg:p-10
        rounded-2xl
        min-h-[240px] sm:min-h-[280px]
        overflow-hidden
        transition-transform duration-300 hover:-translate-y-1
        group
      `}
    >
      {/* Decorative background element */}
      {decoratorVariant === "rings" ? (
        <RingsDecorator />
      ) : (
        <DotsDecorator />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 w-full">
        <h3 className="text-xl sm:text-2xl lg:text-[32px] text-white font-bold leading-snug max-w-[320px]">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-[380px]">
          {description}
        </p>
        <PrimaryButton
          href={href}
          className="
            text-dark bg-white
            hover:bg-white/90 active:scale-95
            shadow-md hover:shadow-lg
            mt-1
          "
        >
          {buttonLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─── Decorators ───────────────────────────────────────────────────────────────
function RingsDecorator() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* large ring bottom-end */}
      <div className="
        absolute -bottom-16 -end-16
        w-64 h-64 rounded-full
        border border-white/10
      "/>
      <div className="
        absolute -bottom-8 -end-8
        w-40 h-40 rounded-full
        border border-white/10
      "/>
      {/* small ring top-start */}
      <div className="
        absolute -top-10 -start-10
        w-36 h-36 rounded-full
        border border-white/10
      "/>
    </div>
  );
}

function DotsDecorator() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* dot grid pattern via repeating CSS */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* accent circle top-end */}
      <div className="
        absolute -top-12 -end-12
        w-48 h-48 rounded-full
        bg-white/5
      "/>
    </div>
  );
}