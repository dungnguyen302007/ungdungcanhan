import React, { useState } from 'react';
import { X, Calendar, Rocket } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Task } from '../../types';

interface AddTaskModalProps {
    onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose }) => {
    const { addTask } = useStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('medium');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newTask: Task = {
            id: Date.now().toString(),
            title,
            description,
            status: 'todo',
            priority,
            dueDate: dueDate || undefined,
            createdAt: Date.now()
        };

        addTask(newTask);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 mb-4 shadow-lg shadow-blue-100 transform -rotate-6">
                        <Rocket size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thêm công việc mới</h2>
                    <p className="text-slate-500 font-medium mt-1">Sẵn sàng chinh phục mục tiêu tiếp theo?</p>
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

                        <div className="grid grid-cols-2 gap-4">
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
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none transition-all pl-12"
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-6"
                    >
                        Tạo công việc
                    </button>
                </form>
            </div>
        </div>
    );
};
