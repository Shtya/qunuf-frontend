import { useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { FaCreditCard } from 'react-icons/fa';
import Popup from '@/components/atoms/Popup';
import ActionPopup from '@/components/atoms/ActionPopup';
import ActionButtons from '@/components/atoms/ActionButtons';
import { useTranslations } from 'next-intl';

export default function VisaCard() {
    const t = useTranslations('dashboard.payments.paymentMethods');
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [cardHolder, setCardHolder] = useState('John Anderson');

    const handleDelete = () => {
        // TODO: trigger actual delete logic
        setShowDeletePopup(false);
    };

    const handleEditSave = () => {
        // TODO: trigger save logic
        setShowEditPopup(false);
    };

    return (
        <>
            {/* Card */}
            <div className="bg-card-bg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-5 md:p-6 rounded-xl">
                {/* Left */}
                <div className="flex gap-4 items-start sm:items-center">
                    <div className="bg-dashboard-bg w-[45px] h-[45px] flex-center rounded-[8px] shrink-0">
                        <span className="text-primary font-bold">VISA</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold text-dark leading-tight">Visa</p>
                        <p className="text-sm text-input">•••• •••• •••• 4242</p>
                        <p className="text-sm text-placeholder">{t('card.expires')} 12/25 • {cardHolder}</p>
                    </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-start sm:items-end gap-3">
                    <div className="flex gap-2">
                        <MdEdit
                            size={18}
                            className="text-secondary cursor-pointer"
                            aria-label="Edit card"
                            onClick={() => setShowEditPopup(true)}
                        />
                        <MdDelete
                            size={18}
                            className="text-red-600 cursor-pointer"
                            aria-label="Delete card"
                            onClick={() => setShowDeletePopup(true)}
                        />
                    </div>
                    <div className="text-xs bg-lighter py-[2px] px-2 w-fit text-secondary rounded-full flex-center">
                        <span>{t('card.default')}</span>
                    </div>
                </div>
            </div>

            {/* Delete Popup */}
            <Popup show={showDeletePopup} onClose={() => setShowDeletePopup(false)}>
                <ActionPopup
                    onCancel={() => setShowDeletePopup(false)}
                    onAction={() => setShowDeletePopup(false)}
                    title={t('card.deleteTitle')}
                    subtitle={t('card.deleteSubtitle')}
                    MainIcon={FaCreditCard}
                    mainIconColor="#EA2323"
                    note={t('card.deleteNote')}
                    actionText={t('card.delete')}
                    cancelText={t('card.cancel')}
                />
            </Popup>

            {/* Edit Popup */}
            <Popup show={showEditPopup} onClose={() => setShowEditPopup(false)}>
                <div className="space-y-6 md:min-w-lg lg:min-w-xl mx-auto">
                    <h2 className="text-lg font-semibold text-dark">{t('card.editTitle')}</h2>
                    <ActionButtons
                        onAction={() => setShowEditPopup(false)}
                        onCancel={() => setShowEditPopup(false)}
                        actionText={t('save')}
                        cancelText={t('discard')}
                        isDisabled={!cardHolder.trim()}
                    />
                </div>
            </Popup>
        </>
    );
}
