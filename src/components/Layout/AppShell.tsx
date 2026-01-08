import React from 'react';
import { Header } from './Header';
import { LayoutDashboard, Calendar, PieChart, Settings } from 'lucide-react';

interface AppShellProps {
    children: React.ReactNode;
    activeTab?: string;
    onTabChange?: (tab: 'overview' | 'analytics' | 'history' | 'settings') => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, activeTab = 'overview', onTabChange }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0">
            <Header />
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 pt-24">
                {children}
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-gray-100 px-8 py-4 flex items-center justify-between z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] md:hidden">
                <button
                    onClick={() => onTabChange?.('overview')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'overview' ? 'text-blue-500 scale-110' : 'text-gray-400'}`}
                >
                    <LayoutDashboard className="w-6 h-6" strokeWidth={activeTab === 'overview' ? 2.5 : 2} />
                    <span className={`text-[10px] font-bold ${activeTab === 'overview' ? 'opacity-100' : 'opacity-0'}`}>Tổng quan</span>
                </button>
                <button
                    onClick={() => onTabChange?.('history')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-blue-500 scale-110' : 'text-gray-400'}`}
                >
                    <Calendar className="w-6 h-6" strokeWidth={activeTab === 'history' ? 2.5 : 2} />
                    <span className={`text-[10px] font-bold ${activeTab === 'history' ? 'opacity-100' : 'opacity-0'}`}>Lịch</span>
                </button>
                <button
                    onClick={() => onTabChange?.('analytics')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'analytics' ? 'text-blue-500 scale-110' : 'text-gray-400'}`}
                >
                    <PieChart className="w-6 h-6" strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
                    <span className={`text-[10px] font-bold ${activeTab === 'analytics' ? 'opacity-100' : 'opacity-0'}`}>Báo cáo</span>
                </button>
                <button
                    onClick={() => onTabChange?.('settings')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' ? 'text-blue-500 scale-110' : 'text-gray-400'}`}
                >
                    <Settings className="w-6 h-6" strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                    <span className={`text-[10px] font-bold ${activeTab === 'settings' ? 'opacity-100' : 'opacity-0'}`}>Cài đặt</span>
                </button>
            </nav>
        </div>
    );
};
