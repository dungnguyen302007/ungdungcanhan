import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

export const Header: React.FC = () => {
    const { setUserId } = useStore();

    const handleLogout = () => {
        setUserId(null); // Clear local session
        toast.success('Đã đăng xuất');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                        Quản Lý Chi Tiêu
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-700">Admin</span>
                        <span className="text-xs text-gray-400">Quản trị viên</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm ring-2 ring-gray-100">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                            alt="Admin"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};
