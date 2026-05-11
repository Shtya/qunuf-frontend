import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';

interface LogoProps {
    className?: string;
    small?: boolean;
}

export default function Logo({ className, small = false }: LogoProps) {
    const t = useTranslations('header');

    const textSize = small
        ? 'text-[18px] ltr:sm:text-[16px] sm:text-[20px] lg:text-[22px]'
        : 'text-[24px] sm:text-[28px] lg:text-[32px]';

    return (
        <div>
             <Link
                href="/"
                className={`flex items-center flex-shrink-0  ${className}`}
            >
                <h1 className={`${textSize} font-bold text-primary`}>
                    {t('logo')}
                </h1>
            </Link>
        </div>
    );
}
