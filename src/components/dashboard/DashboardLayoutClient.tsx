'use client';

// ─── External imports ─────────────────────────────────────────────────────────
import { useTranslations } from 'next-intl';
import { useLocale, useTranslations as useRootTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getDashboardHref } from '@/utils/dashboardPaths';
import { resolveUrl } from '@/utils/upload';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useValues } from '@/contexts/GlobalContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSocket } from '@/contexts/SocketContext';
import { useDashboardHref } from '@/hooks/dashboard/useDashboardHref';
import api from '@/libs/axios';
import { Role } from '@/types/global';
import { Notification } from '@/types/dashboard/notifications';
import { UserRole } from '@/constants/user';
import FallbackImage from '@/components/atoms/FallbackImage';
import Logo from '@/components/atoms/Logo';
import PrimaryButton from '@/components/atoms/buttons/PrimaryButton';

import {
	ComponentType, ReactNode, SVGProps,
	useEffect, useMemo, useRef, useState, useTransition,
} from 'react';
import { createPortal } from 'react-dom';

import { LuLayoutDashboard } from 'react-icons/lu';
import { FaBars, FaHeadset, FaRegNewspaper } from 'react-icons/fa';
import { MdOutlineFactCheck, MdOutlineSettingsApplications } from 'react-icons/md';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { TbBuildingCommunity, TbContract } from 'react-icons/tb';
import { PiBuildingApartment } from 'react-icons/pi';
import { LuCalendarDays } from 'react-icons/lu';
import { MdOutlineBuildCircle } from 'react-icons/md';
import { GrContact, GrLanguage } from 'react-icons/gr';
import { HiOutlineUserGroup, HiOutlineUsers, HiX } from 'react-icons/hi';
import { BsBell } from 'react-icons/bs';
import { RxDotsHorizontal } from 'react-icons/rx';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN INTENT
// ─────────────────────────────────────────────────────────────────────────────
// • Sidebar & Header: frosted-glass panels that float above the content canvas.
//   Three-layer shadow system: crisp edge + soft mid + long ambient ambient.
//   Inner ring-inset gives the "glass has thickness" illusion.
// • Content canvas: cooler/darker background so chrome elements visually lift.
// • All directional utilities use Tailwind logical-property classes:
//   start-*, end-*, ps-*, pe-*, ms-*, me-*, border-s-*, border-e-*
//   → RTL is automatic with no extra rtl: overrides needed.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Types & route helpers
// ─────────────────────────────────────────────────────────────────────────────

export type SidebarLink = {
	href: string; order: number; key: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
	className?: string; disabled?: boolean;
};

export function getDashboardItems(role: Role, adminUserId?: string): SidebarLink[] {
	const common: SidebarLink[] = [
		{ href: getDashboardHref('root'), key: 'dashboard', Icon: LuLayoutDashboard, order: 1 },
		{ href: getDashboardHref('calendar'), key: 'calendar', Icon: LuCalendarDays, order: 18 },
		{ href: getDashboardHref('settings'), key: 'settings', Icon: IoSettingsOutline, order: 20 },
	];
	const tenant: SidebarLink[] = [
		{ href: getDashboardHref('contracts'), key: 'contracts', Icon: TbContract, order: 2 },
		{ href: getDashboardHref('renewRequests'), key: 'renewRequests', Icon: MdOutlineFactCheck, order: 3 },
		{ href: getDashboardHref('maintenance'), key: 'maintenance', Icon: MdOutlineBuildCircle, order: 4 },
		{ href: getDashboardHref('chats', { user: adminUserId }), key: 'support', Icon: FaHeadset, order: 19, disabled: !adminUserId },
	];
	const landlord: SidebarLink[] = [
		{ href: getDashboardHref('contracts'), key: 'contracts', Icon: TbContract, order: 2 },
		{ href: getDashboardHref('properties'), key: 'properties', Icon: PiBuildingApartment, order: 3 },
		{ href: getDashboardHref('maintenance'), key: 'maintenance', Icon: MdOutlineBuildCircle, order: 4 },
		{ href: getDashboardHref('chats', { user: adminUserId }), key: 'support', Icon: FaHeadset, order: 19, disabled: !adminUserId },
	];
	const admin: SidebarLink[] = [
		{ href: getDashboardHref('properties'), key: 'properties', Icon: PiBuildingApartment, order: 2 },
		{ href: getDashboardHref('contracts'), key: 'contracts', Icon: TbContract, order: 3 },
		{ href: getDashboardHref('users'), key: 'users', Icon: HiOutlineUsers, order: 4 },
		{ href: getDashboardHref('maintenance'), key: 'maintenance', Icon: MdOutlineBuildCircle, order: 5 },
		{ href: getDashboardHref('contactUs'), key: 'contactUs', Icon: GrContact, order: 6 },
		{ href: getDashboardHref('blogs'), key: 'blogs', Icon: FaRegNewspaper, order: 7 },
		{ href: getDashboardHref('teamMembers'), key: 'teamMembers', Icon: HiOutlineUsers, order: 8 },
		{ href: getDashboardHref('aboutUs'), key: 'aboutUs', Icon: HiOutlineUserGroup, order: 9 },
		{ href: getDashboardHref('departments'), key: 'departments', Icon: TbBuildingCommunity, order: 10 },
		{ href: getDashboardHref('websiteSettings'), key: 'websiteSettings', Icon: MdOutlineSettingsApplications, order: 11 },
	];
	switch (role) {
		case 'tenant': return [...common, ...tenant];
		case 'landlord': return [...common, ...landlord];
		case 'admin': return [...common, ...admin];
		default: return common;
	}
}

// Per-role visual tokens
const ROLE_TOKENS: Record<string, { badge: string; dot: string }> = {
	admin: { badge: 'text-rose-600 bg-rose-50 border-rose-200', dot: 'bg-rose-500' },
	landlord: { badge: 'text-violet-600 bg-violet-50 border-violet-200', dot: 'bg-violet-500' },
	tenant: { badge: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: PingIndicator
// ─────────────────────────────────────────────────────────────────────────────

interface PingIndicatorProps { top?: string; start?: string; size?: string; color?: string; }
export function PingIndicator({
	top = 'top-0.5', start = 'start-3/4', size = 'size-2', color = '#EF4444',
}: PingIndicatorProps) {
	return (
		<span className={cn('absolute flex pointer-events-none', top, start, size)}>
			<span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
				style={{ backgroundColor: color }} />
			<span className={cn('relative inline-flex rounded-full', size)} style={{ backgroundColor: color }} />
		</span>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: Tooltip — portal-based, fully RTL/LTR-aware
// ─────────────────────────────────────────────────────────────────────────────

export function Tooltip({ children, content }: { children: ReactNode; content: string }) {
	const [show, setShow] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const [pos, setPos] = useState({
		top: 0,
		left: 0,
		right: 0,
		isRtl: false,
	});

	const update = () => {
		if (!ref.current || typeof window === 'undefined') return;

		const r = ref.current.getBoundingClientRect();
		const isRtl = document.documentElement.dir === 'rtl';

		setPos({
			top: r.top + r.height / 2,
			left: r.right + 10,
			right: window.innerWidth - r.left + 10,
			isRtl,
		});
	};

	return (
		<div
			ref={ref}
			className="relative inline-flex"
			onMouseEnter={() => {
				update();
				setShow(true);
			}}
			onMouseLeave={() => setShow(false)}
		>
			{children}

			{show &&
				createPortal(
					<div
						role="tooltip"
						style={
							pos.isRtl
								? { top: pos.top, right: pos.right, transform: 'translateY(-50%)' }
								: { top: pos.top, left: pos.left, transform: 'translateY(-50%)' }
						}
						className="fixed z-[9999] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide bg-gray-900/95 text-white shadow-xl pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10 animate-in fade-in zoom-in-95 duration-100"
					>
						{content}

						<span
							className={cn(
								'absolute top-1/2 -translate-y-1/2 border-[5px] border-transparent',
								!pos.isRtl
									? 'start-full border-s-gray-900/95'
									: 'end-full border-e-gray-900/95'
							)}
						/>
					</div>,
					document.body
				)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: SidebarItem
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarItemProps {
	href: string; label: string; isActive: boolean;
	Icon: ComponentType<SVGProps<SVGSVGElement>>; disabled?: boolean;
}

export function SidebarItem({ href, label, isActive, Icon, disabled }: SidebarItemProps) {
	return (
		<>
			<PrimaryButton href={disabled ? '#' : href}
				className={cn(
					'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 lg:hidden',
					isActive
						? 'bg-primary text-white shadow-sm shadow-primary/20'
						: 'text-dark/55 hover:bg-primary/6 hover:text-primary',
					disabled && 'pointer-events-none opacity-30',
				)}>
				<span className={cn('flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all',
					isActive ? 'bg-white/15' : 'bg-black/4')}>
					<Icon className="w-[17px] h-[17px]" />
				</span>
				<span className="flex-1 text-start">{label}</span>
				{isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
			</PrimaryButton>

			<div className="hidden lg:flex justify-center w-full">
				<Tooltip content={label}>
					<Link href={disabled ? '#' : href} aria-disabled={disabled} aria-label={label}
						className={cn(
							'group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
							isActive
								? 'bg-primary text-white shadow-[0_4px_16px_-2px] shadow-primary/40'
								: 'text-dark/40 hover:bg-primary/8 hover:text-primary',
							disabled && 'pointer-events-none opacity-30',
						)}>
						{isActive && (
							<span className="absolute inset-y-2.5 -start-[15px] w-[3px] rounded-e-full
                bg-primary shadow-[0_0_8px_2px] shadow-primary/40" />
						)}
						<Icon className={cn('w-[19px] h-[19px] transition-transform duration-200',
							!isActive && 'group-hover:scale-110')} />
					</Link>
				</Tooltip>
			</div>
		</>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: LocaleSwitcher
// ─────────────────────────────────────────────────────────────────────────────

interface LocaleSwitcherProps {
	Trigger?: ComponentType<{ onClick: () => void; disabled: boolean; lang?: string }>;
}
export function LocaleSwitcher({ Trigger }: LocaleSwitcherProps) {
	const router = useRouter();
	const [pending, go] = useTransition();
	const t = useRootTranslations('root');
	const pathname = usePathname();
	const params = useParams();
	const searchParams = useSearchParams();
	const locale = useLocale();
	const next = locale === routing.locales[0] ? routing.locales[1] : routing.locales[0];

	function toggle() {
		go(() => {
			const q: Record<string, string> = {};
			searchParams.forEach((v, k) => { q[k] = v; });
			// @ts-expect-error runtime validation
			router.replace({ pathname, params, query: q }, { locale: next });
		});
	}

	if (Trigger) return <Trigger onClick={toggle} disabled={pending} lang={t('lang')} />;

	return (
		<button onClick={toggle} disabled={pending} aria-label="Change language"
			className="group flex items-center gap-2 px-3 py-1.5 rounded-xl
        bg-black/4 hover:bg-primary/8 border border-black/6
        transition-all duration-200 active:scale-95 disabled:opacity-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
			<GrLanguage className="w-4 h-4 text-dark/45 group-hover:text-primary group-hover:rotate-12 transition-all duration-300" />
			<span className="font-bold text-[11px] text-dark/45 group-hover:text-primary uppercase tracking-widest">
				{next}
			</span>
		</button>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: Dropdown
// ─────────────────────────────────────────────────────────────────────────────

export type DropMenuPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
const dropPos = (p: DropMenuPosition) => ({
	'bottom-right': 'top-full end-0 mt-2',
	'top-left': 'bottom-full start-0 mb-2',
	'top-right': 'bottom-full end-0 mb-2',
	'bottom-left': 'top-full start-0 mt-2',
}[p]);

export interface TriggerProps { isOpen: boolean; onToggle: () => void; disabled?: boolean; }
export interface MenuProps { isOpen: boolean; onClose: () => void; }

export function Dropdown({ position = 'bottom-left', className, Trigger, Menu }:
	{ position?: DropMenuPosition; className?: string; Trigger: ComponentType<TriggerProps>; Menu: ComponentType<MenuProps> }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const h = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', h);
		return () => document.removeEventListener('mousedown', h);
	}, []);
	return (
		<div ref={ref} className={cn('relative', className)}>
			<Trigger onToggle={() => setOpen(!open)} isOpen={open} />
			{open && (
				<div className={cn('absolute w-max z-[200]',
					'animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150',
					dropPos(position))}>
					<Menu onClose={() => setOpen(false)} isOpen={open} />
				</div>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: NotificationDropdown
// ─────────────────────────────────────────────────────────────────────────────

function NotificationTrigger({ isOpen, onToggle }: TriggerProps) {
	const { unreadNotificationCount } = useNotifications();
	return (
		<button type="button" aria-label="Open notifications" onClick={onToggle}
			className={cn('relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
				isOpen
					? 'bg-primary text-white shadow-md shadow-primary/25'
					: 'bg-black/4 hover:bg-primary/8 text-dark/50 hover:text-primary')}>
			<BsBell className="w-[17px] h-[17px]" />
			{unreadNotificationCount > 0 && (
				<span className="absolute -top-1 -end-1 flex h-4 w-4">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
					<span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold">
						{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
					</span>
				</span>
			)}
		</button>
	);
}

function NotificationMenu({ isOpen, onClose }: MenuProps) {
	const t = useTranslations('dashboard.notification');
	const { getHref } = useDashboardHref();
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState<Notification[]>([]);
	const { markOneAsRead, subscribe, getNotificationIcon } = useNotifications();

	useEffect(() => {
		if (!isOpen) return;
		setLoading(true);
		api.get('/notifications?limit=10&page=1')
			.then(r => setItems(r.data?.records ?? []))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [isOpen]);

	useEffect(() => subscribe((a) => {
		if (a.type === 'NEW_NOTIFICATION')
			setItems(p => p.some(n => n.id === a.payload.id) ? p : [a.payload, ...p].slice(0, 10));
		if (a.type === 'MARK_ONE_AS_READ')
			setItems(p => p.map(n => n.id === a.payload.id ? { ...n, isRead: true } : n));
		if (a.type === 'MARK_ALL_AS_READ')
			setItems(p => p.map(n => ({ ...n, isRead: true })));
	}), [subscribe]);

	const unread = items.filter(n => !n.isRead).length;

	return (
		<div className="w-[355px] rounded-2xl overflow-hidden
      bg-white/88 dark:bg-[#1a1a2e]/88 backdrop-blur-2xl
      border border-white/65 dark:border-white/8
      shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_32px_-6px_rgba(0,0,0,0.14),0_24px_56px_-12px_rgba(0,0,0,0.10)]">

			{/* Header */}
			<div className="px-5 py-4 border-b border-black/5 dark:border-white/5
        bg-gradient-to-br from-white/50 to-transparent dark:from-white/3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_2px_6px_rgba(0,0,0,0.06)]">
							<BsBell className="w-4 h-4 text-primary" />
						</div>
						<div>
							<p className="text-[13px] font-bold text-dark leading-tight">{t('title')}</p>
							<p className="text-[11px] text-dark/38 mt-0.5">
								{unread > 0 ? t('unreadCount', { count: unread }) : t('allRead')}
							</p>
						</div>
					</div>
					{loading && (
						<span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
					)}
				</div>
			</div>

			{/* List */}
			<div className="max-h-[360px] overflow-y-auto divide-y divide-black/4 dark:divide-white/4"
				style={{ scrollbarWidth: 'thin' }}>
				{loading && items.length === 0 ? (
					/* Skeleton */
					<div className="p-4 space-y-3">
						{[1, 2, 3].map(i => (
							<div key={i} className="flex gap-3 animate-pulse">
								<div className="w-9 h-9 rounded-xl bg-black/6 shrink-0" />
								<div className="flex-1 space-y-2 pt-1">
									<div className="h-3 bg-black/5 rounded-md w-3/4" />
									<div className="h-2.5 bg-black/4 rounded-md" />
									<div className="h-2.5 bg-black/3 rounded-md w-2/3" />
								</div>
							</div>
						))}
					</div>
				) : items.length > 0 ? items.map(item => (
					<button key={item.id}
						onClick={async () => { await markOneAsRead(item); onClose(); }}
						className={cn(
							'group flex items-start gap-3 px-5 py-4 w-full text-start transition-all duration-150',
							'hover:bg-black/3 focus-visible:bg-black/3 focus-visible:outline-none',
							!item.isRead && 'bg-primary/[0.028] border-s-[3px] border-s-primary ps-[17px]',
						)}>
						<span className={cn('mt-0.5 shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-colors',
							!item.isRead ? 'bg-primary/10 text-primary' : 'bg-black/5 text-dark/38')}>
							{getNotificationIcon(item.relatedEntityType || '')}
						</span>
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between gap-2 mb-1">
								<h3 className={cn('text-[13px] leading-snug',
									!item.isRead ? 'font-semibold text-dark' : 'font-medium text-dark/50')}>
									{item.title}
								</h3>
								{!item.isRead && (
									<span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary
                    shadow-[0_0_6px_2px] shadow-primary/40" />
								)}
							</div>
							<p className="text-xs text-dark/44 line-clamp-2 leading-relaxed">{item.message}</p>
						</div>
					</button>
				)) : (
					/* Empty state */
					<div className="py-14 px-6 flex flex-col items-center gap-3 text-center">
						<div className="w-14 h-14 rounded-2xl bg-black/4 flex items-center justify-center
              shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]">
							<BsBell className="w-6 h-6 text-dark/20" />
						</div>
						<div>
							<p className="text-sm font-semibold text-dark/32">{t('noNotifications')}</p>
							<p className="text-xs text-dark/22 mt-1">{t('noNotificationsDesc')}</p>
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="px-5 py-3 border-t border-black/5 bg-black/[0.015]">
				<Link href={getHref('notifications')} onClick={onClose}
					className="flex items-center justify-center gap-1.5 text-[12px] font-semibold
            text-secondary hover:text-primary transition-colors duration-200">
					<span>{t('seeAll')}</span>
					<svg className="w-3.5 h-3.5 rtl:rotate-180 shrink-0"
						fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
					</svg>
				</Link>
			</div>
		</div>
	);
}

export function NotificationDropdown() {
	return <Dropdown Trigger={NotificationTrigger} Menu={NotificationMenu} position="bottom-right" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: DashboardSidebar
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardSidebarProps { isMobile?: boolean; onClose?: () => void; }

function DashboardSidebar({ isMobile = false, onClose }: DashboardSidebarProps) {
	const t = useTranslations('dashboard.sidebar');
	const pathname = usePathname();
	const { user, role, logout, LoggingOut } = useAuth();
	const { settings } = useValues();
	const items = useMemo(() => getDashboardItems(role, settings?.adminUserId) || [], [role, settings]);
	const activeHref = useMemo(() => items.find(i => pathname === i.href)?.href ?? null, [pathname, items]);
	const tokens = ROLE_TOKENS[role] ?? ROLE_TOKENS.tenant;

	return (
		<div className="flex flex-col h-full overflow-hidden
      bg-white/78 dark:bg-[#16162a]/82 backdrop-blur-2xl
      ring-1 ring-inset ring-white/70 dark:ring-white/8">

			{isMobile ? (
				<div className="flex items-center justify-between px-5 py-4
          border-b border-black/6 dark:border-white/5 shrink-0">
					<Logo small />
					<button onClick={onClose} aria-label={t('close')}
						className="w-8 h-8 flex items-center justify-center rounded-lg
              text-dark/38 hover:text-dark hover:bg-black/6 transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
						<HiX className="w-4 h-4" />
					</button>
				</div>
			) : (
				<div className="flex items-center justify-center shrink-0 h-[63.5px]
          border-b border-black/5 dark:border-white/5">
					<Logo small />
				</div>
			)}

			{/* ── Nav ──────────────────────────────────────────── */}
			<div className={cn('flex-1 overflow-y-auto overflow-x-hidden py-4',
				isMobile ? 'px-3' : 'flex flex-col items-center px-3')}
				style={{ scrollbarWidth: 'none' }}>
				<nav className={cn('flex flex-col', isMobile ? 'gap-0.5' : 'gap-1 items-center w-full')}>
					{items.map(({ href, key, Icon, className, order, disabled }) => (
						<div key={href} style={{ order }} className={cn('w-full', className)}
							onClick={() => isMobile && onClose?.()}>
							<SidebarItem href={href} label={t(key)}
								isActive={activeHref === href} disabled={disabled} Icon={Icon} />
						</div>
					))}
				</nav>
			</div>

			{/* ── Bottom dock ──────────────────────────────────── */}
			<div className={cn('shrink-0 border-t border-black/5 dark:border-white/5',
				isMobile ? 'px-3 py-4' : 'px-3 py-4 flex flex-col items-center gap-2.5')}>

				{isMobile ? (
					/* Mobile user card */
					<div className="flex items-center gap-3 p-3 rounded-2xl
            bg-black/3 border border-black/6
            shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
						<Link href="/dashboard/settings/account" onClick={() => onClose?.()}
							aria-label={t('profileSettings')} className="relative shrink-0">
							<div className="w-10 h-10 rounded-xl overflow-hidden border border-black/8 shadow-sm">
								<FallbackImage alt={t('profileAlt')}
									src={resolveUrl(user?.imagePath) || '/users/default-user.png'}
									defaultImage="/users/default-user.png"
									width={40} height={40} className="w-full h-full object-cover" />
							</div>
							<span className="absolute -bottom-0.5 -end-0.5 flex h-2.5 w-2.5">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
								<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white" />
							</span>
						</Link>
						<div className="flex-1 min-w-0">
							<Link href="/dashboard/settings/account" onClick={() => onClose?.()}>
								<p className="text-[13px] font-semibold text-dark truncate hover:text-primary transition-colors leading-tight">
									{user?.name || t('defaultUser')}
								</p>
								<p className="text-[11px] text-dark/38 truncate mt-0.5">
									{user?.email || t('defaultEmail')}
								</p>
							</Link>
							{role && (
								<span className={cn('mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold',
									tokens.badge)}>
									{role}
								</span>
							)}
						</div>
						<Tooltip content={LoggingOut ? t('loggingOut') : t('logout')}>
							<button onClick={() => logout()} disabled={LoggingOut} aria-label={t('logout')}
								className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                  text-dark/35 hover:text-red-500 hover:bg-red-50 transition-all duration-200
                  disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
								<IoLogOutOutline className="w-4 h-4" />
							</button>
						</Tooltip>
					</div>
				) : (
					/* Desktop icon stack */
					<>
						<LocaleSwitcher Trigger={({ onClick, disabled, lang }) => (
							<Tooltip content={lang || t('language')}>
								<button onClick={onClick} disabled={disabled} aria-label={lang || t('language')}
									className="w-11 h-11 flex items-center justify-center rounded-2xl
                    text-dark/38 hover:text-primary hover:bg-primary/8 transition-all duration-200
                    disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
									<GrLanguage className="w-[18px] h-[18px]" />
								</button>
							</Tooltip>
						)} />

						<Tooltip content={LoggingOut ? t('loggingOut') : t('logout')}>
							<button onClick={() => logout()} disabled={LoggingOut} aria-label={t('logout')}
								className="w-11 h-11 flex items-center justify-center rounded-2xl
                  text-dark/38 hover:text-red-500 hover:bg-red-50 transition-all duration-200
                  disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
								<IoLogOutOutline className="w-[18px] h-[18px]" />
							</button>
						</Tooltip>

						<Tooltip content={t('profileSettings')}>
							<Link href="/dashboard/settings/account" aria-label={t('profileSettings')}
								className="group relative block">
								<div className="w-11 h-11 rounded-2xl overflow-hidden
                  border-2 border-black/8 group-hover:border-primary/45
                  shadow-[0_2px_8px_rgba(0,0,0,0.10)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)]
                  transition-all duration-300">
									<FallbackImage alt={t('profileAlt')}
										src={resolveUrl(user?.imagePath) || '/users/default-user.png'}
										defaultImage="/users/default-user.png"
										width={44} height={44}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
								</div>
								<span className="absolute -bottom-0.5 -end-0.5 flex h-2.5 w-2.5">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
									<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white" />
								</span>
							</Link>
						</Tooltip>
					</>
				)}
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9: MobileSidebar portal
// ─────────────────────────────────────────────────────────────────────────────

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
	if (typeof window === 'undefined') return null;
	return createPortal(
		<>
			{/* Backdrop */}
			<div aria-hidden
				className={cn('fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm transition-all duration-300 lg:hidden',
					open ? 'opacity-100' : 'opacity-0 pointer-events-none')}
				onClick={onClose} />

			{/*
        dir="ltr" on wrapper: ensures translate-x-full always means
        "slide right off-screen" regardless of document dir.
        The inner div restores the actual document direction for content.
        The 3-D shadow goes to the logical start (left in LTR, right in RTL).
      */}
			<div dir="ltr"
				className={cn(
					'fixed top-0 end-0 h-full w-[288px] z-[999] lg:hidden',
					'transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
					'shadow-[-24px_0_60px_-8px_rgba(0,0,0,0.14),-6px_0_20px_-4px_rgba(0,0,0,0.08)]',
					open ? 'translate-x-0' : 'translate-x-full',
				)}>
				<div dir={document.dir} className="h-full">
					<DashboardSidebar isMobile onClose={onClose} />
				</div>
			</div>
		</>,
		document.body,
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10: MobileDashboardIcons
// ─────────────────────────────────────────────────────────────────────────────

export function MobileDashboardIcons({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { getHref } = useDashboardHref();
	const { user } = useAuth();
	const { unreadNotificationCount } = useNotifications();
	if (!open) return null;
	return (
		<div className="flex items-center justify-between gap-3 px-4 py-2.5
      border-b border-black/5
      bg-white/80 dark:bg-[#16162a]/80 backdrop-blur-xl
      shadow-[0_4px_16px_-4px_rgba(0,0,0,0.07)]
      lg:hidden animate-in slide-in-from-top-2 duration-200">
			<div className="flex items-center gap-1.5">
				<Link href={getHref('chats')} onClick={onClose} aria-label="Chats"
					className="relative w-9 h-9 flex items-center justify-center rounded-xl
            bg-black/4 hover:bg-primary/8 text-dark/45 hover:text-primary transition-all duration-200">
					<PingIndicator />
					<IoChatbubbleEllipsesOutline className="w-[17px] h-[17px]" />
				</Link>
				<Link href={getHref('notifications')} onClick={onClose} aria-label="Notifications"
					className="relative w-9 h-9 flex items-center justify-center rounded-xl
            bg-black/4 hover:bg-primary/8 text-dark/45 hover:text-primary transition-all duration-200">
					{unreadNotificationCount > 0 && <PingIndicator />}
					<BsBell className="w-[17px] h-[17px]" />
				</Link>
			</div>
			<div className="flex items-center gap-2">
				<p className="hidden sm:block text-xs font-semibold text-dark/55 truncate max-w-[100px]">
					{user?.name}
				</p>
				<div className="relative w-8 h-8 rounded-xl overflow-hidden border border-black/8 shadow-sm shrink-0">
					<FallbackImage alt="profile"
						src={resolveUrl(user?.imagePath) || '/users/default-user.png'}
						defaultImage="/users/default-user.png" width={32} height={32}
						className="w-full h-full object-cover" />
				</div>
			</div>
		</div>
	);
}

 
export function DashboardHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
	const tH = useTranslations('header');
	const t = useTranslations('dashboard.header');
	const [subOpen, setSubOpen] = useState(false);
	const { user, role } = useAuth();
	const { unreadChatCount } = useSocket();
	const { unreadNotificationCount } = useNotifications();
	const tokens = ROLE_TOKENS[role] ?? ROLE_TOKENS.tenant;

	return (
		<div>
			<header className="sticky top-0 z-40
        bg-white/85 dark:bg-[#16162a]/88 backdrop-blur-2xl
        border-b border-black/[0.06] dark:border-white/[0.06]
        shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_20px_-4px_rgba(0,0,0,0.08),0_12px_40px_-8px_rgba(0,0,0,0.05)]">

				{/* ── Mobile header ── */}
				<div className="flex lg:hidden items-center justify-between h-[58px] px-4 gap-3">

					{/* Left: Logo → / */}
					<Logo />
					{/* <Link href="/" aria-label="Go to homepage"
						className="flex items-center gap-2 shrink-0 group">
						<div className="relative w-8 h-8 rounded-xl overflow-hidden
              bg-primary shadow-[0_2px_10px_rgba(0,0,0,0.18)] shrink-0
              group-active:scale-95 transition-transform duration-150">
							<Logo small />
						</div>
					</Link> */}

					{/* Center: greeting */}
					{user?.role && <div className="flex-1 min-w-0 px-2">
						<p className="text-[13px] font-bold text-dark truncate leading-tight">
							{t('greeting', { name: user?.name })}
						</p> 
						<span className={cn(
							'inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border mt-0.5',
							tokens.badge
						)}>
							<span className={cn('w-1 h-1 rounded-full', tokens.dot)} />
							{tH(`roles.${user?.role}`)}
						</span>
					</div>}

					{/* Right: icon cluster */}
					<div className="flex items-center gap-1.5">
						{/* Notifications quick badge */}
						<button onClick={() => setSubOpen(p => !p)} aria-label="Quick actions"
							aria-expanded={subOpen}
							className={cn(
								'relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
								subOpen
									? 'bg-primary text-white shadow-md shadow-primary/30'
									: 'bg-black/5 hover:bg-black/8 text-dark/50',
							)}>
							<BsBell className="w-[17px] h-[17px]" />
							{unreadNotificationCount > 0 && (
								<span className="absolute -top-0.5 -end-0.5 flex h-3.5 w-3.5">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
									<span className="relative inline-flex items-center justify-center rounded-full h-3.5 w-3.5 bg-red-500 text-white text-[8px] font-black">
										{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
									</span>
								</span>
							)}
						</button>

						{/* Burger icon — opens sidebar */}
						<button onClick={onOpenSidebar} aria-label={t('openMenu')}
							className="relative flex items-center justify-center w-9 h-9 rounded-xl
                transition-all duration-200 active:scale-95 shrink-0
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                bg-black/5 hover:bg-primary/10 hover:text-primary text-dark/60
                border border-black/8">
							<FaBars className="w-[17px] h-[17px]" />
						</button>
					</div>
				</div>

				{/* ── Desktop header ── */}
				<div className="hidden lg:flex items-center justify-between h-[62px] px-4 md:px-6 gap-3">

					{/* Left: greeting */}
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div className="min-w-0">
							<h1 className="text-[17px] font-bold text-dark truncate leading-tight tracking-tight">
								{t('greeting', { name: user?.name?.split(' ')[0] || '' })}
							</h1>
							<p className="text-[12px] text-dark/38 font-medium mt-0.5 truncate">
								{t('description')}
							</p>
						</div>
					</div>

					{/* Right: desktop action cluster */}
					<div className="flex items-center gap-2 shrink-0">
						<div className="flex items-center gap-1">
							<LocaleSwitcher Trigger={({ onClick, disabled }) => (
								<button onClick={onClick} disabled={disabled} aria-label="Change language"
									className="w-9 h-9 flex items-center justify-center rounded-xl
                    bg-black/4 hover:bg-primary/8 text-dark/45 hover:text-primary
                    transition-all duration-200 disabled:opacity-40
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
									<GrLanguage className="w-[17px] h-[17px]" />
								</button>
							)} />

							<Link href="/dashboard/chats" aria-label={t('chats')}
								className="relative w-9 h-9 flex items-center justify-center rounded-xl
                  bg-black/4 hover:bg-primary/8 text-dark/45 hover:text-primary transition-all duration-200">
								<IoChatbubbleEllipsesOutline className="w-[17px] h-[17px]" />
								{unreadChatCount > 0 && (
									<span className="absolute -top-1 -end-1 flex h-4 w-4">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
										<span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold">
											{unreadChatCount > 9 ? '9+' : unreadChatCount}
										</span>
									</span>
								)}
							</Link>

							<NotificationDropdown />
						</div>

						{user && <div className="w-px h-5 bg-black/8 mx-0.5" />}

						{user && (
							<div className="flex items-center gap-2.5 ps-2.5 pe-1.5 py-1.5 rounded-xl
                bg-black/[0.032] border border-black/6
                shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_3px_rgba(0,0,0,0.04)]">
								<div className="hidden md:flex flex-col items-start rtl:items-end leading-none gap-1">
									<span className="text-[13px] font-bold text-dark truncate max-w-[115px]">{user.name}</span>
									<span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wide uppercase',
										tokens.badge)}>
										{tH(`roles.${role}`)}
									</span>
								</div>
								<div className="relative w-9 h-9 rounded-xl overflow-hidden
                  border border-black/8 shadow-[0_2px_6px_rgba(0,0,0,0.10)] shrink-0">
									<FallbackImage
										src={user.imagePath ? resolveUrl(user.imagePath) : '/users/default-user.png'}
										alt={user.name} width={36} height={36}
										className="w-full h-full object-cover" defaultImage="/users/default-user.png" />
									<span className="absolute bottom-0 end-0 flex h-2.5 w-2.5">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
										<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-[1.5px] border-white" />
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Mobile quick-action tray (notifications + chats) */}
			<MobileDashboardIcons open={subOpen} onClose={() => setSubOpen(false)} />
		</div>
	);
}


export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const locale =  useLocale()

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-[#eef0f6] dark:bg-[#0d0d1b]">

			<aside
				className="hidden lg:flex flex-col w-[76px] min-w-[76px] h-full shrink-0 z-30 relative"
				style={{
  boxShadow:
    locale === 'rtl'
      ? '-2px 0 1px rgba(0,0,0,0.05), -6px 0 16px rgba(0,0,0,0.08), -14px 0 36px rgba(0,0,0,0.05)'
      : '2px 0 1px rgba(0,0,0,0.05), 6px 0 16px rgba(0,0,0,0.08), 14px 0 36px rgba(0,0,0,0.05)',
}}>
				<DashboardSidebar />
			</aside>

			<MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			{/* Main area */}
			<div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
				<DashboardHeader onOpenSidebar={() => setSidebarOpen(true)} />
				<main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
					<div className="p-4 sm:p-6 lg:p-8 min-h-full">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}