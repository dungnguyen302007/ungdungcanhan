import React from 'react';
import { Bell } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Header: React.FC = () => {
    const { userId } = useStore();

    if (!userId) return null;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-sm px-6">
            <div className="max-w-4xl mx-auto h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-soft-sm">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=MinhAnh&backgroundColor=ffdfbf"
                            alt="Avatar"
                            className="w-full h-full object-cover bg-amber-100"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs font-semibold leading-none text-left">Xin chào,</span>
                        <span className="text-slate-900 font-extrabold text-lg tracking-tight">Minh Anh</span>
                    </div>
                </div>

                <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-soft-sm relative border border-slate-50">
                    <Bell className="w-6 h-6" fill="currentColor" />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};
