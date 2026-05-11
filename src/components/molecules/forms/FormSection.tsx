import { cn } from "@/lib/utils";


export default // Wrapper for form sections with modern card design
    function FormSection({
        title,
        subtitle,
        icon,
        children,
        className
    }: {
        title: string;
        subtitle?: string;
        icon?: React.ReactNode;
        children: React.ReactNode;
        className?: string;
    }) {
    return (
        <div className={cn(
            "group relative bg-card-bg rounded-[24px] border border-dark/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
            "transition-all duration-500 hover:border-secondary/20 hover:-translate-y-1",
            "relative z-10 hover:z-[20] focus-within:z-50", // Add these Z-index classes
            className
        )}>
            {/* Gradient border effect on hover */}
            <div className="absolute -inset-[1px] bg-gradient-to-br from-secondary/5 via-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

            {/* Content */}
            <div className="relative p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-3 pb-4 border-b border-gray/10">
                    {icon && (
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
                            {icon}
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-dark bg-gradient-to-r from-dark to-dark/80 bg-clip-text">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-sm text-dark/60 mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Form fields */}
                {children}
            </div>
        </div>
    );
}