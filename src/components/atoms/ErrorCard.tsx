import { useTranslations } from 'next-intl';
import { MdSearchOff, MdLockOutline, MdErrorOutline, MdCloudOff } from 'react-icons/md';
import { IoRefreshOutline } from 'react-icons/io5';
import { cn } from "@/lib/utils"; // Assuming you have a cn utility
import { JSX } from 'react';

type ErrorType = 'not-found' | 'unauthorized' | 'bad-request' | 'service-error';

interface ErrorCardProps {
    type?: ErrorType;
    title?: string;
    buttonText?: string;
    message: string;
    onAction: () => void;
}

const iconMap: Record<ErrorType, JSX.Element> = {
    'not-found': <MdSearchOff />,
    'unauthorized': <MdLockOutline />,
    'bad-request': <MdErrorOutline />,
    'service-error': <MdCloudOff />,
};

export const ErrorCard: React.FC<ErrorCardProps> = ({
    type = 'bad-request',
    title,
    message,
    buttonText,
    onAction,
}) => {
    const tComman = useTranslations('comman');

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl transition-all duration-300">

                {/* 1. Premium Background Gradients */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-500 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500 rounded-full blur-[80px]" />
                </div>

                <div className="relative flex flex-col items-center justify-center py-12 px-8">

                    {/* 2. Animated Icon Container */}
                    <div className="relative mb-8">
                        {/* Pulsing Rings */}
                        <div className="absolute inset-0 -m-6 pointer-events-none">
                            <div className="w-28 h-28 rounded-full border-4 border-red-100 animate-ping opacity-40"
                                style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="absolute inset-0 -m-4 pointer-events-none">
                            <div className="w-24 h-24 rounded-full bg-red-50/80 animate-pulse" />
                        </div>

                        {/* Central Icon */}
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <div className="text-white text-4xl animate-in zoom-in duration-500">
                                {iconMap[type]}
                            </div>
                        </div>
                    </div>

                    {/* 3. Text Content */}
                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {title || tComman('errorTitle')}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                            {message}
                        </p>
                    </div>

                    {/* 4. Action Button */}
                    <button
                        onClick={onAction}
                        className="group relative mt-10 flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-red-600 transition-all duration-300 active:scale-95 shadow-xl hover:shadow-red-500/20"
                    >
                        <IoRefreshOutline
                            className="text-lg group-hover:rotate-180 transition-transform duration-700"
                        />
                        <span>{buttonText || tComman('retry')}</span>

                        {/* Hover Glow */}
                        <div className="absolute inset-0 rounded-xl bg-red-600 opacity-0 group-hover:opacity-100 blur-md -z-10 transition-opacity" />
                    </button>

                    {/* 5. Decorative Footer Dots */}
                    <div className="mt-10 flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-200 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-red-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-red-200 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};