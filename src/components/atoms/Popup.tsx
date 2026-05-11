'use client';

import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';
import { useOutsideClick } from '@/hooks/useOutsideClick';

interface PopupProps {
    children: React.ReactNode;
    onClose?: () => void;
    show: boolean;
    className?: string;
    headerContent?: React.ReactNode;
}

export default function Popup({ children, onClose, show, className, headerContent }: PopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    // Lock scroll when popup is open
    useEffect(() => {
        if (show) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [show]);

    // useOutsideClick(popupRef, () => {
    //     if (show) onClose?.();
    // });

    if (typeof document === 'undefined') return null;
    if (!children) return null;

    return createPortal(
        <div
            data-popup
            className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-300 backdrop-blur-sm bg-black/40 z-[100] ${show ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
        >
            <div
                ref={popupRef}
                className={`relative bg-white rounded-2xl shadow-2xl w-full md:min-w-[500px] max-w-fit  transform transition-all duration-300 border border-gray-100 ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    } ${className}`}
            >
                {/* Header Section */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <div className="flex-1 text-sm font-bold text-gray-700 uppercase tracking-wide">
                        {headerContent}
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all duration-200 ms-2"
                            aria-label="Close"
                        >
                            <MdClose className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar content">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}