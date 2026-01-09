import React from 'react';
import {
    LayoutDashboard,
    Wallet,
    CheckSquare,
    Heart,
    Settings,
    Play
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'finance', label: 'Tài chính', icon: Wallet },
        { id: 'tasks', label: 'Công việc', icon: CheckSquare },
        { id: 'health', label: 'Sức khỏe', icon: Heart },
        { id: 'settings', label: 'Cài đặt', icon: Settings },
    ];

    return (
        <aside className="flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-100 p-6 h-full transition-all">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-blue-glow">
                    <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
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
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=AnhDung&backgroundColor=ffdfbf"
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover bg-amber-50"
                    />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-[13px] font-black text-slate-900">Anh Dũng</span>
                    <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-tighter">Gói Hội Viên</span>
                </div>
            </div>
        </aside>
    );
};
