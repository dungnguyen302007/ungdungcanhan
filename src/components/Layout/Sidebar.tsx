import React from 'react';
import {
    LayoutDashboard,
    Wallet,
    CheckSquare,
    Heart,
    Settings,
    Play,
    Shield, // Import Shield icon
    MessageCircle // Import MessagesCircle for chat
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore'; // Import auth store

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const { user } = useAuthStore();

    // Build menu items based on user role
    const menuItems = [];

    if (user?.role === 'admin') {
        // Admin sees all tabs
        menuItems.push(
            { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
            { id: 'finance', label: 'Tài chính', icon: Wallet },
            { id: 'tasks', label: 'Công việc', icon: CheckSquare },
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'health', label: 'Sức khỏe', icon: Heart },
            { id: 'settings', label: 'Cài đặt', icon: Settings },
            { id: 'admin', label: 'Quản trị', icon: Shield }
        );
    } else {
        // Staff sees Tasks and Chat
        menuItems.push(
            { id: 'tasks', label: 'Công việc', icon: CheckSquare },
            { id: 'chat', label: 'Chat', icon: MessageCircle }
        );
    }

    return (
        <aside className="flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-100 p-6 h-full transition-all">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-blue-glow shrink-0">
                    <div className="w-7 h-7 bg-white/20 rounded-lg"></div>
                </div>
                <div className="flex-1">
                    <h1 className="font-black text-slate-900 tracking-tight leading-none text-left">MyLife</h1>
                    <p className="text-[10px] text-slate-400 font-bold text-left uppercase tracking-widest mt-1">Trung tâm năng suất</p>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-black text-sm group ${activeTab === item.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'group-hover:text-slate-600'}`} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Productivity Card */}
            <div className="mt-auto mb-6 bg-slate-50 rounded-[2rem] p-5 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 text-left px-1">Phiên tập trung</p>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900 tracking-tighter">25:00</span>
                    <button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-blue-glow">
                        <Play className="w-4 h-4 fill-current" />
                    </button>
                </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full border-2 border-blue-500 p-0.5">
                    <img
                        src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover bg-amber-50"
                    />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-[13px] font-black text-slate-900 truncate max-w-[120px]">{user?.displayName || 'Khách'}</span>
                    <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-tighter">
                        {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                    </span>
                </div>
            </div>
        </aside>
    );
};
