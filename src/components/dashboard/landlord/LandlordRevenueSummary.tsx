'use client'
import { useState } from "react";
import TabButton from "../payments/TabButton";
import SettingsCard from "../settings/SettingsCard";
import { LiaMoneyBillWaveSolid } from "react-icons/lia";
import { BsFillHouseDownFill, BsHouseUpFill } from "react-icons/bs";
import DashboardCard from "../DashboardCard";
import RentedPropertyCard from "./RentedPropertyCard";
import RentalIncomeCard from "../payments/RentalIncomeCard";
import { useTranslations } from "next-intl";

type TabKey = 'Week' | 'Month' | 'Year';
const properties = [
    {
        id: "property-6",
        imageSrc: "/properties/property-6.jpg",
        address: "456 Oak Street, Cairo",
        date: new Date("2025-10-10T14:30"),
        price: 20,
    },
    {
        id: "property-2",
        imageSrc: "/properties/property-2.jpg",
        address: "789 Palm Road, Giza",
        date: new Date("2025-10-11T09:15"),
        price: 20,
    },
    {
        id: "property-3",
        imageSrc: "/properties/property-3.jpg",
        address: "321 Cedar Lane, Alexandria",
        date: new Date("2025-10-12T17:45"),
        price: 20,
    },
    {
        id: "property-4",
        imageSrc: "/properties/property-4.jpg",
        address: "654 Elm Street, Mansoura",
        date: new Date("2025-10-13T11:00"),
        price: 20,
    },
    {
        id: "property-5",
        imageSrc: "/properties/property-5.jpg",
        address: "987 Pine Avenue, Tanta",
        date: new Date("2025-10-14T08:20"),
        price: 20,
    },
    {
        id: "property-6",
        imageSrc: "/properties/property-6.jpg",
        address: "159 Birch Blvd, Aswan",
        date: new Date("2025-10-15T19:00"),
        price: 20,
    },
    {
        id: "property-7",
        imageSrc: "/properties/property-7.jpg",
        address: "753 Willow Way, Ismailia",
        date: new Date("2025-10-16T13:10"),
        price: 20,
    },
];


export default function LandlordRevenueSummary() {
    const [activeTab, setActiveTab] = useState<TabKey>('Week');
    const t = useTranslations('dashboard.landlord.revenue');

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center">
                <TabButton
                    label={t('week')}
                    active={activeTab === 'Week'}
                    onClick={() => setActiveTab('Week')}
                />
                <TabButton
                    label={t('month')}
                    active={activeTab === 'Month'}
                    onClick={() => setActiveTab('Month')}
                />
                <TabButton
                    label={t('year')}
                    active={activeTab === 'Year'}
                    onClick={() => setActiveTab('Year')}
                />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                <SettingsCard
                    title={t('rentalIncome')}
                    description="$847,290"
                    icon={LiaMoneyBillWaveSolid}
                />

                <SettingsCard
                    title={t('totalReserved')}
                    description="5"
                    icon={BsFillHouseDownFill}
                />

                <SettingsCard
                    title={t('totalFree')}
                    description="10"
                    icon={BsHouseUpFill}
                />
            </div>

            {/* Top rented properties */}
            <DashboardCard
                title={t('topRented')}
                className="max-h-[620px] overflow-y-auto thin-scrollbar"
            >
                <div className="divide-y divide-gray-300">
                    {properties.map((property, index) => (
                        <RentedPropertyCard key={index} {...property} />
                    ))}
                </div>
            </DashboardCard>

            {/* Recent transactions */}
            <DashboardCard
                title={t('recentTransactions')}
                className="max-h-[620px] overflow-y-auto thin-scrollbar "
            >
                <div className="divide-y divide-gray-300 space-y-4">
                    <RentalIncomeCard />
                    <RentalIncomeCard />
                    <RentalIncomeCard />
                </div>
            </DashboardCard>
        </div>
    );
}