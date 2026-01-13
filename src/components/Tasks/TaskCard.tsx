import { Clock, GripVertical, Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TaskCardProps {
    task: Task;
}

const PRIORITY_COLORS = {
    high: 'bg-rose-500 shadow-rose-200',
    medium: 'bg-orange-500 shadow-orange-200',
    low: 'bg-emerald-500 shadow-emerald-200'
};

const PRIORITY_LABELS = {
    high: 'Gấp',
    medium: 'Thường',
    low: 'Thong thả'
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { deleteTask, updateTaskStatus } = useStore();

    // Determine next status for simple lifecycle click (optional UX)
    const handleStatusClick = () => {
        if (task.status === 'todo') updateTaskStatus(task.id, 'doing');
        if (task.status === 'doing') updateTaskStatus(task.id, 'done');
    };

    return (
        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-move animate-in fade-in slide-in-from-bottom-2">

            {/* Priority Indicator */}
            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]} shadow-lg`} />

            <div className="flex items-start gap-3">
                <div className="mt-1 text-slate-300">
                    <GripVertical size={16} />
                </div>

                <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-slate-800 leading-snug">{task.title}</h4>

                    {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-3 pt-1">
                        {task.dueDate && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                <Clock size={10} />
                                {format(new Date(task.dueDate), 'dd/MM', { locale: vi })}
                            </div>
                        )}

                        <span className={clsx(
                            "text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-lg",
                            task.priority === 'high' && "bg-rose-50 text-rose-500",
                            task.priority === 'medium' && "bg-orange-50 text-orange-500",
                            task.priority === 'low' && "bg-emerald-50 text-emerald-500"
                        )}>
                            {PRIORITY_LABELS[task.priority]}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions overlay */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Xóa công việc này?')) deleteTask(task.id);
                    }}
                    className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};
