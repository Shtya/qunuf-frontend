import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types/dashboard/chat";
import { User } from "@/types/dashboard/user"; 
import { useTranslations } from "next-intl";
import Image from "next/image";
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import { resolveUrl } from "@/utils/upload";
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from "react-virtualized";
import VirtualMessageRow from "./VirtualMessageRow";
import { useSocket } from "@/contexts/SocketContext";
import { Info, Phone } from "lucide-react";

type ConversationThreadProps = {
    messages: Message[];
    participant: User;
    onSendMessage?: (message: string) => void;
    className?: string;
    loadingMessageId: string | null;
    currentOpenConversationId: string | null;
    retryMessage?: (msg: Message) => void;
    loadMoreMessages?: (conversationId: string) => Promise<number>;
    markAsRead?: (conversationId: string) => Promise<void>;
    loadingMoreId?: string | null;
    isPartnerAdmin?: boolean;
    onViewUserDetails?: (user: User) => void;
};

type ListWithGrid = List & {
    Grid?: {
        _scrollingContainer?: HTMLElement;
    };
};

const ConversationThread = memo(function ConversationThread({
    messages,
    participant,
    onSendMessage,
    loadingMessageId,
    currentOpenConversationId,
    className,
    retryMessage,
    loadMoreMessages,
    loadingMoreId,
    markAsRead,
    isPartnerAdmin,
    onViewUserDetails
}: ConversationThreadProps) {
    const tSupport = useTranslations('dashboard.support');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const prevMessagesCount = useRef(messages.length);
    const { user } = useAuth()
    const t = useTranslations('dashboard.chats');
    const cache = useRef(new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 88,
        minHeight: 88, // Your minimum height
    }));
    const listRef = useRef<List>(null);
    const lastProcessedMessageId = useRef<string | number | null>(null);
    const lastMessage = messages[0];

    const { userStatuses } = useSocket()
    // Helper
    function handleSendMessage(value: string) {
        if (!value) return;
        onSendMessage?.(value)
    }

    const scrollToBottom = (lastPrev?) => {
        if (listRef.current && messages.length > 0) {
            listRef.current.scrollToRow(lastPrev !== undefined ? lastPrev : messages.length - 1);
        }
    };
    const getScrollContainer = () => {
        const grid = (listRef.current as ListWithGrid | null)?.Grid;
        return (grid?._scrollingContainer as HTMLElement | undefined) || messagesContainerRef.current || undefined;
    };

    const markRead = useCallback(() => {
        if (!currentOpenConversationId) return;
        markAsRead?.(currentOpenConversationId);
    }, [currentOpenConversationId, markAsRead]);

    // Auto-scroll / show scroll button logic for newly added messages
    useEffect(() => {
        if (!lastMessage || lastMessage?.id === lastProcessedMessageId.current) return;

        const isNewMessage = messages.length > prevMessagesCount.current;
        if (!isNewMessage) {
            prevMessagesCount.current = messages.length;
            return;
        }

        const raf = requestAnimationFrame(() => {
            const container = getScrollContainer();
            if (!container) {
                prevMessagesCount.current = messages.length;
                return;
            }

            const { scrollTop, scrollHeight, clientHeight } = container;
            if (!clientHeight || !scrollHeight) {
                // still not ready; you can optionally schedule another raf here
                prevMessagesCount.current = messages.length;
                return;
            }

            const isMyMessage = lastMessage?.senderId === user?.id;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

            if (isMyMessage || isNearBottom) {
                lastProcessedMessageId.current = lastMessage?.id;
                cache.current.clearAll();
                listRef.current?.recomputeRowHeights();
                requestAnimationFrame(() => scrollToBottom());
                markRead();
                setShowScrollButton(false);
            } else {
                setShowScrollButton(true);
                lastProcessedMessageId.current = lastMessage?.id;
            }

            prevMessagesCount.current = messages.length;
        });

        return () => cancelAnimationFrame(raf);
    }, [lastMessage, user?.id, messages.length]);

    const loadMoreDone = useRef<boolean>(false);
    const isInitializingRef = useRef(true);

    const handleScroll = async ({ scrollTop, scrollHeight, clientHeight }: { scrollTop: number; scrollHeight: number; clientHeight: number }) => {
        if (isInitializingRef.current) return;

        // 1. Handle "New Messages" button visibility
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

        if (isNearBottom && showScrollButton) {
            setShowScrollButton(false);
            markRead();
        }

        // 2. Trigger Load More when hitting the top
        if (scrollTop <= 150 && clientHeight && !loadingMoreId && currentOpenConversationId) {
            await loadMoreMessages?.(currentOpenConversationId);
            loadMoreDone.current = true;
        }
    };
    const prevScrollHeightRef = useRef<number>(0);
    const getScrollableNode = () => {
        const grid = (listRef.current as ListWithGrid | null)?.Grid;
        return grid?._scrollingContainer as HTMLElement | undefined;
    };

    // Use LayoutEffect to adjust scroll before the user sees a "jump"
    useLayoutEffect(() => {
        isInitializingRef.current = true;
        const container = getScrollableNode();
        if (!container || !currentOpenConversationId || !loadMoreDone.current) return;

        // If messages were added to the top
        if (messages.length > prevMessagesCount.current && container.scrollTop <= 200) {
            const heightDifference = container.scrollHeight - prevScrollHeightRef.current;

            // Offset the scroll so the user stays on the same visual message
            container.scrollTop += heightDifference;
        }

        // Update refs for the next cycle
        prevScrollHeightRef.current = container.scrollHeight;
        prevMessagesCount.current = messages.length;
        loadMoreDone.current = false;
    }, [messages.length, currentOpenConversationId]);

    const lastScrollConversationId = useRef<string>('')
    const lastConversationId = useRef<string>('')
    useEffect(() => {

        if (lastScrollConversationId.current !== currentOpenConversationId) {
            lastScrollConversationId.current = currentOpenConversationId;

            setShowScrollButton(false);
            markRead()
        }
    }, [currentOpenConversationId]);

    //handle resize 
    const resizeTimeoutRef = useRef<number | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        rafId.current = requestAnimationFrame(() => {
            cache.current.clearAll();
            listRef.current?.recomputeRowHeights();
        });

        // Cleanup: cancel previous frame if effect re-runs
        return () => {
            if (rafId) cancelAnimationFrame(rafId.current);
        };
    }, [messages.length]);

    const handleResize = () => {
        if (resizeTimeoutRef.current) {
            cancelAnimationFrame(resizeTimeoutRef.current);
        }

        resizeTimeoutRef.current = requestAnimationFrame(() => {
            cache.current.clearAll();
            listRef.current?.recomputeRowHeights();
            scrollToBottom(); // Optional: keep scroll pinned
            markRead()
            setShowScrollButton(false);
        });
    };
    const rafId = useRef(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.addEventListener('resize', handleResize);

        // 3. Cleanup everything
        return () => {
            window.removeEventListener('resize', handleResize);

            if (resizeTimeoutRef.current) {
                cancelAnimationFrame(resizeTimeoutRef.current);
                resizeTimeoutRef.current = null;
            }
        };
    }, []); // Re-bind if conversation or handler changes



    return (
        <div className={`relative rounded-[8px] bg-card-bg p ${className}`}>
            {/* Scrollable Message Area */}
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-[var(--gray)]">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-12 h-12 relative rounded-full overflow-hidden bg-[var(--gray)]">
                        <Image
                            src={resolveUrl(participant.imagePath) || '/users/default-user.png'}
                            alt={`${isPartnerAdmin ? tSupport('senderName') : participant.name}'s profile`}
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <div className="flex justify-center flex-col gap-1 min-w-0">
                        <h4 className="text-base font-semibold text-dark truncate">{isPartnerAdmin ? tSupport('senderName') : participant.name}</h4>
                        {!isPartnerAdmin && <span
                            className={`flex items-center gap-1 text-sm font-medium ${userStatuses.get(participant?.id) === "online"
                                ? "text-green-600"
                                : "text-gray-400"
                                }`}
                        >
                            <span
                                className={`inline-block w-2 h-2 rounded-full ${userStatuses.get(participant?.id) === "online"
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-gray-400"
                                    }`}
                            />
                            {userStatuses.get(participant?.id) === "online" ? t('online') : t('offline')}
                        </span>}
                    </div>
                </div>
                {!isPartnerAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                        {participant.phoneNumber && (
                            <a
                                href={`tel:${participant.phoneNumber}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gray)] text-[var(--secondary)] hover:bg-[var(--highlight)] transition-colors"
                                aria-label={t('callUser')}
                                title={t('callUser')}
                            >
                                <Phone size={18} />
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => onViewUserDetails?.(participant)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gray)] text-[var(--secondary)] hover:bg-[var(--highlight)] transition-colors"
                            aria-label={t('viewUserDetails')}
                            title={t('viewUserDetails')}
                        >
                            <Info size={18} />
                        </button>
                    </div>
                )}
            </div>
            <div ref={messagesContainerRef} key={currentOpenConversationId} className={`h-[calc(100vh-175px)] md:h-[calc(100vh-370px)] thin-scrollbar space-y-6 pr-1 `}>
                {/* Messages */}
                {(loadingMessageId === currentOpenConversationId) ? (
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <MessageSkeleton key={i} />
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 font-medium text-base">
                        {t('noMessages')}
                    </div>
                ) : (
                    <>
                        <div className="h-full w-full relative">
                            {/* Nice Top Loading Indicator */}
                            {loadingMoreId === currentOpenConversationId && (
                                <div className="absolute top-0 left-0 w-full z-30 flex justify-center py-4 bg-gradient-to-b from-card-bg via-card-bg/90 to-transparent">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs font-medium text-gray-500"> {t('loadingHistory')}</span>
                                    </div>
                                </div>
                            )}

                            <AutoSizer>
                                {({ height, width }) => (
                                    <List
                                        ref={listRef}
                                        onScroll={handleScroll}
                                        width={width}
                                        height={height}
                                        rowCount={messages.length}
                                        deferredMeasurementCache={cache.current}
                                        // 2. Ask the cache for the height of each row
                                        rowHeight={cache.current.rowHeight}
                                        onRowsRendered={() => {
                                            // If a pending scroll was requested and the rendered window includes the last index
                                            const lastIndex = Math.max(0, messages.length - 1);

                                            if (lastConversationId.current !== currentOpenConversationId) {
                                                lastConversationId.current = currentOpenConversationId;
                                                listRef.current.scrollToRow(lastIndex);
                                                setShowScrollButton(false);
                                            }
                                            requestAnimationFrame(() => {
                                                isInitializingRef.current = false;
                                            });
                                        }}
                                        rowRenderer={({ index, key, style, parent }) => (
                                            <CellMeasurer
                                                cache={cache.current}
                                                columnIndex={0}
                                                key={key}
                                                parent={parent}
                                                rowIndex={index}
                                            >
                                                {({ registerChild }) => (
                                                    <div
                                                        ref={registerChild as (element: HTMLDivElement | null) => void}
                                                        style={{ ...style, height: "auto" }}
                                                    >
                                                        <VirtualMessageRow
                                                            retryMessage={retryMessage}
                                                            index={index}
                                                            messages={messages}
                                                            participant={participant}
                                                        />
                                                    </div>
                                                )}
                                            </CellMeasurer>
                                        )}
                                    />
                                )}
                            </AutoSizer>


                        </div>
                        <div />
                    </>
                )}
                <div
                    className={` absolute bottom-[65px] left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ease-out ${showScrollButton
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-3 pointer-events-none'}
  `}
                >
                    <div className="group relative flex items-center justify-center">
                        {/* Hover title */}
                        <span
                            className=" absolute bottom-full mb-2 px-3 py-1 text-xs font-medium text-white bg-primary rounded-full shadow-md opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none text-nowrap"
                        >
                            {t('newMessages')}
                        </span>

                        {/* Button */}
                        <button
                            onClick={() => {
                                scrollToBottom();
                                markRead();
                                setShowScrollButton(false);
                            }}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 text-primary transition-all hover:bg-gray-50 active:scale-95"
                            aria-label="Scroll to bottom"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                            </svg>
                        </button>
                    </div>
                </div>


            </div>

            {/* Input */}
            <MessageInput handleSendMessage={handleSendMessage} currentConversationId={currentOpenConversationId} />
        </div>
    );

})

export default ConversationThread;


export function MessageSkeleton() {
    return (
        <div className="flex items-center  gap-4 p-4 animate-pulse ltr:flex-row-reverse">
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex rtl:justify-end lrt:justify-start gap-4">
                    <div className="h-4 bg-gray-100 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-4 bg-gray-100 rtl:ms-auto ltr:me-auto rounded w-3/4" />
            </div>
            <div className="shrink-0 w-[37px] h-[37px] bg-gray-200 rounded-full" />
        </div>
    );
}
