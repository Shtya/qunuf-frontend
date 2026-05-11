import React, { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
import { FaChevronDown } from 'react-icons/fa';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format } from 'date-fns';
import { useLocale, useTranslations } from "next-intl";
import { enUS, arSA } from 'date-fns/locale';

interface CustomDateInputProps extends React.HTMLProps<HTMLButtonElement> {
    value?: string;
    onClick?: () => void;
}

interface DateRangePickerProps {
    DateInputComponent?: React.FC<DateInputShowComponentProps>;
    onChange: (dates: { startDate?: Date; endDate?: Date }) => void;
    value: { startDate: Date | undefined, endDate: Date | undefined };
}

export default function DateRangePicker({ DateInputComponent, onChange, value }: DateRangePickerProps) {

    const t = useTranslations('comman');

    const [startDate, setStartDate] = useState<Date | undefined>(value.startDate);
    const [endDate, setEndDate] = useState<Date | undefined>(value.endDate);

    const locale = useLocale();
    const dateFnsLocale = locale === 'ar' ? arSA : enUS;
    const InputComponent = DateInputComponent || DefaultDateInputComponent;
    const CustomDateInput = forwardRef<HTMLButtonElement, CustomDateInputProps>(

        ({ onClick }, ref) => (
            <InputComponent
                id="date-picker"
                placeholder={
                    startDate && endDate
                        ? `${format(startDate, 'd MMM yyyy', { locale: dateFnsLocale })} - ${format(endDate, 'd MMM yyyy', { locale: dateFnsLocale })}`
                        : t('datePlaceholder')
                }

                onClick={onClick}
                ref={ref as any}
            />
        )
    );

    CustomDateInput.displayName = 'CustomDateInput';

    return (
        <DatePicker

            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => {
                setStartDate(update[0] ?? undefined);
                setEndDate(update[1] ?? undefined);
                onChange({ startDate: update[0] ?? undefined, endDate: update[1] ?? undefined })
            }}
            calendarStartDay={1}
            customInput={<CustomDateInput />}
            renderCustomHeader={(props) => {
                return (
                    <CustomHeader
                        date={props.date}
                        changeYear={props.changeYear}
                        changeMonth={props.changeMonth}
                        decreaseMonth={props.decreaseMonth}
                        increaseMonth={props.increaseMonth}
                    />
                );
            }}
        />
    );
}


type DateInputShowComponentProps = {
    id: string;
    placeholder: string;
    onClick: React.MouseEventHandler<HTMLElement> | undefined;
    ref: React.Ref<HTMLDivElement>;
};

const DefaultDateInputComponent: React.FC<DateInputShowComponentProps> = ({
    id,
    placeholder,
    onClick,
    ref
}) => {
    const onClickHandler = (event: React.MouseEvent<HTMLElement>) => {
        onClick?.(event);
    };
    return (
        <button
            id={id}
            type="button"
            onClick={onClickHandler}
            className="flex items-center w-[320px] h-[45px] rounded-md bg-[#F5F6F8]  gap-3"
        >
            <div className="w-[45px] h-[45px] bg-secondary rounded-md flex items-center justify-center">
                <FiCalendar size={26} className="text-white" />
            </div>
            <div className="flex-1 text-center text-placeholder font-normal text-[16px] leading-[170%]">
                {placeholder}
            </div>
        </button>
    );
};



interface IconDropdownProps {
    values: string[];
    onChange: (index: number) => void;
    selectedIndex: number;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
}

function IconDropdown({
    values,
    onChange,
    selectedIndex,
    placeholder = 'اختر',
    icon = <FiCalendar />,
    className = '',
}: IconDropdownProps) {
    const [open, setOpen] = useState(false);

    const toggle = () => setOpen((prev) => !prev);
    const select = (index: number) => {
        onChange(index);
        setOpen(false);
    };

    return (
        <div className={` relative w-full max-w-xs ${className}`}>
            <button
                onClick={toggle}
                className="flex items-center justify-between w-full px-3 py-2 rounded-md  text-sm font-medium text-dark"
            >
                <span className="flex items-center gap-2">
                    {icon}
                    {values[selectedIndex] || placeholder}
                </span>
                <FaChevronDown className="text-xs" />
            </button>

            {open && (
                <ul className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto text-sm">
                    {values.map((value, index) => (
                        <li
                            key={value}
                            onClick={() => select(index)}
                            className={`
                                px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 
                                ${index === selectedIndex && 'bg-gray-100 font-semibold'}`
                            }
                        >
                            {icon}
                            {value}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}



interface CustomHeaderProps {
    date: Date;
    changeYear: (year: number) => void;
    changeMonth: (month: number) => void;
    decreaseMonth: () => void;
    increaseMonth: () => void;
}

export const years = Array.from(
    { length: new Date().getFullYear() - 1989 + 1 },
    (_, i) => (i + 1990).toString()
);

export const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const CustomHeader: React.FC<CustomHeaderProps> = ({
    date,
    changeMonth,
    changeYear,
    decreaseMonth,
    increaseMonth,
}) => {
    const locale = useLocale();
    const dateFnsLocale = locale === 'ar' ? arSA : enUS;
    const isRTL = locale === 'ar';

    return (
        <div className="w-full px-2 space-y-2">

            {/* Navigation Row */}
            <div className="flex items-center justify-between">
                <button onClick={isRTL ? increaseMonth : decreaseMonth} className="p-1 rounded hover:bg-gray-100">
                    {isRTL ? <FaChevronRight /> : <FaChevronLeft />}
                </button>

                <span className="text-sm font-bold">
                    {format(date, 'MMMM yyyy', { locale: dateFnsLocale })}
                </span>

                <button onClick={isRTL ? decreaseMonth : increaseMonth} className="p-1 rounded hover:bg-gray-100">
                    {isRTL ? <FaChevronLeft /> : <FaChevronRight />}
                </button>
            </div>

            {/* Dropdown Row */}
            <div className="flex justify-evenly items-center gap-2">
                <IconDropdown
                    values={months}
                    selectedIndex={date.getMonth()}
                    onChange={changeMonth}
                    placeholder="Month"
                />
                <IconDropdown
                    values={years}
                    selectedIndex={years.indexOf(date.getFullYear().toString())}
                    onChange={(index) => changeYear(parseInt(years[index]))}
                    placeholder="Year"
                />
            </div>
        </div>
    );
};

