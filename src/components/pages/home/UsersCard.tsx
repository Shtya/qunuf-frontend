import Image from "next/image";
import RatingStars from "@/components/atoms/RatingStars"
import { useTranslations } from "next-intl";
const users = [
    "/users/user-1.jpg",
    "/users/user-2.jpg",
    "/users/user-3.jpg",
    "/users/user-4.jpg",
];

export default function UsersCard() {
    const rate = 4.5;
    const t = useTranslations('homePage.hero');

    return (
        <div className="absolute  w-full sm:w-fit  end-0 bottom-0">

            <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] text-white text-center font-bold mb-5 sm:mb-7 lg:mb-9" >
                {t('clients', { count: '50K' })}
            </h2>
            <div className=" bg-white py-4 px-[6px] flex flex-col-reverse sm:flex-row items-center sm:items-end gap-2 sm:gap-6">
                <div className="flex flex-row-reverse sm:flex-col gap-2 justify-center text-center sm:text-end">
                    <p className="text-lg sm:text-xl md:text-2xl  font-bold text-[#72A2BD] text-end">{rate}/5</p>
                    <RatingStars rating={rate} />
                </div>
                <div className="flex flex-row-reverse">
                    {users.map((src, i) => (
                        <div
                            key={i}
                            className="w-12 h-12 sm:w-[60px] sm:h-[58px] md:w-[72px] md:h-[70px] rounded-full overflow-hidden border-2 border-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                            style={{ marginInlineEnd: i === 0 ? 0 : -25, zIndex: i + 1 }}
                        >
                            <Image
                                src={src}
                                alt={`User ${i + 1}`}
                                width={72}
                                height={70}
                                className="w-full h-full object-cover"
                            />
                        </div>

                    ))}
                </div>

            </div>
        </div>
    );
}
