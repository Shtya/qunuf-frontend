import { useState } from "react";
import Image from "next/image";

interface ImageLightboxProps {
    open: boolean,
    onClose: () => void,
    url: string
}

export default function ImageLightbox({
    open,
    onClose,
    url
}: ImageLightboxProps) {



    return (
        <div className="flex flex-col gap-6">
            {/* Lightbox */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
                    onClick={() => onClose()}
                >
                    <span className="absolute top-6 right-8 text-white text-4xl cursor-pointer">
                        &times;
                    </span>
                    <div className="relative w-[90vw] h-[90vh]">
                        <Image
                            src={url}
                            alt="Lightbox"
                            fill
                            className="object-contain"
                            sizes="90vw"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
