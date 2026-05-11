import { MdClose } from "react-icons/md";

import ConversationThread from "./ConversationThread";
import EmptyChatState from "./EmptyChatState";
import { Message } from "@/types/dashboard/chat";
import { User } from "@/types/dashboard/user";
import { memo } from "react";
import MessagesLoading from "./MessagesLoading";

interface MobileChatPanelProps {
    selectedUser?: User;
    selectedChatId: string | null;
    messages: {
        items: Message[];
        hasMore: boolean;
        nextCursor: string | null;
    } | null;
    handleSendMessage: (content: string) => void;
    handleCloseThread: () => void;
    isOpen: boolean;
    loadingMessageId: string | null;
    currentOpenConversationId: string | null;
    retryMessage?: (msg: Message) => void;
    loadMoreMessages?: (conversationId: string) => Promise<number>;
    markAsRead?: (conversationId: string) => Promise<void>;
    loadingMoreId?: string | null;
    isPartnerAdmin?: boolean;
}

const MobileChatPanel = memo(function MobileChatPanel({
    selectedUser,
    selectedChatId,
    loadingMessageId,
    currentOpenConversationId,
    messages,
    handleSendMessage,
    handleCloseThread,
    isOpen,
    retryMessage,
    loadMoreMessages,
    loadingMoreId,
    markAsRead,
    isPartnerAdmin
}: MobileChatPanelProps) {
    if (loadingMessageId?.startsWith('new-chat')) {
        return (
            <MessagesLoading />
        );
    }

    return (
        <div
            className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out md:hidden bg-white ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
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
                />
            ) : (
                <EmptyChatState />
            )}
            <button
                onClick={handleCloseThread}
                className="absolute top-4 end-4 text-gray-500 hover:text-gray-800"
            >
                <MdClose size={28} />
            </button>
        </div>
    );
})

export default MobileChatPanel;
