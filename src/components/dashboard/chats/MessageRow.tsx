import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types/dashboard/chat";
import { User } from "@/types/dashboard/user";
import { resolveUrl } from "@/utils/upload";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { memo } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { RiLoader2Fill } from "react-icons/ri";

export type ProcessedMessage = Message & {
    timeStr: string;
};

interface MessageRowProps {
    msg: ProcessedMessage;
    participant: User;
    style?: React.CSSProperties;
    onRetry?: (msg: ProcessedMessage) => void;
}

const MessageRow = memo(function MessageRow({
    msg,
    participant,
    style,
    onRetry,
}: MessageRowProps) {

    const { user } = useAuth()
    const isMine = msg.senderId === user?.id;
    const isSending = msg.status === 'sending';
    const isFailed = msg.status === 'error';
    const t = useTranslations('dashboard.chats');
    return (
        <div style={style}>
            <div
                className={`
          flex items-start gap-4 p-4 rounded-lg transition-all mb-2
          ${isSending ? 'opacity-60' : ''}
          ${isFailed ? 'bg-rose-50/50 border border-rose-200 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.1)]' : ''}
        `}
            >
                {/* Avatar */}
                <div className="shrink-0 w-[37px] h-[37px] relative rounded-full overflow-hidden">
                    <Image
                        src={
                            resolveUrl(
                                isMine ? user.imagePath : participant.imagePath
                            ) || '/users/default-user.png'
                        }
                        alt="profile"
                        width={37}
                        height={37}
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>

                {/* Message Content */}
                <div className="flex flex-col justify-center flex-1">
                    <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-dark">
                            {isMine ? user.name : participant.name}
                        </h4>

                        <span className="text-xs text-input">
                            {msg.timeStr}
                        </span>

                        {/* Status indicator */}
                        {isSending && (
                            <RiLoader2Fill className="w-4 h-4 animate-spin text-gray-400" />
                        )}

                        {isFailed && (
                            <button
                                onClick={() => onRetry?.(msg)}
                                title={t('failedSendTitle')}
                                className="text-rose-500 hover:text-rose-600 hover:scale-110 transition-all"
                            >
                                <FiAlertCircle className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <p className="text-base text-dark font-medium break-all mt-1">
                        {msg.content}
                    </p>

                    {/* Failed helper text */}
                    {/* {isFailed && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="w-1 h-1 rounded-full bg-rose-400" />
                            <span className="text-[11px] font-bold text-rose-500 tracking-tight">
                                {t('failedSendText')}
                            </span>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
});

export default MessageRow;