import { Link } from "@/i18n/navigation";
import { IconType } from 'react-icons';

interface SettingsCardProps {
    title: string;
    description: string;
    icon: IconType;
    href?: string; // made optional
}

export default function SettingsCard({ title, description, href, icon: Icon }: SettingsCardProps) {
    const CardContent = (
        <div className="flex flex-col items-start gap-4 p-4 md:p-5 rounded-xl border border-gray-200 bg-card-bg shadow-sm h-full">
            {/* Icon */}
            <div className="flex items-center justify-center rounded-full text-primary bg-dashboard-bg p-2">
                <Icon size={28} className="shrink-0 w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />
            </div>

            {/* Text Content */}
            <div className="flex flex-col">
                <h3 className="text-lg md:text-xl font-semibold text-dark">{title}</h3>
                <p className="text-base md:text-lg text-input mt-1">{description}</p>
            </div>
        </div>
    );

    return href ? <Link href={href}>{CardContent}</Link> : CardContent;
}
