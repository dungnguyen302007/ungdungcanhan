import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUserId, fetchTransactions } = useStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === 'admin' && password === 'admin') {
            const SHARED_USER_ID = 'admin_household_id';
            setUserId(SHARED_USER_ID);
            fetchTransactions();
            toast.success('Chào mừng Admin!');
        } else {
            toast.error('Sai tên đăng nhập hoặc mật khẩu!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Quản Lý Chi Tiêu</h1>
                    <p className="text-gray-500">Đăng nhập bằng tài khoản quản trị</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
                    >
                        Đăng nhập
                    </button>
                </form>

                <p className="text-xs text-center text-gray-400 mt-8">
                    Dữ liệu được đồng bộ hóa đám mây
                </p>
            </div>
        </div>
    );
};
