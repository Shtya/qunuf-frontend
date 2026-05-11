import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";


export default function NavigationButtons({ nextClassName, prevClassName }: { nextClassName: string, prevClassName: string }) {
    return (
        <>
            <button className={`team-next flex-center   absolute top-1/2 -translate-y-1/2 -left-0 xl:-left-5 2xl:-left-10 z-10 ${nextClassName}`}>
                <MdOutlineArrowBackIos size={32} className="w-[26px] lg:w-[32px] h-[26px] lg:h-[32px]" />
            </button>
            <button className={`team-prev flex-center   absolute top-1/2 -translate-y-1/2 -right-0 xl:-right-5 2xl:-right-10 z-10 ${prevClassName}`}>
                <MdOutlineArrowForwardIos size={32} className="w-[26px] lg:w-[32px] h-[26px] lg:h-[32px]" />
            </button>
        </>
    );
}