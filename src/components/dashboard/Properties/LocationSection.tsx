import { Control } from "react-hook-form";
import SecondaryButton from "@/components/atoms/buttons/SecondaryButton";
import Popup from "@/components/atoms/Popup";
import LocationInput from "@/components/molecules/forms/LocationInput";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function LocationSection({ control }: { control: Control<any> }) {
    const t = useTranslations("dashboard.properties.form");
    const [show, setShow] = useState(false);

    return (
        <div className="my-8">
            <div className="flex justify-between items-center">
                <h3 className="text-dark font-bold text-[20px] md:text-[22px] leading-[24px]">
                    {t("location")}
                </h3>
                <SecondaryButton
                    onClick={() => setShow(true)}
                    className="bg-secondary hover:bg-secondary-hover text-white"
                >
                    {t("selectLocation")}
                </SecondaryButton>
            </div>
            <Popup show={show} onClose={() => setShow(false)}>
                <LocationInput control={control} name="position" />
            </Popup>

        </div>
    );
}
