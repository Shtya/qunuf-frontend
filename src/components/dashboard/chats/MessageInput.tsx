import { useState, useRef, useEffect } from "react";
import { BsSendFill } from "react-icons/bs";
import { useTranslations } from "next-intl";

export default function MessageInput({
    handleSendMessage,
    currentConversationId,
}: {
    handleSendMessage: (value: string) => void;
    currentConversationId: string | null;
}) {
    const t = useTranslations("dashboard.chats");

    // Map of conversationId -> draft message
    const draftsRef = useRef<Map<string, string>>(new Map());


    // Ref for the input element const
    const inputRef = useRef<HTMLInputElement>(null);
    // Local state bound to the input
    const [message, setMessage] = useState<string>("");

    // Whenever conversation changes, load its draft
    useEffect(() => {
        if (!currentConversationId) return;
        const draft = draftsRef.current.get(currentConversationId) || "";
        setMessage(draft);
        inputRef.current?.focus();
    }, [currentConversationId]);

    function send() {
        if (!message.trim()) return;
        handleSendMessage(message);
        // Clear draft for this conversation
        if (currentConversationId) {
            draftsRef.current.set(currentConversationId, "");
        }
        setMessage("");
    }

    function handleChange(value: string) {
        setMessage(value);
        if (currentConversationId) {
            draftsRef.current.set(currentConversationId, value);
        }
    }

    return (
        <div className="flex items-end md:bottom-2 md:start-0 md:end-0 bg-card-bg mt-5">
            <div className="flex items-center gap-5 flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={t("typeMessage")}
                    value={message}
                    onChange={(e) => handleChange(e.target.value)}
                    className="bg-dashboard-bg p-3 border border-gray rounded-full focus:outline-0 w-full"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            send();
                        }
                    }}
                />
                <button onClick={send}>
                    <BsSendFill
                        size={26}
                        className="shrink-0 text-primary rtl:rotate-[280deg]"
                    />
                </button>
            </div>
        </div>
    );
}
