import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { Send, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ChatMessage, ChatGroup } from '../../types/chat';
import { ChatSidebar } from './ChatSidebar';
import { CreateGroupModal } from './CreateGroupModal';

export const ChatPage: React.FC = () => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState('team');
    const [conversationType, setConversationType] = useState<'team' | 'private' | 'group'>('team');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [conversationName, setConversationName] = useState('Chat Team');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Real-time listener for messages
    useEffect(() => {
        const q = query(
            collection(db, 'chat-messages'),
            where('conversationId', '==', selectedConversation),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                msgs.push({
                    id: doc.id,
                    senderId: data.senderId,
                    senderName: data.senderName,
                    senderAvatar: data.senderAvatar,
                    message: data.message,
                    timestamp: data.timestamp?.toMillis() || Date.now(),
                    isRead: data.isRead || false,
                    conversationId: data.conversationId,
                    conversationType: data.conversationType
                });
            });
            setMessages(msgs);
            setLoading(false);

            setLoading(false);
        }, (error) => {
            console.error("Firestore Error:", error);
            // Nếu lỗi là do thiếu index, firebase sẽ trả về link trong message
            if (error.message.includes('indexes')) {
                toast.error("Cần tạo Index trên Firebase. Xem Console để lấy link!", { duration: 10000 });
            } else {
                toast.error("Lỗi tải tin nhắn: " + error.message);
            }
            setLoading(false); // Dừng loading để không bị treo
        });

        return () => unsubscribe();
    }, [selectedConversation, user]);

    // Desktop notification
    const showDesktopNotification = (msg: ChatMessage) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(`Tin nhắn mới từ ${msg.senderName}`, {
                body: msg.message,
                icon: msg.senderAvatar || undefined,
                tag: msg.conversationId
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }

        // Toast notification
        toast(`💬 ${msg.senderName}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`, {
            duration: 4000,
            position: 'bottom-right',
            style: {
                background: '#fff',
                color: '#1e293b',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
            }
        });
    };

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleSelectConversation = async (convId: string, type: 'team' | 'private' | 'group') => {
        setSelectedConversation(convId);
        setConversationType(type);

        // Set conversation name
        if (type === 'team') {
            setConversationName('Chat Team');
        } else if (type === 'group') {
            const groupId = convId.replace('group_', '');
            const groupDoc = await getDocs(query(collection(db, 'chat-groups'), where('__name__', '==', groupId)));
            if (!groupDoc.empty) {
                const groupData = groupDoc.docs[0].data() as ChatGroup;
                setConversationName(groupData.name);
            }
        } else {
            // Private chat - get other user's name
            const userIds = convId.split('_');
            const otherUserId = userIds.find(id => id !== user?.uid);
            if (otherUserId) {
                const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', otherUserId)));
                if (!userDoc.empty) {
                    const userData = userDoc.docs[0].data();
                    setConversationName(userData.displayName || 'User');
                }
            }
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !user) {
            return;
        }

        try {
            await addDoc(collection(db, 'chat-messages'), {
                senderId: user.uid,
                senderName: user.displayName || 'Anonymous',
                senderAvatar: user.photoURL || null,
                message: newMessage.trim(),
                timestamp: new Date(),
                isRead: false,
                conversationId: selectedConversation,
                conversationType
            });

            setNewMessage('');
        } catch (error) {
            console.error('[CHAT] Error sending message:', error);
            toast.error('Lỗi gửi tin nhắn!');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-slate-400 font-bold">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <ChatSidebar
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                onCreateGroup={() => setShowCreateGroup(true)}
            />

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{conversationName}</h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {conversationType === 'team' ? 'Kênh chat chung cho tất cả thành viên' :
                                    conversationType === 'group' ? 'Nhóm dự án' : 'Tin nhắn riêng'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                            <MessageCircle size={64} className="text-slate-300 mb-4" />
                            <p className="text-slate-400 font-bold">Chưa có tin nhắn nào</p>
                            <p className="text-sm text-slate-400">Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === user?.uid;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <img
                                            src={msg.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName}`}
                                            alt={msg.senderName}
                                            className="w-10 h-10 rounded-full object-cover bg-slate-100 flex-shrink-0"
                                        />
                                        <div className="space-y-1">
                                            {!isMe && (
                                                <div className="text-xs font-bold text-slate-500 px-4">{msg.senderName}</div>
                                            )}
                                            <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-500 text-white rounded-br-md' : 'bg-white text-slate-800 shadow-sm rounded-bl-md'
                                                }`}>
                                                <p className="text-sm font-medium whitespace-pre-wrap break-words">{msg.message}</p>
                                            </div>
                                            <div className={`text-[10px] text-slate-400 px-4 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white border-t border-slate-100 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3 font-medium text-slate-700 outline-none transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim()}
                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateGroup && (
                <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
            )}
        </div>
    );
};
