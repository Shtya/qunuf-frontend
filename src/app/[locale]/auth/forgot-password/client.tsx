'use client';

// ─────────────────────────────────────────────────────────────────
// Single-file refactor of: Forgot Password Page
// Includes: Logo, LocaleSwitcher, AuthHeader, SecondaryButton, TextInput, Form Logic
// ─────────────────────────────────────────────────────────────────

import { cn } from '@/lib/utils';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ComponentType,
  InputHTMLAttributes,
  ReactNode,
  useState,
  useTransition,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiLoader } from 'react-icons/fi';
import z from 'zod';
import api from '@/libs/axios';

// ─────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────

// ── Logo ──────────────────────────────────────────────────────────
function Logo({ className, small = false }: { className?: string; small?: boolean }) {
  const t = useTranslations('header');
  const textSize = small
    ? 'text-[20px] sm:text-[22px]'
    : 'text-[26px] sm:text-[30px] lg:text-[34px]';

  return (
    <Link href="/" className={cn('flex items-center flex-shrink-0', className)}>
      <span className={cn(textSize, 'font-extrabold text-primary tracking-tight leading-none')}>
        {t('logo')}
      </span>
    </Link>
  );
}

// ── LocaleSwitcher ────────────────────────────────────────────────
function LocaleSwitcher({
  Trigger,
}: {
  Trigger?: ComponentType<{ onClick: () => void; disabled: boolean; lang?: string }>;
}) {
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
      searchParams.forEach((value, key) => {
        paramsObj[key] = value;
      });
      router.replace(
        // @ts-expect-error — Next validates params at runtime
        { pathname, params, query: paramsObj },
        { locale: nextLocale }
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
        'group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer',
        'bg-white/70 hover:bg-white border border-gray-200/80',
        'shadow-sm hover:shadow transition-all duration-200',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
      )}
    >
      {/* Globe icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-secondary transition-transform duration-300 group-hover:rotate-12 flex-shrink-0"
      >
        <path
          d="M14 27.3333C12.1777 27.3333 10.4555 26.9831 8.83329 26.2827C7.21107 25.5822 5.79463 24.6267 4.58396 23.416C3.37329 22.2053 2.41774 20.7889 1.71729 19.1667C1.01685 17.5444 0.666626 15.8222 0.666626 14C0.666626 12.1556 1.01685 10.428 1.71729 8.81733C2.41774 7.20667 3.37329 5.79556 4.58396 4.584C5.79463 3.37244 7.21107 2.41689 8.83329 1.71733C10.4555 1.01778 12.1777 0.667555 14 0.666666C15.8444 0.666666 17.5724 1.01689 19.184 1.71733C20.7955 2.41778 22.2062 3.37333 23.416 4.584C24.6257 5.79467 25.5813 7.20578 26.2826 8.81733C26.984 10.4289 27.3342 12.1556 27.3333 14C27.3333 15.8222 26.9831 17.5444 26.2826 19.1667C25.5822 20.7889 24.6266 22.2058 23.416 23.4173C22.2053 24.6289 20.7942 25.5844 19.1826 26.284C17.5711 26.9836 15.8435 27.3333 14 27.3333Z"
          fill="currentColor"
          opacity="0.15"
        />
        <path
          d="M14 27.3333C12.1777 27.3333 10.4555 26.9831 8.83329 26.2827C7.21107 25.5822 5.79463 24.6267 4.58396 23.416C3.37329 22.2053 2.41774 20.7889 1.71729 19.1667C1.01685 17.5444 0.666626 15.8222 0.666626 14C0.666626 12.1556 1.01685 10.428 1.71729 8.81733C2.41774 7.20667 3.37329 5.79556 4.58396 4.584C5.79463 3.37244 7.21107 2.41689 8.83329 1.71733C10.4555 1.01778 12.1777 0.667555 14 0.666666C15.8444 0.666666 17.5724 1.01689 19.184 1.71733C20.7955 2.41778 22.2062 3.37333 23.416 4.584C24.6257 5.79467 25.5813 7.20578 26.2826 8.81733C26.984 10.4289 27.3342 12.1556 27.3333 14C27.3333 15.8222 26.9831 17.5444 26.2826 19.1667C25.5822 20.7889 24.6266 22.2058 23.416 23.4173C22.2053 24.6289 20.7942 25.5844 19.1826 26.284C17.5711 26.9836 15.8435 27.3333 14 27.3333ZM14 24.6C14.5777 23.8 15.0777 22.9667 15.5 22.1C15.9222 21.2333 16.2666 20.3111 16.5333 19.3333H11.4666C11.7333 20.3111 12.0777 21.2333 12.5 22.1C12.9222 22.9667 13.4222 23.8 14 24.6ZM10.5333 24.0667C10.1333 23.3333 9.78351 22.572 9.48396 21.7827C9.1844 20.9933 8.93418 20.1769 8.73329 19.3333H4.79996C5.4444 20.4444 6.25018 21.4111 7.21729 22.2333C8.1844 23.0556 9.28974 23.6667 10.5333 24.0667ZM17.4666 24.0667C18.7111 23.6667 19.8168 23.0556 20.784 22.2333C21.7511 21.4111 22.5564 20.4444 23.2 19.3333H19.2666C19.0666 20.1778 18.8168 20.9947 18.5173 21.784C18.2177 22.5733 17.8675 23.3342 17.4666 24.0667ZM3.66663 16.6667H8.19996C8.13329 16.2222 8.08352 15.7836 8.05063 15.3507C8.01774 14.9178 8.00085 14.4676 7.99996 14C7.99907 13.5324 8.01596 13.0827 8.05063 12.6507C8.08529 12.2187 8.13507 11.7796 8.19996 11.3333H3.66663C3.55552 11.7778 3.4724 12.2169 3.41729 12.6507C3.36218 13.0844 3.33418 13.5342 3.33329 14C3.3324 14.4658 3.3604 14.916 3.41729 15.3507C3.47418 15.7853 3.55729 16.224 3.66663 16.6667ZM10.8666 16.6667H17.1333C17.2 16.2222 17.2502 15.7836 17.284 15.3507C17.3177 14.9178 17.3342 14.4676 17.3333 14C17.3324 13.5324 17.3155 13.0827 17.2826 12.6507C17.2497 12.2187 17.2 11.7796 17.1333 11.3333H10.8666C10.8 11.7778 10.7502 12.2169 10.7173 12.6507C10.6844 13.0844 10.6675 13.5342 10.6666 14C10.6657 14.4658 10.6826 14.916 10.7173 15.3507C10.752 15.7853 10.8017 16.224 10.8666 16.6667ZM19.8 16.6667H24.3333C24.4444 16.2222 24.528 15.7836 24.584 15.3507C24.64 14.9178 24.6675 14.4676 24.6666 14C24.6657 13.5324 24.6382 13.0827 24.584 12.6507C24.5297 12.2187 24.4462 11.7796 24.3333 11.3333H19.8C19.8666 11.7778 19.9168 12.2169 19.9506 12.6507C19.9844 13.0844 20.0008 13.5342 20 14C19.9991 14.4658 19.9822 14.916 19.9493 15.3507C19.9164 15.7853 19.8666 16.224 19.8 16.6667ZM19.2666 8.66667H23.2C22.5555 7.55555 21.7502 6.58889 20.784 5.76667C19.8177 4.94444 18.712 4.33333 17.4666 3.93333C17.8666 4.66667 18.2168 5.428 18.5173 6.21733C18.8177 7.00667 19.0675 7.82311 19.2666 8.66667ZM11.4666 8.66667H16.5333C16.2666 7.68889 15.9222 6.76667 15.5 5.9C15.0777 5.03333 14.5777 4.2 14 3.4C13.4222 4.2 12.9222 5.03333 12.5 5.9C12.0777 6.76667 11.7333 7.68889 11.4666 8.66667ZM4.79996 8.66667H8.73329C8.93329 7.82222 9.18351 7.00533 9.48396 6.216C9.7844 5.42667 10.1342 4.66578 10.5333 3.93333C9.28885 4.33333 8.18307 4.94444 7.21596 5.76667C6.24885 6.58889 5.44351 7.55555 4.79996 8.66667Z"
          fill="currentColor"
        />
      </svg>
      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
        {nextLocale}
      </span>
    </button>
  );
}

// ── AuthHeader ────────────────────────────────────────────────────
function AuthHeader({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-between items-center', className)}>
      <Logo small />
      <LocaleSwitcher />
    </div>
  );
}

// ── SecondaryButton ───────────────────────────────────────────────
function SecondaryButton({
  children,
  className = '',
  onClick,
  href,
  type = 'button',
  disabled,
  ...props
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const base =
    'relative overflow-hidden inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  if (href) {
    return (
      <Link href={href} className={cn(base, className)} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cn(base, 'group', className)}>
      {/* shimmer layer */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-white/10 skew-x-[-20deg] group-hover:translate-x-full transition-transform duration-700"
      />
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// FORM PRIMITIVES
// ─────────────────────────────────────────────────────────────────

// ── FormErrorMessage ──────────────────────────────────────────────
function FormErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-center gap-1.5 text-xs font-medium text-red-500 ltr:text-left rtl:text-right mt-1"
    >
      <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

// ── TextInput ─────────────────────────────────────────────────────
function TextInput({
  label,
  placeholder,
  value,
  className,
  onChange,
  error,
  required,
  disabled,
  readOnly,
  suffix,
  prefix,
  type = 'text',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  suffix?: ReactNode;
  prefix?: ReactNode;
}) {
  const hasError = !!error;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label className="text-sm font-semibold text-[color:var(--input)] flex items-center gap-1 select-none ltr:text-left rtl:text-right">
          {label}
          {required && (
            <span className="text-red-500 leading-none" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative w-full group/input">
        {/* Focus glow */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute -inset-0.5 rounded-[14px] opacity-0 blur-sm transition-opacity duration-300 pointer-events-none',
            'bg-gradient-to-r from-secondary/30 to-primary/20',
            !hasError && 'group-focus-within/input:opacity-100'
          )}
        />

        {prefix && (
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-y-0 flex items-center px-3.5 pointer-events-none z-10',
              'border-e border-[color:var(--gray)]/15 text-[color:var(--dark)]/40 font-medium text-sm',
              'ltr:left-0 rtl:right-0'
            )}
          >
            {prefix}
          </div>
        )}

        <input
          {...props}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-required={required}
          className={cn(
            'relative w-full min-h-[48px] rounded-xl text-sm font-medium',
            'bg-white border-2 transition-all duration-200',
            'text-[color:var(--dark)] placeholder:text-[color:var(--placeholder)]',
            'ltr:pl-4 ltr:pr-4 rtl:pr-4 rtl:pl-4',
            prefix && 'ltr:pl-[52px] rtl:pr-[52px]',
            suffix && 'ltr:pr-[52px] rtl:pl-[52px]',
            'focus:outline-none focus-visible:ring-0',
            hasError
              ? 'border-red-300 bg-red-50/30 hover:border-red-400 focus:border-red-400'
              : [
                  'border-[color:var(--gray)]/20',
                  'hover:border-[color:var(--secondary)]/40',
                  'focus:border-[color:var(--secondary)]',
                ],
            disabled && 'bg-slate-50 cursor-not-allowed opacity-50',
            readOnly && 'bg-slate-50 cursor-default'
          )}
        />

        {suffix && (
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-y-0 flex items-center px-3.5 pointer-events-none z-10',
              'border-s border-[color:var(--gray)]/15 text-[color:var(--dark)]/40 font-medium text-sm',
              'ltr:right-0 rtl:left-0'
            )}
          >
            {suffix}
          </div>
        )}
      </div>

      <FormErrorMessage message={error} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FORGOT PASSWORD FORM
// ─────────────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, { message: 'required' }).email({ message: 'invalidEmail' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword.form');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      toast.success(t('success.sent'));
      router.push('/auth/sign-in');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('errors.forgotPasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextInput
            label={t('email.label')}
            placeholder={t('email.placeholder')}
            type="email"
            {...field}
            error={errors.email?.message ? t(`errors.${errors.email.message}`) : undefined}
            required
          />
        )}
      />

      <SecondaryButton
        type="submit"
        disabled={loading}
        className={cn(
          'w-full bg-secondary hover:bg-secondary-hover text-white py-3 mt-1',
          'shadow-lg shadow-secondary/20 hover:shadow-secondary/30'
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <FiLoader className="w-4 h-4 animate-spin" aria-hidden="true" />
            {t('loading')}
          </span>
        ) : (
          t('send')
        )}
      </SecondaryButton>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordClient() {
  const t = useTranslations('auth.forgotPassword');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[color:var(--dashboard-bg,#f7f8fa)]">
      {/* Decorative background blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 ltr:-left-32 rtl:-right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 ltr:-right-24 rtl:-left-24 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-3xl" />
      </div>

      <div className="w-full max-w-[1100px] mx-auto">
        {/* Card */}
        <div
          className={cn(
            'flex flex-col lg:flex-row items-stretch',
            'rounded-2xl overflow-hidden',
            'shadow-[0_8px_48px_rgba(0,0,0,0.10)]',
            'bg-white',
            'animate-[fadeUp_0.4s_ease_both]'
          )}
        >
          {/* ── Left: Form panel ─────────────────────────────── */}
          <div className="w-full lg:w-[52%] flex flex-col p-6 sm:p-8 lg:p-10 xl:p-12">
            <AuthHeader className="mb-8 sm:mb-10" />

            {/* Heading */}
            <div className="mb-7 sm:mb-8">
              <h1 className="text-[color:var(--dark)] font-bold text-[28px] sm:text-[32px] leading-tight tracking-tight ltr:text-left rtl:text-right">
                {t('title')}
              </h1>
              <p className="mt-2 text-[color:var(--dark)]/55 text-[15px] sm:text-[16px] leading-relaxed ltr:text-left rtl:text-right">
                {t('subtitle')}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-7 sm:mb-8" />

            <ForgotPasswordForm />

            {/* Back to Login Link */}
            <div className="mt-6 flex ltr:justify-start rtl:justify-end">
              <Link
                href="/auth/sign-in"
                className={cn(
                  'inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors',
                  'group'
                )}
              >
								{t('backToLogin')}
                {!isRTL ? (
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                ) : (
                  <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                )}
              </Link>
            </div>
          </div>

          {/* ── Right: Image panel ───────────────────────────── */}
          <div className="relative hidden lg:block w-[48%] min-h-[520px]">
            {/* Image */}
            <Image
              src="/auth/signin.jpg" // Reusing the sign-in image asset
              fill
              alt=""
              aria-hidden="true"
              className="object-cover"
              priority
            />

            {/* Gradient overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary)/55 0%, var(--lightGold)/35 60%, transparent 100%)',
              }}
            />

            {/* Decorative pattern dots */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-20 opacity-[0.06]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}