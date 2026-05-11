'use client';

import { FileItem, processFiles, resolveUrl } from '@/utils/upload';
import { Control, Controller } from 'react-hook-form';
import FilePreviewItem from './FilePreviewItem';
import { BsCloudArrowUp } from 'react-icons/bs';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { set } from 'zod';
import { MdClose } from 'react-icons/md';
import { cn } from '@/lib/utils';

type UploaderProps = {
    control: Control<any>;
    name: string; // 👈 field name
    allowMultiple?: boolean;
    allowPrimary?: boolean
    label?: string;
    onRemoveFile?: (file: FileItem) => Promise<boolean>,
    preventRemoveOn?: number;
    accept?: string;
    rules?: string[]; // 👈 array of rules to display
    maxSizeMB?: number;
    maxFiles?: number;
    defaultImage?: string;
};

export default function Uploader({
    control,
    name,
    allowMultiple = true,
    allowPrimary = true,
    label,
    defaultImage,
    onRemoveFile,
    preventRemoveOn,
    accept = '*/*',
    rules = ['الحد الأقصى لحجم الملف 9MB', 'الحد الأقصى 10 ملفات'],
    maxSizeMB = 9,
    maxFiles = 10,
}: UploaderProps) {
    const t = useTranslations("comman.form.uploader");
    const [removingFiles, setRemovingFiles] = useState(new Set<string>());
    // generate a stable unique id per Uploader instance
    const idRef = useRef(`${name}-dropzone-${Math.random().toString(36).slice(2)}`);
    const inputId = idRef.current;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => {
                const currentFiles: FileItem[] = Array.isArray(field.value)
                    ? field.value
                    : field.value
                        ? [field.value]
                        : [];

                const canRemove = !preventRemoveOn || currentFiles.length > preventRemoveOn;
                const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!e.target.files) return;

                    const files = Array.from(e.target.files);

                    const updated = processFiles(
                        files,
                        accept,
                        allowMultiple,
                        allowPrimary,
                        field.value || [],
                        maxSizeMB,
                        maxFiles
                    );

                    field.onChange(allowMultiple ? updated : updated[0]);
                };


                const setPrimary = (url: string) => {
                    const updated = (field.value || []).map((f: FileItem) => ({
                        ...f,
                        isPrimary: f.url === url,
                    }));
                    field.onChange(updated);
                };

                const removeFile = async (url: string) => {
                    const currentValues = Array.isArray(field.value)
                        ? field.value
                        : field.value ? [field.value] : [];

                    // 2. Find the specific file item to pass to the callback
                    const fileItemToRemove = currentValues.find((f: any) =>
                        typeof f === 'string' ? f === url : f.url === url
                    );

                    let isRemoved = true;
                    if (onRemoveFile) {
                        setRemovingFiles(prev => {
                            const next = new Set(prev);
                            next.add(fileItemToRemove.url);
                            return next;
                        });

                        isRemoved = await onRemoveFile(fileItemToRemove);

                        setRemovingFiles(prev => {
                            const next = new Set(prev);
                            next.delete(fileItemToRemove.url);
                            return next;
                        });
                    }


                    if (!isRemoved) return;
                    let updated = currentValues.filter((f: any) =>
                        typeof f === 'string' ? f !== url : f.url !== url
                    );

                    if (allowMultiple && allowPrimary && updated.length > 0) {
                        const hasPrimary = updated.some((f: any) => typeof f === 'object' && f.isPrimary);

                        if (!hasPrimary && typeof updated[0] === 'object') {
                            updated[0] = { ...updated[0], isPrimary: true };
                        }
                    }

                    const finalValue = allowMultiple ? updated : (updated[0] || null);
                    field.onChange(finalValue);
                };

                const isOneFile = !allowMultiple;

                return (
                    <div className="relative col-span-12 group/uploader"
                        onDrop={(e) => {
                            e.preventDefault();
                            const files = Array.from(e.dataTransfer.files);
                            handleFiles({ target: { files } } as any);
                        }}
                        onDragOver={(e) => e.preventDefault()}>

                        {/* Architectural Label */}
                        {label && (
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1 h-6 bg-secondary rounded-full" />
                                <label htmlFor={inputId} className="text-sm font-black uppercase tracking-[0.2em] text-dark/80 cursor-pointer">
                                    {label}
                                </label>
                            </div>
                        )}

                        {/* Dropzone */}
                        <div className={cn(
                            "relative overflow-hidden transition-all duration-500 rounded-2xl border-2 border-dashed",
                            "bg-white border-dark/10", // Initial White Background
                            "group-hover/uploader:border-secondary/40 group-hover/uploader:shadow-sm" // Hover transition
                        )}>
                            <label
                                htmlFor={inputId}
                                className="relative flex flex-col items-center justify-center w-full cursor-pointer py-12 px-6"
                            >
                                <div className="relative mb-6">
                                    {/* Background Decorative Circle */}
                                    <div className="absolute inset-0 scale-150 bg-secondary/5 rounded-full blur-2xl group-hover/uploader:bg-secondary/10 transition-colors" />
                                    <BsCloudArrowUp size={56} className="relative text-secondary group-hover/uploader:-translate-y-1 transition-transform duration-300" />
                                </div>

                                <div className="text-center space-y-1">
                                    <span className="block text-lg font-bold text-dark tracking-tight">
                                        {t("dragLabel")}
                                    </span>
                                    <span className="block text-xs font-medium text-dark/40 uppercase tracking-widest">
                                        — {t("orLabel")} —
                                    </span>
                                    <span className="inline-block mt-4 px-5 py-2 rounded-full bg-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-colors">
                                        {t("chooseFiles")}
                                    </span>
                                </div>

                                {/* Technical Rules Row */}
                                <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 mt-8 border-t border-dark/5 pt-6 w-full max-w-md">
                                    {rules.map((rule, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-secondary/40" />
                                            <span className="text-[10px] font-bold text-dark/40 uppercase tracking-tight">{rule}</span>
                                        </div>
                                    ))}
                                </div>

                                <input id={inputId} type="file" multiple={allowMultiple} accept={accept} className="hidden" onChange={handleFiles} />
                                {isOneFile && currentFiles.length === 1 && (() => {
                                    const file = currentFiles[0];
                                    let src = '';
                                    let isImage = false;

                                    let fileName = '';

                                    if (typeof file === 'string') {
                                        src = file;
                                        isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(src);
                                        fileName = src.split('/').pop() || '';
                                    } else {
                                        src = file.url || '';
                                        isImage = file.type?.startsWith('image/');
                                        fileName = file.name || '';
                                    }
                                    if (!src) return null;
                                    const isRemoving = removingFiles.has(src);
                                    return (
                                        <div className="absolute inset-0 z-20 bg-white">
                                            <div className={`relative w-full h-full ${isRemoving ? "opacity-50 grayscale" : ""}`}>
                                                {isImage ? (
                                                    <Image
                                                        src={resolveUrl(src)}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover rounded-[8px]"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 rounded-[8px] flex flex-col items-center justify-center">
                                                        <BsCloudArrowUp size={40} className="text-gray-400 mb-2" />
                                                        <span className="text-sm text-gray-700 px-4 text-center truncate w-full">{fileName}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Loading Spinner for Single File */}
                                            {isRemoving && (
                                                <div className="absolute inset-0 flex items-center justify-center z-30">
                                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}

                                            {/* Close Icon - Disabled while removing */}
                                            <button
                                                type="button"
                                                disabled={isRemoving}
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevent opening file dialog
                                                    e.stopPropagation();
                                                    removeFile(src); // Your callback
                                                }}
                                                className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md z-40 transition-colors
                    ${isRemoving ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                            >
                                                <MdClose size={18} />
                                            </button>
                                        </div>
                                    );
                                })()}

                            </label>
                        </div>

                        {!isOneFile && currentFiles.length > 0 && (
                            <div className="grid grid-cols-1 xs:!grid-cols-2 md:!grid-cols-3 lg:!grid-cols-4 gap-4 mt-6">
                                {currentFiles.map((file: FileItem | string, idx: number) => (
                                    <FilePreviewItem
                                        canRemove={canRemove}
                                        removingFiles={removingFiles}
                                        key={idx}
                                        file={file}
                                        idx={idx}
                                        allowMultiple={allowMultiple}
                                        allowPrimary={allowPrimary}
                                        setPrimary={setPrimary}
                                        removeFile={removeFile}
                                    />
                                ))}
                            </div>
                        )}

                    </div>
                );
            }}
        />
    );
}
