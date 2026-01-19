import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { X, Users } from 'lucide-react';
import type { AppUser } from '../../types';

interface CreateGroupModalProps {
    onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
    const { user } = useAuthStore();
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [users, setUsers] = useState<AppUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        const q = query(collection(db, 'users'), where('approved', '==', true));
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

    const toggleUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleCreate = async () => {
        if (!groupName.trim() || !user || selectedUsers.size === 0) {
            alert('Vui lòng nhập tên nhóm và chọn ít nhất 1 thành viên!');
            return;
        }

        try {
            const members = [user.uid, ...Array.from(selectedUsers)];
            await addDoc(collection(db, 'chat-groups'), {
                name: groupName.trim(),
                description: description.trim() || null,
                avatar: null,
                members,
                admins: [user.uid],
                createdBy: user.uid,
                createdAt: Date.now()
            });

            onClose();
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Lỗi tạo nhóm: ' + error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white">
                            <Users size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Tạo nhóm mới</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Group Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Tên nhóm *
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="VD: Dự án Website 2024"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Mô tả (tùy chọn)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả ngắn về nhóm..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Members */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Thành viên ({selectedUsers.size} đã chọn)
                        </label>
                        <div className="border border-slate-300 rounded-xl divide-y divide-slate-200 max-h-60 overflow-y-auto">
                            {users.map((chatUser) => (
                                <label
                                    key={chatUser.uid}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.has(chatUser.uid)}
                                        onChange={() => toggleUser(chatUser.uid)}
                                        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-200"
                                    />
                                    <img
                                        src={chatUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.displayName}`}
                                        alt={chatUser.displayName}
                                        className="w-10 h-10 rounded-full object-cover bg-slate-100"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900 text-sm">{chatUser.displayName}</div>
                                        <div className="text-xs text-slate-500">{chatUser.email}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!groupName.trim() || selectedUsers.size === 0}
                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Tạo nhóm
                    </button>
                </div>
            </div>
        </div>
    );
};
