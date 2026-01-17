import React, { useState } from 'react';
import { UserManagement } from './UserManagement';
import { Users, FileText } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'content'>('users');

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Trung Tâm Quản Trị</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Quản lý người dùng và nội dung hệ thống</p>
                </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Quản lý Thành viên
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'content'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Nội dung (Coming Soon)
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[500px]">
                {activeTab === 'users' ? (
                    <UserManagement />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 font-bold">
                        Tính năng đang phát triển...
                    </div>
                )}
            </div>
        </div>
    );
};
