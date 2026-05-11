import { FaBars } from "react-icons/fa";
import NotificationDropdown from "../atoms/NotificationDropdown";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "../atoms/LocaleSwitcher";
import { GrLanguage } from "react-icons/gr";
import { useTranslations } from "next-intl";
import { useDashboardHref } from "@/hooks/dashboard/useDashboardHref";
import MobileDashboardIcons from "./MobileDashboardIcons";
import { RxDotsHorizontal } from "react-icons/rx";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { UserRole } from "@/constants/user";
import FallbackImage from "../atoms/FallbackImage";
import { resolveUrl } from "@/utils/upload";

export default function DashboardHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
	const tHeader = useTranslations('header');
	const t = useTranslations('dashboard.header');
	const [subHeaderOpen, setSubHeaderOpen] = useState(false);
	const { getHref } = useDashboardHref();
	const { user } = useAuth();
	const { unreadChatCount } = useSocket();

	function toggleSubHeader() {
		setSubHeaderOpen(p => !p);
	}

	const roleStyles: Record<UserRole, string> = {
		[UserRole.ADMIN]: 'text-red-600 bg-gradient-to-r from-red-50 to-red-100/50 border-red-200',
		[UserRole.LANDLORD]: 'text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200',
		[UserRole.TENANT]: 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200',
	};

	return (
		<div>
			<header className="px-4 md:px-6 bg-white/80 backdrop-blur-sm border-b border-gray/10 sticky top-0 z-40">
				<div className="py-[21px] flex justify-between items-center h-[98px] sm:h-[107px] md:h-[112px]">

					{/* Left: Mobile Dots & Greeting */}
					<div className="flex items-center gap-4">
						{/* Mobile Menu Toggle */}
						<button
							onClick={() => setSubHeaderOpen(!subHeaderOpen)}
							className={`lg:hidden p-2.5 rounded-xl transition-all duration-200 ${subHeaderOpen
									? "bg-primary text-white shadow-md"
									: "bg-secondary/80 hover:bg-primary text-white hover:shadow-md"
								}`}
							aria-label="Toggle mobile menu"
						>
							<RxDotsHorizontal className="text-xl" />
						</button>

						{/* Greeting Section */}
						<div className="space-y-0.5">
							<h1 className="text-xl sm:text-2xl md:text-[32px] font-bold text-dark leading-tight bg-gradient-to-r from-dark to-dark/80 bg-clip-text">
								{t('greeting', { name: user?.name?.split(' ')[0] || "There" })}
							</h1>
							<p className="hidden sm:block text-sm md:text-base text-dark/60 font-medium">
								{t('description')}
							</p>
						</div>
					</div>

					{/* Right: Actions + User Profile */}
					<div className="flex items-center gap-3 md:gap-4">
						{/* Desktop Quick Actions */}
						<div className="hidden lg:flex gap-2 items-center">
							{/* Language Switcher */}
							<LocaleSwitcher Trigger={LocaleTrigger} />

							{/* Chat Button */}
							<Link href="/dashboard/chats">
								<div className="relative group">
									{/* Button */}
									<div className="relative bg-secondary hover:bg-primary rounded-full p-3 transition-all duration-200 shadow-sm hover:shadow-md">
										<IoChatbubbleEllipsesOutline size={20} className="text-white group-hover:scale-110 transition-transform duration-200" />

										{/* Unread Badge */}
										{unreadChatCount > 0 && (
											<span className="absolute -top-1 -right-1 flex h-5 w-5">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
												<span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold shadow-md">
													{unreadChatCount > 9 ? '9+' : unreadChatCount}
												</span>
											</span>
										)}
									</div>
								</div>
							</Link>

							{/* Notification Dropdown */}
							<NotificationDropdown />
						</div>

						{/* User Profile Card */}
						{user && (
							<div className="relative group">
								{/* Gradient border effect on hover */}
								<div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />

								{/* Profile Card */}
								<div className="relative flex items-center gap-3 ps-4 py-2 pe-2 border-s border-gray/10 bg-gradient-to-r from-transparent to-secondary/5 rounded-r-2xl group-hover:to-secondary/10 transition-all duration-300">
									{/* User Info - Desktop */}
									<div className="hidden md:flex flex-col items-end leading-tight">
										<span className="text-sm font-bold text-dark truncate max-w-[120px] group-hover:text-primary transition-colors duration-200">
											{user.name}
										</span>
										{/* Role Badge */}
										<span className={[
											"text-[9px] uppercase tracking-tight font-bold px-2 py-1 rounded-lg border mt-1.5 shadow-sm transition-all duration-200",
											roleStyles[user.role as UserRole] || "text-secondary bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200"
										].join(' ')}>
											{tHeader(`roles.${user.role}`)}
										</span>
									</div>

									{/* Avatar */}
									<div className="relative shrink-0">
										{/* Glow effect on hover */}
										<div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-primary/50 to-primary/30 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />

										{/* Avatar Image */}
										<div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-secondary group-hover:border-primary transition-all duration-300 ring-2 ring-transparent group-hover:ring-primary/20 shadow-md">
											<FallbackImage
												src={user.imagePath ? resolveUrl(user.imagePath) : '/users/default-user.png'}
												alt={user.name}
												width={44}
												height={44}
												className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
												defaultImage="/users/default-user.png"
											/>
										</div>

										{/* Online Status Indicator */}
										<span className="absolute bottom-0 right-0 flex h-3 w-3">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
											<span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-white shadow-sm"></span>
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Mobile Sidebar Toggle */}
						<button
							onClick={onOpenSidebar}
							className="lg:hidden p-2.5 rounded-xl bg-secondary hover:bg-primary text-white transition-all duration-200 shadow-sm hover:shadow-md"
							aria-label="Open navigation menu"
						>
							<FaBars className="text-xl" />
						</button>
					</div>
				</div>
			</header>

			{/* Mobile Dashboard Icons */}
			<MobileDashboardIcons open={subHeaderOpen} onClose={() => setSubHeaderOpen(false)} />
		</div>
	);
}

// Enhanced Locale Trigger
function LocaleTrigger({
	onClick,
	disabled,
}: {
	onClick: () => void;
	disabled: boolean;
}) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className="relative group bg-secondary hover:bg-primary rounded-full p-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Toggle locale"
		>
			{/* Glow effect on hover */}
			<div className="absolute -inset-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-200" />
			<GrLanguage size={20} className="relative text-white group-hover:scale-110 transition-transform duration-200" />
		</button>
	);
}