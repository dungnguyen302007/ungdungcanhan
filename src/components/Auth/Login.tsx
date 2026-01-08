import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import toast from 'react-hot-toast';

export const Login = () => {
    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            toast.success('Đăng nhập thành công!');
        } catch (error) {
            console.error(error);
            toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">💰</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-800">Quản Lý Chi Tiêu</h1>
                    <p className="text-gray-500">Đăng nhập để đồng bộ dữ liệu trên mọi thiết bị</p>
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 group"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-6 h-6"
                    />
                    <span className="group-hover:text-gray-900">Tiếp tục với Google</span>
                </button>

                <p className="text-xs text-center text-gray-400 mt-8">
                    An toàn • Bảo mật • Miễn phí
                </p>
            </div>
        </div>
    );
};
