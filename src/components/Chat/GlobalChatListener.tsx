import React, { useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';
import type { ChatMessage } from '../../types/chat';

export const GlobalChatListener: React.FC = () => {
    const { user } = useAuthStore();
    const lastProcessedId = useRef<string | null>(null);

    const playNotificationSound = () => {
        try {
            // Tạo âm thanh đơn giản bằng Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Tần số cao (Hz)
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio playback failed:', e);
        }
    };

    useEffect(() => {
        if (!user) return;

        // Listen to the latest message in the entire collection
        const q = query(
            collection(db, 'chat-messages'),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) return;

            const doc = snapshot.docs[0];
            const data = doc.data() as ChatMessage;

            // Skip if message is from myself
            if (data.senderId === user.uid) {
                lastProcessedId.current = doc.id;
                return;
            }

            // Skip if this message was already processed (prevent duplicate alerts on re-renders)
            if (lastProcessedId.current === doc.id) return;

            // Mark as processed immediately
            if (!lastProcessedId.current) {
                // First load - don't notify history
                lastProcessedId.current = doc.id;
                return;
            }
            lastProcessedId.current = doc.id;

            // Filter relevant messages
            let isRelevant = false;
            let title = '';

            if (data.conversationType === 'team') {
                isRelevant = true;
                title = `Team Chat: ${data.senderName}`;
            } else if (data.conversationType === 'private') {
                // Check if I am part of this private conversation
                if (data.conversationId.includes(user.uid)) {
                    isRelevant = true;
                    title = `Tin nhắn từ ${data.senderName}`;
                }
            } else if (data.conversationType === 'group') {
                // Optimistic check: we assume if they are receiving the message query result (which is global here)
                // we check if they are in the group. 
                // Since we don't have group list here easily, we can just notify 
                // OR we can rely on the fact that if a user is not in a group, they probably shouldn't see it?
                // But Firestore rules allow reading ALL messages currently.
                // TODO: Enhance this by checking user's group list if available.
                // For now, let's notify for all groups to ensure they don't miss anything.
                isRelevant = true;
                title = `Nhóm: ${data.senderName}`;
            }

            if (isRelevant) {
                // Play sound
                playNotificationSound();

                // Desktop Notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    const notification = new Notification(title, {
                        body: data.message,
                        icon: data.senderAvatar || undefined,
                        tag: data.conversationId
                    });

                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                        // Optional: Navigate to chat page
                        window.location.href = '/chat';
                    };
                }

                // Toast Notification
                toast.custom((t) => (
                    <div
                        className={`${t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                        onClick={() => {
                            toast.dismiss(t.id);
                            window.location.href = '/chat';
                        }}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <img
                                        className="h-10 w-10 rounded-full object-cover"
                                        src={data.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.senderName}`}
                                        alt=""
                                    />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {title}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                        {data.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ), { duration: 5000 });
            }
        });

        return () => unsubscribe();
    }, [user]);

    return null; // Silent component
};
