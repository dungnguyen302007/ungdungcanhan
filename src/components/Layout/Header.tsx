import React, { useState } from 'react';
import { Bell, X, CloudSun, LogOut, FileText } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface HeaderProps {
    onTabChange?: (tab: 'overview' | 'analytics' | 'history' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({ onTabChange }) => {
    const { userId, notifications, markNotificationAsRead, setUserId } = useStore();
    const [showNotifications, setShowNotifications] = useState(false);

    if (!userId) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        setUserId(null);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-sm px-6">
            <div className="max-w-4xl mx-auto h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-soft-sm shrink-0">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=MinhAnh&backgroundColor=ffdfbf"
                            alt="Avatar"
                            className="w-full h-full object-cover bg-amber-100"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-[10px] font-semibold leading-none text-left">Xin chào,</span>
                        <span className="text-slate-900 font-black text-sm tracking-tight">Anh Dũng</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2 mr-4 border-r border-slate-100 pr-4">
                        <button
                            onClick={() => onTabChange?.('overview')}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Tổng quan
                        </button>
                        <button
                            onClick={() => onTabChange?.('history')}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Lịch sử
                        </button>
                    </div>

                    {/* Báo cáo Chi Tiêu Button - Highlighted */}
                    <button
                        onClick={() => onTabChange?.('analytics')}
                        className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-2xl shadow-blue-glow font-black text-xs hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Báo cáo chi tiêu</span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-soft-sm relative border border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                            <Bell className="w-5 h-5" fill={unreadCount > 0 ? "currentColor" : "none"} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 z-[60]">
                                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-xs font-bold">
                                            Không có thông báo nào
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => {
                                                    markNotificationAsRead(notification.id);
                                                    setShowNotifications(false);
                                                }}
                                                className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                            >
                                                {!notification.isRead && (
                                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                )}
                                                <div className="flex gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'weather' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {notification.type === 'weather' ? <CloudSun className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[13px] font-bold text-slate-800 leading-tight">{notification.title}</p>
                                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{notification.message}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                                            {format(new Date(notification.date), 'HH:mm, dd/MM', { locale: vi })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings - Desktop Only */}
                    <button
                        onClick={() => onTabChange?.('settings')}
                        className="hidden md:flex w-10 h-10 rounded-full bg-white items-center justify-center text-slate-600 border border-slate-50 hover:bg-slate-50 transition-all active:scale-95"
                        title="Cài đặt"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-2xl border border-red-100 font-black text-xs hover:bg-red-100 transition-all active:scale-95"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Đăng xuất</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
