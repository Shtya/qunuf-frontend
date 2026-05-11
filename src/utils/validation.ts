import { AxiosResponse } from "axios";
import z from "zod";


// Reusable phone schema
export const phoneSchema = z.string()
    .min(1, 'validation.required')
    .regex(/^[+]?[\d\s\-()]{3,20}$/, 'validation.invalidPhone');

export const triggerFileDownload = (response: AxiosResponse<any, any>, defaultName: string) => {
    const contentDisposition = response.headers['content-disposition'];
    let filename = defaultName;

    if (contentDisposition) {
        // Try to parse "filename=" from the header
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
            filename = match[1];
        }
    }

    // 5. Create Download Link
    const url = window.URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }));

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename); // Use the filename from server

    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
}