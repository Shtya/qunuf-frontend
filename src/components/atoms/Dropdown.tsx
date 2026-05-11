import { useRef, useState } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { ComponentType } from 'react';
import { DropMenuPosition, getDropMenuPosition } from '@/utils/helpers';

export interface TriggerProps {
    isOpen: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

export interface MenuProps {
    isOpen: boolean;
    onClose: () => void;
}


interface DropdownProps {
    position?: DropMenuPosition;
    className?: string;
    Trigger: ComponentType<TriggerProps>;
    Menu: ComponentType<MenuProps>;
}

export default function Dropdown({
    position = 'bottom-left',
    className,
    Trigger,
    Menu,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useOutsideClick(
        dropdownRef,
        () => setIsOpen(false),
    );

    const baseClass =
        'absolute w-max overflow-hidden rounded shadow-md z-[100]';

    const positionClass = getDropMenuPosition(position);


    const dropdownClass = `${baseClass} ${positionClass}`;

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <Trigger onToggle={() => setIsOpen(!isOpen)} isOpen={isOpen} />
            {isOpen && (
                <div className={dropdownClass}>
                    <Menu onClose={() => setIsOpen(false)} isOpen={isOpen} />
                </div>
            )}
        </div>
    );
}