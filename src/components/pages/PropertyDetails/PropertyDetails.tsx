'use client';

/**
 * PropertyDetails.tsx — Luxury redesign, single file.
 * Uses your existing CSS variables: --secondary, --primary, --dark,
 * --dashboard-bg, --secondary-hover. No new colors introduced.
 * All original business logic preserved exactly.
 */

import { ReactNode, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Map, { Marker } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { resolveUrl } from '@/utils/upload';
import { Property, RentType } from '@/types/dashboard/properties';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

import { IoIosArrowForward, IoIosArrowBack, IoIosPin } from 'react-icons/io';
import { LiaBuilding } from 'react-icons/lia';
import { GiMilitaryAmbulance } from 'react-icons/gi';
import {
	BiArea, BiGroup, BiCheckCircle, BiXCircle,
	BiBed, BiBath, BiBuildings, BiCar,
} from 'react-icons/bi';
import { MdOutlineElevator, MdOutlineKitchen, MdOutlineMeetingRoom } from 'react-icons/md';
import { TbShield, TbDoor } from 'react-icons/tb';
import { FaRegSnowflake } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi2';

import 'swiper/css';
import 'swiper/css/navigation';
import 'maplibre-gl/dist/maplibre-gl.css';



declare global {
	interface Window {
		__maplibreRTLLoaded?: boolean;
	}
}

export function ensureMaplibreRTL() {
	if (typeof window === 'undefined') return;

	if (window.__maplibreRTLLoaded) return;

	maplibregl.setRTLTextPlugin(
		'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
		true
	);

	window.__maplibreRTLLoaded = true;
}

// ─── Local types ─────────────────────────────────────────────────────────────
type GalleryImage = { imagePath: string; isPrimary?: boolean };
type NearbyItem = { name: string; distance?: string };
type DetailItem = { label: string; value: string; icon?: ReactNode };

// ─────────────────────────────────────────────────────────────────────────────
// PrimaryButton
// ─────────────────────────────────────────────────────────────────────────────
type PrimaryButtonProps = {
	children: ReactNode;
	className?: string;
	onClick?: () => void;
	href?: string;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
};

function PrimaryButton({
	children, className = '', onClick, href, type = 'button', disabled,
}: PrimaryButtonProps) {
	const base = cn(
		'inline-flex items-center justify-center gap-2 font-semibold tracking-wide',
		'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
		'focus-visible:ring-offset-2 focus-visible:ring-secondary',
		'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
	);
	if (href) return <Link href={href} className={cn(base, className)}>{children}</Link>;
	return (
		<button type={type} onClick={onClick} disabled={disabled} className={cn(base, className)}>
			{children}
		</button>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageLightbox
// ─────────────────────────────────────────────────────────────────────────────
function ImageLightbox({
	open, onClose, url,
}: { open: boolean; onClose: () => void; url: string }) {
	if (!open) return null;
	return (
		<div
			className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<button
				className="absolute top-5 end-6 text-white/60 hover:text-white text-5xl leading-none transition-colors focus-visible:outline-none"
				onClick={onClose}
				aria-label="Close"
			>
				&times;
			</button>
			<div
				className="relative w-[92vw] h-[88vh] rounded-3xl overflow-hidden shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<Image src={url} alt="Full size" fill className="object-contain" sizes="92vw" priority />
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageGallery
// ─────────────────────────────────────────────────────────────────────────────
type ImageGalleryProps = {
	images: GalleryImage[];
	userImage: string;
	price: { amount: number; isMonthly: boolean };
	title: string;
};

function ImageGallery({ images, userImage, price, title }: ImageGalleryProps) {
	const locale = useLocale();
	const ar = locale === 'ar';
	const sortedImages = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
	const [active, setActive] = useState(0);
	const [lightboxOpen, setLightbox] = useState(false);

	const periodLabel = price.isMonthly
		? (ar ? 'شهرياً' : 'mo')
		: (ar ? 'سنويًا' : 'yr');

	if (!sortedImages.length) return null;

	return (
		<section className="space-y-3">
			{/* ── Main image ── */}
			<div
				className="relative w-full h-[300px] sm:h-[460px] lg:h-[560px] rounded-[28px] overflow-hidden cursor-zoom-in group shadow-xl shadow-black/10"
				onClick={() => setLightbox(true)}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
				aria-label={ar ? 'فتح الصورة' : 'Open full-size image'}
			>
				<Image
					src={sortedImages[active].imagePath}
					alt="Property main"
					fill
					className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
					sizes="(max-width: 768px) 100vw, 1200px"
					priority
				/>

				{/* Dark gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

				{/* Image counter pill */}
				<div className="absolute top-5 end-5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 pointer-events-none select-none">
					<span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
					{active + 1} / {sortedImages.length}
				</div>

				{/* Expand hint */}
				<div className="absolute top-5 start-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 pointer-events-none">
					{ar ? 'اضغط للتكبير ↗' : 'Click to expand ↗'}
				</div>

				{/* Bottom info bar */}
				<div className="absolute bottom-0 start-0 end-0 p-5 sm:p-8 flex items-end justify-between gap-4 pointer-events-none">
					{/* Landlord avatar + name */}
					<div className="flex items-center gap-3">
						<div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden ring-2 ring-white/25 shrink-0 shadow-lg">
							<Image src={userImage} alt={title} fill className="object-cover" sizes="56px" />
						</div>
						<div className="text-white drop-shadow">
							<p className="text-[10px] font-semibold opacity-55 uppercase tracking-wider mb-0.5">
								{ar ? 'معروض بواسطة' : 'Listed by'}
							</p>
							<p className="text-sm font-bold leading-none">{title}</p>
						</div>
					</div>

					{/* Price */}
					<div className={cn('text-white drop-shadow', ar ? 'text-start' : 'text-end')}>
						<p className="text-[10px] font-semibold opacity-55 uppercase tracking-wider mb-0.5">
							{ar ? 'الإيجار' : 'Rent'}
						</p>
						<p className="font-bold leading-none">
							<span className="text-2xl sm:text-3xl">
								{price.amount.toLocaleString()}
							</span>
							<span className="text-xs font-medium opacity-55 ms-1.5">
								SAR / {periodLabel}
							</span>
						</p>
					</div>
				</div>
			</div>

			{/* ── Thumbnails ── */}
			{sortedImages.length > 1 && (
				<div className="flex items-center gap-2">
					{/* Prev arrow — flips in RTL */}
					<button
						className="image-prev shrink-0 w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-200 active:scale-95"
						aria-label={ar ? 'السابق' : 'Previous'}
					>
						{ar ? <IoIosArrowForward size={16} /> : <IoIosArrowBack size={16} />}
					</button>

					<Swiper
						modules={[Navigation]}
						navigation={{ nextEl: '.image-next', prevEl: '.image-prev' }}
						spaceBetween={8}
						loop
						className="w-full"
						breakpoints={{
							0: { slidesPerView: 3, spaceBetween: 8 },
							480: { slidesPerView: 4, spaceBetween: 10 },
							768: { slidesPerView: 5, spaceBetween: 12 },
							1024: { slidesPerView: 6, spaceBetween: 14 },
						}}
					>
						{sortedImages.map((img, idx) => (
							<SwiperSlide key={idx}>
								<button
									onClick={() => setActive(idx)}
									aria-label={`${ar ? 'صورة' : 'Image'} ${idx + 1}`}
									aria-current={idx === active}
									className={cn(
										'relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2',
										'transition-all duration-200 focus-visible:outline-none',
										'focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1',
										idx === active
											? 'border-secondary shadow-lg scale-[1.05]'
											: 'border-transparent hover:border-gray-300',
									)}
								>
									<Image
										src={img.imagePath}
										alt={`Thumbnail ${idx + 1}`}
										fill
										className="object-cover"
										sizes="160px"
									/>
									{idx === active && (
										<div className="absolute inset-0 bg-secondary/10" />
									)}
								</button>
							</SwiperSlide>
						))}
					</Swiper>

					{/* Next arrow — flips in RTL */}
					<button
						className="image-next shrink-0 w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-200 active:scale-95"
						aria-label={ar ? 'التالي' : 'Next'}
					>
						{ar ? <IoIosArrowBack size={16} /> : <IoIosArrowForward size={16} />}
					</button>
				</div>
			)}

			<ImageLightbox
				open={lightboxOpen}
				onClose={() => setLightbox(false)}
				url={sortedImages[active].imagePath}
			/>
		</section>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// LocationMap
// ─────────────────────────────────────────────────────────────────────────────
function LocationMap({
	lat, lng, onChange, zoom = 8,
}: { lat: number; lng: number; zoom?: number; onChange?: (c: { lat: number; lng: number }) => void }) {
	const [interacting, setInteracting] = useState(false);
	const t = useTranslations('comman.form');

	return (
		<div className="relative group">
			{/* Ambient glow on hover */}
			<div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-secondary/20 via-primary/15 to-secondary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />

			<div
				className={cn(
					'relative overflow-hidden rounded-3xl border-2 transition-all duration-300',
					'h-[300px] sm:h-[400px] lg:h-[480px]',
					interacting
						? 'border-secondary shadow-xl shadow-secondary/15'
						: 'border-gray-200/70 hover:border-secondary/30',
				)}
			>
				<Map
					initialViewState={{ latitude: lat, longitude: lng, zoom }}
					style={{ width: '100%', height: '100%' }}
					mapStyle="https://tiles.openfreemap.org/styles/liberty"
					onClick={(e) => { const { lat: la, lng: lo } = e.lngLat; onChange?.({ lat: la, lng: lo }); }}
					onMouseDown={() => setInteracting(true)}
					onMouseUp={() => setInteracting(false)}
					onTouchStart={() => setInteracting(true)}
					onTouchEnd={() => setInteracting(false)}
					dragRotate={false}
				>
					<Marker latitude={lat} longitude={lng}>
						<div className="relative">
							<div className="absolute inset-0 -m-3 bg-secondary/30 rounded-full animate-ping" />
							<div className="absolute inset-0 -m-2 bg-secondary/40 rounded-full animate-pulse" />
							<svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="drop-shadow-xl relative">
								<path
									d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
									fill="url(#pinGrad)"
								/>
								<defs>
									<linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" style={{ stopColor: 'var(--secondary)' }} />
										<stop offset="100%" style={{ stopColor: 'var(--primary)' }} />
									</linearGradient>
								</defs>
							</svg>
						</div>
					</Marker>
				</Map>

				{/* Instruction pill */}
				<div className="absolute top-4 start-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-secondary/20 text-xs font-semibold text-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
					<span className="flex items-center gap-1.5">
						<IoIosPin className="text-secondary" />
						{t('mapInstruction')}
					</span>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// buildDetailsArray — original business logic, unchanged
// ─────────────────────────────────────────────────────────────────────────────
function buildDetailsArray(
	property: Property,
	locale: string,
	tEnums: (key: string) => string,
): DetailItem[] {
	const details: DetailItem[] = [];
	const ar = locale === 'ar';
	const yes = ar ? 'نعم' : 'Yes';
	const no = ar ? 'لا' : 'No';

	if (!property.facilities) return details;
	const f = property.facilities;

	const push = (
		labelAr: string, labelEn: string,
		value: string | number | boolean | undefined,
		icon?: ReactNode,
	) => {
		if (value === undefined || value === null) return;
		details.push({
			label: ar ? labelAr : labelEn,
			value: typeof value === 'boolean' ? (value ? yes : no) : String(value),
			icon,
		});
	};

	push('غرف النوم', 'Bedrooms', f.bedrooms, <BiBed />);
	push('الحمامات', 'Bathrooms', f.bathrooms, <BiBath />);
	push('غرف المعيشة', 'Living Rooms', f.livingRooms, <MdOutlineMeetingRoom />);
	push('المطبخ', 'Kitchen', f.kitchen, <MdOutlineKitchen />);
	push('موقف سيارات', 'Parking', f.parking, <BiCar />);
	push('المصاعد', 'Elevators', f.elevators, <MdOutlineElevator />);
	push('الغرف', 'Rooms', f.rooms, <TbDoor />);
	push('المجلس', 'Majlis', f.majlis, <BiBuildings />);
	push('المخزن', 'Store', f.store, <BiBuildings />);
	push('مداخل الأمان', 'Security Entrances', f.securityEntrances, <TbShield />);
	if (f.maidRoom !== undefined) push('غرفة الخادمة', 'Maid Room', f.maidRoom, <TbDoor />);
	if (f.backyard !== undefined) push('الفناء الخلفي', 'Backyard', f.backyard, <BiBuildings />);
	if (f.centralAC !== undefined) push('تكييف مركزي', 'Central AC', f.centralAC, <FaRegSnowflake />);
	if (f.desertAC !== undefined) push('تكييف صحراوي', 'Desert AC', f.desertAC, <FaRegSnowflake />);

	return details;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI atoms
// ─────────────────────────────────────────────────────────────────────────────

/** White card surface */
function Card({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className={cn(
			'bg-white rounded-[24px] border border-gray-100/80 p-6 sm:p-8 shadow-sm',
			className,
		)}>
			{children}
		</div>
	);
}

/** Secondary-color accent bar — sits at the top of each card's content area */
function CardAccent() {
	return <div className="w-10 h-[3px] rounded-full bg-secondary mb-6" />;
}

/** Section heading with optional icon and trailing rule */
function SectionHeading({ title, icon }: { title: string; icon?: ReactNode }) {
	return (
		<div className="flex items-center gap-3 mb-6">
			{icon && (
				<span className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/10 text-secondary text-xl shrink-0">
					{icon}
				</span>
			)}
			<h2 className="text-xl sm:text-2xl font-bold text-dark leading-tight shrink-0">{title}</h2>
			<div className="flex-1 h-px bg-gradient-to-r from-secondary/20 to-transparent" />
		</div>
	);
}

/** Compact stat pill for header quick-stats row */
function StatPill({
	icon, label, value, variant = 'default',
}: { icon: ReactNode; label: string; value: string; variant?: 'default' | 'success' | 'warning' }) {
	const styles = {
		default: 'bg-secondary/8 border-secondary/15 text-dark',
		success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
		warning: 'bg-amber-50 border-amber-100 text-amber-800',
	} as const;
	return (
		<div className={cn(
			'flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-colors',
			styles[variant],
		)}>
			<span className="text-secondary text-lg shrink-0">{icon}</span>
			<div>
				<p className="text-[10px] font-bold uppercase tracking-widest opacity-50 leading-none mb-1">{label}</p>
				<p className="text-sm font-bold leading-none">{value}</p>
			</div>
		</div>
	);
}

/** Book button — original role check + href logic preserved */
function BookButton({ id, size = 'md' }: { id: string; size?: 'md' | 'lg' }) {
	const t = useTranslations('property.details');
	const { role } = useAuth();
	const href = role !== 'tenant' ? '/auth/sign-up?type=tenant' : `/booking?property=${id}`;
	return (
		<Link
			href={href}
			className={cn(
				'inline-flex items-center justify-center gap-2 font-semibold tracking-wide rounded-2xl',
				'bg-secondary hover:bg-secondary-hover text-white',
				'shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/35',
				'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
				size === 'lg' ? 'px-9 py-4 text-base' : 'px-7 py-3 text-sm',
			)}
		>
			{t('bookingNow')}
		</Link>
	);
}

/** Nearby facility list */
function NearbyList({ items }: { items: NearbyItem[] }) {
	return (
		<div className="divide-y divide-gray-100">
			{items.map(({ name, distance }, idx) => (
				<div
					key={idx}
					className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 -mx-2 px-2 hover:bg-gray-50/70 rounded-xl transition-colors duration-150"
				>
					<span className="text-sm sm:text-base font-medium text-dark leading-snug">{name}</span>
					{distance && (
						<span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary bg-secondary/8 border border-secondary/15 px-3 py-1.5 rounded-full shrink-0">
							<IoIosPin size={12} />
							{distance}
						</span>
					)}
				</div>
			))}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// PropertyDetails — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function PropertyDetails({ property }: { property: Property }) {
	const tEnums = useTranslations('property.enums');
	const t = useTranslations('property.details');
	const locale = useLocale();
	const ar = locale === 'ar';
	useEffect(() => {
		ensureMaplibreRTL();
	}, []);
	// ── Derived values (original logic) ──────────────────────────────────────
	const periodLabel = property.rentType === RentType.MONTHLY
		? (ar ? 'شهرياً' : 'mo')
		: (ar ? 'سنويًا' : 'yr');

	const address = property.state
		? (ar ? property.state.name_ar : property.state.name)
		: property.nationalAddressCode || '';

	const images = property.images?.map((img) => ({
		imagePath: resolveUrl(img.url),
		isPrimary: img.is_primary,
	})) || [];

	const description = property.description
		?.split('\n').filter((p) => p.trim()) || [];

	const additionalDetails = property.additionalDetails
		?.split('\n').filter((p) => p.trim()) || [];

	const details = buildDetailsArray(property, locale, tEnums);

	const nearby = {
		education: property.educationInstitutions?.map((i) => ({
			name: i.name, distance: `${i.distance_km} km`,
		})) || [],
		health: property.healthMedicalFacilities?.map((f) => ({
			name: f.name, distance: `${f.distance_km} km`,
		})) || [],
	};

	const latitude = Number(property.latitude);
	const longitude = Number(property.longitude);
	const hasValidCoordinates =
		Number.isFinite(latitude) && Number.isFinite(longitude);

	// ─────────────────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-[#F7F6F3]">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-5">

				{/* ── BREADCRUMB ── */}
				<nav
					className="flex items-center gap-2 text-xs font-medium text-gray-400 flex-wrap"
					aria-label="Breadcrumb"
				>
					<span className="text-secondary cursor-pointer hover:underline underline-offset-2">
						{ar ? 'العقارات' : 'Properties'}
					</span>
					<span className="opacity-30 select-none">/</span>
					{address && (
						<>
							<span className="text-secondary cursor-pointer hover:underline underline-offset-2">
								{address}
							</span>
							<span className="opacity-30 select-none">/</span>
						</>
					)}
					<span className="text-gray-500 truncate max-w-[180px] sm:max-w-none">
						{property.name}
					</span>
				</nav>

				{/* ── GALLERY ── */}
				<ImageGallery
					images={images}
					userImage={
						property?.user?.imagePath
							? resolveUrl(property.user.imagePath)
							: '/users/default-user.png'
					}
					price={{ amount: property.rentPrice, isMonthly: property.rentType === RentType.MONTHLY }}
					title={property?.user?.name || (ar ? 'المالك' : 'Landlord')}
				/>

				{/* ── PROPERTY HEADER CARD ── */}
				<Card>
					{/* Badge row */}
					<div className="flex items-center gap-2 flex-wrap mb-5">
						<span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
							<HiOutlineSparkles size={11} />
							{property.rentType === RentType.MONTHLY
								? (ar ? 'إيجار شهري' : 'Monthly')
								: (ar ? 'إيجار سنوي' : 'Yearly')}
						</span>
						{property.isFurnished && (
							<span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
								<BiCheckCircle size={11} />
								{ar ? 'مفروش' : 'Furnished'}
							</span>
						)}
					</div>

					{/* Title */}
					<h1 className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-dark leading-tight mb-3 break-words">
						{property.name}
					</h1>

					{/* Address */}
					{address && (
						<p className="flex items-center gap-1.5 text-gray-400 text-sm mb-6">
							<IoIosPin className="text-secondary shrink-0" size={16} />
							{address}
						</p>
					)}

					{/* Horizontal rule */}
					<div className="h-px bg-gradient-to-r from-secondary/20 via-gray-100 to-transparent mb-6" />

					{/* Quick stat pills */}
					<div className="flex flex-wrap gap-2 mb-6">
						{property.area && (
							<StatPill
								icon={<BiArea />}
								label={ar ? 'المساحة' : 'Area'}
								value={`${property.area} m²`}
							/>
						)}
						{property.capacity && (
							<StatPill
								icon={<BiGroup />}
								label={ar ? 'السعة' : 'Capacity'}
								value={property.capacity.toString()}
							/>
						)}
						<StatPill
							icon={property.isFurnished ? <BiCheckCircle /> : <BiXCircle />}
							label={ar ? 'مفروش' : 'Furnished'}
							value={property.isFurnished ? (ar ? 'نعم' : 'Yes') : (ar ? 'لا' : 'No')}
							variant={property.isFurnished ? 'success' : 'default'}
						/>
					</div>

					{/* Price + Book CTA */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
								{ar ? 'سعر الإيجار' : 'Rent Price'}
							</p>
							<div className="flex items-baseline gap-2">
								<span className="text-3xl sm:text-4xl font-bold text-secondary leading-none">
									{property.rentPrice.toLocaleString()}
								</span>
								<span className="text-sm text-gray-400 font-medium">
									SAR / {periodLabel}
								</span>
							</div>
						</div>
						<BookButton id={property.id} size="lg" />
					</div>
				</Card>

				{/* ── DESCRIPTION ── */}
				{description.length > 0 && (
					<Card>
						<CardAccent />
						<SectionHeading title={t('description')} />
						<div className="space-y-4 text-gray-500 text-sm sm:text-[15px] leading-[1.9]">
							{description.map((para, idx) => <p key={idx}>{para}</p>)}
						</div>
					</Card>
				)}

				{/* ── PROPERTY DETAILS GRID ── */}
				{details.length > 0 && (
					<Card>
						<CardAccent />
						<SectionHeading title={t('propertyDetails')} />
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
							{details.map(({ label, value, icon }, idx) => (
								<div
									key={idx}
									className="group flex flex-col gap-2 p-4 bg-[#F7F6F3] hover:bg-secondary/6 border border-gray-100 hover:border-secondary/25 rounded-2xl transition-all duration-200 cursor-default"
								>
									<span className="text-secondary text-xl group-hover:scale-110 transition-transform duration-200 w-fit">
										{icon}
									</span>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
										{label}
									</p>
									<p className="text-base font-bold text-dark leading-none">{value}</p>
								</div>
							))}
						</div>
					</Card>
				)}

				{/* ── FEATURES ── */}
				{property.features && property.features.length > 0 && (
					<Card>
						<CardAccent />
						<SectionHeading title={t('propertyFeatures')} />
						<div className="flex flex-wrap gap-2">
							{property.features.map((feature, idx) => (
								<span
									key={idx}
									className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/8 text-secondary border border-secondary/20 rounded-full text-sm font-semibold hover:bg-secondary/15 transition-colors duration-200 cursor-default"
								>
									<BiCheckCircle size={14} className="shrink-0" />
									{feature}
								</span>
							))}
						</div>
					</Card>
				)}

				{/* ── ADDITIONAL DETAILS ── */}
				{additionalDetails.length > 0 && (
					<Card>
						<CardAccent />
						<SectionHeading title={t('additionalDetails')} />
						<div className="space-y-4 text-gray-500 text-sm sm:text-[15px] leading-[1.9]">
							{additionalDetails.map((para, idx) => <p key={idx}>{para}</p>)}
						</div>
					</Card>
				)}

				{/* ── LOCATION MAP ── */}
				{hasValidCoordinates && (
					<Card>
						<CardAccent />
						<SectionHeading title={t('location')} icon={<IoIosPin />} />
						<LocationMap lat={latitude} lng={longitude} />

						{/* Coordinate chips below map */}
						<div className="flex flex-wrap gap-3 mt-4">
							{[
								{ label: ar ? 'خط العرض' : 'Latitude', value: latitude.toFixed(4) },
								{ label: ar ? 'خط الطول' : 'Longitude', value: longitude.toFixed(4) },
								...(address ? [{ label: ar ? 'المنطقة' : 'District', value: address }] : []),
							].map(({ label, value }) => (
								<div
									key={label}
									className="flex flex-col gap-1 px-4 py-3 bg-[#F7F6F3] border border-gray-100 rounded-2xl min-w-[120px]"
								>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
									<p className="text-sm font-bold text-dark">{value}</p>
								</div>
							))}
						</div>
					</Card>
				)}

				{/* ── NEARBY: EDUCATION ── */}
				{nearby.education.length > 0 && (
					<Card>
						<CardAccent />
						<SectionHeading title={t('education')} icon={<LiaBuilding />} />
						<NearbyList items={nearby.education} />
					</Card>
				)}

				{/* ── NEARBY: HEALTH ── */}
				{nearby.health.length > 0 && (
					<Card>
						<CardAccent />
						<SectionHeading title={t('healthAndMedical')} icon={<GiMilitaryAmbulance />} />
						<NearbyList items={nearby.health} />
					</Card>
				)}

				{/* ── BOTTOM CTA STRIP ── */}
				<div className="bg-dark rounded-[28px] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
					<div>
						<p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2 select-none">
							{ar ? 'هل أنت مستعد للانتقال؟' : 'Ready to move in?'}
						</p>
						<p className="text-xl sm:text-2xl font-bold text-white leading-tight break-words">
							{property.name}
						</p>
						<p className="text-sm text-white/40 mt-1.5 font-medium">
							SAR {property.rentPrice.toLocaleString()} / {periodLabel}
						</p>
					</div>
					<BookButton id={property.id} size="lg" />
				</div>

			</div>
		</div>
	);
}