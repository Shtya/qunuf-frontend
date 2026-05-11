import { MessageSkeleton } from "./ConversationThread";

export default function MessagesLoading() {
    return (
        <div className="bg-card-bg md:col-span-6 lg:col-span-7 xl:col-span-8 rounded-[8px] relative h-full">
            {/* Fake Header Skeleton */}
            <div className="px-4 py-6 border-b border-gray-100 flex items-center gap-4">
                <div className="shrink-0 w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Message Skeletons */}
            <div className="p-4 space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <MessageSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}