import { useState } from "react";
import Image from "next/image";
import Popup from "../atoms/Popup";
import { PiDownloadBold } from "react-icons/pi";
import { useTranslations } from "next-intl";

type ContractImage = {
    src: string;
    alt?: string;
};

interface ContractViewerProps {
    images: ContractImage[];
}

export default function ContractViewer({ images }: ContractViewerProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const t = useTranslations('dashboard.contracts');
    function handleOnClose() {
        setMenuOpen(false);
        setSelectedIndex(0); // reset to first image when closing
    }

    const hasImages = images && images.length > 0;

    return (
        <div>
            <button
                className="text-primary py-1 px-2 border border-dark rounded-full text-sm disabled:opacity-50"
                onClick={() => hasImages && setMenuOpen(true)}
                disabled={!hasImages}
            >
                {hasImages ? t('viewContract') : t('noContractAvailable')}
            </button>

            <Popup
                onClose={handleOnClose}
                show={menuOpen}
                headerContent={
                    <header className="flex justify-between items-center">
                        <p className="text-secondary text-2xl">{t('contractTitle')}</p>
                        {hasImages && (
                            <a
                                href={images[selectedIndex].src}
                                download={`contract-page-${selectedIndex + 1}.png`}
                                className="p-1"
                            >
                                <PiDownloadBold
                                    size={20}
                                    className="text-secondary hover:text-secondary-hover"
                                />
                            </a>
                        )}
                    </header>
                }
            >
                <div className="flex flex-col md:flex-row h-[70vh] xs:h-[87vh] w-full max-w-6xl mx-auto bg-white rounded-lg overflow-hidden">
                    {hasImages ? (
                        <>
                            {/* Sidebar with thumbnails */}
                            <div className="flex md:flex-col bg-secondary border-b md:border-b-0 md:border-r border-gray-200 overflow-x-auto md:overflow-y-auto w-full md:w-32 lg:w-40">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedIndex(idx)}
                                        className={`flex-shrink-0 md:w-full p-1 sm:p-2 border-b md:border-b-0 md:border-r-0 border-primary hover:bg-secondary-hover ${idx === selectedIndex ? "bg-secondary" : ""
                                            }`}
                                    >
                                        <Image
                                            src={img.src}
                                            alt={img.alt || `Contract page ${idx + 1}`}
                                            width={120}
                                            height={160}
                                            className="w-20 h-auto md:w-full object-contain rounded"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Main preview */}
                            <div className="flex-1 flex justify-center items-center overflow-auto bg-white">
                                <Image
                                    src={images[selectedIndex].src}
                                    alt={
                                        images[selectedIndex].alt ||
                                        `Contract page ${selectedIndex + 1}`
                                    }
                                    width={1017}
                                    height={1451}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex justify-center items-center text-gray-500 text-lg">
                            {t('noImagesFallback')}
                        </div>
                    )}
                </div>
            </Popup>
        </div>
    );
}
