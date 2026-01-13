import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { TaskColumn } from './TaskColumn';
import { AddTaskModal } from './AddTaskModal';
import { ListTodo, Loader2, CheckCircle2 } from 'lucide-react';

export const TasksApp: React.FC = () => {
    const { tasks } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const doingTasks = tasks.filter(t => t.status === 'doing');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const completionRate = tasks.length > 0
        ? Math.round((doneTasks.length / tasks.length) * 100)
        : 0;

    return (
        <div className="flex-1 p-4 lg:p-8 bg-[#F8FAFC] min-h-screen flex flex-col overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 animate-in fade-in slide-in-from-top-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Công việc của tôi</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-600">{tasks.length - doneTasks.length} đang chờ</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                            <span className="text-xs font-bold text-slate-600">Hoàn thành {completionRate}%</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                    <ListTodo size={20} />
                    <span>Thêm việc mới</span>
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-6 h-full min-w-[900px]">
                    <TaskColumn
                        title="Cần làm"
                        status="todo"
                        icon={<ListTodo size={20} />}
                        color="bg-slate-500"
                        tasks={todoTasks}
                        onAddClick={() => setIsAddModalOpen(true)}
                    />

                    <TaskColumn
                        title="Đang làm"
                        status="doing"
                        icon={<Loader2 size={20} className="animate-spin" />}
                        color="bg-blue-500"
                        tasks={doingTasks}
                    />

                    <TaskColumn
                        title="Đã xong"
                        status="done"
                        icon={<CheckCircle2 size={20} />}
                        color="bg-emerald-500"
                        tasks={doneTasks}
                    />
                </div>
            </div>

            {isAddModalOpen && <AddTaskModal onClose={() => setIsAddModalOpen(false)} />}
        </div>
    );
};
