"use client";

import { Link } from "@/i18n/navigation";
import { ReactNode } from "react";
import { GoArrowUpRight } from "react-icons/go";

interface FloatingActionButtonProps {
    href: string;
    icon?: ReactNode;
    size?: number; // default: 60
    bgColor?: string; // default: 60
    className?: string;
}

export default function FloatingActionButton({
    href,
    icon = <GoArrowUpRight size={28} />,
    size = 60,
    bgColor = 'var(--color-light)',
    className = "",
}: FloatingActionButtonProps) {
    return (
        <div
            className={`absolute top-[2px] rtl:start-[2px] ltr:end-[2px] p-4 rounded-full z-[2] ${className}`}
            style={{ backgroundColor: bgColor }}
        >
            <Link
                href={href}
                className={`bg-secondary flex-center text-light rounded-full transition hover:scale-[1.05]`}
                style={{ width: size, height: size }}
            >
                {icon}
            </Link>
        </div>
    );
}
