import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { HiX } from "react-icons/hi";
 
interface SidebarProps {
    title: string | ReactNode;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string
}

export default function Sidebar({ title, open, onClose, children, className }: SidebarProps) {
    return (
        <>
            {/* Inline content on desktop */}
            <div className={`hidden lg:block ${className}`}>{children}</div>

            {/* Mobile sidebar via portal */}
            {typeof window !== 'undefined' &&
                createPortal(
                    <>
                        {/* Overlay */}
                        <div
                            className={`fixed inset-0 z-[998] bg-black/40 transition-opacity duration-300 lg:hidden ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                            onClick={onClose}
                        />

                        {/* Sidebar panel */}
                        <div
                            dir="ltr"
                            className={`filter-sidebar overflow-y-auto fixed top-0 right-0 h-full w-full max-w-[335px] bg-white shadow-lg transform transition-transform duration-300 lg:hidden z-[999] ${open ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-semibold">{title}</h2>
                                <button onClick={onClose}>
                                    <HiX size={24} />
                                </button>
                            </div>
                            <div dir={document.dir} className="">
                                {children}
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
}
