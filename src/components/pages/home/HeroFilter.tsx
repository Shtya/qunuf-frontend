'use client'

import { useMemo, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { CiSearch } from "react-icons/ci";
import SelectInput, { Option } from "@/components/molecules/forms/SelectInput";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";


export default function HeroFilter() {
    const t = useTranslations("homePage.filters");
    const [location, setLocation] = useState<Option | null>(null);
    const [propertyType, setPropertyType] = useState<Option | null>(null);
    const [category, setCategory] = useState<Option | null>(null);


    const search = useMemo(() => {
        const params = new URLSearchParams();
        if (location) params.set("location", location.value.toString());
        if (propertyType) params.set("type", propertyType.value.toString());
        if (category) params.set("category", category.value.toString());

        const search = `/properties?${params.toString()}`
        return search;
    }, [location, propertyType, category])

    return (
        <div className="absolute top-1/2 md:top-3/5 -translate-y-1/2 left-1/2 -translate-x-1/2 w-full px-3">
            <div className="p-5 sm:p-7 lg:p-9 bg-white rounded-[12px] basic-shadow max-md:w-full grid grid-cols-1 md:grid-cols-2 xl:flex flex-row justify-center items-center gap-3 w-fit mx-auto">

                <SelectInput
                    options={[
                        { label: t("options.locations.cairo"), value: "cairo" },
                        { label: t("options.locations.alex"), value: "alex" },
                        { label: t("options.locations.giza"), value: "giza" }
                    ]}
                    placeholder={t("labels.location")}
                    value={location}
                    onChange={setLocation}
                    className="w-full md:w-[255px]"
                />

                <SelectInput
                    options={[
                        { label: t("options.propertyTypes.apartment"), value: "apartment" },
                        { label: t("options.propertyTypes.villa"), value: "villa" },
                        { label: t("options.propertyTypes.duplex"), value: "duplex" }
                    ]}
                    placeholder={t("labels.propertyType")}
                    value={propertyType}
                    onChange={setPropertyType}
                    className="w-full md:w-[255px]"
                />
                <SelectInput
                    options={[
                        { label: t("options.categories.furnished"), value: "furnished" },
                        { label: t("options.categories.unfurnished"), value: "unfurnished" }
                    ]}
                    placeholder={t("labels.category")}
                    value={category}
                    onChange={setCategory}
                    className="w-full md:w-[255px]"
                />
                <div className="flex gap-3 items-center">
                    <Link
                        href='/properties'>
                        <HiOutlineAdjustmentsHorizontal size={24} />
                    </Link>
                    <Link
                        href={search}
                        className="flex justify-center gap-2 bg-secondary basic-shadow text-white py-2 px-8 rounded-md w-full transition-colors hover:bg-secondary-hover"
                    >
                        <span>{t("search")}</span>
                        <CiSearch size={24} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
