'use client';

import { useState } from 'react';
import PropertiesForm from "@/components/dashboard/Properties/PropertiesForm";
import BulkAddProperties from "@/components/dashboard/Properties/BulkAddProperties";
import { useAuth } from '@/contexts/AuthContext';
import Step1 from '@/components/pages/booking/Step1';
import { useTranslations } from 'next-intl';
import { BiBuilding } from 'react-icons/bi';
import { MdOutlineLibraryAdd } from 'react-icons/md';

type AddMode = 'single' | 'bulk';

export default function AddPage() {
    const { user, role } = useAuth();
    const t = useTranslations('dashboard.properties.addMode');
 

    const [mode, setMode] = useState<AddMode | null>(null);

    // Admin: skip profile check, show mode chooser
    if (role === 'admin') {
        if (!mode) {
            return <ModeSwitcher t={t} onSelect={setMode} />;
        }
        return mode === 'bulk' ? <BulkAddProperties /> : <div><PropertiesForm /></div>;
    }

    // Landlord: profile completeness check first
    const isProfileComplete = !!(
        user?.phoneNumber &&
        user?.nationalityId &&
        user?.identityNumber &&
        user?.birthDate &&
        user?.shortAddress
    );

    const [profileCompleted, setProfileCompleted] = useState(isProfileComplete);

    if (!profileCompleted) {
        return <Step1 nextStep={() => setProfileCompleted(true)} />;
    }

    return (
        <div>
            <PropertiesForm />
        </div>
    );
}

function ModeSwitcher({
    t,
    onSelect,
}: {
    t: ReturnType<typeof useTranslations<'dashboard.properties.addMode'>>;
    onSelect: (mode: AddMode) => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('title')}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                <ModeCard
                    label={t('single')}
                    description={t('singleDesc')}
                    Icon={BiBuilding}
                    onClick={() => onSelect('single')}
                />
                <ModeCard
                    label={t('bulk')}
                    description={t('bulkDesc')}
                    Icon={MdOutlineLibraryAdd}
                    onClick={() => onSelect('bulk')}
                />
            </div>
        </div>
    );
}

function ModeCard({
    label,
    description,
    Icon,
    onClick,
}: {
    label: string;
    description: string;
    Icon: React.ElementType;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary hover:shadow-lg transition-all text-center cursor-pointer group"
        >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
        </button>
    );
}