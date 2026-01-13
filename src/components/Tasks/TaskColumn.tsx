import React from 'react';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { useStore } from '../../store/useStore';
import { Plus } from 'lucide-react';

interface TaskColumnProps {
    title: string;
    status: Task['status'];
    icon: React.ReactNode;
    tasks: Task[];
    color: string;
    onAddClick?: () => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, icon, tasks, color, onAddClick }) => {
    const { updateTaskStatus } = useStore();

    // Minimal Drag & Drop placeholder logic (using standard HTML5 API)
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            updateTaskStatus(taskId, status);
        }
    };

    return (
        <div
            className="flex-1 flex flex-col gap-4 min-w-[300px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-blue-500/20`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-extrabold text-slate-800">{title}</h3>
                        <span className="text-xs font-bold text-slate-400">{tasks.length} Việc</span>
                    </div>
                </div>
                {status === 'todo' && (
                    <button
                        onClick={onAddClick}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-blue-500 hover:border-blue-200 flex items-center justify-center transition-all"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>

            {/* Tasks Container */}
            <div className="flex-1 bg-slate-50/50 rounded-[2rem] border border-white/50 p-4 space-y-3 min-h-[200px]">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    >
                        <TaskCard task={task} />
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center py-10 opacity-30 border-2 border-dashed border-slate-200 rounded-2xl">
                        <span className="text-sm font-bold text-slate-400">Thả việc vào đây</span>
                    </div>
                )}
            </div>
        </div>
    );
};
