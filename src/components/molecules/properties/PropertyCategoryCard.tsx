import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveUrl } from "@/utils/upload";
import FloatingActionButton from "@/components/atoms/buttons/FloatingActionButton";

type Property = {
	id: string;
	title: string;
	address: string;
	price: number;
	imageUrl: string;
	slug: string
};

export default function PropertyCategoryCard({
	property,
	locale,
}: {
	property: Property;
	locale: 'ar' | 'en';
}) {
	const period = locale === 'ar' ? '/ سنوى' : '/ Yearly';

	return (
		<div className="relative w-full max-w-full h-[484px] rounded-[24px]  bg-white overflow-hidden flex flex-col gap-6">
			{/* Accent corner blocks */}
			<div className="z-[1] absolute top-0 rtl:start-0 ltr:end-0 bg-white rounded-tr-[24px] w-[94px] h-[47px]" />
			<div className="z-[1] absolute top-0 rtl:start-0 ltr:end-0 bg-white rounded-tr-[24px] w-[47px] h-[94px]" />
			{/* Concave SVG decorations */}
			<div className="absolute top-[74px] rtl:-start-[20px] ltr:-end-[20px] z-10">
				<svg width="40" height="40" viewBox="0 0 40 40" className="block">
					<defs>
						<mask id="notch-bl">
							<rect x="0" y="0" width="40" height="40" fill="white" />
							<circle cx="0" cy="40" r="20" fill="black" />
						</mask>
					</defs>
					<rect x="0" y="0" width="40" height="40" fill="white" mask="url(#notch-bl)" />
				</svg>
			</div>

			<div className="absolute rtl:start-[74px] ltr:end-[74px] -top-[20px] z-10">
				<svg width="40" height="40" viewBox="0 0 40 40" className="block">
					<defs>
						<mask id="notch-bl">
							<rect x="0" y="0" width="40" height="40" fill="white" />
							<circle cx="0" cy="40" r="20" fill="black" />
						</mask>
					</defs>
					<rect x="0" y="0" width="40" height="40" fill="white" mask="url(#notch-bl)" />
				</svg>
			</div>
			{/* Floating action button */}
			<FloatingActionButton
				href={`/properties/${property.slug}`}
				bgColor="white"
				size={60}
			/>


			{/* Property details */}
			<div className="relative w-full h-full rounded-[24px] overflow-hidden">
				<Image src={property.imageUrl ? resolveUrl(property.imageUrl) : '/placeholder.jpg'} fill alt={property.title} className="rounded-[24px] object-cover filter brightness-[0.9] image-scale" />
			</div>

			<div className="p-3 pt-0 space-y-3">
				<span className="inline-flex items-center rounded-full bg-secondary/10 text-secondary px-3 py-1 text-[11px] font-semibold">
					{property.address}
				</span>

				<Link
					href={`/properties/${property.slug}`}
					className="block text-lg sm:text-xl font-bold text-dark leading-tight hover:text-secondary transition-colors duration-200 truncate whitespace-nowrap"				>
					{property.title}
				</Link>

				<div className="flex items-end justify-between gap-3 pt-1">
					<div className="flex items-baseline gap-2 flex-wrap">
						<span className="font-extrabold text-xl sm:text-2xl text-dark tabular-nums">
							{Number(property.price || 0).toLocaleString()}
						</span>
						<span className="text-sm text-gray-400 font-medium">
							{property.price} / {period}
						</span>
					</div>
				</div>
			</div>
 
		</div>
	);
}