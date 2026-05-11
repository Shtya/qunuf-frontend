'use client';

import { createPortal } from 'react-dom';
import { useRef, useState, ReactNode } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

interface TooltipProps {
    children: ReactNode;
    content: string;
    position?: TooltipPosition;
}

interface Coords {
    top: number;
    left: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ children, content, position = 'auto' }: TooltipProps) {
    const [show, setShow] = useState(false);
    const [coords, setCoords] = useState<Coords>({ top: 0, left: 0, placement: 'top' });
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const isRtl = document.documentElement.dir === 'rtl';

        // Resolve final placement
        let placement: 'top' | 'bottom' | 'left' | 'right';

        if (position === 'auto') {
            // Default to side (left in RTL, right in LTR) — preserves original behavior
            placement = isRtl ? 'left' : 'right';
        } else {
            placement = position;
        }

        let top = 0;
        let left = 0;
        const GAP = 8;

        switch (placement) {
            case 'top':
                top = rect.top - GAP;
                left = rect.left + rect.width / 2;
                break;
            case 'bottom':
                top = rect.bottom + GAP;
                left = rect.left + rect.width / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - GAP;
                break;
            case 'right':
            default:
                top = rect.top + rect.height / 2;
                left = rect.right + GAP;
                break;
        }

        setCoords({ top, left, placement });
    };

    // Arrow styles per placement
    const arrowClass: Record<string, string> = {
        top: 'absolute left-1/2 -translate-x-1/2 bottom-[-5px] border-x-[5px] border-x-transparent border-t-[5px] border-t-[var(--primary)]',
        bottom: 'absolute left-1/2 -translate-x-1/2 top-[-5px] border-x-[5px] border-x-transparent border-b-[5px] border-b-[var(--primary)]',
        left: 'absolute top-1/2 -translate-y-1/2 right-[-5px] border-y-[5px] border-y-transparent border-l-[5px] border-l-[var(--primary)]',
        right: 'absolute top-1/2 -translate-y-1/2 left-[-5px] border-y-[5px] border-y-transparent border-r-[5px] border-r-[var(--primary)]',
    };

    // Transform origin per placement (for the tooltip box itself)
    const transformStyle: Record<string, string> = {
        top: 'translate(-50%, -100%)',
        bottom: 'translate(-50%, 0%)',
        left: 'translate(-100%, -50%)',
        right: 'translate(0%, -50%)',
    };

    return (
        <div
            ref={triggerRef}
            className="relative inline-flex items-center justify-center"
            onMouseEnter={() => { updatePosition(); setShow(true); }}
            onMouseLeave={() => setShow(false)}
        >
            {children}

            {show && content && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        transform: transformStyle[coords.placement],
                        zIndex: 9999,
                    }}
                    className="
                        w-max max-w-[200px]
                        px-2.5 py-1.5
                        rounded-lg
                        text-xs font-semibold
                        bg-[var(--primary)] text-white
                        shadow-lg shadow-black/20
                        pointer-events-none
                        whitespace-nowrap
                        animate-in fade-in zoom-in-95 duration-100
                    "
                >
                    {content}
                    <span className={arrowClass[coords.placement]} />
                </div>,
                document.body
            )}
        </div>
    );
}