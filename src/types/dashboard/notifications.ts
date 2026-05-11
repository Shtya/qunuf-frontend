// types/notification.ts

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    relatedEntityType?: string | null;
    relatedEntityId?: string | null;
    created_at: string;
}
