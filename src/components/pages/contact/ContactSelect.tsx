import FormErrorMessage from "@/components/molecules/forms/FormErrorMessage";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useRef, useState } from "react";

export function ContactSelect({
    id,
    label,
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    error,
    wrapperClassName = "",
}: {
    id: string;
    label?: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    error?: string | undefined,
    wrapperClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null)
    useOutsideClick(menuRef, () => setOpen(false))
    return (
        <div>

            <div
                className={`flex gap-2 flex-col border-[1px] ${error ? 'border-red-500' : 'border-[#E0E0E0]'} py-3 px-[20px] relative ${wrapperClassName}`}
            >
                {label && (
                    <label
                        htmlFor={id}
                        className="text-input text-[13px] font-medium"
                    >
                        {label}
                    </label>
                )}

                {/* Trigger */}
                <div
                    id={id}
                    className="flex justify-between items-center cursor-pointer text-sm font-medium text-primary"
                    onClick={() => setOpen(!open)}
                >
                    <span className={value ? "text-primary" : "text-black"}>
                        {value
                            ? options.find((opt) => opt.value === value)?.label
                            : placeholder}
                    </span>
                    <svg
                        className={`w-4 h-4 text-gray-500 transform transition-transform ${open ? "rotate-180" : ""
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
                {/* Dropdown menu */}
                {open && (
                    <ul ref={menuRef} className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E0E0E0] rounded-md shadow-lg z-10">
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <FormErrorMessage message={error} />
        </div>
    );
}
