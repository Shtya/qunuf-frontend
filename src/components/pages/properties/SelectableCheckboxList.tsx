import { IoMdCheckmark } from "react-icons/io";

type Option = {
    label: string;
    value: string;
};

type SelectableCheckboxListProps = {
    options: Option[];
    selectedValues: string[];
    onToggle: (value: string) => void;
};

export default function SelectableCheckboxList({
    options,
    selectedValues,
    onToggle,
}: SelectableCheckboxListProps) {
    const selectedSet = new Set(selectedValues);

    return (
        <div className="flex flex-col gap-4">
            {options.map(({ label, value }) => {
                const isSelected = selectedSet.has(value);
                return (
                    <div
                        key={value}
                        className="flex items-center gap-3 w-fit cursor-pointer select-none"
                        onClick={() => onToggle(value)}
                    >
                        <div
                            className={`flex-center rounded-sm w-[20px] h-[20px] transition-colors ${isSelected ? "border border-primary bg-primary" : "bg-lighter"
                                }`}
                        >
                            {isSelected && <IoMdCheckmark size={12} className="text-white" />}
                        </div>
                        <label className="text-input text-[14px] font-medium">{label}</label>
                    </div>
                );
            })}
        </div>
    );
}
