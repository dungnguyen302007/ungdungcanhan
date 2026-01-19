import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { MessageCircle, Users, Plus, Hash } from 'lucide-react';
import type { AppUser } from '../../types';
import type { ChatGroup } from '../../types/chat';

interface ChatSidebarProps {
    selectedConversation: string;
    onSelectConversation: (conversationId: string, type: 'team' | 'private' | 'group') => void;
    onCreateGroup: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    selectedConversation,
    onSelectConversation,
    onCreateGroup
}) => {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [groups, setGroups] = useState<ChatGroup[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    // Load approved users
    useEffect(() => {
        const q = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList: AppUser[] = [];
            snapshot.forEach((doc) => {
                const userData = doc.data() as AppUser;
                if (userData.uid !== user?.uid) {
                    usersList.push(userData);
                }
            });
            setUsers(usersList);
        });

        return () => unsubscribe();
    }, [user]);

    // Load groups where user is member
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'chat-groups'),
            where('members', 'array-contains', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const groupsList: ChatGroup[] = [];
            snapshot.forEach((doc) => {
                groupsList.push({ id: doc.id, ...doc.data() } as ChatGroup);
            });
            setGroups(groupsList);
        });

        return () => unsubscribe();
    }, [user]);

    // Track unread message counts
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'chat-messages'),
            where('isRead', '==', false),
            where('senderId', '!=', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const counts: Record<string, number> = {};
            snapshot.forEach((doc) => {
                const data = doc.data();
                const convId = data.conversationId;
                counts[convId] = (counts[convId] || 0) + 1;
            });
            setUnreadCounts(counts);
        }, (error) => {
            console.error('[ChatSidebar] Listener error:', error);
        });

        return () => unsubscribe();
    }, [user]);

    const getConversationId = (userId: string) => {
        if (!user) return '';
        return [user.uid, userId].sort().join('_');
    };

    return (
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Tin nhắn</h3>
                <button
                    onClick={onCreateGroup}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Tạo nhóm mới"
                >
                    <Plus size={20} className="text-slate-600" />
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {/* Team Chat */}
                <button
                    onClick={() => onSelectConversation('team', 'team')}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors ${selectedConversation === 'team' ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                        }`}
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0">
                        <Users size={20} />
                    </div>
                    <div className="flex-1 text-left">
                        <div className={`${unreadCounts['team'] ? 'font-bold' : 'font-medium'} text-slate-900`}>Chat Team</div>
                        <div className="text-xs text-slate-500">Nhóm chung toàn công ty</div>
                    </div>
                    {unreadCounts['team'] && unreadCounts['team'] > 0 && (
                        <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                            {unreadCounts['team']}
                        </div>
                    )}
                </button>

                {/* Groups */}
                {groups.length > 0 && (
                    <div className="p-2">
                        <div className="text-xs font-bold text-slate-400 px-2 py-2 flex items-center gap-2">
                            <Hash size={12} />
                            NHÓM DỰ ÁN
                        </div>
                        {groups.map((group) => {
                            const groupConvId = `group_${group.id}`;
                            const unreadCount = unreadCounts[groupConvId] || 0;
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => onSelectConversation(groupConvId, 'group')}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors ${selectedConversation === groupConvId ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className={`${unreadCount > 0 ? 'font-bold' : 'font-medium'} text-slate-900 text-sm`}>{group.name}</div>
                                        <div className="text-xs text-slate-500">{group.members.length} thành viên</div>
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                            {unreadCount}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Private Chats */}
                <div className="p-2">
                    <div className="text-xs font-bold text-slate-400 px-2 py-2 flex items-center gap-2">
                        <MessageCircle size={12} />
                        TIN NHẮN RIÊNG
                    </div>
                    {users.length === 0 ? (
                        <div className="text-center py-4 text-slate-400 text-sm">
                            Chưa có người dùng nào
                        </div>
                    ) : (
                        users.map((chatUser) => {
                            const conversationId = getConversationId(chatUser.uid);
                            const unreadCount = unreadCounts[conversationId] || 0;
                            return (
                                <button
                                    key={chatUser.uid}
                                    onClick={() => onSelectConversation(conversationId, 'private')}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors ${selectedConversation === conversationId ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <img
                                        src={chatUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.displayName}`}
                                        alt={chatUser.displayName}
                                        className="w-10 h-10 rounded-full object-cover bg-slate-100 flex-shrink-0"
                                    />
                                    <div className="flex-1 text-left">
                                        <div className={`${unreadCount > 0 ? 'font-bold' : 'font-medium'} text-slate-900 text-sm`}>{chatUser.displayName}</div>
                                        <div className="text-xs text-slate-500">{chatUser.email}</div>
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                            {unreadCount}
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
