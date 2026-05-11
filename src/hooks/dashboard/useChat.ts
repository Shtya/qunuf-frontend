import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/libs/axios';
import { Conversation, Message } from '@/types/dashboard/chat';
import { User } from '@/types/dashboard/user';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ulid } from "ulid";
import { SortedMap, SortedSet } from '@rimbu/sorted';
import { ConversationOrder, conversationSetContext } from '@/utils/compare';

const findDescendingInsertionIndex = (array: any[], newSortId: string): number => {
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        // Fallback logic inside the search to get the effective sort key
        const midSortId = array[mid].sortId;

        if (midSortId === newSortId) return mid;
        if (midSortId > newSortId) {
            low = mid + 1; // Look at the right half (smaller values)
        } else {
            high = mid - 1; // Look at the left half (larger values)
        }
    }
    return low;
};

const findAscendingInsertionIndex = (array: any[], newSortId: string): number => {
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midSortId = array[mid].sortId;

        if (midSortId === newSortId) return mid;

        // Change: If the middle value is GREATER than our new value,
        // it means our new value belongs in the LOWER half (left).
        if (midSortId < newSortId) {
            low = mid + 1; // Look at the right half (larger values)
        } else {
            high = mid - 1; // Look at the left half (smaller values)
        }
    }
    return low;
};

export interface ConversationChat {
    id: string;
    me: User;
    partner: User;
    sortId: string;
    myUnreadCount: number;
    supportUserId?: string
    lastMessage?: Message;
    created_at: string;
}

export function useChat() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const targetUserIdFromParams = searchParams.get("user");
    const { user } = useAuth();
    const currentUserId = user?.id;

    // 1. Conversations State (Map of ID -> ConversationChat)
    const [conversationsMap, setConversationsMap] = useState<Map<string, ConversationChat>>(
        new Map()
    );
    const conversationsArray = useMemo(() => {
        // 1. Check if it's actually an instance of Map
        if (!(conversationsMap instanceof Map)) {
            console.error("conversationsMap is not a Map!", conversationsMap);
            return [];
        }

        // 2. Converts the Map iterator into a plain array
        return Array.from(conversationsMap.values());
    }, [conversationsMap]);



    const [sortedConversationsIds, setSortedConversationsIds] = useState<
        SortedSet<ConversationOrder>
    >(() => conversationSetContext.empty());


    const [currentOpenConversationId, setCurrentOpenConversationId] = useState<string | null>(null);


    // 2. Messages State (Map of ID -> { items, hasMore, nextCursor })
    const [messagesData, setMessagesData] = useState<Map<
        string,
        {
            items: Message[];
            hasMore: boolean;
            nextCursor: string | null;
        }
    >>(new Map());

    // 3. Loading States
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [cursorConversations, setCursorConversations] = useState<string | null>(null);
    const [hasMoreConversations, setHasMoreConversations] = useState(true);

    const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
    const [loadingMoreId, setLoadingMoreId] = useState<string | null>(null);

    //socket
    const {
        subscribe,
        setUnreadChatCount
    } = useSocket()

    // Helper: Process partner data before storing
    const processConversation = useCallback((conv: Conversation): ConversationChat => {
        const isP1 = conv.participantOneId === currentUserId;
        return {
            ...conv,
            me: isP1 ? conv.participantOne : conv.participantTwo,
            partner: isP1 ? conv.participantTwo : conv.participantOne,
            myUnreadCount: isP1 ? conv.unreadCountOne : conv.unreadCountTwo,
        };
    }, [currentUserId]);


    const fetchController = useRef<AbortController | null>(null);

    const fetchConversations = useCallback(async () => {
        // Cancel previous request if it exists
        if (fetchController.current) {
            fetchController.current.abort();
        }

        const controller = new AbortController();
        fetchController.current = controller;
        if (!hasMoreConversations) {
            return;
        }

        setLoadingConversations(true);
        try {
            const res = await api.get(
                `/conversations?${cursorConversations ? `cursor=${cursorConversations}&` : ''}limit=50`,
                { signal: controller.signal } // <-- pass the abort signal
            );
            fetchController.current = null;
            const { conversations, nextCursor, hasMore: serverHasMore } = res.data;
            const processed: ConversationChat[] = (conversations || []).map(processConversation);

            // Update map
            setConversationsMap(prev => {
                const map = new Map(prev);
                for (const conv of processed) {
                    map.set(conv.id, conv);
                }
                return map;
            });

            // Update sorted IDs
            const sortIds = processed.map(c => ({
                id: c.id,
                sortId: c.lastMessage?.sortId || c.sortId,
            }));


            setSortedConversationsIds(prev =>
                prev.addAll(sortIds)
            );

            // Update pagination state
            setCursorConversations(nextCursor || false);
            setHasMoreConversations(serverHasMore || false);

        } catch (err: any) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                console.log('Previous request canceled');
            } else {
                console.error(err);
            }
        } finally {
            if (!controller.signal.aborted)
                setLoadingConversations(false);
        }
    }, [processConversation, cursorConversations, hasMoreConversations]);


    // 6. Load Initial Messages for a specific conversation
    const abortControllers = useRef<Map<string, AbortController>>(new Map());

    // Cleanup on Unmount: Abort all pending requests
    useEffect(() => {
        return () => {
            abortControllers.current.forEach(controller => controller.abort());
            abortControllers.current.clear();
        };
    }, []);

    const loadMoreMessages = useCallback(async (conversationId: string) => {
        const currentData = messagesData.get(conversationId);

        // 1. Basic checks
        if (!currentData || !currentData.hasMore || loadingMoreId === conversationId) return;

        // 2. Abort any existing "load more" or "load initial" request for THIS conversation
        if (abortControllers.current.has(conversationId)) {
            abortControllers.current.get(conversationId)?.abort();
        }

        const controller = new AbortController();
        abortControllers.current.set(conversationId, controller);

        setLoadingMoreId(conversationId);

        try {
            const res = await api.get(
                `/conversations/${conversationId}/messages?cursor=${currentData.nextCursor}&limit=50`,
                { signal: controller.signal }
            );
            let lastLength = -1;
            const { messages, nextCursor, hasMore } = res.data;

            setMessagesData(prev => {
                const updated = new Map(prev);
                const existing = updated.get(conversationId);
                lastLength = existing.items.length;
                updated.set(conversationId, {
                    items: [...(existing?.items ?? []), ...messages],
                    hasMore: hasMore || false,
                    nextCursor: nextCursor || null
                });
                return updated;
            });
            return lastLength;
        } catch (err: any) {
            if (err?.name === "CanceledError" || err?.message === "canceled") return;
            console.error("Pagination error", err);
        } finally {
            // 3. Cleanup: only clear loading if this was the latest request
            if (!controller.signal.aborted) {
                abortControllers.current.delete(conversationId);
                setLoadingMoreId(prev => prev === conversationId ? null : prev);
            }
        }
    }, [messagesData, loadingMoreId]);

    // Initial Boot
    useEffect(() => {
        if (!user?.id) return;
        fetchConversations();
    }, [user]);


    const loadMessages = useCallback(async (conversationId: string) => {


        if (messagesData.has(conversationId)) return;

        const existingId = loadingMessageId?.startsWith("new-chat") ? conversationsMap.get(conversationId)?.partner?.id : null;
        if (existingId && loadingMessageId === `new-chat_${existingId}`)
            return;


        if (abortControllers.current.has(conversationId)) {
            abortControllers.current.get(conversationId)?.abort();
        }

        // 3. Create a new controller and store it
        const controller = new AbortController();
        abortControllers.current.set(conversationId, controller);

        // indicate loading for UI (skeleton)
        setLoadingMessageId(conversationId);

        try {
            const res = await api.get(`/conversations/${conversationId}/messages?limit=50`, {
                signal: controller.signal
            });

            const { messages, nextCursor, hasMore } = res.data;

            setMessagesData(prev => {
                // 1. Create a new Map instance from the previous Map
                const next = new Map(prev);

                // 2. Use the .set() method to update the data
                next.set(conversationId, {
                    items: messages || [],
                    hasMore: hasMore || false,
                    nextCursor: nextCursor || null
                });

                // 3. Return the new Map
                return next;
            });
        } catch (err: any) {
            if (err?.name === "CanceledError" || err?.message === "canceled") {
                return;
            }
            console.error(`Failed to load messages for ${conversationId}`, err);
        } finally {
            if (!controller.signal.aborted) {
                abortControllers.current.delete(conversationId);
                setLoadingMessageId(prev => prev === conversationId ? null : prev);
            }
        }
    }, [messagesData, loadingMessageId, conversationsMap]);

    // Stable refs so the effect below can read latest values without re-triggering
    const conversationsArrayRef = useRef(conversationsArray);
    conversationsArrayRef.current = conversationsArray;
    const messagesDataRef = useRef(messagesData);
    messagesDataRef.current = messagesData;
    const loadingMessageIdRef = useRef(loadingMessageId);
    loadingMessageIdRef.current = loadingMessageId;
    const currentOpenConversationIdRef = useRef(currentOpenConversationId);
    currentOpenConversationIdRef.current = currentOpenConversationId;

    useEffect(() => {
        const resolveChatState = async () => {
            const conversationsArray = conversationsArrayRef.current;
            const messagesData = messagesDataRef.current;
            const loadingMessageId = loadingMessageIdRef.current;
            const currentOpenConversationId = currentOpenConversationIdRef.current;

            if (targetUserIdFromParams) {
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.delete("user");
                router.replace(`?${newParams.toString()}`, { scroll: false });
                // A. Search locally first
                const existing = conversationsArray.find(c => c.partner.id === targetUserIdFromParams);

                if (existing) {
                    if (!messagesData.has(existing.id) && loadingMessageId !== existing.id) {
                        await loadMessages(existing.id);
                    }
                    if (currentOpenConversationId !== existing.id) {
                        setCurrentOpenConversationId(existing.id);
                    }
                    return;
                }

                if (loadingMessageId?.startsWith('new-chat')) return;
                // B. Create New Conversation (API)
                setCurrentOpenConversationId(null);
                setLoadingMessageId(`new-chat_${targetUserIdFromParams}`);
                try {
                    const res = await api.post('/conversations', { otherUserId: targetUserIdFromParams });

                    const { conversation, messages, nextCursor, hasMore } = res.data;
                    const processed = processConversation(conversation);

                    setConversationsMap(prev => new Map(prev).set(processed.id, processed));

                    setSortedConversationsIds(prevIds => {
                        const effectiveSortId = processed.lastMessage?.sortId || processed.sortId;
                        const newItem: ConversationOrder = { id: processed.id, sortId: effectiveSortId };
                        return prevIds.add(newItem);
                    });

                    setMessagesData(prev => new Map(prev).set(processed.id, {
                        items: messages || [],
                        hasMore: hasMore || false,
                        nextCursor: nextCursor || null
                    }));

                    setCurrentOpenConversationId(processed.id);

                } catch (err) {
                    console.error("Failed to sync conversation:", err);
                } finally {
                    setLoadingMessageId(null);
                }

                return;
            }

            // ---------------------------------------------------------
            // PRIORITY 2: Manual Selection (No URL Param)
            // ---------------------------------------------------------
            if (currentOpenConversationId) {
                const existingMessages = messagesData.get(currentOpenConversationId);
                if (!existingMessages && loadingMessageId !== currentOpenConversationId) {
                    await loadMessages(currentOpenConversationId);
                }
            }
        };

        resolveChatState();

    }, [
        targetUserIdFromParams,
        currentOpenConversationId,
        user?.id,
        loadMessages,
        processConversation,
        searchParams,
        router,
    ]);

    // 5 & 7. Reusable Mark as Read Function
    const readRequestsInProgress = useRef<Set<string>>(new Set());
    const markAsRead = useCallback(async (conversationId: string) => {
        const conv = conversationsMap.get(conversationId);

        if (!conv || readRequestsInProgress.current.has(conversationId) || conv.myUnreadCount === 0) {
            return;
        }
        readRequestsInProgress.current.add(conversationId);
        // Optimistic Update: Local Conversation State
        let oldUnRead = conv.myUnreadCount;
        setConversationsMap(prev => {
            const updated = new Map(prev);
            const current = updated.get(conversationId);
            if (current) updated.set(conversationId, { ...current, myUnreadCount: 0 });
            return updated;
        });

        setUnreadChatCount(prev => Math.max(0, prev - oldUnRead));
        // Optimistic Update: Global Socket Unread Bubble

        try {
            const res = await api.put(`/conversations/${conversationId}/read`);
            const newTotle = res.data.totalUnread
            setUnreadChatCount(newTotle);
        } catch (err) {
            console.error("Failed to mark read", err);
            setUnreadChatCount(prev => Math.max(0, prev + oldUnRead));
            setConversationsMap(prev => {
                const updated = new Map(prev);
                const current = updated.get(conversationId);
                if (current) updated.set(conversationId, { ...current, myUnreadCount: oldUnRead });
                return updated;
            });

            // Note: In a strict app, you'd revert the count here if API fails
        } finally {

            readRequestsInProgress.current.delete(conversationId);
        }

    }, [conversationsMap]);

    // Assuming ConversationOrder = { id: string; sortId: number }
    // and your SortedSet context is configured with compare: (a, b) => b.sortId - a.sortId
    // and hash: c => c.id

    const updateSortedList = useCallback((id: string, sortId: string) => {
        setSortedConversationsIds(prev => {
            // Construct the updated conversation order
            const updatedConv: ConversationOrder = { id, sortId };

            // Remove by id (thanks to hash function) and add updated
            return prev
                .remove({ id } as ConversationOrder) // remove old entry by id
                .add(updatedConv);                   // add updated entry, SortedSet re-sorts automatically
        });
    }, []);

    const fetchOneConversation = async (conversationId: string) => {
        try {
            const res = await api.get(`/conversations/${conversationId}`);
            const processed: ConversationChat = res.data;

            // 1. Update the Map with the full object
            setConversationsMap(prev => {
                const next = new Map(prev);
                next.set(processed.id, processed);
                return next;
            });

            // 2. Update the Sorted ID list using the reusable helper
            const effectiveSortId = processed.lastMessage?.sortId || processed.sortId;
            updateSortedList(processed.id, effectiveSortId);
            return processed;
        } catch (error) {
            console.error("Error syncing conversation:", error);
            return undefined;
        }
    };

    useEffect(() => {
        // Subscribe to Socket Events
        const unsubscribe = subscribe("chat", async (action) => {
            if (action.type === "NEW_MESSAGE") {
                const { message, tempId, sender } = action.payload;
                const convId = message.conversationId;
                let existingConv = conversationsMap.get(convId);

                // 2. If it doesn't exist, fetch it first (processed conversation)
                if (existingConv) {

                    setConversationsMap(prev => {
                        const updated = new Map(prev);
                        let conv = updated.get(convId);
                        // but for now, we update the lastMessage and unread count
                        if (conv) {
                            const isMine = message.senderId === currentUserId;
                            const newUnread = !isMine ? conv.myUnreadCount + 1 : conv.myUnreadCount;

                            const updatedConv = {
                                ...conv,
                                lastMessage: message,
                                myUnreadCount: newUnread
                            };
                            updated.set(convId, updatedConv);
                        }
                        return updated;
                    });


                    setMessagesData(prev => {
                        const data = prev.get(convId);
                        if (!data) return prev; // Don't update if messages haven't been loaded yet

                        const newItems = [...data.items];


                        // Find existing occurrence (by id) and remove it if present
                        const existingIndex = tempId ? newItems.findIndex(m => (m as any).id === tempId) : -1;
                        if (existingIndex > -1) {
                            newItems.splice(existingIndex, 1);
                        }

                        // Compute insertion index in descending order (newest first)
                        const insIndex = findDescendingInsertionIndex(newItems, message.sortId);

                        // Insert the (possibly updated) message at the correct position
                        newItems.splice(insIndex, 0, message);

                        const next = new Map(prev);
                        next.set(convId, { ...data, items: newItems });
                        return next;
                    });

                    // Assuming ConversationOrder = { id: string; sortId: number }
                    setSortedConversationsIds(prev => {
                        const convToMove = existingConv;
                        if (!convToMove) return prev;

                        const updatedConv: ConversationOrder = {
                            id: convToMove.id,
                            sortId: message.sortId, // newest message priority
                        };

                        // Remove old entry, then add updated one
                        return prev
                            .remove({ id: convToMove.id, sortId: convToMove.sortId }) // remove old
                            .add(updatedConv); // add updated, SortedSet keeps order
                    });

                } else {
                    // This updates both the Map and the Sorted IDs list
                    existingConv = await fetchOneConversation(convId);
                }
                // 5 & 6. Unread Logic
                if (message.senderId !== currentUserId) {
                    setUnreadChatCount(prev => prev + 1);
                }
            }

            if (action.type === "CONVERSATION_READ") {
                const { conversationId, readByUserId } = action.payload;
                const isMe = readByUserId === currentUserId;

                let oldUnRead = 0;
                // 1. Update Conversation Map
                setConversationsMap(prev => {
                    const existing = prev.get(conversationId);
                    if (!existing) return prev;
                    oldUnRead = existing.myUnreadCount;
                    const next = new Map(prev);
                    next.set(conversationId, {
                        ...existing,
                        // If I read it (on another device), clear my unread count locally
                        myUnreadCount: isMe ? 0 : existing.myUnreadCount,
                    });
                    return next;
                });

                // 2. If it was ME reading on another device, update the global badge
                if (isMe && oldUnRead > 0) {
                    setUnreadChatCount(prev => Math.max(0, prev - oldUnRead));
                }

                // 3. Update Message items to reflect "Read" status
                setMessagesData(prev => {
                    const data = prev.get(conversationId);
                    if (!data) return prev;

                    // If the other user read the conversation, mark all MY messages as read
                    const updatedItems = data.items.map(msg => {
                        if (msg.senderId === readByUserId) return msg; // Don't mark their own messages
                        return { ...msg, readAt: new Date() };
                    });

                    const next = new Map(prev);
                    next.set(conversationId, { ...data, items: updatedItems });
                    return next;
                });
            }
        });

        return () => unsubscribe();
    }, [subscribe, currentOpenConversationId, conversationsMap, markAsRead, currentUserId]);

    // Inside useChat hook
    const [isSending, setIsSending] = useState<Map<string, boolean>>(new Map());

    const sendMessage = useCallback(async (conversationId: string, content: string) => {
        if (!content.trim() || !currentUserId || !conversationId) return;

        // 1. Create a unique tempId and a fake "Optimistic" message
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const optimisticMessage: Message = {
            id: tempId, // Temporary ID
            conversationId,
            content,
            senderId: currentUserId,
            created_at: new Date().toISOString(),
            sortId: ulid(), // Use current time for sorting
            readAt: null,
            updated_at: new Date().toISOString(),
            // Add a custom flag for UI styling (e.g., opacity or spinner)
            status: 'sending'
        };

        // 2. Set Loading State for this conversation
        setIsSending(prev => new Map(prev).set(conversationId, true));

        // 3. Optimistically Update Messages List
        setMessagesData(prev => {
            const data = prev.get(conversationId);
            if (!data) return prev;

            const next = new Map(prev);
            // Add to the start (or end depending on your sort order)
            // Here we use unshift assuming index 0 is the newest
            next.set(conversationId, {
                ...data,
                items: [optimisticMessage, ...data.items],
            });
            return next;
        });

        setConversationsMap(prev => {
            const existing = prev.get(conversationId);
            if (!existing) return prev;

            const next = new Map(prev);
            next.set(conversationId, {
                ...existing,
                lastMessage: optimisticMessage, // Show "sending..." content in sidebar
            });
            return next;
        });


        try {
            // 4. Call API with the DTO structure
            const response = await api.post('/conversations/message', {
                conversationId,
                content,
                tempId // Pass tempId so backend can echo it back in Socket
            });

            setMessagesData(prev => {
                const data = prev.get(conversationId);
                if (!data) return prev;

                const next = new Map(prev);
                next.set(conversationId, {
                    ...data,
                    items: data.items.map(m =>
                        m.id === tempId ? { ...m, status: 'sent' } : m
                    ),
                });
                return next;
            });

            // NOTE: We don't manually replace the message here because
            // the Socket "message:received" will handle the replacement
            // using the tempId logic we wrote earlier.

        } catch (error) {
            console.error("Failed to send message:", error);

            // 5. Handle Error: Mark message as failed or remove it
            setMessagesData(prev => {
                const data = prev.get(conversationId);
                if (!data) return prev;
                const next = new Map(prev);
                next.set(conversationId, {
                    ...data,
                    items: data.items.map(m =>
                        m.id === tempId ? { ...m, status: 'error' } : m
                    )
                });
                return next;
            });
        } finally {
            setIsSending(prev => {
                const next = new Map(prev);
                next.delete(conversationId);
                return next;
            });
        }
    }, [currentUserId, setMessagesData]);

    const retryMessage = useCallback(
        async (msg: Message) => {
            if (!msg || !currentUserId) return;

            const { conversationId, content, id: tempId } = msg;

            // 1. Mark the message as sending again
            setMessagesData(prev => {
                const data = prev.get(conversationId);
                if (!data) return prev;

                const next = new Map(prev);
                next.set(conversationId, {
                    ...data,
                    items: data.items.map(m =>
                        m.id === tempId ? { ...m, status: 'sending' } : m
                    ),
                });
                return next;
            });

            setIsSending(prev => new Map(prev).set(conversationId, true));

            try {
                // 2. Call API again with same tempId
                await api.post('/conversations/message', {
                    conversationId,
                    content,
                    tempId, // pass same tempId so backend echoes it back
                });
                setMessagesData(prev => {
                    const data = prev.get(conversationId);
                    if (!data) return prev;

                    const next = new Map(prev);
                    next.set(conversationId, {
                        ...data,
                        items: data.items.map(m =>
                            m.id === tempId ? { ...m, status: 'sent' } : m
                        ),
                    });
                    return next;
                });
            } catch (error) {
                console.error('Retry failed:', error);

                // 4. Mark as failed again
                setMessagesData(prev => {
                    const data = prev.get(conversationId);
                    if (!data) return prev;

                    const next = new Map(prev);
                    next.set(conversationId, {
                        ...data,
                        items: data.items.map(m =>
                            m.id === tempId ? { ...m, status: 'error' } : m
                        ),
                    });
                    return next;
                });
            } finally {
                // 5. Clear sending state
                setIsSending(prev => {
                    const next = new Map(prev);
                    next.delete(conversationId);
                    return next;
                });
            }
        },
        [currentUserId, setMessagesData]
    );


    const handleSelectChat = useCallback((id: string | null) => {
        setCurrentOpenConversationId(id);
    }, []);

    const openChatWithUser = useCallback((targetUserId: string) => {
        if (!targetUserId) return;

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set("user", targetUserId);
        router.replace(`?${nextParams.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const currentConversation = useMemo(() => {
        if (!currentOpenConversationId) return null;

        return conversationsMap.get(currentOpenConversationId) || null;
    }, [conversationsMap, currentOpenConversationId]);

    const currentConversationMessages = useMemo(() => {
        if (!currentOpenConversationId) return null;

        return messagesData.get(currentOpenConversationId) || null;
    }, [messagesData, currentOpenConversationId]);

    return {
        sortedConversationsIds,
        currentOpenConversationId,
        setCurrentOpenConversationId,
        currentConversation,
        currentConversationMessages,
        handleSelectChat,
        openChatWithUser,
        conversationsMap,
        hasMoreConversations,
        cursorConversations,
        messagesData,
        loadingConversations,
        loadingMessageId,
        loadingMoreId,
        loadMoreMessages,
        loadMessages,
        sendMessage,
        retryMessage,
        markAsRead,
        isSending,
        fetchMoreConversations: fetchConversations
    };
}
