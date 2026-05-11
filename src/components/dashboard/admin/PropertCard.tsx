import CircularRating from "@/components/atoms/CircularRating";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface PropertyCardProps {
    imageSrc: string;
    address: string;
    date: Date;
    rating?: number;
    id?: string;
}

export default function PropertyCard({
    imageSrc,
    address,
    date,
    rating,
    id
}: PropertyCardProps) {
    const formattedDate = date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return (
        <div className="flex justify-between items-center gap-4 py-2">
            <div className="flex items-center gap-4">
                <div className="relative w-[58px] h-[58px]">
                    <Image src={imageSrc} fill alt="" className="rounded-full object-cover" />
                </div>
                <div className="space-y-2">
                    {id ? (
                        <Link href={`/properties/${id}`} className="font-medium text-sm sm:text-base">
                            {address}
                        </Link>
                    ) : (
                        <h1 className="font-medium text-sm sm:text-base">{address}</h1>
                    )}
                    <p className="text-gray-500 text-sm sm:text-base">{formattedDate}</p>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                {rating != null ? (
                    <CircularRating rating={rating} />
                ) : (
                    <span
                        style={{
                            fontSize: 48,
                            fontWeight: 700,
                            lineHeight: 1,
                            color: 'var(--primary)',
                            display: 'inline-block',
                            width: 50,
                            textAlign: 'center',
                            userSelect: 'none',
                        }}
                    >
                        _
                    </span>
                )}

            </div>
        </div>
    );
}
