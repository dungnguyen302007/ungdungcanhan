import React, { useState } from 'react';
import { UserManagement } from './UserManagement';
import { LocationSettings } from './LocationSettings';
import { WorkHoursSettings } from './WorkHoursSettings';
import { AttendanceReport } from './AttendanceReport';
import { RequestManagement } from './RequestManagement';
import { Users, FileText, MapPin, Clock, ClipboardList, Flag } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'location' | 'work_hours' | 'report' | 'requests' | 'content'>('users');

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Trung Tâm Quản Trị</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Quản lý người dùng và cài đặt hệ thống</p>
                </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 rounded-xl w-fit">
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
                    onClick={() => setActiveTab('location')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'location'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <MapPin className="w-4 h-4" />
                    Vị trí Văn phòng
                </button>
                <button
                    onClick={() => setActiveTab('work_hours')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'work_hours'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Cấu hình Giờ làm
                </button>
                <button
                    onClick={() => setActiveTab('report')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'report'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <ClipboardList className="w-4 h-4" />
                    Báo cáo Chấm công
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'requests'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Flag className="w-4 h-4" />
                    Duyệt Yêu cầu
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
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'location' && <LocationSettings />}
                {activeTab === 'work_hours' && <WorkHoursSettings />}
                {activeTab === 'report' && <AttendanceReport />}
                {activeTab === 'requests' && <RequestManagement />}
                {activeTab === 'content' && (
                    <div className="flex items-center justify-center h-full text-slate-400 font-bold">
                        Tính năng đang phát triển...
                    </div>
                )}
            </div>
        </div>
    );
};

