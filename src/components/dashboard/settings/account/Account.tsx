"use client";
 
import { useAuth } from "@/contexts/AuthContext";
import { useValues } from "@/contexts/GlobalContext";
import { isWithinAdultRange } from "@/utils/date";
import { saudiPhoneRegex } from "@/utils/helpers";
import { resolveUrl } from "@/utils/upload";
import { cn } from "@/lib/utils";
import api from "@/libs/axios";
import { Link } from "@/i18n/navigation";
import { Option } from "@/components/molecules/forms/SelectInput";
import DateInput from "@/components/molecules/forms/DateInput";
import FormErrorMessage from "@/components/molecules/forms/FormErrorMessage";
import SelectField from "@/components/molecules/forms/SelectField";
import TextInput from "@/components/molecules/forms/TextInput";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { IdentityType } from "@/types/global";
import { User } from "@/types/dashboard/user";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import {
  ReactNode, 
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { MdCameraAlt, MdClose, MdEdit } from "react-icons/md";
import { z, ZodSchema } from "zod";
import { createPortal } from "react-dom";

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMA (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$#!%*?&])/;

export const userUpdateSchema = z
  .object({
    name: z.string().min(3, "validation.min3").max(100, "validation.max100").optional(),
    email: z.email(),
    phoneNumber: z.string().regex(saudiPhoneRegex, "validation.invalidPhone").optional(),
    birthDate: z
      .union([z.date(), z.undefined()])
      .refine((val) => val !== undefined, { message: "validation.required" })
      .refine((val) => isWithinAdultRange(val), { message: "validation.invalidBirthDate" }),
    identityType: z.string().min(1, "validation.required"),
    identityOtherType: z.string(),
    identityNumber: z
      .string()
      .min(3, "validation.min3")
      .max(20, "validation.max20")
      .regex(/^[a-zA-Z0-9]*$/, "validation.alphanumeric"),
    identityIssueCountryId: z.uuid().optional(),
    nationalityId: z.uuid().optional(),
    shortAddress: z
      .string()
      .length(8, "validation.shortAddressLength")
      .regex(/^[A-Z]{4}\d{4}$|^[0-9]{8}$/, "validation.shortAddressInvalid")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.identityType === IdentityType.OTHER) {
      if (!data.identityOtherType || data.identityOtherType.length < 1) {
        ctx.addIssue({ path: ["identityOtherType"], message: "validation.required", code: z.ZodIssueCode.custom });
        return;
      }
      if (data.identityOtherType.length < 3) {
        ctx.addIssue({ path: ["identityOtherType"], message: "validation.min3", code: z.ZodIssueCode.custom });
      }
    }
  });

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "validation.required"),
    newPassword: z
      .string()
      .min(8, "validation.min8")
      .max(20, "validation.max20")
      .regex(passwordRegex, "validation.invalidPassword"),
    confirmPassword: z.string().min(1, "validation.required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "validation.passwordsDoNotMatch",
    path: ["confirmPassword"],
  });

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DASHBOARD CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface DashboardCardProps {
  title?: string;
  linkLabel?: string;
  linkHref?: string;
  children?: ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  linkLabel,
  linkHref,
  children,
  className = "",
}: DashboardCardProps) {
  const hasHeader = title || (linkLabel && linkHref);

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden",
        "rounded-2xl bg-[var(--card-bg)]",
        "border border-[var(--gray)]/60",
        "shadow-sm",
        className
      )}
    >
      {/* Top accent line */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] z-10 bg-gradient-to-r from-[var(--secondary)]/0 via-[var(--secondary)] to-[var(--primary)]/0"
      />

      {/* Header */}
      {hasHeader && (
        <header className="relative z-10 shrink-0 flex items-center justify-between gap-3 px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-[var(--gray)]/40">
          {title && (
            <h3 className="min-w-0 flex-1 text-start font-bold text-lg md:text-xl text-[var(--dark)] leading-snug tracking-tight line-clamp-1">
              {title}
            </h3>
          )}
          {linkLabel && linkHref && (
            <Link
              href={linkHref}
              className="group/link shrink-0 inline-flex items-center gap-1.5 py-1 px-0.5 -my-1 text-sm font-semibold text-[var(--secondary)] hover:text-[var(--primary)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 rounded"
            >
              <span>{linkLabel}</span>
              <svg
                aria-hidden
                className="w-4 h-4 shrink-0 rtl:rotate-180 transition-transform duration-200 group-hover/link:translate-x-0.5 rtl:group-hover/link:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </header>
      )}

      {/* Body */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 md:px-6 py-4 md:py-5">
        {children}
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. POPUP
// ═══════════════════════════════════════════════════════════════════════════════

interface PopupProps {
  children: ReactNode;
  onClose?: () => void;
  show: boolean;
  className?: string;
  headerContent?: ReactNode;
}

export function Popup({
  children,
  onClose,
  show,
  className,
  headerContent,
}: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [show]);

  if (typeof document === "undefined" || !children) return null;

  return createPortal(
    <div
      data-popup
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm",
        "transition-all duration-200",
        show ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}
    >
      <div
        ref={popupRef}
        className={cn(
          "relative w-full md:min-w-[480px] max-w-fit",
          "bg-[var(--card-bg)] rounded-2xl",
          "shadow-2xl border border-[var(--gray)]/60",
          "transition-all duration-200",
          show ? "scale-100 translate-y-0" : "scale-95 translate-y-3",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--gray)]/40">
          <div className="flex-1 text-sm font-bold text-[var(--dark)]">
            {headerContent}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="ms-3 flex items-center justify-center w-8 h-8 rounded-full text-[var(--placeholder)] hover:text-[var(--dark)] hover:bg-[var(--lighter)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
            >
              <MdClose className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5   max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. POPUP ACTION BUTTONS (inline — previously a separate file)
// ═══════════════════════════════════════════════════════════════════════════════

interface PopupActionButtonsProps {
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  updateText?: string;
}

function PopupActionButtons({
  onCancel,
  isLoading,
  disabled,
  updateText,
}: PopupActionButtonsProps) {
  const t = useTranslations("dashboard.account");

  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--dark)]/70 hover:bg-[var(--lighter)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gray)] disabled:opacity-50"
      >
        {t("cancel")}
      </button>
      <button
        type="submit"
        disabled={disabled || isLoading}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--primary)] hover:opacity-90 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm"
      >
        {isLoading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {updateText ?? t("save")}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. EDITABLE FIELD
// ═══════════════════════════════════════════════════════════════════════════════

interface EditableFieldProps {
  label: string;
  valueDisplay?: string | ReactNode;
  popupClassName?: string;
  renderPopup: (close: () => void) => ReactNode;
  className?: string;
}

export function EditableField({
  label,
  valueDisplay,
  popupClassName,
  renderPopup,
  className,
}: EditableFieldProps) {
  const [showPopup, setShowPopup] = useState(false);
  const t = useTranslations("dashboard.account");

  return (
    <div
      className={cn(
        "group/row relative py-4 border-b border-[var(--gray)]/30 last:border-0",
        "transition-colors duration-150",
        className
      )}
    >
      {/* Row layout */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: label + value */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="text-xs font-semibold text-[var(--placeholder)] uppercase tracking-wide leading-none">
            {label}
          </span>
          <div className="text-sm font-medium text-[var(--dark)] mt-1 leading-snug break-words">
            {valueDisplay || (
              <span className="text-[var(--placeholder)] italic font-normal text-xs">
                {t("notProvided")}
              </span>
            )}
          </div>
        </div>

        {/* Right: edit button — always visible on mobile, hover-reveal on md+ */}
        <button
          onClick={() => setShowPopup(true)}
          aria-label={`${t("edit")} ${label}`}
          className={cn(
            "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
            "text-xs font-semibold transition-all duration-150",
            "bg-[var(--lighter)] text-[var(--dark)]/60 border border-[var(--gray)]/60",
            "hover:bg-[var(--secondary)] hover:text-white hover:border-[var(--secondary)]",
            "active:scale-95",
            // On desktop: hide until row is hovered
            "md:opacity-0 md:group-hover/row:opacity-100",
            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
          )}
        >
          <MdEdit size={14} />
          <span className="hidden sm:inline">{t("edit")}</span>
        </button>
      </div>

      {/* Popup */}
      <Popup
        show={showPopup}
        className={popupClassName}
        onClose={() => setShowPopup(false)}
        headerContent={
          <span className="text-sm font-bold text-[var(--dark)]">{label}</span>
        }
      >
        {renderPopup(() => setShowPopup(false))}
      </Popup>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. USER IMAGE UPDATER
// ═══════════════════════════════════════════════════════════════════════════════

export function UserImageUpdater() {
  const t = useTranslations("dashboard.account");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setCurrentUser } = useAuth();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("messages.invalidFileType"));
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    setImageUploading(true);
    const toastId = toast.loading(t("messages.uploadingImage"));
    try {
      const res = await api.post("/users/profile-image", formData);
      toast.success(t("messages.imageUpdated"), { id: toastId });
      setCurrentUser({ ...user, imagePath: res.data.imagePath });
    } catch (error: any) {
      toast.error(t("messages.updateError"), { id: toastId });
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initials = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex flex-col items-center pb-6 mb-5 border-b border-[var(--gray)]/30">
      <div className="relative group/avatar mb-4">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
        />

        {/* Avatar ring */}
        <div
          className={cn(
            "relative h-28 w-28 sm:h-36 sm:w-36 rounded-full overflow-hidden",
            "ring-[3px] ring-[var(--gray)]/60",
            "shadow-md",
            "group-hover/avatar:ring-[var(--primary)]/40 group-hover/avatar:ring-4",
            "transition-all duration-300"
          )}
        >
          {user?.imagePath ? (
            <Image
              src={resolveUrl(user.imagePath) || "/users/default-user.png"}
              alt={user.name}
              fill
              className={cn(
                "object-cover transition-all duration-300",
                imageUploading
                  ? "opacity-40 scale-105 blur-sm"
                  : "opacity-100 scale-100 group-hover/avatar:scale-105"
              )}
              sizes="(max-width: 640px) 112px, 144px"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--secondary)]/20 to-[var(--primary)]/20 flex items-center justify-center text-[var(--secondary)] text-4xl font-bold">
              {initials}
            </div>
          )}

          {/* Hover overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent",
              "flex items-end justify-center pb-3",
              "opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300",
              imageUploading && "opacity-0 pointer-events-none"
            )}
          >
            <span className="text-white text-xs font-semibold">
              {t("changeImage")}
            </span>
          </div>

          {/* Upload spinner */}
          {imageUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="w-10 h-10 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
            </div>
          )}
        </div>

        {/* Camera button */}
        <button
          type="button"
          onClick={() => !imageUploading && fileInputRef.current?.click()}
          disabled={imageUploading}
          title={t("changeImage")}
          aria-label={t("changeImage")}
          className={cn(
            "absolute bottom-1 end-1",
            "w-9 h-9 rounded-full flex items-center justify-center",
            "bg-[var(--primary)] text-white",
            "shadow-md hover:shadow-lg",
            "hover:opacity-90 active:scale-95",
            "transition-all duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
          )}
        >
          <MdCameraAlt className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* User info */}
      <div className="text-center flex flex-col gap-0.5">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--dark)]">
          {user?.name}
        </h2>
        <p className="text-sm text-[var(--placeholder)] font-medium">
          {user?.email}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. POPUP FORMS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Name ──────────────────────────────────────────────────────────────────────
interface NamePopupProps {
  value?: string;
  error?: string;
  isLoading: boolean;
  onSave: (val: string) => void;
  close: () => void;
}

export function NamePopupDefault({
  value = "",
  isLoading,
  error,
  onSave,
  close,
}: NamePopupProps) {
  const t = useTranslations("dashboard.account");
  const [name, setName] = useState(value);
  useEffect(() => { setName(value); }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isLoading || !name.trim()) return;
        onSave(name.trim());
      }}
      className="space-y-5"
    >
      <TextInput
        type="text"
        label={t("fullName")}
        placeholder={t("placeholders.name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error ? t(error) : ""}
      />
      <PopupActionButtons onCancel={close} isLoading={isLoading} disabled={!name.trim()} />
    </form>
  );
}

// ── Phone ─────────────────────────────────────────────────────────────────────
interface PhonePopupProps {
  value?: string;
  error?: string;
  isLoading: boolean;
  onSave: (val: string) => void;
  close: () => void;
}

export function PhonePopupDefault({
  value = "",
  onSave,
  close,
  error,
  isLoading,
}: PhonePopupProps) {
  const t = useTranslations("dashboard.account");
  const [phone, setPhone] = useState(value);
  useEffect(() => { setPhone(value); }, [value]);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(phone.trim()); }}
      className="space-y-5"
    >
      <TextInput
        type="text"
        label={t("phone")}
        placeholder={t("placeholders.phoneNumber")}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={error ? t(error) : ""}
      />
      <PopupActionButtons onCancel={close} isLoading={isLoading} disabled={!phone?.trim()} />
    </form>
  );
}

// ── Nationality ───────────────────────────────────────────────────────────────
interface NationalityPopupProps {
  value?: string | null;
  error?: string;
  isLoading: boolean;
  onSave: (countryId: string) => void;
  close: () => void;
}

export function NationalityPopup({
  value,
  error,
  isLoading,
  onSave,
  close,
}: NationalityPopupProps) {
  const t = useTranslations("dashboard.account");
  const locale = useLocale();
  const { countries, loadingCountries } = useValues();

  const options: Option[] = useMemo(
    () => countries.map((c) => ({ value: c.id, label: locale === "ar" ? c.name_ar : c.name })),
    [countries, locale]
  );
  const selectedOption = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);
  const [selected, setSelected] = useState<Option | null>(selectedOption);
  useEffect(() => { setSelected(selectedOption); }, [selectedOption]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!selected) return;
        onSave(selected.value.toString());
      }}
      className="space-y-5"
    >
      <SelectField
        label={t("nationality")}
        dropdownClassName="!max-h-[300px]"
        options={options}
        value={selected}
        onChange={setSelected}
        placeholder={loadingCountries ? t("loading") : t("selectNationality")}
        className="w-full"
      />
      <FormErrorMessage message={error ? t(error) : ""} />
      <PopupActionButtons onCancel={close} isLoading={isLoading} />
    </form>
  );
}

// ── Birth Date ────────────────────────────────────────────────────────────────
interface BirthDatePopupProps {
  value?: string | null;
  error?: string;
  isLoading: boolean;
  onSave: (value: Date | null) => void;
  close: () => void;
}

export function BirthDatePopup({
  value,
  error,
  isLoading,
  onSave,
  close,
}: BirthDatePopupProps) {
  const t = useTranslations("dashboard.account");
  const [birthDate, setBirthDate] = useState(value ? new Date(value) : undefined);
  useEffect(() => { setBirthDate(value ? new Date(value) : undefined); }, [value]);

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().split("T")[0];
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString().split("T")[0];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(birthDate ? new Date(birthDate) : undefined);
      }}
      className="space-y-5"
    >
      <DateInput
        minDate={minDate}
        maxDate={maxDate}
        label={t("birthDate")}
        placeholder={t("placeholders.birthDate")}
        value={birthDate}
        onChange={(dates) => setBirthDate(dates[0] ? dates[0] : undefined)}
        error={error ? t(error) : ""}
      />
      <PopupActionButtons onCancel={close} isLoading={isLoading} />
    </form>
  );
}

// ── Identity ──────────────────────────────────────────────────────────────────
interface IdentityPopupProps {
  user: User;
  onSave: (form: any) => void;
  errors: Record<string, string>;
  close: () => void;
  isLoading: boolean;
}

export function IdentityPopup({
  user,
  onSave,
  close,
  isLoading,
  errors,
}: IdentityPopupProps) {
  const t = useTranslations("dashboard.account");
  const locale = useLocale();
  const { countries, loadingCountries } = useValues();

  const [form, setForm] = useState({
    identityType: user?.identityType || "national_id",
    identityNumber: user?.identityNumber || "",
    identityIssueCountryId: user?.identityIssueCountry?.id || "",
    identityOtherType: user?.identityOtherType || "",
  });

  const countryOptions: Option[] = useMemo(
    () => countries.map((c) => ({ value: c.id, label: locale === "ar" ? c.name_ar : c.name })),
    [countries, locale]
  );

  const identityOptions: Option[] = useMemo(
    () => [
      { label: t(`identityTypeGroup.${IdentityType.NATIONAL_ID}`), value: IdentityType.NATIONAL_ID },
      { label: t(`identityTypeGroup.${IdentityType.RESIDENCY}`), value: IdentityType.RESIDENCY },
      { label: t(`identityTypeGroup.${IdentityType.PREMIUM_RESIDENCY}`), value: IdentityType.PREMIUM_RESIDENCY },
      { label: t(`identityTypeGroup.${IdentityType.GCC_ID}`), value: IdentityType.GCC_ID },
      { label: t(`identityTypeGroup.${IdentityType.PASSPORT}`), value: IdentityType.PASSPORT },
      { label: t(`identityTypeGroup.${IdentityType.OTHER}`), value: IdentityType.OTHER },
    ],
    [countries, locale]
  );

  const selectedIssueCountry = useMemo(
    () => countryOptions.find((o) => o.value === form.identityIssueCountryId) ?? null,
    [countryOptions, form.identityIssueCountryId]
  );

  useEffect(() => {
    setForm({
      identityType: user?.identityType || "national_id",
      identityNumber: user?.identityNumber || "",
      identityIssueCountryId: user?.identityIssueCountry?.id || "",
      identityOtherType: user?.identityOtherType || "",
    });
  }, [user]);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (isLoading) return; onSave(form); }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label={t("identityType")}
          placeholder={t("placeholders.identityType")}
          options={identityOptions}
          value={identityOptions.find((o) => o.value === form.identityType)}
          onChange={(opt) => setForm({ ...form, identityType: opt.value.toString() })}
        />
        <FormErrorMessage message={errors.identityType ? t(errors.identityType) : ""} />
        <TextInput
          error={errors.identityNumber ? t(errors.identityNumber) : ""}
          type="text"
          label={t("identityNumber")}
          placeholder={t("placeholders.identityType")}
          value={form.identityNumber}
          onChange={(e) => setForm({ ...form, identityNumber: e.target.value })}
        />
      </div>

      {form.identityType === IdentityType.OTHER && (
        <TextInput
          error={errors.identityOtherType ? t(errors.identityOtherType) : ""}
          type="text"
          label={t("identityOtherType")}
          placeholder={t("placeholders.identityOtherType")}
          value={form.identityOtherType}
          onChange={(e) => setForm({ ...form, identityOtherType: e.target.value })}
        />
      )}

      <SelectField
        label={t("identityIssueCountry")}
        dropdownClassName="!max-h-[300px]"
        options={countryOptions}
        value={selectedIssueCountry}
        placeholder={loadingCountries ? t("loading") : t("selectNationality")}
        onChange={(opt) => setForm({ ...form, identityIssueCountryId: opt.value.toString() })}
      />
      <FormErrorMessage message={errors.identityIssueCountry ? t(errors.identityIssueCountry) : ""} />
      <PopupActionButtons onCancel={close} isLoading={isLoading} />
    </form>
  );
}

// ── Short Address ─────────────────────────────────────────────────────────────
interface ShortAddressPopupProps {
  initialData: string;
  errors: Record<string, string>;
  onSave: (val: string) => void;
  close: () => void;
  isLoading: boolean;
}

export function ShortAddressPopup({
  initialData,
  onSave,
  close,
  isLoading,
  errors,
}: ShortAddressPopupProps) {
  const t = useTranslations("dashboard.account");
  const [shortAddress, setShortAddress] = useState(initialData || "");

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (isLoading) return; onSave(shortAddress); }}
      className="space-y-4 min-w-[300px]"
    >
      <TextInput
        error={errors.shortAddress ? t(errors.shortAddress) : ""}
        type="text"
        label={t("shortAddress")}
        placeholder="e.g. RRRR1234"
        value={shortAddress}
        onChange={(e) => setShortAddress(e.target.value.toUpperCase())}
      />
      <PopupActionButtons onCancel={close} isLoading={isLoading} />
    </form>
  );
}

// ── Password ──────────────────────────────────────────────────────────────────
interface PasswordPopupProps {
  close: () => void;
}

export function PasswordPopup({ close }: PasswordPopupProps) {
  const t = useTranslations("dashboard.account");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = passwordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading(t("messages.updating"));
    try {
      await api.put("/auth/change-password", {
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success(t("messages.passwordUpdated"), { id: toastId });
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      close();
    } catch {
      toast.error(t("messages.updateError"), { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        type="password"
        label={t("oldPassword")}
        placeholder={t("placeholders.oldPassword")}
        value={formData.oldPassword}
        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
        error={errors.oldPassword && t(errors.oldPassword)}
      />
      <TextInput
        type="password"
        label={t("newPassword")}
        placeholder={t("placeholders.newPassword")}
        value={formData.newPassword}
        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
        error={errors.newPassword && t(errors.newPassword)}
      />
      <TextInput
        type="password"
        label={t("confirmPassword")}
        placeholder={t("placeholders.confirmPassword")}
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        error={errors.confirmPassword && t(errors.confirmPassword)}
      />
      <PopupActionButtons onCancel={close} isLoading={isLoading} />
    </form>
  );
}

// ── Email ─────────────────────────────────────────────────────────────────────
interface EmailPopupProps {
  value?: string;
  close: () => void;
  onSuccess?: () => void;
}

export function EmailPopup({ value = "", close, onSuccess }: EmailPopupProps) {
  const t = useTranslations("dashboard.account");
  const [email, setEmail] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { user, setCurrentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailSchema = z.email("validation.invalidEmail");
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setError(validation.error.issues?.[0].message);
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading(t("messages.updating"));
    try {
      await api.post("/auth/request-email-change", { newEmail: email });
      setCurrentUser({ ...user, pendingEmail: email });
      toast.success(t("messages.checkEmailForLink"), { id: toastId });
      onSuccess?.();
      close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("messages.updateError"), { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextInput
        type="email"
        label={t("newEmail")}
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
        error={error ? t(error) : undefined}
        placeholder="example@mail.com"
      />
      <PopupActionButtons
        onCancel={close}
        isLoading={isLoading}
        disabled={!email || isLoading}
        updateText={t("sendLink")}
      />
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. PENDING EMAIL FIELD
// ═══════════════════════════════════════════════════════════════════════════════

interface PendingEmailFieldProps {
  user: any;
  resendEmail: () => void;
  cancelEmailChange: () => void;
  resendLoading: boolean;
  cancelLoading: boolean;
  cooldown: number;
}

function PendingEmailField({
  user,
  resendEmail,
  cancelEmailChange,
  resendLoading,
  cancelLoading,
  cooldown,
}: PendingEmailFieldProps) {
  const t = useTranslations("dashboard.account");

  return (
    <div className="relative py-4 border-b border-[var(--gray)]/30">
      <div className="flex flex-col gap-3">
        {/* Label + badge */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs font-semibold text-[var(--placeholder)] uppercase tracking-wide">
            {t("email")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full">
            <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {t("pendingVerification")}
          </span>
        </div>

        {/* Current + pending email */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-[var(--dark)]">{user.email}</p>
          <p className="text-xs text-[var(--placeholder)] flex items-center gap-1.5 flex-wrap">
            <svg className="w-3.5 h-3.5 text-[var(--secondary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>
              {t("verificationSentTo")}:
              <span className="font-semibold text-[var(--secondary)] ms-1">{user.pendingEmail}</span>
            </span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={resendEmail}
            disabled={resendLoading || cooldown > 0}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40",
              cooldown > 0
                ? "bg-[var(--lighter)] text-[var(--placeholder)] cursor-not-allowed"
                : "bg-[var(--secondary)]/10 text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white active:scale-95"
            )}
          >
            {resendLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {resendLoading ? t("sending") : cooldown > 0 ? `${t("resend")} (${cooldown}s)` : t("resend")}
          </button>

          <button
            onClick={cancelEmailChange}
            disabled={cancelLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
          >
            {cancelLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. ACCOUNT SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

function AccountSkeleton() {
  return (
    <DashboardCard className="animate-pulse">
      {/* Avatar */}
      <div className="flex flex-col items-center pb-6 mb-5 border-b border-[var(--gray)]/30">
        <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-[var(--gray)] mb-4" />
        <div className="h-5 bg-[var(--gray)] rounded-full w-40 mb-2" />
        <div className="h-3.5 bg-[var(--lighter)] rounded-full w-52" />
      </div>
      {/* Field rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="py-4 border-b border-[var(--gray)]/30 last:border-0 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-2.5 bg-[var(--lighter)] rounded-full w-20" />
            <div className="h-4 bg-[var(--gray)] rounded-full w-1/2" />
          </div>
          <div className="h-8 w-16 bg-[var(--lighter)] rounded-lg shrink-0" />
        </div>
      ))}
    </DashboardCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ACCOUNT PAGE (root)
// ═══════════════════════════════════════════════════════════════════════════════

export default function Account() {
  const t = useTranslations("dashboard.account");
  const locale = useLocale();
  const isAr = locale === "ar";
  const { user, setCurrentUser, loadingUser } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);

  // Email cooldown
  const [resendLoading, setResendLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [cooldown]);

  const startResendCooldown = () => setCooldown(30);

  async function resendEmail() {
    try {
      setResendLoading(true);
      await api.post("/auth/resend-email-confirmation");
      toast.success(t("messages.emailResent"));
      startResendCooldown();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("messages.failedToResend"));
    } finally {
      setResendLoading(false);
    }
  }

  async function cancelEmailChange() {
    try {
      setCancelLoading(true);
      await api.post("/auth/cancel-email-change");
      if (user) setCurrentUser({ ...user, pendingEmail: null });
      toast.success(t("messages.changeCanceled"));
    } catch {
      toast.error(t("messages.failedToCancel"));
    } finally {
      setCancelLoading(false);
    }
  }

  const handleUpdate = async (
    payload: any,
    onClose: () => void,
    schema: ZodSchema = userUpdateSchema
  ) => {
    setErrors({});
    const result = schema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setUpdating(true);
    const toastId = toast.loading(t("messages.updating"));
    try {
      const res = await api.put("/users/profile", payload);
      toast.success(t("messages.updateSuccess"), { id: toastId });
      setCurrentUser(res.data);
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("messages.updateError"), { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const identityInfo = useMemo(() => {
    if (!user) return "";
    const typeValue =
      user.identityType === IdentityType.OTHER && user.identityOtherType
        ? user.identityOtherType
        : user.identityType
        ? t(`identityTypeGroup.${user.identityType}`)
        : "";
    const maskedNumber = user.identityNumber
      ? `${user.identityNumber.slice(0, 2)}******${user.identityNumber.slice(-2)}`
      : "";
    const countryValue = user?.identityIssueCountry
      ? `${isAr ? user.identityIssueCountry?.name_ar : user.identityIssueCountry?.name}`.trim()
      : "";
    return [
      typeValue ? `${t("typeLabel")}: ${typeValue}` : null,
      maskedNumber ? `${t("idNumberLabel")}: ${maskedNumber}` : null,
      countryValue ? `${t("issueCountryLabel")}: ${countryValue}` : null,
    ]
      .filter(Boolean)
      .join(" • ");
  }, [user, isAr, t]);

  if (loadingUser) return <AccountSkeleton />;

  return (
    <DashboardCard>
      <UserImageUpdater />

      {/* Full Name */}
      <EditableField
        label={t("fullName")}
        valueDisplay={user?.name}
        renderPopup={(close) => (
          <NamePopupDefault
            value={user?.name}
            isLoading={updating}
            error={errors.name}
            onSave={(val) =>
              handleUpdate({ name: val }, close, z.object({ name: userUpdateSchema.shape.name }))
            }
            close={close}
          />
        )}
      />

      {/* Email / Pending Email */}
      {user?.pendingEmail ? (
        <PendingEmailField
          user={user}
          resendEmail={resendEmail}
          cancelEmailChange={cancelEmailChange}
          resendLoading={resendLoading}
          cancelLoading={cancelLoading}
          cooldown={cooldown}
        />
      ) : (
        <EditableField
          label={t("email")}
          valueDisplay={user?.email}
          renderPopup={(close) => (
            <EmailPopup value={user?.email} close={close} onSuccess={startResendCooldown} />
          )}
        />
      )}

      {/* Password */}
      <EditableField
        label={t("password")}
        valueDisplay="••••••••"
        renderPopup={(close) => <PasswordPopup close={close} />}
      />

      {/* Phone */}
      <EditableField
        label={t("phone")}
        valueDisplay={user?.phoneNumber}
        renderPopup={(close) => (
          <PhonePopupDefault
            value={user?.phoneNumber}
            isLoading={updating}
            error={errors.phoneNumber}
            onSave={(val) =>
              handleUpdate(
                { phoneNumber: val },
                close,
                z.object({ phoneNumber: userUpdateSchema.shape.phoneNumber })
              )
            }
            close={close}
          />
        )}
      />

      {/* Birth Date */}
      <EditableField
        label={t("birthDate")}
        popupClassName="popup-visable"
        valueDisplay={user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : ""}
        renderPopup={(close) => (
          <BirthDatePopup
            value={user?.birthDate}
            isLoading={updating}
            error={errors.birthDate}
            onSave={(val) =>
              handleUpdate(
                { birthDate: val },
                close,
                z.object({ birthDate: userUpdateSchema.shape.birthDate })
              )
            }
            close={close}
          />
        )}
      />

      {/* Nationality */}
      <EditableField
        label={t("nationality")}
        popupClassName="popup-visable"
        valueDisplay={isAr ? user?.nationality?.name_ar : user?.nationality?.name}
        renderPopup={(close) => (
          <NationalityPopup
            value={isAr ? user?.nationality?.name_ar : user?.nationality?.name}
            isLoading={updating}
            error={errors.nationalityId}
            onSave={(val) =>
              handleUpdate(
                { nationalityId: val },
                close,
                z.object({ nationalityId: userUpdateSchema.shape.nationalityId })
              )
            }
            close={close}
          />
        )}
      />

      {/* Short Address */}
      <EditableField
        label={t("shortAddress")}
        valueDisplay={user?.shortAddress}
        renderPopup={(close) => (
          <ShortAddressPopup
            errors={errors}
            initialData={user?.shortAddress || ""}
            isLoading={updating}
            onSave={(data) =>
              handleUpdate(
                { shortAddress: data },
                close,
                z.object({ shortAddress: userUpdateSchema.shape.shortAddress })
              )
            }
            close={close}
          />
        )}
      />

      {/* Identity */}
      <EditableField
        label={t("identityInfo")}
        popupClassName="popup-visable"
        valueDisplay={`${identityInfo}`}
        renderPopup={(close) => (
          <IdentityPopup
            errors={errors}
            user={user}
            isLoading={updating}
            onSave={(data) =>
              handleUpdate(
                data,
                close,
                userUpdateSchema.pick({
                  identityType: true,
                  identityNumber: true,
                  identityIssueCountryId: true,
                  identityOtherType: true,
                })
              )
            }
            close={close}
          />
        )}
      />
    </DashboardCard>
  );
}