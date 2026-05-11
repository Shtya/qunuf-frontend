import { ConversationChat } from "@/hooks/dashboard/useChat"; 
import { formatLastMessageTime } from "@/utils/date";
import { resolveUrl } from "@/utils/upload";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { RiLoader2Fill } from "react-icons/ri";

interface ChatPreviewProps {
    conversation: ConversationChat;
    onClick?: () => void;
    selected: boolean;
    isSending?: boolean;
}

export default function ChatPreviewCard({
    onClick,
    selected,
    conversation,
    isSending = true,
}: ChatPreviewProps) {
    const tSupport = useTranslations('dashboard.support');
    const t = useTranslations('comman');

    const support = conversation.supportUserId === conversation?.partner?.id;

    return (
        <div
            className={`border-b border-b-gray cursor-pointer relative 
        ${selected ? 'bg-gray-100' : ''} 
        ${isSending ? 'opacity-70' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition relative">
                {/* Profile Image - Added Pulse & Background for skeleton feel */}
                <div className={`shrink-0 w-14 h-14 relative rounded-full overflow-hidden bg-gray-200 ${isSending ? 'animate-pulse' : ''}`}>
                    <Image
                        src={resolveUrl(conversation?.partner?.imagePath) || '/users/default-user.png'}
                        alt={`${support ? tSupport('senderName') : conversation?.partner?.name}'s profile`}
                        width={56}
                        height={56}
                        className={`w-full h-full rounded-full object-cover transition-opacity ${isSending ? 'opacity-40' : 'opacity-100'}`}

                    />
                </div>

                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-semibold text-dark truncate">
                            {support ? tSupport('senderName') : conversation?.partner?.name}
                        </h4>

                        {/* Skeleton bar instead of time when sending */}
                        {isSending ? (
                            <div className="">
                                <RiLoader2Fill className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            conversation?.lastMessage && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {formatLastMessageTime(conversation?.lastMessage?.created_at, t)}
                                </span>
                            )
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        {/* Last Message Preview */}
                        {conversation?.lastMessage?.content && (
                            <p className={`text-sm flex-1 line-clamp-1 ${isSending ? 'opacity-50 italic' : conversation?.myUnreadCount > 0 ? 'text-dark font-medium' : 'text-gray-500'}`}>
                                {isSending ? 'Sending message...' : conversation?.lastMessage.content}
                            </p>
                        )}

                        {/* WhatsApp Style Unread Ball */}
                        {!isSending && conversation?.myUnreadCount > 0 && (
                            <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold shadow-sm">
                                {conversation?.myUnreadCount > 99 ? '99+' : conversation?.myUnreadCount}
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
}