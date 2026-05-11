'use client';

import { createContext, useContext, useRef, useEffect, useState, ReactNode, Dispatch, SetStateAction, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import { Message } from "@/types/dashboard/chat";
import api from "@/libs/axios";
import { User } from "@/types/dashboard/user";
import { Notification } from "@/types/dashboard/notifications";


// --- Extended Types ---

export type SocketAction =
    | { type: "NEW_MESSAGE"; payload: { message: Message; sender: User; tempId?: string; } }
    | { type: "CONVERSATION_READ"; payload: { conversationId: string; readByUserId: string; readAt: string } }
    | { type: "USER_STATUS_CHANGE"; payload: { userId: string; status: 'online' | 'offline'; timestamp: string } }
    | { type: "THREAD_READ"; payload: string }
    | { type: "USERS_ACTIVE_SYNC"; payload: { users: string[]; timestamp: string }; }



export type SocketSubscriberCallback = (action: SocketAction) => void;

interface SocketContextType {
    isConnected: boolean;
    unreadChatCount: number;
    userStatuses: Map<string, 'online' | 'offline'>; // Track online/offline users
    setUnreadChatCount: Dispatch<SetStateAction<number>>;
    subscribe: (key: string, cb: SocketSubscriberCallback) => () => void;
    incrementUnread: () => void;
    resetUnread: () => void;
    clearUnreadForThread: (threadId: string) => void;
    fetchUnreadChatCount: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth() as { user: { id: string; accessToken?: string } | null };
    const { addIncoming } = useNotifications();

    const socketRef = useRef<Socket | null>(null);
    const subscribers = useRef<Map<string, SocketSubscriberCallback>>(new Map());

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
    const [userStatuses, setUserStatuses] = useState<Map<string, 'online' | 'offline'>>(new Map());
    const publish = (action: SocketAction) => {
        subscribers.current.forEach((cb) => cb(action));
    };

    const subscribe = useCallback((key: string, cb: SocketSubscriberCallback) => {
        subscribers.current.set(key, cb);
        return () => { subscribers.current.delete(key); };
    }, []);

    const incrementUnread = () => setUnreadChatCount((prev) => prev + 1);
    const resetUnread = () => setUnreadChatCount(0);
    const clearUnreadForThread = (threadId: string) => publish({ type: "THREAD_READ", payload: threadId });

    const fetchUnreadChatCount = async () => {
        if (typeof window === "undefined") return;
        try {
            const { data } = await api.get("/conversations/unread/count");
            setUnreadChatCount(data?.totalUnread || 0);
        } catch {
            setUnreadChatCount(0);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!user?.id || !token) return;

        if (!socketRef.current) {
            socketRef.current = io(process.env.NEXT_PUBLIC_BASE_URL as string, {
                auth: { token },
                transports: ["websocket"],
                reconnection: true,
            });
        }

        const socket = socketRef.current;

        // ------------------ EVENT ALIGNMENT ------------------

        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));

        // 1. Aligned with backend: message:received
        socket.on("message:received", (msgPayload: { message: Message; sender: User; tempId?: string; }) => {
            const isAnyScreenListening = subscribers.current.size > 0;
            if (!isAnyScreenListening) {
                incrementUnread();
            }
            publish({ type: "NEW_MESSAGE", payload: msgPayload });
        });

        // 2. Aligned with backend: conversation:read
        socket.on("conversation:read", (data: { conversationId: string; readByUserId: string; readAt: string }) => {
            publish({ type: "CONVERSATION_READ", payload: data });
        });

        // 3. Aligned with backend: new_notification
        socket.on("new_notification", (notification: Notification) => {
            addIncoming(notification);
        });

        // 4. Aligned with backend: user:status
        socket.on("user:status", (data: { userId: string; status: 'online' | 'offline'; timestamp: string }) => {

            setUserStatuses(prev => {
                const updated = new Map(prev);
                updated.set(data.userId, data.status);
                return updated;
            });
            publish({ type: "USER_STATUS_CHANGE", payload: data });
        });

        socket.on(
            "users:active",
            (data: { users: string[]; timestamp: string }) => {
                setUserStatuses(() => {
                    const updated = new Map<string, "online" | "offline">();
                    data.users.forEach(userId => {
                        updated.set(userId, "online");
                    });
                    return updated;
                });

                publish({ type: "USERS_ACTIVE_SYNC", payload: data });
            }
        );


        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("message:received");
            socket.off("conversation:read");
            socket.off("new_notification");
            socket.off("user:status");
            socket.off("users:active");
        };
    }, [user?.id, addIncoming]);

    useEffect(() => {
        if (user?.id) fetchUnreadChatCount();
        else setUnreadChatCount(0);
    }, [user?.id]);

    return (
        <SocketContext.Provider
            value={{
                isConnected,
                unreadChatCount,
                userStatuses,
                setUnreadChatCount,
                subscribe,
                incrementUnread,
                resetUnread,
                clearUnreadForThread,
                fetchUnreadChatCount,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocket must be used within a SocketProvider");
    return context;
};