interface TabButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export default function TabButton({ label, active, onClick }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-[15px] sm:text-base py-1 m:py-2 px-3 sm:px-4 pb-4 sm:pb-6 border-b-2 font-semibold ${active ? 'border-b-secondary text-secondary' : 'border-dark text-dark'
                }`}
        >
            {label}
        </button>
    );
}
