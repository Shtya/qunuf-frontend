// lib/variants.ts or same file
import { tv } from 'tailwind-variants';

export const searchVariants = tv({
    base: "relative flex items-center gap-3 px-4 py-2.5 w-full transition-all duration-300 ease-in-out border rounded-2xl group shadow-sm",
    variants: {
        state: {
            idle: "bg-dashboard-bg border-gray/10 hover:border-secondary/40",
            focused: "bg-dashboard-bg border-secondary shadow-md ring-4 ring-secondary/5",
        }
    }
});