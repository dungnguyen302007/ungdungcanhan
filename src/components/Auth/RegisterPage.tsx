import React, { useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import type { AppUser } from '../../types';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Create User in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Display Name
            await updateProfile(user, { displayName });

            // 3. Create User Doc in Firestore
            const newUser: AppUser = {
                uid: user.uid,
                email: user.email!,
                displayName: displayName,
                role: 'pending', // Default role for new users
                createdAt: Date.now()
            };

            await setDoc(doc(db, 'users', user.uid), newUser);

            toast.success('Đăng ký thành công! Vui lòng chờ Admin duyệt.');
            onSwitchToLogin();

        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Email này đã được sử dụng!');
            } else {
                toast.error(`Lỗi đăng ký (${error.code}): ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-slate-800">Đăng Ký</h1>
                    <p className="text-slate-500 mt-2">Tham gia vào hệ thống</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tên hiển thị</label>
                        <input
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="email@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ít nhất 6 ký tự..."
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={onSwitchToLogin}
                        className="text-sm font-bold text-blue-500 hover:underline"
                    >
                        Đã có tài khoản? Đăng nhập ngay
                    </button>
                </div>
            </div>
        </div>
    );
};
