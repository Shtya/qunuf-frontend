import { Link } from "@/i18n/navigation";
import { ComponentType, ReactNode, SVGProps } from "react";
import Tooltip from "./Tooltip";
import PrimaryButton from "./buttons/PrimaryButton";

interface SidebarItemProps {
    href: string;
    label: string;
    isActive: boolean;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    disabled: boolean;
}

export default function SidebarItem({
    href,
    label,
    isActive,
    Icon,
    disabled,
}: SidebarItemProps) {
    const mobileClass = `flex gap-2 items-center justify-start w-full px-4 py-2 rounded lg:hidden rounded-lg ${isActive
        ? "bg-secondary text-white hover:bg-secondary-hover"
        : "bg-lighter text-dark hover:bg-light"
        }`;

    const desktopClass = `rounded-full flex-center w-[60px] h-[60px] ${isActive ? "bg-primary hover:bg-primary-hover" : "hover:bg-gray"
        } cursor-pointer`;

    const iconClass = `w-6 h-6 ${isActive ? "text-white " : "text-dark"}`;

    return (
        <div>
            {/* Mobile view with label */}
            <PrimaryButton href={href} className={mobileClass}>
                {Icon && <Icon className={iconClass} />} {label}
            </PrimaryButton>

            {/* Desktop view with tooltip */}
            <div className="hidden lg:block">
                <Tooltip content={label} position="top">
                    <Link href={href} className={`${disabled && "disabled"}`}>
                        <div className={desktopClass}>
                            {Icon && <Icon className={iconClass} />}
                        </div>
                    </Link>
                </Tooltip>
            </div>
        </div>
    );
}
