import { getInitials } from "@/utils/helpers";

export default function ImageAlt({ title }: { title: string }) {
    return (
        <div className="w-full h-full text-4xl bg-gray-200 flex items-center justify-center text-gray-500">
            {getInitials(title)}
        </div>
    );
}