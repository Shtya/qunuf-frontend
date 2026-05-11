import { IoAlertCircleOutline, IoRefreshOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface TableErrorProps {
    message: string;
    onRetry?: () => void;
}

export default function TableError({ message, onRetry }: TableErrorProps) {
    const t = useTranslations('dashboard.error');
    return (
        <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/50 to-orange-50/30 shadow-sm">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-red-500 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col items-center justify-center py-16 px-4">
                {/* Animated icon container */}
                <div className="relative mb-6">
                    {/* Pulsing rings */}
                    <div className="absolute inset-0 -m-6">
                        <div className="w-28 h-28 rounded-full border-4 border-red-200/40 animate-ping"
                            style={{ animationDuration: '2s' }} />
                    </div>
                    <div className="absolute inset-0 -m-4">
                        <div className="w-24 h-24 rounded-full bg-red-100/60 animate-pulse" />
                    </div>

                    {/* Icon */}
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <IoAlertCircleOutline className="text-white text-4xl animate-in zoom-in duration-300" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3 max-w-md">
                    <h3 className="text-xl font-bold text-red-900">
                        {t('title')}
                    </h3>
                    <p className="text-sm text-red-700/80 leading-relaxed">
                        {message || "We encountered an error while loading the data. Please try again."}
                    </p>
                </div>

                {/* Retry Button */}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className={cn(
                            "group relative mt-6 flex items-center gap-2",
                            "px-6 py-3 rounded-xl font-semibold text-sm",
                            "bg-gradient-to-r from-red-500 to-orange-500",
                            "hover:from-red-600 hover:to-orange-600",
                            "text-white shadow-md hover:shadow-lg",
                            "transition-all duration-200",
                            "active:scale-95"
                        )}
                    >
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/50 to-orange-500/50 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-200 -z-10" />

                        <IoRefreshOutline
                            className="text-lg group-hover:rotate-180 transition-transform duration-500"
                        />
                        <span>{t('retry')}</span>
                    </button>
                )}

                {/* Decorative dots */}
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-orange-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-red-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}