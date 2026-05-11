import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type props = {
    onSave: () => void;
    isLoading?: boolean;
}
export default function Actions({ isLoading, onSave }: props) {
    const tCommon = useTranslations("comman");
    const router = useRouter()
    return (
        <div className="flex items-center gap-4 pt-4">
            <button
                type="button"
                onClick={onSave}
                disabled={isLoading}
                className={cn(
                    "group relative px-8 py-3 rounded-xl font-semibold text-white",
                    "bg-gradient-to-r from-secondary to-primary",
                    "hover:from-secondary-hover hover:to-primary-hover",
                    "shadow-md hover:shadow-xl transition-all duration-200",
                    "active:scale-95"
                )}
            >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary/50 to-primary/50 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-200 -z-10" />

                <span className="relative flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isLoading ? tCommon("saving") : tCommon("save")}
                </span>
            </button>

            <button
                type="button"
                onClick={() => router.back()}
                className={cn(
                    "px-8 py-3 rounded-xl font-semibold",
                    "bg-white border-2 border-gray/20 text-dark",
                    "hover:border-secondary hover:bg-secondary/5",
                    "transition-all duration-200 active:scale-95"
                )}
            >
                {tCommon("cancel")}
            </button>
        </div>
    );
}