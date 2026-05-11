
import { Message } from "@/types/dashboard/chat";
import ConversationThread from "./ConversationThread";
import EmptyChatState from "./EmptyChatState";
import { User } from "@/types/dashboard/user";
import { memo } from "react";
import MessagesLoading from "./MessagesLoading";
import { MdClose } from "react-icons/md";




interface ChatPanelProps {
    selectedUser?: User;
    selectedChatId: string | null;
    messages: {
        items: Message[];
        hasMore: boolean;
        nextCursor: string | null;
    } | null;
    handleSendMessage: (content: string) => void;
    loadingMessageId: string | null;
    currentOpenConversationId: string | null;
    handleCloseThread: () => void;
    isOpen: boolean;
    retryMessage?: (msg: Message) => void;
    loadMoreMessages?: (conversationId: string) => Promise<number>;
    markAsRead?: (conversationId: string) => Promise<void>;
    loadingMoreId?: string | null;
    isPartnerAdmin?: boolean;
    onViewUserDetails?: (user: User) => void;
}

const ChatPanel = memo(function ChatPanel({
    selectedUser,
    loadingMessageId,
    currentOpenConversationId,
    messages,
    handleSendMessage,
    retryMessage,
    loadMoreMessages,
    handleCloseThread,
    isOpen,

    loadingMoreId,
    markAsRead,
    isPartnerAdmin,
    onViewUserDetails
}: ChatPanelProps) {

    if (loadingMessageId?.startsWith('new-chat')) {
        return (
            <MessagesLoading />
        );
    }

    return (
        <div className={`bg-[var(--card-bg)] rounded-2xl overflow-hidden min-h-[500px] border border-[var(--gray)] max-md:fixed max-md:inset-0 max-md:z-50 max-md:transition-transform max-md:duration-300 max-md:ease-in-out   ${isOpen ? "max-md:translate-x-0" : "max-md:translate-x-full"}
        md:block md:col-span-6 lg:col-span-7 xl:col-span-8 md:relative`}>
            {selectedUser ? (
                <ConversationThread
                    isPartnerAdmin={isPartnerAdmin}
                    markAsRead={markAsRead}
                    loadingMoreId={loadingMoreId}
                    loadMoreMessages={loadMoreMessages}
                    retryMessage={retryMessage}
                    currentOpenConversationId={currentOpenConversationId}
                    loadingMessageId={loadingMessageId}
                    className="h-full overflow-hidden px-4 py-6"
                    messages={messages?.items || []}
                    participant={selectedUser}
                    onSendMessage={handleSendMessage}
                    onViewUserDetails={onViewUserDetails}
                />
            ) : (
                <EmptyChatState />
            )}
            <button
                onClick={handleCloseThread}
                className="absolute top-4 end-4 text-gray-500 hover:text-gray-800 md:hidden"
            >
                <MdClose size={28} />
            </button>
        </div>
    );
})

export default ChatPanel;
