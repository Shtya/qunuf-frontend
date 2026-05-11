import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveUrl } from "@/utils/upload";
import { Property, PropertyStatus } from "@/types/dashboard/properties";
import SmartTooltip from "@/components/atoms/SmartTooltip";

// تعريف واجهة صورة العقار بناءً على الـ Entity في الباك إند
export interface PropertyImage {
    url: string;
    is_primary: boolean;
}

interface PropertyCellProps {
    property: Property
}
export function PropertyCell({
    property
}: PropertyCellProps) {
    // 1. البحث عن الصورة الأساسية، أو اختيار أول صورة، أو استخدام Placeholder
    const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];
    const imageSrc = primaryImage?.url || "/images/property-placeholder.png";

    const isActive = property.status === PropertyStatus.ACTIVE;
    return (
        <div className="flex items-center gap-2 min-w-fit">
            <div className="relative w-[40px] h-[40px] shrink-0">
                <Image
                    src={resolveUrl(imageSrc)}
                    fill
                    sizes="40px"
                    alt={property.name}
                    className="rounded-[8px] object-cover"
                />
            </div>

            {isActive ? (
                <Link
                    href={`/properties/${property.slug}`}
                    className="cursor-pointer hover:underline decoration-secondary"
                >
                    <SmartTooltip
                        value={property.name}
                        maxLength={{ xs: 10, sm: 15, md: 20, lg: 30, xl: 40 }}
                        className="text-dark font-medium cursor-pointer"
                    />
                </Link>
            ) : (
                <SmartTooltip
                    value={property.name}
                    maxLength={{ xs: 10, sm: 15, md: 20, lg: 30, xl: 40 }}
                    className="text-gray-500 font-medium"
                />
            )}
        </div>
    );
}
