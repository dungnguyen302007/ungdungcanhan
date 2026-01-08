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
        <div className="min-h-screen bg-gradient-to-br from-[#FFE4E6] via-[#FFF5F7] to-[#FCE7F3] flex flex-col pb-24 md:pb-0">
            <Header />
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 pt-24">
                {children}
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white px-8 pb-8 pt-5 flex items-center justify-between z-50 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] md:hidden rounded-t-[3.5rem] border-t border-slate-50">
                <button
                    onClick={() => onTabChange?.('overview')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'overview' ? 'text-blue-500 scale-105' : 'text-slate-400'}`}
                >
                    <LayoutDashboard className="w-6 h-6" strokeWidth={activeTab === 'overview' ? 2.5 : 2} fill={activeTab === 'overview' ? 'currentColor' : 'none'} />
                    <span className="text-[11px] font-black tracking-tighter capitalize">Tổng quan</span>
                </button>
                <button
                    onClick={() => onTabChange?.('history')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-blue-500 scale-105' : 'text-slate-400'}`}
                >
                    <Calendar className="w-6 h-6" strokeWidth={activeTab === 'history' ? 2.5 : 2} fill={activeTab === 'history' ? 'currentColor' : 'none'} />
                    <span className="text-[11px] font-black tracking-tighter capitalize">Lịch</span>
                </button>
                <button
                    onClick={() => onTabChange?.('analytics')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'analytics' ? 'text-blue-500 scale-105' : 'text-slate-400'}`}
                >
                    <PieChart className="w-6 h-6" strokeWidth={activeTab === 'analytics' ? 2.5 : 2} fill={activeTab === 'analytics' ? 'currentColor' : 'none'} />
                    <span className="text-[11px] font-black tracking-tighter capitalize">Báo cáo</span>
                </button>
                <button
                    onClick={() => onTabChange?.('settings')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' ? 'text-blue-500 scale-105' : 'text-slate-400'}`}
                >
                    <Settings className="w-6 h-6" strokeWidth={activeTab === 'settings' ? 2.5 : 2} fill={activeTab === 'settings' ? 'currentColor' : 'none'} />
                    <span className="text-[11px] font-black tracking-tighter capitalize">Cài đặt</span>
                </button>
            </nav>
        </div>
    );
};
