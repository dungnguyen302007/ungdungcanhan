import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import type { AppUser } from '../../types';
import { Shield, User, Check, X, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = useAuthStore(state => state.user);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const userList: AppUser[] = [];
            querySnapshot.forEach((doc) => {
                userList.push(doc.data() as AppUser);
            });
            // Sort: Pending first, then by name
            userList.sort((a, b) => {
                if (a.role === 'pending' && b.role !== 'pending') return -1;
                if (a.role !== 'pending' && b.role === 'pending') return 1;
                return (a.displayName || '').localeCompare(b.displayName || '');
            });
            setUsers(userList);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải danh sách người dùng');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (uid: string) => {
        try {
            await updateDoc(doc(db, 'users', uid), { role: 'staff' });
            toast.success('Đã duyệt thành viên thành công!');
            fetchUsers();
        } catch (error) {
            toast.error('Lỗi khi duyệt');
        }
    };

    const handleReject = async (uid: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn XÓA yêu cầu này không?')) return;
        try {
            await deleteDoc(doc(db, 'users', uid));
            toast.success('Đã xóa yêu cầu.');
            fetchUsers();
        } catch (error) {
            toast.error('Lỗi khi xóa');
        }
    };

    const handleChangeRole = async (uid: string, newRole: 'admin' | 'staff') => {
        try {
            await updateDoc(doc(db, 'users', uid), { role: newRole });
            toast.success(`Đã chuyển quyền thành ${newRole}`);
            fetchUsers();
        } catch (error) {
            toast.error('Lỗi khi đổi quyền');
        }
    };

    const handleSendResetPassword = async (email: string) => {
        if (!window.confirm(`Gửi email đặt lại mật khẩu cho ${email}?`)) return;
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Đã gửi email khôi phục mật khẩu!');
        } catch (error: any) {
            toast.error('Lỗi gửi email: ' + error.message);
        }
    };

    if (isLoading) return <div className="text-center p-10">Đang tải dữ liệu...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-slate-400 text-xs uppercase border-b border-slate-100">
                        <th className="px-4 py-3 font-bold">Thành viên</th>
                        <th className="px-4 py-3 font-bold">Email</th>
                        <th className="px-4 py-3 font-bold text-center">Vai trò</th>
                        <th className="px-4 py-3 font-bold text-center">Trạng thái</th>
                        <th className="px-4 py-3 font-bold text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {users.map((user) => (
                        <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                                    />
                                    <span className="font-bold text-slate-700">{user.displayName || 'Không tên'}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">{user.email}</td>
                            <td className="px-4 py-3 text-center">
                                {user.role === 'admin' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold"><Shield size={12} /> Admin</span>}
                                {user.role === 'staff' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold"><User size={12} /> Staff</span>}
                                {user.role === 'pending' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">Chờ duyệt</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={`w-2 h-2 rounded-full inline-block ${user.role === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                                {/* Actions based on Role */}
                                {user.role === 'pending' ? (
                                    <>
                                        <button onClick={() => handleApprove(user.uid)} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition" title="Duyệt">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => handleReject(user.uid)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Từ chối/Xoá">
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleSendResetPassword(user.email)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition" title="Gửi email đổi mật khẩu">
                                            <Mail size={16} />
                                        </button>

                                        {/* Dropdown or toggle for role change - simplified to toggle for now or simple buttons */}
                                        {currentUser?.uid !== user.uid && (
                                            <div className="inline-flex items-center gap-1 ml-2 border-l pl-2 border-slate-200">
                                                {user.role === 'staff' ? (
                                                    <button onClick={() => handleChangeRole(user.uid, 'admin')} className="text-xs font-bold text-red-500 hover:underline">
                                                        Thăng chức
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleChangeRole(user.uid, 'staff')} className="text-xs font-bold text-blue-500 hover:underline">
                                                        Giáng chức
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-10 text-slate-400">Chưa có thành viên nào</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
