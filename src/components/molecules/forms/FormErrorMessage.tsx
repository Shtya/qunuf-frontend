import { FiAlertCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface FormErrorMessageProps {
    message?: string;
    className?: string;
}

export default function FormErrorMessage({ message, className }: FormErrorMessageProps) {
    if (!message) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 mt-1.5",
                "text-red-500 text-xs font-medium",
                "animate__animated animate__shakeX", // Visual feedback on appearance
                className
            )}
        >
            {/* Architectural Icon */}
            <FiAlertCircle className="shrink-0 w-3.5 h-3.5" />

            <span>{message}</span>
        </div>
    );
}