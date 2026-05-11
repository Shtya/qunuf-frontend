'use client';

import { FileItem, resolveUrl } from "@/utils/upload";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo } from "react";
import { FaFilePdf, FaFileExcel, FaFileWord, FaFileCsv, FaFileArchive, FaFileAlt } from "react-icons/fa";
import { MdClose } from "react-icons/md";


// خريطة الامتداد → أيقونة + لون
const fileTypeMap: Record<string, { icon: any; color: string }> = {
    pdf: { icon: FaFilePdf, color: "text-red-500" },
    csv: { icon: FaFileCsv, color: "text-green-500" },
    xls: { icon: FaFileExcel, color: "text-green-600" },
    xlsx: { icon: FaFileExcel, color: "text-green-600" },
    doc: { icon: FaFileWord, color: "text-blue-600" },
    docx: { icon: FaFileWord, color: "text-blue-600" },
    zip: { icon: FaFileArchive, color: "text-yellow-600" },
    rar: { icon: FaFileArchive, color: "text-yellow-600" },
    "7z": { icon: FaFileArchive, color: "text-yellow-600" },
    default: { icon: FaFileAlt, color: "text-gray-500" },
};

type FilePreviewItemProps = {
    file: FileItem | string;
    idx: number;
    allowMultiple?: boolean;
    allowPrimary?: boolean;
    setPrimary?: (url: string) => void;
    removeFile?: (url: string) => void;
    canRemove?: boolean;
    removingFiles: Set<string>
};

export default function FilePreviewItem({
    removingFiles,
    file,
    idx,
    allowMultiple = true,
    allowPrimary = true,
    setPrimary,
    removeFile,
    canRemove
}: FilePreviewItemProps) {
    // Support edit mode: backend may return just a URL string
    const t = useTranslations("comman.form.uploader");

    const fileObj: FileItem =
        typeof file === "string"
            ? { url: file, name: file.split("/").pop(), type: "", isPrimary: idx === 0 }
            : file;

    const isImage =
        fileObj.type?.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|webp)$/i.test(fileObj.url);

    const fileName = fileObj.name || `file-${idx}`;
    const ext = fileName.split(".").pop()?.toLowerCase() || "default";

    const { icon: FileIcon, color } = fileTypeMap[ext] || fileTypeMap.default;

    const isRemoving = useMemo(() => {
        return removingFiles.has(fileObj.url);
    }, [removingFiles, fileObj.url]);

    return (
        <div key={idx} className="group/row relative overflow-hidden rounded-2xl bg-white border border-dark/5 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-dark/5 hover:-translate-y-1">

            {/* Main Content Area */}
            <div className={`${isRemoving ? "opacity-20 scale-95" : "opacity-100"} transition-all duration-500`}>
                {isImage ? (
                    <div className="relative overflow-hidden">
                        <Image
                            src={resolveUrl(fileObj.url)}
                            alt={fileName}
                            height={160}
                            width={160}
                            className="w-full h-44 object-cover transition-transform duration-700 group-hover/row:scale-110"
                        />
                        {/* Gradient Overlay for better legibility of buttons */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />
                    </div>
                ) : (
                    <div className="w-full h-44 flex flex-col items-center justify-center bg-dark/[0.02]">
                        <div className="p-4 rounded-2xl bg-white shadow-sm mb-3">
                            <FileIcon className={`w-8 h-8 ${color}`} />
                        </div>
                        <span className="text-[10px] font-black text-dark/60 uppercase tracking-widest px-4 text-center truncate w-full">
                            {ext} file
                        </span>
                    </div>
                )}
            </div>

            {/* Primary Status Badge (Trimmed Design) */}
            {fileObj.isPrimary && (
                <div className="absolute top-3 left-3 z-20">
                    <span className="px-2 py-1 rounded-md bg-secondary text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-secondary/20">
                        {t("primaryFile")}
                    </span>
                </div>
            )}

            {/* Removal Overlay (Logic preserved) */}
            {isRemoving && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-md bg-white/40">
                    <div className="relative">
                        <div className="w-10 h-10 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                    </div>
                    <span className="mt-3 text-[9px] font-black uppercase tracking-[0.3em] text-secondary">
                        {t("removing")}
                    </span>
                </div>
            )}

            {/* Actions (Preserved Logic, Improved Style) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between gap-2 items-center translate-y-full group-hover/row:translate-y-0 transition-transform duration-300 z-20">
                {allowMultiple && allowPrimary && setPrimary && !isRemoving && !fileObj.isPrimary && (
                    <button
                        type="button"
                        onClick={() => setPrimary(fileObj.url)}
                        className="bg-white/95 backdrop-blur-sm text-dark text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl hover:bg-secondary hover:text-white transition-all"
                    >
                        {t("setAsPrimary")}
                    </button>
                )}

                {removeFile && canRemove && (
                    <button
                        type="button"
                        disabled={isRemoving}
                        onClick={() => removeFile(fileObj.url)}
                        className={`ml-auto p-1.5 rounded-lg transition-all shadow-xl
                        ${isRemoving ? "bg-dark/10" : "bg-red-500 hover:bg-red-600 text-white"}`}
                    >
                        <MdClose size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
