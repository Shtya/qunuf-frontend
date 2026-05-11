import React from "react";
import { MdArticle } from "react-icons/md";

interface EmptyStateProps {
    title: string;
    description: string;
}

export default function NoData({ title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="mb-6 rounded-full bg-gray-100 p-6">
                <MdArticle size={48} className="text-gray-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {title}
            </h3>

            <p className="text-sm text-gray-500 max-w-md">
                {description}
            </p>
        </div>
    );
}