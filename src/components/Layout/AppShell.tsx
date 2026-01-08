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
            <nav className="fixed bottom-0 left-0 right-0 bg-white px-8 py-5 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] md:hidden rounded-t-[3rem] border-t border-slate-50">
                <button
                    onClick={() => onTabChange?.('overview')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'overview' ? 'text-blue-500' : 'text-slate-400'}`}
                >
                    <LayoutDashboard className="w-6 h-6" strokeWidth={activeTab === 'overview' ? 3 : 2} fill={activeTab === 'overview' ? 'currentColor' : 'none'} fillOpacity={0.1} />
                    <span className="text-[10px] font-black tracking-tight">Tổng quan</span>
                </button>
                <button
                    onClick={() => onTabChange?.('history')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-blue-500' : 'text-slate-400'}`}
                >
                    <Calendar className="w-6 h-6" strokeWidth={activeTab === 'history' ? 3 : 2} fill={activeTab === 'history' ? 'currentColor' : 'none'} fillOpacity={0.1} />
                    <span className="text-[10px] font-black tracking-tight">Lịch</span>
                </button>
                <button
                    onClick={() => onTabChange?.('analytics')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'analytics' ? 'text-blue-500' : 'text-slate-400'}`}
                >
                    <PieChart className="w-6 h-6" strokeWidth={activeTab === 'analytics' ? 3 : 2} fill={activeTab === 'analytics' ? 'currentColor' : 'none'} fillOpacity={0.1} />
                    <span className="text-[10px] font-black tracking-tight">Báo cáo</span>
                </button>
                <button
                    onClick={() => onTabChange?.('settings')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-blue-500' : 'text-slate-400'}`}
                >
                    <Settings className="w-6 h-6" strokeWidth={activeTab === 'settings' ? 3 : 2} fill={activeTab === 'settings' ? 'currentColor' : 'none'} fillOpacity={0.1} />
                    <span className="text-[10px] font-black tracking-tight">Cài đặt</span>
                </button>
            </nav>
        </div>
    );
};
