"use client";

import { ReactNode, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FiPhoneCall, FiAlertCircle } from "react-icons/fi";
import { HiOutlineMailOpen } from "react-icons/hi";
import { LiaFaxSolid } from "react-icons/lia";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import api from "@/libs/axios";
import { phoneSchema } from "@/utils/validation";
import { useValues } from "@/contexts/GlobalContext";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Schema
───────────────────────────────────────────── */
const contactSchema = z.object({
  name: z.string().min(1, "required"),
  email: z.string().email("email").optional().or(z.literal("")),
  phone: phoneSchema,
  message: z.string().min(1, "required"),
  inquiry: z.string().min(1, "required"),
});
type ContactFormValues = z.infer<typeof contactSchema>;

/* ─────────────────────────────────────────────
   Lazy map
───────────────────────────────────────────── */
const LocationMap = dynamic(
  () => import("@/components/atoms/LocationMap"),
  { ssr: false }
);

/* ═════════════════════════════════════════════
   ContactSection (page-level)
═════════════════════════════════════════════ */
export default function ContactSection() {
  return (
    <section
      className="py-16 md:py-24 px-4" 
    >
      <div className="container max-w-7xl mx-auto">
        <div
          className="grid grid-cols-1 lg:grid-cols-2 rounded-[24px] overflow-hidden"
          style={{
            border: "0.5px solid rgba(75,61,37,0.14)",
            boxShadow: "0 24px 64px rgba(75,61,37,0.10)",
          }}
        >
          {/* Form side */}
          <div className="bg-white">
            <ContactForm />
          </div>

          {/* Map side */}
          <MapPanel />
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════
   ContactForm
═════════════════════════════════════════════ */
function ContactForm() {
  const t = useTranslations("contact.form");
  const { settings } = useValues();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "", inquiry: "" },
  });

  const onSubmit = async (data: ContactFormValues) => {
    const toastId = toast.loading(t("sending"));
    try {
      await api.post("/contact-us", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        inquiry: data.inquiry,
      });
      toast.success(t("success"), { id: toastId });
      reset();
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : t("error");

      toast.error(message, { id: toastId });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col h-full px-7 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14"
    >
      {/* Header */}
      <div className="mb-8">
        <span
          className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase mb-3"
          style={{ color: "var(--secondary)" }}
        >
          <span
            className="inline-block w-5 h-[2px] rounded-full"
            style={{ background: "var(--light)" }}
            aria-hidden="true"
          />
          {t("eyebrow")}
        </span>
        <h1
          className="font-bold text-[30px] sm:text-[38px] md: leading-[1.1] mb-2"
          style={{ color: "var(--primary)" }}
        >
          {t("getIn")}{" "}
          <span style={{ color: "var(--secondary)" }}>{t("touch")}</span>
        </h1>
        <p className="text-[13px] md: leading-relaxed" style={{ color: "var(--placeholder)" }}>
          {t("headerMessage")}
        </p>
      </div>

      {/* Fields — underline style */}
      <div className="flex flex-col gap-0 flex-1">
        <UnderlineInput
          id="name"
          label={t("name")}
          required
          error={errors.name?.message && t(`validation.${errors.name.message}`)}
          {...register("name")}
        />
        <UnderlineInput
          id="email"
          label={t("email")}
          type="email"
          error={errors.email?.message && t(`validation.${errors.email.message}`)}
          {...register("email")}
        />
        <UnderlineInput
          id="phone"
          label={t("phone")}
          required
          error={errors.phone?.message && t(`validation.${errors.phone.message}`)}
          {...register("phone")}
        />

        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <UnderlineSelect
              id="message"
              label={t("message.label")}
              options={[
                { value: "Friend Referral", label: t("message.options.friend_referral") },
                { value: "Social Media",    label: t("message.options.social_media") },
                { value: "Search Engine",   label: t("message.options.search_engine") },
                { value: "other",           label: t("message.options.other") },
              ]}
              value={field.value}
              onChange={field.onChange}
              placeholder={t("message.placeholder")}
              error={errors.message?.message && t(`validation.${errors.message.message}`)}
            />
          )}
        />

        <UnderlineTextarea
          id="inquiry"
          label={t("inquiry.label")}
          placeholder={t("inquiry.placeholder")}
          required
          error={errors.inquiry?.message && t(`validation.${errors.inquiry.message}`)}
          {...register("inquiry")}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "mt-8 w-full h-[50px] rounded-xl",
          "text-[13px] font-semibold tracking-[0.08em] uppercase",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "active:scale-[0.98]",
          isSubmitting && "opacity-60 cursor-not-allowed"
        )}
        style={{
          background: "var(--primary)",
          color: "var(--lighter)",
          boxShadow: "0 4px 16px rgba(75,61,37,0.22)",
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--primary)";
        }}
      >
        {isSubmitting ? t("sending") : t("send")}
      </button>

      {/* Contact info row */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8"
        style={{ borderTop: "1px solid var(--gray)" }}
      >
        <ContactInfoItem
          icon={<FiPhoneCall size={15} />}
          label={t("phone")}
          value={settings?.contactPhone || t("noData")}
        />
        <ContactInfoItem
          icon={<LiaFaxSolid size={15} />}
          label={t("fax")}
          value={settings?.fax || t("noData")}
        />
        <ContactInfoItem
          icon={<HiOutlineMailOpen size={15} />}
          label={t("email")}
          value={settings?.contactEmail || t("noData")}
        />
      </div>
    </form>
  );
}

/* ═════════════════════════════════════════════
   MapPanel
═════════════════════════════════════════════ */
function MapPanel() {
  const t = useTranslations("contact");
  const { settings, loadingSettings } = useValues();

  return (
    <div
      className="relative flex flex-col justify-end p-8 sm:p-10 lg:p-12 min-h-[400px] lg:min-h-0 overflow-hidden"
      style={{ background: "var(--primary)" }}
    >
      {/* Decorative circles */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -end-16 w-64 h-64 rounded-full"
        style={{ background: "rgba(192,178,131,0.07)" }}
      />
      <div
        aria-hidden="true"
        className="absolute top-8 end-8 w-32 h-32 rounded-full"
        style={{ background: "rgba(192,178,131,0.05)" }}
      />

      {/* Copy */}
      <div className="relative z-10 mb-6">
        <p
          className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-3"
          style={{ color: "rgba(192,178,131,0.65)" }}
        >
          {t("map.eyebrow")}
        </p>
        <h2
          className="font-bold text-[24px] sm:text-[28px] md: leading-[1.2] mb-3"
          style={{ color: "var(--lighter)" }}
        >
          {t("map.title")}
        </h2>
        <p
          className="text-[13px] md: leading-relaxed"
          style={{ color: "rgba(192,178,131,0.75)" }}
        >
          {t("map.subtitle")}
        </p>
      </div>

      {/* Map frame */}
      <div
        className="relative z-10 w-full rounded-[16px] overflow-hidden"
        style={{
          height: "clamp(180px, 40vh, 420px)",
          border: "1px solid rgba(192,178,131,0.18)",
          background: "rgba(255,255,255,0.05)",
        }}
      >
        {loadingSettings ? (
          <div
            className="w-full h-full animate-pulse"
            style={{ background: "rgba(192,178,131,0.08)" }}
          />
        ) : settings?.latitude && settings?.longitude ? (
          <LocationMap
            lat={settings.latitude}
            lng={settings.longitude}
            zoom={6}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p
              className="text-[13px]"
              style={{ color: "rgba(192,178,131,0.6)" }}
            >
              {t("nolocation")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   UnderlineInput
═════════════════════════════════════════════ */
interface UnderlineInputProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  [key: string]: unknown;
}

function UnderlineInput({
  id,
  label,
  type = "text",
  required = false,
  error,
  ...props
}: UnderlineInputProps) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "relative py-3 transition-all duration-200",
          "border-b",
          error
            ? "border-red-400"
            : "border-[rgba(75,61,37,0.15)] focus-within:border-[rgba(75,61,37,0.6)]"
        )}
      >
        {/* Micro label */}
        <label
          htmlFor={id}
          className="block text-[10px] font-semibold tracking-[0.1em] uppercase mb-[6px]"
          style={{ color: error ? "#ef4444" : "var(--light)" }}
        >
          {label}
          {required && (
            <span className="text-red-400 ms-0.5" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
        <input
          id={id}
          type={type}
          className="w-full bg-transparent border-none outline-none text-[14px] font-medium"
          style={{ color: "var(--primary)", caretColor: "var(--secondary)" }}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

interface UnderlineTextareaProps {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  [key: string]: unknown;
}

function UnderlineTextarea({
  id,
  label,
  placeholder,
  required = false,
  error,
  ...props
}: UnderlineTextareaProps) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "relative py-3 transition-all duration-200 border-b",
          error
            ? "border-red-400"
            : "border-[rgba(75,61,37,0.15)] focus-within:border-[rgba(75,61,37,0.6)]"
        )}
      >
        <label
          htmlFor={id}
          className="block text-[10px] font-semibold tracking-[0.1em] uppercase mb-[6px]"
          style={{ color: error ? "#ef4444" : "var(--light)" }}
        >
          {label}
          {required && (
            <span className="text-red-400 ms-0.5" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
        <textarea
          id={id}
          rows={4}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent border-none outline-none text-[14px] font-medium md: leading-relaxed placeholder:text-[var(--placeholder)]"
          style={{ color: "var(--primary)", caretColor: "var(--secondary)" }}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

/* ═════════════════════════════════════════════
   UnderlineSelect
═════════════════════════════════════════════ */
interface UnderlineSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}

function UnderlineSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "",
  error,
}: UnderlineSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (!next || !ref.current?.contains(next)) {
      setOpen(false);
    }
  };

  return (
    <div className="w-full relative" ref={ref} onBlur={handleBlur}>
      <div
        className={cn(
          "relative py-3 transition-all duration-200 border-b",
          error
            ? "border-red-400"
            : open
            ? "border-[rgba(75,61,37,0.6)]"
            : "border-[rgba(75,61,37,0.15)]"
        )}
      >
        <label
          htmlFor={id}
          className="block text-[10px] font-semibold tracking-[0.1em] uppercase mb-[6px]"
          style={{ color: error ? "#ef4444" : "var(--light)" }}
        >
          {label}
        </label>

        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between bg-transparent border-none outline-none cursor-pointer text-start"
        >
          <span
            className="text-[14px] font-medium"
            style={{ color: value ? "var(--primary)" : "var(--placeholder)" }}
          >
            {selectedLabel ?? placeholder}
          </span>

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "w-4 h-4 flex-shrink-0 ms-2 transition-transform duration-200",
              open && "rotate-180"
            )}
            style={{ color: "var(--light)" }}
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute start-0 end-0 top-full mt-2 rounded-xl overflow-hidden z-20"
            style={{
              background: "#fff",
              border: "0.5px solid rgba(75,61,37,0.14)",
              boxShadow: "0 12px 32px rgba(75,61,37,0.12)",
            }}
          >
            {options.map((opt) => {
              const selected = value === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="w-full text-start px-4 py-3 text-[13px] transition-colors duration-150"
                  style={{
                    color: selected ? "var(--primary)" : "var(--secondary-hover)",
                    background: selected ? "var(--lighter)" : "transparent",
                    fontWeight: selected ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <FieldError message={error} />
    </div>
  );
}

/* ═════════════════════════════════════════════
   ContactInfoItem
═════════════════════════════════════════════ */
function ContactInfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--lighter)", color: "var(--secondary)" }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-[2px]"
          style={{ color: "var(--light)" }}
        >
          {label}
        </p>
        <p
          className="text-[13px] font-medium truncate"
          style={{ color: "var(--primary)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   FieldError
═════════════════════════════════════════════ */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-[11px] font-medium animate-[shake_0.4s_ease-in-out]">
      <FiAlertCircle className="shrink-0 w-3.5 h-3.5" aria-hidden="true" />
      <span role="alert">{message}</span>
    </div>
  );
}

