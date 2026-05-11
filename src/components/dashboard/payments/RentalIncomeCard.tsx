import { LuCircleCheck } from "react-icons/lu";
import { MdOutlineArrowOutward } from "react-icons/md";
export default function RentalIncomeCard() {
    return (
        <div>

            <div className="bg-card-bg flex flex-col gap-4 p-5 md:p-6 rounded-xl  sm:flex-row sm:items-center sm:justify-between">
                {/* Left Section */}
                <div className="flex gap-4 items-start sm:items-center">
                    <div className="bg-dashboard-bg w-[45px] h-[45px] flex-center rounded-[8px] shrink-0">
                        <MdOutlineArrowOutward className="text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold text-dark leading-tight">
                            Rental Income – 123 Oak Street
                        </p>
                        <p className="text-sm text-input">123 Oak Street, Apt 2B</p>
                        <p className="text-sm text-placeholder">2025-10-05</p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-start sm:items-end gap-2">
                    <p className="text-primary font-semibold text-base">$2,500.00</p>
                    <div className="flex items-center gap-1">
                        <LuCircleCheck size={14} className="text-primary mb-[2px]" />
                        <p className="text-secondary text-sm">Completed</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
