'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Popup from '@/components/atoms/Popup';
import { PiDownloadBold, PiSpinnerGapBold } from 'react-icons/pi';
import { resolveUrl } from '@/utils/upload';

interface ContractPdfViewerProps {
    pdfPath: string;
    contractNumber?: string | null;
    onClose: () => void;
}

export default function ContractPdfViewer({
    pdfPath,
    contractNumber,
    onClose,
}: ContractPdfViewerProps) {
    const t = useTranslations('dashboard.contracts');
    const [isLoading, setIsLoading] = useState(true);

    const pdfUrl = resolveUrl(pdfPath);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `contract-${contractNumber || 'document'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Popup show={true} onClose={onClose}>
            <div className="w-[95vw] md:w-[90vw] max-w-6xl mx-auto flex flex-col h-[85vh]">

                {/* Header */}
                <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800">
                            {t('pdfViewer.title')}
                        </h2>
                        {contractNumber && (
                            <span className="text-sm text-gray-500">
                                #{contractNumber}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleDownload}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <PiDownloadBold size={18} />
                        <span className="hidden sm:inline">
                            {t('pdfViewer.download')}
                        </span>
                    </button>
                </header>

                {/* Viewer */}
                <div className="relative flex-1 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">

                    {/* Loader */}
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80">
                            <PiSpinnerGapBold className="animate-spin text-primary text-4xl mb-2" />
                            <span className="text-gray-500">
                                {t('pdfViewer.loading')}
                            </span>
                        </div>
                    )}

                    {/* PDF iframe */}
                    <iframe
                        src={pdfUrl}
                        title="Contract PDF"
                        className="w-full h-full"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            </div>
        </Popup>
    );
}
