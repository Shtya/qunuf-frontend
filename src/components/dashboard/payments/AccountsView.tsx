import { PiPlusBold } from "react-icons/pi";
import VisaCard from "./VisaCard";
import Popup from "@/components/atoms/Popup";
import ActionButtons from "@/components/atoms/ActionButtons";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function AccountsView() {
    const [showAddPopup, setShowAddPopup] = useState(false);
    const t = useTranslations('dashboard.payments.paymentMethods');

    const handleAddSave = () => {
        // TODO: trigger save logic
        setShowAddPopup(false);
    };

    return (
        <>
            <div className="flex justify-between items-center gap-4">
                <h2 className="text-lg font-medium my-4">{t('recentAccounts')}</h2>
                <button
                    onClick={() => setShowAddPopup(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 lg:py-3 !rounded-[8px] bg-primary text-lighter text-sm sm:text-base whitespace-nowrap"
                >
                    <PiPlusBold size={18} className="mb-[2px] shrink-0" />
                    <span>{t('addMethod')}</span>
                </button>

            </div>

            <div className="mt-5 space-y-4">
                <VisaCard />
                <VisaCard />
            </div>

            <Popup show={showAddPopup} onClose={() => setShowAddPopup(false)}>
                <div className="space-y-6 md:min-w-lg lg:min-w-xl mx-auto   ">
                    <h2 className="text-lg font-semibold text-dark">{t('addCardHolder')}</h2>

                    <ActionButtons
                        onAction={handleAddSave}
                        onCancel={() => setShowAddPopup(false)}
                        actionText={t('save')}
                        cancelText={t('discard')}
                        isDisabled={false}
                    />
                </div>
            </Popup>
        </>
    );
}
