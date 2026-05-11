'use client';

import { createContext, useContext, useRef, useState, useEffect, ReactNode, ReactElement } from 'react';
import { useAuth } from './AuthContext';
import api from '@/libs/axios';
import { FaCheckCircle, FaEdit, FaExclamationTriangle, FaFileContract, FaFileSignature, FaGift, FaHistory, FaHome, FaHourglassEnd, FaPaperPlane, FaRegEnvelope, FaRegNewspaper, FaTimesCircle } from 'react-icons/fa';
import { useDashboardHref } from '@/hooks/dashboard/useDashboardHref';
import { Notification } from '@/types/dashboard/notifications';
import { useRouter } from '@/i18n/navigation';


export type NotificationAction =
    | { type: "NEW_NOTIFICATION"; payload: Notification }
    | { type: "MARK_ONE_AS_READ"; payload: { id: string } }
    | { type: "REVERT_MARK_ONE"; payload: { id: string } }
    | { type: "MARK_ALL_AS_READ" }
    | { type: "REVERT_MARK_ALL" };

export type SubscriberCallback = (action: NotificationAction) => void;

interface NotificationContextType {
    unreadNotificationCount: number;
    addIncoming: (notification: Notification) => void;
    markOneAsRead: (notification: Notification) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    subscribe: (callback: SubscriberCallback) => () => void;
    getNotificationIcon: (type: string, size?: number) => ReactElement;
    getNavigationLink: (notif: Notification) => string;
}

// --- Context ---

// We initialize with undefined to enforce the use of the Provider
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
    const { getHref } = useDashboardHref();
    const router = useRouter()
    // Using a Set of callbacks for the Pub/Sub system
    const subscribers = useRef<Set<SubscriberCallback>>(new Set());

    // Assuming useAuth returns an object with a user
    const { user } = useAuth() as { user: { id: string } | null };

    // ------------------------------
    // Pub/Sub System
    // ------------------------------
    const publish = (action: NotificationAction) => {
        subscribers.current.forEach(cb => cb(action));
    };

    const subscribe = (callback: SubscriberCallback) => {
        subscribers.current.add(callback);
        return () => {
            subscribers.current.delete(callback);
        };
    };

    // ------------------------------
    // Notification Actions
    // ------------------------------
    const addIncoming = (notification: Notification) => {
        if (!notification.isRead) {
            setUnreadNotificationCount(prev => prev + 1);
        }

        publish({ type: "NEW_NOTIFICATION", payload: notification });

        setTimeout(() => {
            const els = document.querySelectorAll(
                `[data-notification-id="${notification.id}"]`
            );
            els.forEach(el => el.classList.add("highlight"));
        }, 50);
    };



    const getNotificationIcon = (type: string) => {
        switch (type) {
            // --- Chat Notifications ---
            case 'CHAT':
                return <FaRegEnvelope size={20} className="text-secondary" />;

            // --- Contract Notifications ---
            case 'CONTRACT_REQUEST':
            case 'CONTRACT_CREATED':
                return <FaFileContract size={20} className="text-primary" />;

            case 'TERMS_REVISED':
                return <FaEdit size={20} className="text-info" />;

            case 'CONTRACT_ACCEPTED':
                return <FaCheckCircle size={20} className="text-success" />;

            case 'CONTRACT_CANCELLED':
                return <FaTimesCircle size={20} className="text-danger" />;

            // NEW: Final activation (Ejar PDF uploaded)
            case 'CONTRACT_ACTIVE':
                return <FaFileSignature size={20} className="text-success" />;

            case 'TERMINATION_NOTICE':
                // Yellow warning for the 60-day pending period
                return <FaHistory size={20} className="text-warning" />;

            case 'CONTRACT_TERMINATED':
                // Red for final immediate termination
                return <FaTimesCircle size={20} className="text-danger" />;

            case 'CONTRACT_EXPIRED':
                return <FaHourglassEnd size={20} className="text-secondary" />;

            case 'CONTRACT_RENEW_OFFER':
                return <FaGift size={20} className="text-success" />;

            case 'CONTRACT_RENEW_OFFER_SENT':
                return <FaPaperPlane size={20} className="text-info" />;

            case 'CONTRACT_RENEWAL_REJECTED':
                return <FaTimesCircle size={20} className="text-warning" />;
            // --- Property Notifications ---
            case 'NEW_PROPERTY_SUBMITTED':
            case 'PROPERTY_UPDATED':
                return <FaHome size={20} className="text-warning" />;

            case 'PROPERTY_STATUS_CHANGED':
            case 'PROPERTY_UNARCHIVED':
                return <FaHistory size={20} className="text-info" />;

            // --- Admin Specific Alerts ---
            case 'ADMIN_CONTRACT_TERMINATED':
            case 'ADMIN_CONTRACT_TERMINATION_ALERT':
            case 'ADMIN_ACTION_REQUIRED':
            case 'ADMIN_CONTRACT_ALERT':
                return <FaExclamationTriangle size={20} className="text-danger" />;

            // --- Default ---
            default:
                return <FaRegNewspaper size={20} className="text-secondary" />;
        }
    };

    const getNavigationLink = (notif: Notification) => {
        const type = notif.relatedEntityType?.toLowerCase();
        if (type === 'property') return `/dashboard/properties?view=${notif.relatedEntityId}`;
        if (type === 'contract') return `/dashboard/contracts?view=${notif.relatedEntityId}`;
        if (type === 'chat') return getHref('chats', { user: notif.relatedEntityId });
        return "";
    };

    const markOneAsRead = async (notif: Notification) => {
        // Optimistic update
        publish({ type: "MARK_ONE_AS_READ", payload: { id: notif.id } });
        setUnreadNotificationCount(prev => Math.max(prev - 1, 0));

        try {
            await api.put(`/notifications/read/${notif.id}`);
            const link = getNavigationLink(notif);
            if (link) router.push(link)
        } catch {
            // Revert on error
            setUnreadNotificationCount(prev => prev + 1);
            publish({ type: "REVERT_MARK_ONE", payload: { id: notif.id } });
        }

    };

    const markAllAsRead = async () => {
        // Optimistic update
        const prevUnreadCount = unreadNotificationCount;
        setUnreadNotificationCount(0);
        publish({ type: "MARK_ALL_AS_READ" });

        try {
            await api.put('/notifications/read-all');
        } catch {
            // Revert on error
            setUnreadNotificationCount(prevUnreadCount);
            publish({ type: "REVERT_MARK_ALL" });
        }
    };

    // ------------------------------
    // Fetch initial counts
    // ------------------------------
    const fetchUnreadNotificationCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            const count = Number(res?.data?.unreadCount ?? 0);
            setUnreadNotificationCount(count);
        } catch {
            setUnreadNotificationCount(0);
        }
    };

    // Initial data fetch
    useEffect(() => {
        if (user?.id) {
            fetchUnreadNotificationCount();
        } else {
            setUnreadNotificationCount(0);
        }
    }, [user?.id]);




    return (
        <NotificationContext.Provider
            value={{
                unreadNotificationCount,
                addIncoming,
                markOneAsRead,
                markAllAsRead,
                subscribe,
                getNotificationIcon,
                getNavigationLink
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};