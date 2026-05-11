import { User } from "./user";

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface Message {
    id: string;            // UUID from CoreEntity
    conversationId: string;
    senderId: string;
    sender?: User;         // Joined User object
    content: string;
    sortId: string;         
    readAt: Date | null; // ISO Date string
    created_at: string;    // ISO Date string
    updated_at: string;
    tempId?: string;       // Used to match socket responses
    status?: MessageStatus;
}

export interface Conversation {
    id: string;
    participantOne: User;
    participantTwo: User;
    participantOneId: string;
    participantTwoId: string;
    lastMessage?: Message;
    unreadCountOne: number;
    unreadCountTwo: number;
    sortId: string;
    created_at: string;
}