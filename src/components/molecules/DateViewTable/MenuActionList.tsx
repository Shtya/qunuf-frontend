'use client';

import { Link } from "@/i18n/navigation";
import React, { ComponentType, useState } from 'react';
import { IconType } from 'react-icons';
import { TableRowType } from "@/types/table";
import Popup from "@/components/atoms/Popup";
import Tooltip from "@/components/atoms/Tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionType =
    | 'primary'
    | 'secondary'
    | 'edit'
    | 'delete'
    | 'normal'
    | 'warning';

export type ChildTypeProps = {
    row: any;
    onClose: () => void;
    setRows?: React.Dispatch<React.SetStateAction<TableRowType<any>[] | null>>;
    fetchRows?: (signal?: AbortSignal) => Promise<void>;
};

export type MenuActionItem = {
    label: string;
    Icon?: IconType;
    type?: ActionType;
    link?: string;
    Child?: ComponentType<ChildTypeProps>;
    onClick?: () => void;
    show?: boolean;
};

type Props = {
    items?: MenuActionItem[];
    onClose?: () => void;
    row?: any;
    setRows?: React.Dispatch<React.SetStateAction<TableRowType<any>[] | null>>;
    fetchRows?: (signal?: AbortSignal) => Promise<void>;
    onOpenPopup?: (Child: ComponentType<ChildTypeProps>, row: any) => void;
};

// ─── Color map ────────────────────────────────────────────────────────────────

const getColorClass = (type?: ActionType): string => {
    switch (type) {
        case 'primary':
            return 'text-[var(--primary)] hover:text-[var(--primary-hover)]';
        case 'secondary':
            return 'text-[var(--secondary)] hover:text-[var(--secondary-hover)]';
        case 'edit':
            return 'text-[var(--secondary)] hover:text-[var(--primary)]';
        case 'delete':
            return 'text-red-500 hover:text-red-700';
        case 'warning':
            return 'text-orange-500 hover:text-orange-700';
        case 'normal':
        default:
            return 'text-[var(--secondary)] hover:text-[var(--primary)]';
    }
};

// ─── Icon color for bg bubble ─────────────────────────────────────────────────

const getBubbleClass = (type?: ActionType): string => {
    switch (type) {
        case 'primary':
            return 'bg-[var(--lighter)] hover:bg-[var(--light)]/30';
        case 'secondary':
            return 'bg-[var(--lighter)] hover:bg-[var(--light)]/30';
        case 'edit':
            return 'bg-[var(--lighter)] hover:bg-[var(--light)]/30';
        case 'delete':
            return 'bg-red-50 hover:bg-red-100';
        case 'warning':
            return 'bg-orange-50 hover:bg-orange-100';
        case 'normal':
        default:
            return 'bg-[var(--lighter)] hover:bg-[var(--light)]/30';
    }
};

// ─── Dropdown menu version ────────────────────────────────────────────────────

export default function MenuActionList({ items, onClose }: Props) {
    const [activeChild, setActiveChild] = useState<ComponentType<{ onClose: () => void }> | undefined>(undefined);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleOnClose = () => {
        setMenuOpen(false);
        setActiveChild(undefined);
    };

    const visibleItems = items?.filter(item => item.show === undefined || item.show);
    if (!visibleItems?.length) return null;

    return (
        <>
            <div className="flex flex-col gap-0.5 bg-white rounded-xl p-1.5 min-w-[170px]">
                {visibleItems.map((item, index) => {
                    const Icon = item.Icon;

                    const inner = (
                        <span className={`
                            flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                            transition-colors duration-150 w-full text-start
                            ${getColorClass(item.type)}
                            hover:bg-[var(--lighter)]
                        `}>
                            {Icon && (
                                <span className="shrink-0 opacity-80">
                                    <Icon size={15} />
                                </span>
                            )}
                            {item.label}
                        </span>
                    );

                    if (item.link) {
                        return (
                            <Link key={index} href={item.link} onClick={onClose}>
                                {inner}
                            </Link>
                        );
                    }

                    if (item.onClick) {
                        return (
                            <button key={index} onClick={() => { item.onClick?.(); onClose?.(); }}>
                                {inner}
                            </button>
                        );
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => {
                                setActiveChild(() => item.Child as ComponentType<{ onClose: () => void }>);
                                setMenuOpen(true);
                            }}
                        >
                            {inner}
                        </button>
                    );
                })}
            </div>

            {activeChild && (
                <Popup onClose={handleOnClose} show={menuOpen}>
                    {React.createElement(activeChild, { onClose: handleOnClose })}
                </Popup>
            )}
        </>
    );
}

// ─── Icon row version (used in tables) ───────────────────────────────────────

export function ActionList({ items, row, setRows, fetchRows, onOpenPopup }: Props) {
    const visibleItems = items?.filter(item => item.show === undefined || item.show);
    if (!visibleItems?.length) return null;

    const handleClick = (item: MenuActionItem) => {
        // 1. Direct onClick handler (e.g. viewDetails)
        if (item.onClick) {
            item.onClick();
            return;
        }

        // 2. Child popup via parent's onOpenPopup
        if (item.Child && onOpenPopup) {
            // Inject fetchRows + setRows into the child transparently
            const ChildWithExtras = (props: ChildTypeProps) =>
                React.createElement(item.Child!, { ...props, fetchRows, setRows });

            onOpenPopup(ChildWithExtras as ComponentType<ChildTypeProps>, row);
        }
    };

    return (
        <div className="flex flex-row items-center justify-end gap-1 px-1">
            {visibleItems.map((item, index) => {
                const Icon = item.Icon;
                if (!Icon) return null;

                const button = (
                    <button
                        key={index}
                        onClick={() => handleClick(item)}
                        className={`
                            inline-flex items-center justify-center
                            w-8 h-8 rounded-lg
                            transition-all duration-150
                            ${getBubbleClass(item.type)}
                            ${getColorClass(item.type)}
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]/40
                        `}
                        aria-label={item.label}
                    >
                        <Icon size={16} />
                    </button>
                );

                if (item.link) {
                    return (
                        <Link key={index} href={item.link} aria-label={item.label}>
                            <span className={`
                                inline-flex items-center justify-center
                                w-8 h-8 rounded-lg
                                transition-all duration-150
                                ${getBubbleClass(item.type)}
                                ${getColorClass(item.type)}
                            `}>
                                <Icon size={16} />
                            </span>
                        </Link>
                    );
                }

                return (
                    <Tooltip key={index} content={item.label} position="top">
                        {button}
                    </Tooltip>
                );
            })}
        </div>
    );
}