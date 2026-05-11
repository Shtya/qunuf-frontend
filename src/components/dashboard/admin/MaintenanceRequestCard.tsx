import { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MdElectricalServices, MdPlumbing, MdAcUnit } from "react-icons/md";
import { MaintenanceRequestCardType } from "@/types/dashboard/maintenance";
import { IconType } from "react-icons";


const typeIconMap: Record<string, IconType> = {
    Electrical: MdElectricalServices,
    Plumbing: MdPlumbing,
    HVAC: MdAcUnit,
};

export default function MaintenanceRequestCard({
    type,
    location,
    requestId,
    issue,
    user,
}: MaintenanceRequestCardType) {
    const t = useTranslations("dashboard.admin.maintenance");

    const Icon = typeIconMap[type];
    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 2xl:grid-cols-3 justify-between items-center gap-4 py-2">
            {/* Left: Type Icon */}
            <div className=" max-xs:col-span-1 flex items-center gap-4">
                <div className="flex items-center shrink-0 justify-center w-[58px] h-[58px] rounded-full"
                    style={{ background: '#E7EEE9' }}>
                    <Icon size={24} className="shrink-0" style={{
                        color: '#617C6C'
                    }} />
                </div>
                <div className="space-y-2">
                    <h1 className="font-medium text-sm sm:text-base">
                        {t(`type.${type}`)} | {location}
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base">
                        {t("requestId")}: {requestId}
                    </p>
                </div>
            </div>

            {/* Center: Issue */}
            <div className="xs:ms-auto max-xs:col-span-1 xs:text-center text-sm sm:text-base text-dark font-medium">
                {issue}
            </div>

            {/* Right: User Info */}
            <div className="max-xs:col-span-1 col-span-2 2xl:col-span-1 2xl:ms-auto flex items-center gap-2">
                <div className="relative w-[44px] h-[44px]">
                    <Image
                        src={user.imageSrc}
                        fill
                        alt={user.name}
                        className="rounded-full object-cover"
                    />
                </div>
                <p className="text-dark text-base font-semibold">{user.name}</p>
            </div>

        </div>
    );
}
