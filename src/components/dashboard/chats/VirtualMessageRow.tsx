import { memo } from "react";
import MessageRow from "./MessageRow";
import { useTranslations } from "next-intl";
import { formatLastMessageTime } from "@/utils/date";

const VirtualMessageRow = memo(function VirtualMessageRow({
    index,
    style,
    messages,
    participant,
    key,
    retryMessage
}: any) {
    const t = useTranslations('comman')
    const realIndex = messages.length - 1 - index;

    const msg = messages[realIndex];

    if (!msg) return null;

    const dateObj = new Date(msg.created_at);

    const timeStr = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const prevMsg = messages[realIndex + 1];
    const isNewDay =
        !prevMsg ||
        new Date(prevMsg.created_at).toDateString() !== dateObj.toDateString();

    return (
        <div key={key} style={style} className="px-4">
            {isNewDay && (
                <p className="text-center font-bold text-input">
                    {formatLastMessageTime(dateObj, t, { showTodayAs: 'today' })}
                </p>
            )}

            <MessageRow onRetry={retryMessage} msg={{ ...msg, timeStr }} participant={participant} />
        </div>
    );
});

export default VirtualMessageRow;
