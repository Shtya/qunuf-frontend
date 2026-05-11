import { BsBell } from "react-icons/bs";
import Dropdown, { MenuProps, TriggerProps } from "./Dropdown";
 import { useTranslations } from "use-intl";
import { Link } from "@/i18n/navigation";
import { useDashboardHref } from "@/hooks/dashboard/useDashboardHref";
import { useNotifications } from "@/contexts/NotificationContext";
import api from "@/libs/axios";
import { useEffect, useState } from "react";
import { Notification } from "@/types/dashboard/notifications";

export default function NotificationDropdown() {
    return (
        <Dropdown Trigger={NotificationTrigger} Menu={NotificationMenu} position="bottom-right" />
    );
}

function NotificationTrigger({ isOpen, onToggle }: TriggerProps) {
    const { unreadNotificationCount } = useNotifications();

    return (
        <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute -inset-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-200" />

            {/* Button */}
            <button
                type="button"
                aria-label="Open notifications"
                onClick={onToggle}
                className="relative bg-secondary hover:bg-primary rounded-full p-3 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <BsBell className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />

                {/* Unread Badge */}
                {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold shadow-md">
                            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                        </span>
                    </span>
                )}
            </button>
        </div>
    );
}

function NotificationMenu({ isOpen, onClose }: MenuProps) {
    const t = useTranslations('dashboard.notification');
    const { getHref } = useDashboardHref();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const {
        markOneAsRead,
        subscribe,
        getNotificationIcon,
    } = useNotifications();

    // --- Fetch Logic ---
    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications?limit=10&page=1');
            const { records = [] } = res.data || {};
            setNotifications(records);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch when opened
    useEffect(() => {
        if (isOpen) fetchList();
    }, [isOpen]);

    // --- Subscription Logic ---
    useEffect(() => {
        const unsubscribe = subscribe((action) => {
            switch (action.type) {
                case "NEW_NOTIFICATION":
                    setNotifications(prev => {
                        const exists = prev.some(n => n.id === action.payload.id);
                        if (exists) return prev;
                        return [action.payload, ...prev].slice(0, 10);
                    });
                    break;

                case "MARK_ONE_AS_READ":
                    setNotifications(prev =>
                        prev.map(n => n.id === action.payload.id ? { ...n, isRead: true } : n)
                    );
                    break;

                case "MARK_ALL_AS_READ":
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    break;
            }
        });

        return () => unsubscribe();
    }, [subscribe]);

    const handleNotificationClick = async (item: Notification) => {
        await markOneAsRead(item);
        onClose();
    };

    return (
        <div className="w-80 shadow-2xl rounded-2xl overflow-hidden border border-gray/20 bg-white">
            {/* Header with gradient */}
            <header className="p-4 bg-gradient-to-r from-secondary via-secondary to-secondary-hover text-white font-bold text-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BsBell className="w-4 h-4" />
                    <span>{t('title')}</span>
                </div>
                {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
            </header>

            {/* Notifications List */}
            <div className="bg-white max-h-[400px] thin-scrollbar overflow-y-auto">
                {loading && notifications.length === 0 ? (
                    <div className="p-8 text-center text-dark/40 text-sm">
                        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="animate-pulse">{t('loading')}</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray/10">
                        {notifications.map((item) => (
                            <button
                                key={item.id}
                                className={`group flex items-start gap-3 p-4 text-start w-full hover:bg-secondary/5 transition-all duration-200 ${!item.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                                    }`}
                                onClick={() => handleNotificationClick(item)}
                            >
                                {/* Icon */}
                                <div className={`mt-1 shrink-0 p-2 rounded-lg transition-all duration-200 ${!item.isRead
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-secondary/10 text-secondary'
                                    }`}>
                                    {getNotificationIcon(item.relatedEntityType || '')}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h2 className={`text-sm leading-tight ${!item.isRead
                                            ? 'font-bold text-dark'
                                            : 'font-medium text-dark/60'
                                            }`}>
                                            {item.title}
                                        </h2>
                                        {!item.isRead && (
                                            <span className="flex h-2 w-2 shrink-0 mt-1">
                                                {/* <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span> */}
                                                <span className="animate-ping relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-dark/60 line-clamp-2 leading-relaxed">
                                        {item.message}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BsBell className="w-8 h-8 text-secondary/40" />
                        </div>
                        <p className="text-sm text-dark/40 font-medium">{t('noNotifications')}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="p-3 bg-gradient-to-r from-secondary/5 to-transparent border-t border-gray/10 text-center">
                <Link
                    href={getHref('notifications')}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary font-semibold transition-colors duration-200"
                >
                    <span>{t('seeMore')}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </footer>
        </div>
    );
}