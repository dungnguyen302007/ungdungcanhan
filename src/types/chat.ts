export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string | null;
    message: string;
    timestamp: number;
    isRead: boolean;
    conversationId: string; // 'team' | 'userId1_userId2' | 'group_groupId'
    conversationType: 'team' | 'private' | 'group';
}

export interface Conversation {
    id: string;
    type: 'team' | 'private' | 'group';
    name: string;
    avatar?: string;
    participants: string[]; // User IDs
    lastMessage?: string;
    lastMessageTime?: number;
    unreadCount?: number;
    createdBy?: string;
    createdAt: number;
}

export interface ChatGroup {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    members: string[];
    admins: string[];
    createdBy: string;
    createdAt: number;
}
