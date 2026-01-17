import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import type { AppUser } from '../../types';

interface LoginPageProps {
    onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const { setUser } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // EMERGENCY BACKDOOR: Auto-grant Admin for specific emails
            const adminEmails = ['nguyenvandung63664@gmail.com', 'nguyenvandung636641@gmail.com'];

            if (user.email && adminEmails.includes(user.email)) {
                const { updateDoc, doc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
                console.log('Force upgraded to Admin');
            }

            // Fetch user role from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data() as AppUser;

                // Check for pending status (allow specific admin emails to bypass)
                if (userData.role === 'pending' && user.email && !adminEmails.includes(user.email)) {
                    await auth.signOut();
                    toast.error('Tài khoản của bạn đang chờ Admin duyệt!');
                    return;
                }

                setUser(userData);
                toast.success('Đăng nhập thành công!');

            } else {
                // AUTO-HEAL: If Auth exists but Firestore doc is missing, create it now
                console.warn('User doc missing. Attempting auto-heal...');
                const newUser: AppUser = {
                    uid: user.uid,
                    email: user.email!,
                    displayName: user.displayName || 'User',
                    role: 'admin', // Default to admin for now
                    createdAt: Date.now()
                };

                try {
                    const { setDoc } = await import('firebase/firestore');
                    await setDoc(doc(db, 'users', user.uid), newUser);
                    setUser(newUser);
                    toast.success('Đã tự động tạo dữ liệu người dùng!');
                } catch (err: any) {
                    console.error('Auto-heal failed:', err);
                    toast.error(`Lỗi dữ liệu: ${err.message}`);
                    await auth.signOut();
                }
            }

        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/invalid-credential') {
                toast.error('Sai email hoặc mật khẩu!');
            } else {
                toast.error('Có lỗi xảy ra: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Vui lòng nhập email để đặt lại mật khẩu!');
            return;
        }
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Đã gửi email khôi phục! Kiểm tra hộp thư của bạn.');
            setIsForgotPassword(false);
        } catch (error: any) {
            console.error(error);
            toast.error('Lỗi: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-slate-800">
                        {isForgotPassword ? 'Khôi phục Mật khẩu' : 'Đăng Nhập'}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isForgotPassword ? 'Nhập email để lấy lại mật khẩu' : 'Chào mừng trở lại!'}
                    </p>
                </div>

                {!isForgotPassword ? (
                    <form onSubmit={handleLogin} className="space-y-6">
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
                                placeholder="Bí mật..."
                            />
                            <div className="text-right mt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(true)}
                                    className="text-xs font-bold text-blue-500 hover:underline"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập email của bạn"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Gửi yêu cầu' : 'Lấy lại mật khẩu'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(false)}
                                className="text-sm font-bold text-slate-500 hover:underline"
                            >
                                Quay lại Đăng nhập
                            </button>
                        </div>
                    </form>
                )}

                {!isForgotPassword && (
                    <div className="text-center">
                        <button
                            onClick={onSwitchToRegister}
                            className="text-sm font-bold text-blue-500 hover:underline"
                        >
                            Chưa có tài khoản? Đăng ký ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
