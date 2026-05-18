'use client'
import PrimaryButton from "@/components/atoms/buttons/PrimaryButton";
import PropertyCategoryCard from "@/components/molecules/properties/PropertyCategoryCard";
import SwiperNav from "@/components/atoms/SwiperNav";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "use-intl";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { usePathname, useSearchParams } from "next/navigation";
import PropertyCategorySkeleton from "@/components/molecules/properties/PropertyCategorySkeleton";
import { useIndicatorPosition } from "@/hooks/useIndicatorPosition";
import { updateUrlParams } from "@/utils/helpers";
import { LuSearchX } from "react-icons/lu";
import api from "@/libs/axios";

type category = 'apartment' | 'family_housing' | 'villa';

export default function PropertyCategorySection() {
	const searchParams = useSearchParams();
	const locale = useLocale();
	const pathname = usePathname();
	const t = useTranslations('homePage.propertyCategory');
	const tEnums = useTranslations("property.enums");

	const [properties, setProperties] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [activeCategory, setActiveCategory] = useState<category>(
		(searchParams.get("category") as category) || 'apartment'
	);

	const activeSelector = `[data-category="${activeCategory}"]`;
	const indicatorRef = useIndicatorPosition(activeSelector);
	const isRTL = locale === 'ar';

	// Fetch Properties whenever activeCategory changes
	useEffect(() => {
		const fetchByCategory = async () => {
			setLoading(true);
			try {
				const res = await api.get('/properties/search', {
					params: {
						subTypes: activeCategory,
						limit: 10,
						sortBy: 'created_at',
						sortOrder: 'DESC',
					}
				});
				setProperties(res.data.records || []);
			} catch (error) {
				console.error("Category fetch failed", error);
			} finally {
				setLoading(false);
			}
		};
		fetchByCategory();
	}, [activeCategory]);

	const handleFilterClick = (value: category) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("category", value);
		setActiveCategory(value);
		updateUrlParams(pathname, params);
	};

	return (
		<section className="pt-10  bg-white ">
			<div className="py-12 sm:py-16 lg:py-20 container ">
				{/* Header & Filter Toggle */}
				<div>
					<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
						<div className={`max-w-2xl  `}>
							<div
								className={`flex items-center gap-2.5 mb-3  `} >
								<span aria-hidden="true" className="block h-1 w-10 rounded-full bg-secondary" />
								<span className="text-xs font-semibold tracking-widest uppercase text-secondary">
									{t('eyebrow')}
								</span>
							</div>

							<h2
								id="category-section-title"
								className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark md: leading-tight tracking-tight"
							>
								{t('title')}
							</h2>

							<p className="mt-3 text-sm sm:text-base text-dark/60 md: leading-relaxed max-w-2xl">
								{t('description')}
							</p>
						</div>

						{/* Tab Switcher */}
						<div className="relative border border-secondary p-1.5 rounded-full flex gap-1 bg-white shadow-sm">
							<div
								ref={indicatorRef}
								className="absolute bg-secondary transition-all duration-300 ease-in-out rounded-full z-0"
							/>
							{(['apartment', 'family_housing', 'villa'] as category[]).map((cat) => (
								<PrimaryButton
									key={cat}
									data-category={cat}
									className={`text-nowrap transition-colors duration-300 z-[1] px-6 py-2 rounded-full text-sm font-medium ${activeCategory === cat ? 'text-white' : 'text-black hover:text-secondary'
										}`}
									onClick={() => handleFilterClick(cat)}
								>
									{t(`filters.${cat}`)}
								</PrimaryButton>
							))}
						</div>
					</div>
				</div>

				{/* Main Content Area */}
				<div className="mt-[45px] bg-white relative min-h-[400px]">
					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
							{[...Array(3)].map((_, i) => (
								<PropertyCategorySkeleton key={i} />
							))}
						</div>
					) : properties.length === 0 ? (
						/* Empty State */
						<div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
							<div className="p-5 bg-gray-50 rounded-full mb-4">
								<LuSearchX size={50} className="text-gray-300" />
							</div>
							<h3 className="text-xl font-bold text-dark">{t('noProperties', { default: 'No properties found' })}</h3>
							<p className="text-gray-400 mt-2 max-w-sm">
								{t('emptyCategory', { default: 'We couldn’t find any listings in this category right now.' })}
							</p>
						</div>
					) : (
						<Swiper
							modules={[Navigation]}
							spaceBetween={20}
							navigation={{
								nextEl: isRTL ? '.category-prev' : '.category-next',
								prevEl: isRTL ? '.category-next' : '.category-prev',
							}}
							breakpoints={{
								0: { slidesPerView: 1 },
								1020: { slidesPerView: 2 },
								1280: { slidesPerView: 3 },
							}}
							onSlideChange={(swiper) => {
								const perView = swiper.params.slidesPerView as number;
								setCurrentPage(Math.floor(swiper.realIndex / perView) + 1);
								setTotalPages(Math.ceil(properties.length / perView));
							}}
							onInit={(swiper) => {
								const perView = swiper.params.slidesPerView as number;
								setTotalPages(Math.ceil(properties.length / perView));
							}}
						>
							{properties.map((property) => (
								<SwiperSlide key={property.id}>
									<PropertyCategoryCard
										property={{
											id: property.id,
											title: property.name,
											address: `${tEnums(`propertyType.${property.propertyType}`)} - ${tEnums(`subType.residential.${property.subType}`)}`,
											price: property.rentPrice || property.salePrice,
											imageUrl: property.images?.find((img: any) => img.is_primary)?.url || property.images?.[0]?.url,
											slug: property.slug
										}}
										locale={locale as 'ar' | 'en'}
									/>
								</SwiperSlide>
							))}
						</Swiper>
					)}
				</div>

				{/* Footer Navigation */}
				{!loading && properties.length > 0 && (
					<div className="flex justify-center mt-[40px]">
						<SwiperNav
							currentPage={currentPage}
							totalPages={totalPages}
							prevClass="category-prev"
							nextClass="category-next"
							dir={isRTL ? "rtl" : "ltr"}
						/>
					</div>
				)}
			</div>
		</section>
	);
}