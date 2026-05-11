

interface SectionHeadingProps {
    title: string;
    className?: string;
}

export default function SectionHeading({
    title,
    className = '',
}: SectionHeadingProps) {

    return (
        <h1
            className={`font-bold text-[28px] sm:text-[32px] md:text-[34px] leading-[100%] tracking-[0%] text-dark ${className}`}
        >
            {title}
        </h1>
    );
}
