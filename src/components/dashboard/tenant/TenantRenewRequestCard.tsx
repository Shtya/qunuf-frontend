import Image from "next/image";
import { FaStar } from "react-icons/fa";
import SecondaryButton from "../../atoms/buttons/SecondaryButton";
import { useTranslations } from "next-intl";
import { RenewRequest, RenewStatus } from "@/types/dashboard/renew-request";
import { resolveUrl } from "@/utils/upload";
import Link from "next/link";

interface RenewRequestCardProps {
    data: RenewRequest;
    onAccept?: () => void;
    onReject?: () => void;
    isLoading?: boolean;
}

export default function RenewRequestCard({ data, onAccept, onReject, isLoading = false }: RenewRequestCardProps) {
    const t = useTranslations('dashboard.renewRequest');
    const tEnums = useTranslations('property.enums');
    const property = data.property;
    const contract = data.originalContract;

    if (!property || !contract) {
        return null;
    }

    // Get property image
    const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];
    const imageSrc = primaryImage?.url ? resolveUrl(primaryImage.url) : "/images/property-placeholder.png";

    // Calculate prices
    // totalAmount is the total for the entire contract period
    // durationInMonths is the contract duration
    // So monthly equivalent = totalAmount / durationInMonths
    const monthlyPrice = contract.totalAmount / contract.durationInMonths;
    const discount = data.offeredDiscountAmount;
    const newPrice = monthlyPrice - discount;

    // Get property type label
    const propertyTypeLabel = property.subType
        ? tEnums(`subType.${property.propertyType}.${property.subType}`)
        : tEnums(`propertyType.${property.propertyType}`);

    const isPending = data.status === RenewStatus.PENDING;

    return (
        <div className="max-sm:mx-auto max-sm:w-full bg-card-bg rounded-[12px] custom-shadow overflow-hidden max-w-[440px]">
            {/* Property Info */}
            <div className="flex gap-4 p-4 border-b border-gray-200">
                <Link href={`/properties/${property.slug}`} className="flex-shrink-0">
                    <Image
                        src={imageSrc}
                        alt={property.name}
                        width={100}
                        height={100}
                        className="rounded-md w-[100px] h-[100px] object-cover flex-shrink-0 hover:opacity-80 transition-opacity"
                    />
                </Link>
                <div className="flex flex-col justify-between flex-1">
                    <div>
                        <p className="text-xs text-dark">{propertyTypeLabel}</p>
                        <Link
                            href={`/properties/${property.slug}`}
                            className="block hover:underline decoration-secondary"
                        >
                            <h2 className="text-base font-semibold text-dark">{property.name}</h2>
                        </Link>
                    </div>
                    {property.averageRating && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <FaStar className="text-yellow-500" size={14} />
                            <span className="font-medium">{property.averageRating.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Price Details */}
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-dark mb-2">{t('priceDetails')}</h3>
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span className="underline">{t('forOneMonth')}</span>
                    <span>{monthlyPrice.toLocaleString()} {t('currency')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                    <span className="underline">{t('longStayDiscount')}</span>
                    <span className="text-green-600">-{discount.toLocaleString()} {t('currency')}</span>
                </div>
            </div>

            {/* Total */}
            <div className="p-4 flex justify-between items-center">
                <span className="font-semibold text-dark">{t('total')}</span>
                <span className="font-bold text-lg text-dark">{newPrice.toLocaleString()} {t('currency')}</span>
            </div>

            {/* Status Badge (if not pending) */}
            {!isPending && (
                <div className="px-4 pb-2">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${data.status === RenewStatus.ACCEPTED
                        ? 'bg-green-100 text-green-700'
                        : data.status === RenewStatus.REJECTED
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        <span>{t(`status.${data.status.toLowerCase()}`)}</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            {isPending && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-center mt-6 p-4">
                    <SecondaryButton
                        className="border border-gray-500 text-gray-700 w-full sm:w-auto sm:flex-1 max-w-[320px] hover:bg-gray-50 disabled:opacity-50"
                        onClick={onReject}
                        disabled={isLoading}
                    >
                        {t('reject')}
                    </SecondaryButton>

                    <SecondaryButton
                        className="bg-secondary hover:bg-secondary-hover text-white w-full sm:w-auto sm:flex-1 max-w-[320px] disabled:opacity-50"
                        onClick={onAccept}
                        disabled={isLoading}
                    >
                        {t('accept')}
                    </SecondaryButton>
                </div>
            )}
        </div>
    );
}
