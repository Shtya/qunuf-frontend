type StepTitleProps = {
    title: string;
    subtitle?: string;
    className?: string;
};

export default function StepTitle({ title, subtitle, className = '' }: StepTitleProps) {
    return (
        <div className={`mx-auto flex flex-col items-center gap-4 text-center ${className}`}>
            <h1 className="text-dark font-semibold text-[28px] sm:text-[32px] md:text-[36px] leading-[100%] tracking-normal">
                {title}
            </h1>
            {subtitle && (
                <p className="text-dark font-light text-[16px] sm:text-[17px] md:text-[18px] leading-[100%] tracking-normal">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
