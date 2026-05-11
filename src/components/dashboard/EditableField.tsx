import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MdEdit } from 'react-icons/md';
import Popup from '../atoms/Popup';

interface EditableFieldProps {
    label: string;
    valueDisplay?: string | React.ReactNode;
    popupClassName?: string;
    renderPopup: (close: () => void) => React.ReactNode;
    className?: string;
}

export default function EditableField({
    label,
    valueDisplay,
    popupClassName,
    renderPopup,
    className
}: EditableFieldProps) {
    const [showPopup, setShowPopup] = useState(false);
    const t = useTranslations('dashboard.account');

    return (
        <div className={cn(
            "group/row relative py-5 border-b border-gray/10 last:border-0",
            "transition-all duration-200",
            className
        )}>
            {/* Hover background gradient */}
            <div className="absolute -inset-x-4 inset-y-0 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative space-y-3">
                {/* Header: Label + Edit Button */}
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-dark/70 flex items-center gap-2">
                        <span>{label}</span>
                    </label>

                    <button
                        onClick={() => setShowPopup(true)}
                        className={cn(
                            "group/edit flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                            "text-sm font-semibold transition-all duration-200",
                            "bg-secondary/10 text-secondary hover:bg-secondary hover:text-white",
                            "hover:shadow-md active:scale-95",
                            "opacity-0 group-hover/row:opacity-100"
                        )}
                    >
                        <MdEdit size={16} className="group-hover/edit:scale-110 transition-transform duration-200" />
                        <span>{t('edit')}</span>
                    </button>
                </div>

                {/* Value Display */}
                <div className={cn(
                    "text-base font-medium text-dark min-h-[24px] transition-colors duration-200",
                    "group-hover/row:text-primary"
                )}>
                    {valueDisplay || (
                        <span className="text-dark/40 italic text-sm">
                            {t('notProvided')}
                        </span>
                    )}
                </div>
            </div>

            {/* Popup */}
            <Popup
                show={showPopup}
                className={popupClassName}
                onClose={() => setShowPopup(false)}
                headerContent={
                    <div className="text-lg font-bold text-dark bg-gradient-to-r from-dark to-dark/80 bg-clip-text">
                        {label}
                    </div>
                }
            >
                {renderPopup(() => setShowPopup(false))}
            </Popup>
        </div>
    );
}