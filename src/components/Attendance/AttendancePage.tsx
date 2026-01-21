import React, { useState } from 'react';
import { FaceCheckIn } from '../FaceID/FaceCheckIn';
import { FaceRegistration } from '../FaceID/FaceRegistration';
import { AttendanceHistory } from './AttendanceHistory';
import { AttendanceCalendar } from './AttendanceCalendar';
import { useAuthStore } from '../../store/useAuthStore';
import { Camera, UserPlus, Clock, Calendar } from 'lucide-react';

export const AttendancePage: React.FC = () => {
    const { user } = useAuthStore();
    const [view, setView] = useState<'check-in' | 'register' | 'history' | 'calendar'>('check-in');

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-black text-slate-900 mb-6">Hệ Thống Chấm Công</h1>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                <button
                    onClick={() => setView('check-in')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${view === 'check-in'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <Camera className="w-4 h-4" />
                    Chấm công
                </button>
                <button
                    onClick={() => setView('register')}
                    disabled={user?.role === 'pending'}
                    title={user?.role === 'pending' ? 'Cần Admin phê duyệt' : ''}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${view === 'register'
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        } ${user?.role === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <UserPlus className="w-4 h-4" />
                    Đăng ký Face ID
                </button>
                <button
                    onClick={() => setView('history')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${view === 'history'
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Lịch sử
                </button>
                <button
                    onClick={() => setView('calendar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${view === 'calendar'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    Lịch
                </button>
            </div>

            {/* Content */}
            {view === 'check-in' && <FaceCheckIn />}
            {view === 'register' && <FaceRegistration />}
            {view === 'history' && <AttendanceHistory />}
            {view === 'calendar' && <AttendanceCalendar />}
        </div>
    );
};
