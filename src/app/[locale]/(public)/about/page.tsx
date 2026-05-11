

import AboutDepartments from "@/components/pages/about/AboutDepartments";
import TeamSection from "@/components/pages/about/TeamSection";
import PageHeader from "@/components/atoms/PageHeader";
import PageHeroSection from "@/components/atoms/PageHeroSection";
import AboutMainSection from "@/components/pages/about/AboutMainSection";
import api from "@/libs/axios";
import { getLocale, getTranslations } from "next-intl/server";
import { CompanySection, type Team, type Department, type CompanyInfo } from "@/types/company";
import { resolveUrl } from "@/utils/upload";


export async function generateMetadata() {
	const t = await getTranslations("about");

	return {
		title: t("header"), // 👈 localized title
	};
}

export default async function AboutPage() {
	const t = await getTranslations("about");
	const locale = await getLocale()
	const isArabic = locale === 'ar';

	const [teamsRes, departmentsRes, companyInfoRes] = await Promise.all([
		api.get('/teams'),
		api.get('/departments'),
		api.get('/company-info'),
	]);

	// Extract actual data
	const { records: TeamRecords } = teamsRes.data;

	// Explicitly type records as Team[]
	const teams: Team[] = TeamRecords;

	const { records: departmentsRecords } = departmentsRes.data;

	const departments: Department[] = departmentsRecords;
	const companyInfo: CompanyInfo[] = companyInfoRes.data || [];

	// Helper function to get localized text
	const getLocalizedText = (en: string, ar: string) => isArabic ? ar : en;

	// Create a map for company info by section

	// Create a map for company info by section
	const companyInfoMap = companyInfo.reduce((acc, item) => {
		acc[item.section] = item;
		return acc;
	}, {} as Record<string, CompanyInfo>);

	const historyInfo = companyInfoMap[CompanySection.HISTORY];
	const whyUsInfo = companyInfoMap[CompanySection.WHY_US];
	const visionInfo = companyInfoMap[CompanySection.VISION];
	const missionInfo = companyInfoMap[CompanySection.MISSION];
	const goalsInfo = companyInfoMap[CompanySection.GOALS];


	return (
		<section className="overflow-y-hidden lg:overflow-x-hidden">
			<MainAboutSection />
			<div className=" pt-20 2xl:pb-[60px]" >

				<div className="container px-4 md:px-6 space-y-16 md:space-y-24">

					<div className="flex flex-col gap-[60px] md:gap-[80px] lg:gap-[100px]">

						{historyInfo && (
							<AboutMainSection data-aos="fade-up" title={getLocalizedText(historyInfo.title_en, historyInfo.title_ar)} imageSrc={historyInfo.imagePath ? resolveUrl(historyInfo.imagePath) : '/about/History.jpg'} text={getLocalizedText(historyInfo.content_en, historyInfo.content_ar)} />
						)}

						{whyUsInfo && (
							<AboutMainSection data-aos="fade-up" title={getLocalizedText(whyUsInfo.title_en, whyUsInfo.title_ar)} imageSrc={whyUsInfo.imagePath ? resolveUrl(whyUsInfo.imagePath) : '/about/Why.jpg'} reverse text={getLocalizedText(whyUsInfo.content_en, whyUsInfo.content_ar)} />
						)}

					</div>


					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
						{visionInfo && (
							<AboutInfoCard
								data-aos="fade-up" data-aos-delay="100"
								index={1}
								tagLabel={t("cards.visionTag")}
								title={getLocalizedText(visionInfo.title_en, visionInfo.title_ar)}
								text={getLocalizedText(visionInfo.content_en, visionInfo.content_ar)}
							/>
						)}
						{missionInfo && (
							<AboutInfoCard
								data-aos="fade-up" data-aos-delay="200"
								index={2}
								tagLabel={t("cards.missionTag")}
								title={getLocalizedText(missionInfo.title_en, missionInfo.title_ar)}
								text={getLocalizedText(missionInfo.content_en, missionInfo.content_ar)}
							/>
						)}
						{goalsInfo && (
							<AboutInfoCard
								data-aos="fade-up" data-aos-delay="300"
								index={3}
								tagLabel={t("cards.goalsTag")}
								title={getLocalizedText(goalsInfo.title_en, goalsInfo.title_ar)}
								text={getLocalizedText(goalsInfo.content_en, goalsInfo.content_ar)}
							/>
						)}
					</div>

					<AboutDepartments departments={departments} isArabic={isArabic} />

				</div>
				<TeamSection teams={teams} locale={locale} isArabic={isArabic} />
			</div>
		</section>
	);
}

async function MainAboutSection() {
	const t = await getTranslations('about.hero');

	return (
		<section
			id="about-us"
			className="relative overflow-hidden">
			<PageHeroSection
				title={t('title')}
				description={t('description')}
				buttonText={t('seeMore')}
			/>

		</section>
	);
}


interface InfoCardProps {
	title: string;
	text: string;
	className?: string; // optional extra styling
}

interface InfoCardProps {
	title: string;
	text: string;
	index?: number; // 1, 2, 3 — drives the decorative numeral
	tagLabel?: string; // e.g. "Vision", "Mission", "Goals"
	icon?: React.ReactNode;
	accentFrom?: string;
	accentTo?: string;
	className?: string;
	[key: string]: unknown;
}

// Default icons per card position — callers can override
const DEFAULT_ICONS = [
	// Eye / Vision
	<svg key="eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
		<circle cx="12" cy="12" r="2" />
		<path d="M22 12C20.667 9 17 5 12 5S3.333 9 2 12c1.333 3 5 7 10 7s8.667-4 10-7Z" />
	</svg>,
	// Shield / Mission
	<svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
		<path d="M12 22V12m0 0L8 8m4 4 4-4M6 3h12a1 1 0 0 1 1 1v5a8 8 0 0 1-16 0V4a1 1 0 0 1 1-1Z" />
	</svg>,
	// Layers / Goals
	<svg key="layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
		<path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
	</svg>,
];

const ACCENT_GRADIENTS = [
	"linear-gradient(90deg, var(--primary) 0%, var(--secondary) 60%, var(--light) 100%)",
	"linear-gradient(90deg, var(--secondary) 0%, var(--light) 60%, var(--lightGold) 100%)",
	"linear-gradient(90deg, var(--light) 0%, var(--secondary) 50%, var(--primary) 100%)",
];

const ICON_STROKES = [
	"var(--primary)",
	"var(--secondary)",
	"var(--light)",
];

function AboutInfoCard({
	title,
	text,
	index = 1,
	tagLabel,
	icon,
	className = "",
	...props
}: InfoCardProps) {
	const i = Math.min(Math.max(index, 1), 3) - 1;
	const accentGradient = ACCENT_GRADIENTS[i];
	const iconStroke = ICON_STROKES[i];
	const numeral = String(index).padStart(2, "0");
	const resolvedIcon = icon ?? (
		<span style={{ color: iconStroke }}>
			{DEFAULT_ICONS[i]}
		</span>
	);

	return (
		<div
			{...props}
			className={[
				"group relative overflow-hidden flex flex-col",
				"rounded-[20px] border border-[rgba(75,61,37,0.12)]",
				"bg-[var(--dashboard-bg)]",
				"transition-all duration-300 ease-out",
				"hover:-translate-y-[6px] hover:border-[rgba(75,61,37,0.22)]",
				"hover:shadow-[0_16px_48px_rgba(75,61,37,0.12)]",
				"min-h-[300px]",
				className,
			].join(" ")}
		>
			{/* Top gradient bar */}
			<div
				aria-hidden="true"
				className="h-[3px] w-full flex-shrink-0"
				style={{ background: accentGradient }}
			/>

			{/* Card body */}
			<div className="flex flex-col flex-1 px-7 pt-7 pb-8">
				{/* Icon bubble */}
				<div
					aria-hidden="true"
					className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-5 flex-shrink-0"
					style={{ background: "var(--lighter)" }}
				>
					{resolvedIcon}
				</div>

				{/* Title */}
				<h3
					className="font-bold text-[19px] leading-snug mb-3"
					style={{ color: "var(--primary)" }}
				>
					{title}
				</h3>

				{/* Rule */}
				<div
					className="w-8 h-[2px] rounded-full mb-4 flex-shrink-0"
					style={{ background: accentGradient }}
				/>

				{/* Body text */}
				<p
					className="text-[14px] md:text-[15px] leading-[1.8] flex-1"
					style={{ color: "var(--secondary-hover)" }}
				>
					{text}
				</p>

 
			</div>

			{/* Decorative background numeral */}
			<div
				aria-hidden="true"
				className="
          absolute bottom-5 end-6
          text-[80px] font-bold leading-none tracking-[-4px]
          select-none pointer-events-none
          transition-all duration-300
          text-[rgba(75,61,37,0.07)]
          group-hover:text-[rgba(75,61,37,0.12)]
          group-hover:scale-[1.08] group-hover:-translate-y-1
        "
				style={{ fontVariantNumeric: "tabular-nums" }}
			>
				{numeral}
			</div>
		</div>
	);
}
