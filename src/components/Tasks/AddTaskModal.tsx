import { Pencil, Rocket, X, Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Task, AppUser } from '../../types';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface AddTaskModalProps {
    onClose: () => void;
    taskToEdit?: Task;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, taskToEdit }) => {
    const { addTask, updateTask } = useStore();
    const { user } = useAuthStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('medium');
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [reminderTime, setReminderTime] = useState<Task['reminderTime']>('none');
    const [users, setUsers] = useState<AppUser[]>([]);

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setPriority(taskToEdit.priority);
            setDueDate(taskToEdit.dueDate || '');
            setAssigneeId(taskToEdit.assigneeId || '');
            setReminderTime(taskToEdit.reminderTime || 'none');
        }
    }, [taskToEdit]);

    // Fetch users for assignment if admin
    useEffect(() => {
        if (user?.role === 'admin') {
            const fetchUsers = async () => {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const userList: AppUser[] = [];
                querySnapshot.forEach((doc) => userList.push(doc.data() as AppUser));
                setUsers(userList);
            };
            fetchUsers();
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        // If assigning to someone else, use that; otherwise default to self if not set
        const finalAssigneeId = assigneeId || user?.uid;

        if (taskToEdit) {
            updateTask(taskToEdit.id, {
                title,
                description,
                priority,
                dueDate: dueDate || undefined,
                assigneeId: finalAssigneeId,
                reminderTime,
                notified: false
            });
        } else {
            const newTask: Task = {
                id: Date.now().toString(),
                title,
                description,
                status: 'todo',
                priority,
                dueDate: dueDate || undefined,
                assigneeId: finalAssigneeId,
                creatorId: user?.uid,
                createdAt: Date.now(),
                reminderTime,
                notified: false
            };
            addTask(newTask);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 mb-4 shadow-lg shadow-blue-100 transform -rotate-6">
                        {taskToEdit ? <Pencil size={32} /> : <Rocket size={32} />}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {taskToEdit ? 'Cập nhật công việc' : 'Thêm công việc mới'}
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        {taskToEdit ? 'Thay đổi thông tin công việc' : 'Sẵn sàng chinh phục mục tiêu tiếp theo?'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Tên công việc</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ví dụ: Hoàn thành báo cáo quý..."
                                className="w-full bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none transition-all placeholder:font-medium"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Mô tả (Tùy chọn)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Chi tiết công việc..."
                                className="w-full bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 font-medium text-slate-600 outline-none transition-all min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Độ ưu tiên</label>
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                                {(['low', 'medium', 'high'] as const).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${priority === p
                                            ? 'bg-white shadow-sm text-slate-800'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {p === 'low' ? 'Thấp' : p === 'medium' ? 'Vừa' : 'Cao'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Hạn chót</label>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none transition-all pl-12"
                                    style={{ fontSize: '17px', lineHeight: '1.4' }}
                                />
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        {/* Reminder Dropdown */}
                        {dueDate && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Nhắc trước</label>
                                <select
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value as Task['reminderTime'])}
                                    className="w-full bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none transition-all appearance-none"
                                >
                                    <option value="none">Không nhắc</option>
                                    <option value="0m">Ngay tại thời điểm đó</option>
                                    <option value="1m">1 phút trước</option>
                                    <option value="5m">5 phút trước</option>
                                    <option value="15m">15 phút trước</option>
                                    <option value="30m">30 phút trước</option>
                                    <option value="45m">45 phút trước</option>
                                    <option value="1h">1 giờ trước</option>
                                    <option value="2h">2 giờ trước</option>
                                    <option value="1d">1 ngày trước</option>
                                </select>
                            </div>
                        )}

                        {/* Assignee Dropdown (Admin Only) */}
                        {user?.role === 'admin' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Giao việc cho</label>
                                <div className="relative">
                                    <select
                                        value={assigneeId}
                                        onChange={(e) => setAssigneeId(e.target.value)}
                                        className="w-full bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="">-- Tự mình làm --</option>
                                        {users.map(u => (
                                            <option key={u.uid} value={u.uid}>
                                                {u.displayName} ({u.role === 'admin' ? 'Admin' : 'Staff'})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        ▼
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-6"
                    >
                        {taskToEdit ? 'Lưu thay đổi' : 'Tạo công việc'}
                    </button>
                </form>
            </div>
        </div>
    );
};
