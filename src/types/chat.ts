export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    message: string;
    timestamp: number;
    isRead: boolean;
}
