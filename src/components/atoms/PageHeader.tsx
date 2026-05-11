interface PageHeaderProps {
    title: string;
    className?: string;
    dir?: "ltr" | "rtl";
}

export default function PageHeader({ title, className, dir = "ltr" }: PageHeaderProps) {
    return (
        <header
            dir={dir}
            aria-label={title}
            className={`flex items-center justify-center py-8 md:py-10 ${className ?? ""}`}
        >
            <div className="flex items-center gap-3">
                {/* Decorative line */}
                <div
                    aria-hidden="true"
                    className="w-7 h-[2.5px] bg-primary rounded-full"
                />

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-secondary tracking-tight">
                    {title}
                </h1>

                {/* Decorative line */}
                <div
                    aria-hidden="true"
                    className="w-7 h-[2.5px] bg-primary rounded-full"
                />
            </div>
        </header>
    );
}