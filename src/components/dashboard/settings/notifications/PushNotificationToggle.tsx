"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function PushNotificationToggle() {
    const [openNotifications, setOpenNotifications] = useState(true)
    const t = useTranslations('dashboard.notification');

    return (
        <div className="rounded-[20px] p-6 md:p-7 bg-[#6161F126]">
            <div className="flex items-center justify-between">
                <p className="text-base text-gray-800 font-bold">
                    🔔 {t('pushToggle')}
                </p>

                {/* Flowbite toggle */}
                <label className="inline-flex items-center mb-0 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={openNotifications}
                        onChange={(e) => setOpenNotifications(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="bg-gray-400 peer-checked:bg-primary relative w-11 h-6  peer-focus:outline-none  rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white peer-checked:after:bg-lightGold  after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:z-[1]"></div>
                </label>
            </div>
        </div>
    );
}
