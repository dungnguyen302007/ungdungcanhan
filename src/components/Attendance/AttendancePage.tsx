import React, { useState } from 'react';
import { FaceCheckIn } from '../FaceID/FaceCheckIn';
import { FaceRegistration } from '../FaceID/FaceRegistration';
import { AttendanceHistory } from './AttendanceHistory';

import { useAuthStore } from '../../store/useAuthStore';

export const AttendancePage: React.FC = () => {
    const [mode, setMode] = useState<'checkin' | 'register'>('checkin');
    const { user } = useAuthStore();

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    onClick={() => setMode('checkin')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'checkin' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                    Chấm công
                </button>
                <button
                    onClick={() => setMode('register')}
                    disabled={user?.role === 'pending'}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'register' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'} ${user?.role === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={user?.role === 'pending' ? 'Tài khoản cần được duyệt trước' : ''}
                >
                    Đăng ký Face ID
                </button>
            </div>

            {mode === 'checkin' ? (
                <div className="animate-fade-in space-y-8">
                    <FaceCheckIn />
                    <AttendanceHistory />
                </div>
            ) : (
                <div className="animate-fade-in">
                    <FaceRegistration />
                </div>
            )}

            <div className="text-center text-slate-400 text-sm mt-8">
                Hệ thống chấm công sử dụng công nghệ nhận diện khuôn mặt Face API.
                <br />
                Dữ liệu khuôn mặt được mã hóa và lưu trữ an toàn.
            </div>
        </div>
    );
};
