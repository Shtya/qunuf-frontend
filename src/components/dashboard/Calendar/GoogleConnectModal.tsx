'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';
import { BsGoogle } from 'react-icons/bs';
import { LuKey, LuBookOpen, LuCopy, LuCheck, LuExternalLink, LuTrash2, LuEye, LuEyeOff } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import api from '@/libs/axios';
import toast from 'react-hot-toast';

type Tab = 'credentials' | 'guide';

interface SavedCredential {
    clientId: string | null;
    hasSecret: boolean;
    redirectUri: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
}

export function GoogleConnectModal({ open, onClose }: Props) {
    const t = useTranslations('dashboard.calendar.googleModal');

    const [tab, setTab] = useState<Tab>('credentials');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [saved, setSaved] = useState<SavedCredential | null>(null);
    const [loadingCreds, setLoadingCreds] = useState(false);
    const [saving, setSaving] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [copiedUri, setCopiedUri] = useState(false);

    // Fetch saved credentials when modal opens
    useEffect(() => {
        if (!open) return;
        setLoadingCreds(true);
        api.get<SavedCredential>('/calendar/google/credentials')
            .then(res => {
                const data = res.data;
                setSaved(data);
                if (data.clientId) setClientId(data.clientId);
            })
            .catch(() => setSaved(null))
            .finally(() => setLoadingCreds(false));
    }, [open]);

    if (!open || typeof window === 'undefined') return null;

    const handleSave = async () => {
        if (!clientId.trim() || !clientSecret.trim()) {
            toast.error(t('requiredFields'));
            return;
        }
        setSaving(true);
        try {
            await api.post('/calendar/google/credentials', {
                clientId: clientId.trim(),
                clientSecret: clientSecret.trim(),
            });
            toast.success(t('saved')); 
            const res = await api.get<SavedCredential>('/calendar/google/credentials');
            setSaved(res.data);
            setClientSecret('');
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await api.get<{ url: string; configured: boolean }>('/calendar/google/auth-url');
            if (res.data.configured && res.data.url) {
                window.open(res.data.url, '_blank', 'noopener,noreferrer');
                onClose();
            } else {
                toast.error(t('notConfigured'));
            }
        } catch {
            toast.error(t('notConfigured'));
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            await api.delete('/calendar/google/credentials');
            setSaved(null);
            setClientId('');
            setClientSecret('');
            toast.success(t('disconnected'));
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to disconnect');
        } finally {
            setDisconnecting(false);
        }
    };

    const copyUri = async () => {
        if (!saved?.redirectUri) return;
        await navigator.clipboard.writeText(saved.redirectUri);
        setCopiedUri(true);
        setTimeout(() => setCopiedUri(false), 2000);
    };

    const steps = t.raw('steps') as string[];
    const hasCredentials = !!saved?.clientId;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                aria-hidden
                onClick={onClose}
                className="fixed inset-0 z-1000 bg-black/35 backdrop-blur-[3px]"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                className={cn(
                    'fixed z-1001 top-1/2 ltr:right-1/2 rtl:left-1/2 ltr:translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2',
                    'w-full max-w-lg rounded-2xl overflow-hidden',
                    'bg-white/97 backdrop-blur-2xl',
                    'border border-white/70',
                    'shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_16px_48px_-8px_rgba(0,0,0,0.22),0_48px_96px_-16px_rgba(0,0,0,0.14)]',
                    'animate-in fade-in zoom-in-95 duration-200',
                )}
            >
                {/* Color bar */}
                <div className="h-1 bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#EA4335]" />

                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-black/6">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#4285F4]/10 text-[#4285F4] shrink-0">
                        <BsGoogle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-[15px] font-bold text-dark md: leading-tight">{t('title')}</h2>
                        {hasCredentials && (
                            <p className="text-[11px] text-green-600 font-semibold mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                {saved?.clientId.slice(0, 24)}…
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="w-8 h-8 flex items-center justify-center rounded-xl
                            text-dark/35 hover:text-dark hover:bg-black/6
                            transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-5 pt-3">
                    {(['credentials', 'guide'] as Tab[]).map(tabKey => (
                        <button
                            key={tabKey}
                            onClick={() => setTab(tabKey)}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-[12px] font-semibold border-b-2 transition-all duration-150',
                                tab === tabKey
                                    ? 'border-[#4285F4] text-[#4285F4] bg-[#4285F4]/5'
                                    : 'border-transparent text-dark/45 hover:text-dark hover:bg-black/3',
                            )}
                        >
                            {tabKey === 'credentials'
                                ? <><LuKey className="w-3.5 h-3.5" />{t('tabCredentials')}</>
                                : <><LuBookOpen className="w-3.5 h-3.5" />{t('tabGuide')}</>
                            }
                        </button>
                    ))}
                </div>
                <div className="h-px bg-black/6 mx-5" />

                {/* Body */}
                <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin' }}>

                    {/* ── Credentials tab ── */}
                    {tab === 'credentials' && (
                        <>
                            {loadingCreds ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="w-6 h-6 border-2 border-[#4285F4]/30 border-t-[#4285F4] rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Client ID */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                                            {t('clientIdLabel')}
                                        </label>
                                        <input
                                            value={clientId}
                                            onChange={e => setClientId(e.target.value)}
                                            placeholder={t('clientIdPlaceholder')}
                                            className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-black/2
                                                text-[13px] text-dark font-mono placeholder:text-dark/30 placeholder:font-sans
                                                focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4]/40
                                                transition-all duration-150"
                                        />
                                    </div>

                                    {/* Client Secret */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                                            {t('clientSecretLabel')}
                                            {hasCredentials && (
                                                <span className="ms-2 normal-case tracking-normal text-green-600 text-[10px] font-semibold">
                                                    ✓ saved
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showSecret ? 'text' : 'password'}
                                                value={clientSecret}
                                                onChange={e => setClientSecret(e.target.value)}
                                                placeholder={hasCredentials ? '••••••••••••••••' : t('clientSecretPlaceholder')}
                                                className="w-full px-3 py-2.5 pe-10 rounded-xl border border-black/10 bg-black/2
                                                    text-[13px] text-dark font-mono placeholder:text-dark/30 placeholder:font-sans
                                                    focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4]/40
                                                    transition-all duration-150"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSecret(s => !s)}
                                                className="absolute inset-y-0 end-0 px-3 flex items-center text-dark/35 hover:text-dark transition-colors"
                                            >
                                                {showSecret ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Redirect URI (read-only) */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
                                            {t('redirectUriLabel')}
                                        </label>
                                        {saved?.redirectUri ? (
                                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-black/10 bg-black/[0.018]">
                                                <code className="flex-1 text-[11px] text-dark/70 font-mono truncate">
                                                    {saved.redirectUri}
                                                </code>
                                                <button
                                                    onClick={copyUri}
                                                    className={cn(
                                                        'shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all duration-150',
                                                        copiedUri
                                                            ? 'bg-green-50 text-green-600'
                                                            : 'bg-black/5 text-dark/45 hover:bg-black/8',
                                                    )}
                                                >
                                                    {copiedUri
                                                        ? <><LuCheck className="w-3 h-3" />{t('copied')}</>
                                                        : <><LuCopy className="w-3 h-3" />{t('copy')}</>
                                                    }
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2.5">
                                                {t('redirectUriNotSet')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Save button */}
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full py-2.5 rounded-xl border-2 border-[#4285F4]/30
                                            bg-[#4285F4]/6 hover:bg-[#4285F4]/10 text-[#4285F4]
                                            text-[13px] font-semibold transition-all duration-150
                                            disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {saving ? t('saving') : t('saveCredentials')}
                                    </button>

                                    {/* Disconnect (only if credentials exist) */}
                                    {hasCredentials && (
                                        <button
                                            onClick={handleDisconnect}
                                            disabled={disconnecting}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                                                text-[12px] font-semibold text-red-500 hover:text-red-600
                                                hover:bg-red-50 transition-all duration-150
                                                disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            <LuTrash2 className="w-3.5 h-3.5" />
                                            {t('disconnect')}
                                        </button>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* ── Guide tab ── */}
                    {tab === 'guide' && (
                        <div className="space-y-4">
                            <p className="text-[11px] font-bold text-dark/50 uppercase tracking-widest">{t('stepsTitle')}</p>
                            <ol className="space-y-3">
                                {steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#4285F4]/10 text-[#4285F4] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="text-[12px] text-dark/65 md: leading-relaxed pt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <a
                                href="https://console.cloud.google.com/apis/credentials"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[12px] text-[#4285F4] font-semibold hover:underline"
                            >
                                <LuExternalLink className="w-3.5 h-3.5" />
                                Google Cloud Console — Credentials
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer — Connect button always visible */}
                <div className="flex items-center gap-2 px-5 py-4 border-t border-black/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl bg-black/5 hover:bg-black/8
                            text-[13px] font-semibold text-dark/60 hover:text-dark
                            transition-all duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConnect}
                        disabled={connecting || !hasCredentials}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                            bg-[#4285F4] hover:bg-[#3b78e7] active:scale-[0.98] text-white
                            text-[13px] font-semibold shadow-md shadow-[#4285F4]/25
                            transition-all duration-150
                            disabled:opacity-40 disabled:pointer-events-none"
                        title={!hasCredentials ? t('noCredentials') : undefined}
                    >
                        {connecting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('connecting')}
                            </>
                        ) : (
                            <>
                                <BsGoogle className="w-3.5 h-3.5" />
                                {t('connect')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>,
        document.body,
    );
}
