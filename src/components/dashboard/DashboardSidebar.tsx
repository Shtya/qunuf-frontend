'use client';

import { getDashboardItems, SidebarLink } from '@/constants/dashboardItems';
import { useTranslations } from 'next-intl';
import Logo from '../atoms/Logo';
import Tooltip from '../atoms/Tooltip';
import { IoLogOutOutline } from 'react-icons/io5';
import FallbackImage from '../atoms/FallbackImage';
import SidebarItem from '../atoms/SidebarItem'; 
import { GrLanguage } from 'react-icons/gr';
import { HiX } from 'react-icons/hi';
import { Link, usePathname } from '@/i18n/navigation';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useValues } from '@/contexts/GlobalContext';
import { resolveUrl } from '@/utils/upload';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
    isMobile?: boolean;
    onClose?: () => void;
}

export default function DashboardSidebar({ isMobile = false, onClose }: DashboardSidebarProps) {
    const t = useTranslations('dashboard.sidebar');
    const pathname = usePathname();
    const { user, role, logout, LoggingOut } = useAuth();
    const { settings } = useValues();

    const items: SidebarLink[] = useMemo(
        () => getDashboardItems(role, settings?.adminUserId) || [],
        [role, settings]
    );

    async function handleLogOut() {
        await logout();
    }

    const activeHref = useMemo(() => {
        if (!pathname) return null;
        const match = items.find(i => pathname === i.href);
        return match?.href ?? null;
    }, [pathname, items]);

    const sidebarContent = (
        <div className="flex flex-col h-full bg-sidebar">
            {/* Mobile Header */}
            {isMobile && (
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray/10 bg-gradient-to-r from-primary/5 to-transparent">
                    <Logo small />
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-secondary/20 text-sidebar-foreground transition-all duration-200"
                    >
                        <HiX className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Desktop Logo */}
            {!isMobile && (
                <div className="flex items-center justify-center shrink-0 pt-6 pb-6">
                    <Logo small />
                </div>
            )}

            {/* Navigation - Enhanced scrollbar */}
            <div className={cn(
                "flex-1 flex justify-center overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40",
                isMobile ? "px-4" : "px-2"
            )}>
                <nav className={cn(
                    "flex flex-col pb-2",
                    isMobile ? "gap-1.5 py-2" : "gap-2"
                )}>
                    {items.map(({ href, key, Icon, className, order, disabled }) => {
                        const isActive = activeHref === href;
                        return (
                            <div
                                className={cn('transition-all duration-200', className)}
                                key={href}
                                style={{ order }}
                                onClick={() => isMobile && onClose?.()}
                            >
                                <SidebarItem
                                    href={href}
                                    label={t(key)}
                                    isActive={isActive}
                                    disabled={disabled}
                                    Icon={Icon}
                                />
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section - No extra space */}
            <div className={cn(
                "shrink-0 border-t border-gray/10",
                isMobile ? "px-4 py-4 space-y-3" : "px-2 py-3 space-y-2"
            )}>

                {/* Logout Button - Desktop */}
                {!isMobile && (
                    <div className="flex justify-center">
                        <Tooltip content={LoggingOut ? t("loggingOut") : t("logout")} position="top">
                            <button
                                onClick={handleLogOut}
                                disabled={LoggingOut}
                                className="relative group w-14 h-14 flex items-center justify-center rounded-full bg-secondary hover:bg-primary text-sidebar-foreground disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <IoLogOutOutline className="  text-white relative h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                        </Tooltip>
                    </div>
                )}

                {/* Profile Avatar - Desktop */}
                {!isMobile && (
                    <div className="flex justify-center">
                        <Link
                            href="/dashboard/settings/account"
                            className="relative group block"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-primary/50 to-primary/30 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />

                            {/* Avatar container */}
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-secondary group-hover:border-primary transition-all duration-300 ring-4 ring-transparent group-hover:ring-primary/20 shadow-lg">
                                <FallbackImage
                                    alt="profile"
                                    src={resolveUrl(user?.imagePath) || "/users/default-user.png"}
                                    defaultImage="/users/default-user.png"
                                    width={56}
                                    height={56}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>

                            {/* Online status indicator */}
                            <span className="absolute bottom-0 right-0 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-sidebar shadow-md"></span>
                            </span>
                        </Link>
                    </div>
                )}

                {/* Mobile Profile Card */}
                {isMobile && (
                    <div className="relative group">
                        {/* Gradient border effect */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Card content */}
                        <div className="relative bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl p-4 border border-secondary/40 group-hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-3">
                                {/* Profile Avatar */}
                                <Link
                                    href="/dashboard/settings/account"
                                    className="relative shrink-0 group/avatar"
                                    onClick={() => onClose?.()}
                                >
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-secondary group-hover/avatar:border-primary transition-all duration-300 ring-2 ring-transparent group-hover/avatar:ring-primary/30 shadow-md">
                                        <FallbackImage
                                            alt="profile"
                                            src={resolveUrl(user?.imagePath) || "/users/default-user.png"}
                                            defaultImage="/users/default-user.png"
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Online Status */}
                                    <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary border-2 border-sidebar"></span>
                                    </span>
                                </Link>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href="/dashboard/settings/account"
                                        className="block group/name"
                                        onClick={() => onClose?.()}
                                    >
                                        <p className="text-sm font-semibold text-sidebar-foreground truncate group-hover/name:text-primary transition-colors">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-sidebar-foreground/60 truncate">
                                            {user?.email || 'user@example.com'}
                                        </p>
                                    </Link>
                                    {role && (
                                        <div className="mt-1.5 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-primary to-primary-hover text-white shadow-sm">
                                            {role}
                                        </div>
                                    )}
                                </div>

                                {/* Logout Button */}
                                <Tooltip
                                    content={LoggingOut ? t('loggingOut') : t('logout')}
                                    position="top"
                                >
                                    <button
                                        onClick={handleLogOut}
                                        disabled={LoggingOut}
                                        className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-red-500 text-sidebar-foreground hover:text-white disabled:opacity-50 transition-all duration-200 group/logout shadow-sm"
                                    >
                                        <IoLogOutOutline className=" text-white h-5 w-5 group-hover/logout:scale-110 transition-transform duration-200" />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return sidebarContent;
}

// Desktop Locale Trigger (Icon only with secondary bg)
function DesktopLocaleTrigger({
    onClick,
    disabled,
    lang,
}: {
    onClick: () => void;
    disabled: boolean;
    lang?: string;
}) {
    return (
        <Tooltip content={lang || 'Language'} >
            <button
                onClick={onClick}
                disabled={disabled}
                className=" text-white relative group w-14 h-14 flex items-center justify-center rounded-full bg-secondary hover:bg-primary text-sidebar-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Change language"
            >
                <GrLanguage className="relative h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
        </Tooltip>
    );
}

function MobileLocaleTrigger({
    onClick,
    disabled,
    lang,
}: {
    onClick: () => void;
    disabled: boolean;
    lang?: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-secondary to-secondary-hover hover:from-primary hover:to-primary-hover border border-secondary/40 hover:border-primary text-sidebar-foreground w-full transition-all duration-200 group shadow-sm hover:shadow-md"
            aria-label="Change language"
        >
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-sidebar border border-gray/20 group-hover:border-primary/30 transition-all duration-200 shadow-sm">
                <GrLanguage className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium flex-1 text-left">{lang || 'Language'}</span>
        </button>
    );
}

// Mobile Sidebar Wrapper Component
interface MobileSidebarProps {
    open: boolean;
    onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
    if (typeof window === 'undefined') return null;

    return createPortal(
        <>
            {/* Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-[998] bg-dark/60 backdrop-blur-sm transition-all duration-300 lg:hidden',
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div
                dir="ltr"
                className={cn(
                    'fixed top-0 right-0 h-full w-full max-w-[340px] bg-sidebar shadow-2xl transform transition-transform duration-300 lg:hidden z-[999]',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div dir={document.dir} className="h-full">
                    <DashboardSidebar isMobile onClose={onClose} />
                </div>
            </div>
        </>,
        document.body
    );
}