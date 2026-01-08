import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

export const Header: React.FC = () => {
    const { setUserId } = useStore();

    const handleLogout = () => {
        setUserId(null);
        toast.success('Đã đăng xuất');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-xl px-4 md:px-6">
            <div className="max-w-4xl mx-auto h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                            alt="Admin"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs font-medium">Xin chào,</span>
                        <span className="text-gray-900 font-bold text-base leading-tight">Minh Anh</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-primary transition-all shadow-soft group relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-soft"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};
