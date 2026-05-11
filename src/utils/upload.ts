import { baseImg } from "@/libs/axios";
import z from "zod";

// helpers/fileUpload.ts
export type FileItem = {
    url: string;
    file?: File;
    name?: string;
    type?: string;
    isPrimary?: boolean;

};
export const fileItemSchema = z.object({
    url: z.string(),
    file: z.instanceof(File).optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    isPrimary: z.boolean().optional()
});


export function processFiles(
    files: File[],
    accept: string,
    allowMultiple: boolean,
    allowPrimary: boolean,
    existing: FileItem[] = [],
    maxSizeMB: number = 9,
    maxFiles: number = 10
): FileItem[] {
    // 🔹 Validation rules
    const MAX_SIZE_MB = maxSizeMB;
    const MAX_FILES = maxFiles;

    // Normalize accept string → array of trimmed rules
    const ACCEPTED_TYPES = accept
        ? accept.split(",").map((r) => r.trim()).filter(Boolean)
        : [];

    const allowAll =
        ACCEPTED_TYPES.length === 0 ||
        (ACCEPTED_TYPES.length === 1 && ACCEPTED_TYPES[0] === "*/*");

    const validFiles: File[] = [];

    for (const file of files) {
        // 1. Size check
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`❌ ${file.name} is larger than ${MAX_SIZE_MB}MB and was skipped.`);
            continue;
        }

        // 2. Type check
        if (!allowAll) {
            const isAccepted = ACCEPTED_TYPES.some((rule) => {
                if (rule === "image/*") return file.type.startsWith("image/");
                if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule.toLowerCase());
                return file.type === rule;
            });

            if (!isAccepted) {
                alert(`❌ ${file.name} is not an accepted file type and was skipped.`);
                continue;
            }
        }

        validFiles.push(file);
    }

    // 3. Convert to FileItem[]
    const newFiles: FileItem[] = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
        name: file.name,
        type: file.type,
        isPrimary: false,
    }));

    // 4. Merge with existing
    let updated: FileItem[];
    if (!allowMultiple) {
        updated = newFiles.length > 0 ? [newFiles[0]] : [];
    } else {
        updated = [...existing, ...newFiles];
    }

    // 5. Enforce max files
    if (updated.length > MAX_FILES) {
        alert(`⚠️ You can only upload up to ${MAX_FILES} files.`);
        updated = updated.slice(0, MAX_FILES);
    }

    // 6. Ensure one primary
    if (allowPrimary && !updated.some((f) => f.isPrimary) && updated.length > 0) {
        updated[0].isPrimary = true;
    }

    return updated;
}


export function resolveUrl(u?: string | null) {
    if (!u) return '';
    if (/^(https?:|blob:|data:)/i.test(u)) return u;

    // Ensure leading slash for relative paths
    const normalized = u.replace(/^\/+/, '');
    return (baseImg || '/') + normalized;
}
