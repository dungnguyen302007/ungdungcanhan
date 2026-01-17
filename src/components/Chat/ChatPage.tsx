import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { Send, MessageCircle } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';

export const ChatPage: React.FC = () => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Real-time listener
    useEffect(() => {
        const q = query(collection(db, 'chat-messages'), orderBy('timestamp', 'asc'));

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
                    isRead: data.isRead || false
                });
            });
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;

        try {
            await addDoc(collection(db, 'chat-messages'), {
                senderId: user.uid,
                senderName: user.displayName,
                senderAvatar: user.photoURL,
                message: newMessage.trim(),
                timestamp: serverTimestamp(),
                isRead: false
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
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
        <div className="flex-1 flex flex-col h-screen bg-[#F8FAFC]">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chat Team</h2>
                        <p className="text-sm text-slate-500 font-medium">Kênh chat chung cho tất cả thành viên</p>
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
                            <div key={msg.id} className={` flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full border-2 border-white flex-shrink-0">
                                        <img
                                            src={msg.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName}`}
                                            alt={msg.senderName}
                                            className="w-full h-full rounded-full object-cover bg-slate-100"
                                        />
                                    </div>

                                    {/* Message Bubble */}
                                    <div className="space-y-1">
                                        {!isMe && (
                                            <div className="text-xs font-bold text-slate-500 px-4">{msg.senderName}</div>
                                        )}
                                        <div
                                            className={`px-4 py-3 rounded-2xl ${isMe
                                                    ? 'bg-blue-500 text-white rounded-br-md'
                                                    : 'bg-white text-slate-800 shadow-sm rounded-bl-md'
                                                }`}
                                        >
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
    );
};
