import { TriggerProps } from "@/components/atoms/Dropdown";

const TableTrigger: React.FC<TriggerProps> = ({ onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="text-[var(--dark)] hover:text-[var(--primary)]"
            aria-label="Open menu"
        >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
        </button>
    );
};

export default TableTrigger;