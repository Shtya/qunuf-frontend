'use client';

import StepTitle from "./StepTitle";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from "next/navigation";
import SecondaryButton from "@/components/atoms/buttons/SecondaryButton";
import { PropertyType, RentType } from "@/types/dashboard/properties";

export default function Step3({ nextStep, createdContract }: { nextStep: () => void, createdContract: any }) {
    const tEnums = useTranslations("property.enums");
    const t = useTranslations('bookings.contractReview');
    const locale = useLocale();
    if (!createdContract) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg">{t('noContract')}</p>
                </div>
            </div>
        );
    }

    const contract = createdContract;
    const property = contract.propertySnapshot;
    const landlord = contract.landlordSnapshot;
    const tenant = contract.tenantSnapshot;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2
        }).format(Number(amount));
    };

    return (
        <div className="flex-1 flex flex-col justify-between gap-12">
            <div className="space-y-6">
                <StepTitle title={t('title')} subtitle={t('subtitle')} />

                {/* Contract Details */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Property Information */}
                    <div className="bg-lighter rounded-xl shadow-sm px-6 py-5 space-y-4">
                        <h3 className="text-xl font-semibold text-dark border-b pb-2">
                            {t('sections.property')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.propertyName')}:</span>
                                <p className="font-medium text-dark">{property?.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.propertyType')}:</span>
                                <p className="font-medium text-dark">{tEnums(`propertyType.${property?.type}`)} - {tEnums(`subType.${property?.type === PropertyType.RESIDENTIAL ? 'residential' : 'commercial'}.${property?.subType}`)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.area')}:</span>
                                <p className="font-medium text-dark">{property?.area} m²</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.capacity')}:</span>
                                <p className="font-medium text-dark">{property?.capacity}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.location')}:</span>
                                <p className="font-medium text-dark">{property?.stateName}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.furnished')}:</span>
                                <p className="font-medium text-dark">{property?.isFurnished ? t('yes') : t('no')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rental Period */}
                    <div className="bg-lighter rounded-xl shadow-sm px-6 py-5 space-y-4">
                        <h3 className="text-xl font-semibold text-dark border-b pb-2">
                            {t('sections.rentalPeriod')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.startDate')}:</span>
                                <p className="font-medium text-dark">{formatDate(contract.startDate)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.endDate')}:</span>
                                <p className="font-medium text-dark">{formatDate(contract.endDate)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.duration')}:</span>
                                <p className="font-medium text-dark">{contract.durationInMonths} {t('months')}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.rentType')}:</span>
                                <p className="font-medium text-dark">
                                    {contract.rentType === RentType.MONTHLY ? t('monthly') : t('yearly')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-lighter rounded-xl shadow-sm px-6 py-5 space-y-4">
                        <h3 className="text-xl font-semibold text-dark border-b pb-2">
                            {t('sections.financial')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.totalAmount')}:</span>
                                <p className="font-medium text-dark text-lg">{formatCurrency(contract.totalAmount)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.securityDeposit')}:</span>
                                <p className="font-medium text-dark">{formatCurrency(contract.securityDeposit)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.platformFee')}:</span>
                                <p className="font-medium text-dark">
                                    {contract.platformFeePercentage}% ({formatCurrency(contract.platformFeeAmount)})
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Landlord Information */}
                    <div className="bg-lighter rounded-xl shadow-sm px-6 py-5 space-y-4">
                        <h3 className="text-xl font-semibold text-dark border-b pb-2">
                            {t('sections.landlord')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.name')}:</span>
                                <p className="font-medium text-dark">{landlord?.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.email')}:</span>
                                <p className="font-medium text-dark">{landlord?.email}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('fields.phone')}:</span>
                                <p className="font-medium text-dark">{landlord?.phoneNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contract Terms */}
                    {contract.currentTerms && (
                        <div className="bg-lighter rounded-xl shadow-sm px-6 py-5 space-y-4">
                            <h3 className="text-xl font-semibold text-dark border-b pb-2">
                                {t('sections.terms')}
                            </h3>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {contract.currentTerms}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Done Button */}
            <div className="flex justify-center">
                <SecondaryButton
                    onClick={nextStep}
                    className="bg-secondary hover:bg-secondary-hover text-white py-2 lg:py-3 w-full sm:w-[323px]"
                >
                    {t('done')}
                </SecondaryButton>
            </div>
        </div>
    );
}
