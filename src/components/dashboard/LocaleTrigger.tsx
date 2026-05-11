import { GrLanguage } from "react-icons/gr";




export default function LocaleTrigger({
    onClick,
    disabled,
    lang
}: {
    onClick: () => void;
    disabled: boolean;
    lang?: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-lighter hover:bg-gray text-dark w-full justify-start lg:hidden"
            aria-label="Change language"
        >
            <GrLanguage className="w-5 h-5" />
            <span className="text-sm font-medium">{lang}</span>
        </button>
    );
}