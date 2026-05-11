import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type SecondaryButtonProps = {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function SecondaryButton({
    children,
    className = "",
    onClick,
    href,
    type = "button",
    disabled,
    ...props
}: SecondaryButtonProps) {

    const baseClasses =
        "px-5 sm:px-8 py-1 sm:py-[6px] rounded-[10px] flex items-center justify-center";

    if (href) {
        return (
            <Link
                href={href}
                className={`${baseClasses} ${className}`}
                {...props}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseClasses} ${className}`}
        >
            {children}
        </button>
    );
}