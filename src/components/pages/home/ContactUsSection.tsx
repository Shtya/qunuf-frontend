'use client'

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import api from "@/libs/axios";
import toast from "react-hot-toast";
import { useState, ReactNode } from "react";

// ─── PrimaryButton (inlined) ──────────────────────────────────────────────────
type PrimaryButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  ariaLabel?: string;
  ariaBusy?: boolean;
};

function PrimaryButton({
  children,
  className = "",
  onClick,
  href,
  type = "button",
  disabled,
  ariaLabel,
  ariaBusy,
  ...props
}: PrimaryButtonProps) {
  const base = [
    "inline-flex items-center justify-center gap-2",
    "min-h-[44px] px-5 sm:px-7 py-2.5 sm:py-3",
    "rounded-full font-semibold text-sm sm:text-base",
    "transition-all duration-200 select-none",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-primary/60 focus-visible:ring-offset-2",
    "disabled:opacity-60 disabled:pointer-events-none",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={`${base} ${className}`} {...props}>
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
      aria-busy={ariaBusy}
      className={`${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

// ─── ContactUsSection ─────────────────────────────────────────────────────────
export default function ContactUsSection() {
  const t = useTranslations("homePage.contactUs");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post("/blogs/subscribe", { email });
      toast.success(t("successMessage"));
      setEmail("");
    } catch (error: any) {
      console.error("Subscription error", error);
      toast.error(error?.response?.data?.message || t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden my-8 sm:my-12 lg:my-16"
      style={{
        background:
          "linear-gradient(135deg, var(--lighter) 0%, var(--light) 60%, var(--lighter) 100%)",
      }}
      aria-labelledby="contact-heading"
    >
      <div
        className="
          container mx-auto
          flex flex-col lg:flex-row
          items-center justify-between
          gap-0
          px-4 sm:px-6 lg:px-8
        "
      >
        {/* ── Text & Form ─────────────────────────────────────────────── */}
        <div
          className="
            flex-1
            flex flex-col
            gap-5 sm:gap-7
            py-10 sm:py-14 lg:py-20
            w-full
            max-w-xl
            lg:max-w-none
          "
        >
          {/* Eyebrow label */}
          <span
            className="
              inline-flex w-fit
              text-xs sm:text-sm font-semibold uppercase tracking-widest
              text-primary
              bg-primary/10
              px-3 py-1 rounded-full
            "
          >
            {t("eyebrow")}
          </span>

          {/* Heading */}
          <h2
            id="contact-heading"
            className="
              text-3xl sm:text-4xl lg:text-5xl xl:text-[52px]
              font-bold text-dark
              leading-tight tracking-tight
              max-w-[520px]
            "
          >
            {t("title")}
          </h2>

          {/* Description */}
          <p
            className="
              text-sm sm:text-base
              text-dark/70
              leading-relaxed
              max-w-[460px]
            "
          >
            {t("description")}
          </p>

          {/* Subscribe form */}
          <form
            onSubmit={handleSubscribe}
            noValidate
            className="w-full max-w-[500px]"
            aria-label={t("formAriaLabel")}
          >
            <div
              className="
                flex items-stretch
                bg-white
                rounded-full
                border border-transparent
                focus-within:border-primary
                shadow-sm hover:shadow-md
                transition-all duration-200
                overflow-hidden
                w-full
              "
            >
              <label htmlFor="subscribe-email" className="sr-only">
                {t("placeholder")}
              </label>
              <input
                id="subscribe-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className="
                  flex-1 min-w-0
                  bg-transparent
                  ps-5 pe-3 py-3 sm:py-4
                  text-sm sm:text-base text-dark
                  placeholder:text-dark/35
                  focus:outline-none
                  disabled:opacity-50
                "
                placeholder={t("placeholder")}
              />
              <PrimaryButton
                type="submit"
                disabled={loading}
                ariaBusy={loading}
                ariaLabel={loading ? t("loading") : t("button")}
                className="
                  bg-primary hover:bg-primary-hover active:scale-95
                  text-white font-bold
                  text-sm sm:text-base text-nowrap
                  rounded-full
                  my-1.5 me-1.5
                  px-5 sm:px-8
                  shrink-0
                "
              >
                {loading ? <Spinner /> : null}
                {loading ? t("loading") : t("button")}
              </PrimaryButton>
            </div>

            {/* Screen-reader live region for async feedback */}
            <div aria-live="polite" aria-atomic="true" className="sr-only" />
          </form>

          {/* Trust note */}
          <p className="text-xs text-dark/45 max-w-[360px] leading-relaxed">
            {t("privacyNote")}
          </p>
        </div>

        {/* ── Image ───────────────────────────────────────────────────── */}
        <div
          className="
            relative
            flex-1 self-stretch
            w-full
            min-h-[280px] sm:min-h-[360px] lg:min-h-[560px]
            lg:max-w-[48%]
            pointer-events-none
            select-none
          "
          aria-hidden="true"
        >
          {/* Fade into gradient on the start edge (desktop) */}
          <div
            className="
              hidden lg:block
              absolute inset-y-0 start-0 w-24 z-10
              bg-gradient-to-e from-[var(--lighter)] to-transparent
            "
          />

          <Image
            src="/contact-image.png"
            alt={t("imageAlt")}
            fill
            className="
              object-contain
              lg:object-cover lg:object-top
            "
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}