import React, { useState, useEffect } from 'react';
import { X, Send, Calendar, FileText, AlertTriangle, History, Clock } from 'lucide-react';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const userId = user?.uid;
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
    const [history, setHistory] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'late_in',
        reason: ''
    });

    // We could fetch user profile here, but for simplicity let's rely on admin looking up user ID
    // or we fetch it briefly.
    // For now, let's just use "Unknown" in local submission, 
    // real app would join with Users collection or fetch profile in store.

    // Better: Fetch display name on mount if not in store
    const [displayName, setDisplayName] = React.useState('');

    React.useEffect(() => {
        if (userId) {
            // Fetch basic info if needed, or just let Cloud Function handle it.
            // But we are client-side.
            import('firebase/firestore').then(({ getDoc, doc }) => {
                getDoc(doc(db, 'users', userId)).then(snap => {
                    setDisplayName(snap.data()?.displayName || 'Nhân viên');
                });
            });
        }
    }, [userId]);

    useEffect(() => {
        if (activeTab === 'history' && userId) {
            fetchHistory();
        }
    }, [activeTab, userId]);

    const fetchHistory = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // Client-side sort to avoid index
            const q = query(
                collection(db, 'attendance_requests'),
                where('userId', '==', userId)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setHistory(data);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.reason.trim()) {
            toast.error("Vui lòng nhập lý do");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'attendance_requests'), {
                userId,
                displayName: displayName || 'Nhân viên',
                ...formData,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            toast.success("Đã gửi yêu cầu thành công! Vui lòng chờ duyệt.");
            onClose();
            setFormData({ ...formData, reason: '' }); // Reset reason
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error("Lỗi khi gửi yêu cầu.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold border border-green-200">Đã duyệt</span>;
            case 'rejected': return <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold border border-red-200">Từ chối</span>;
            default: return <span className="text-amber-600 bg-amber-100 px-2 py-1 rounded text-xs font-bold border border-amber-200">Chờ duyệt</span>;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'late_in': return 'Đi muộn';
            case 'early_out': return 'Về sớm';
            case 'missing_in': return 'Quên Check-in';
            case 'missing_out': return 'Quên Check-out';
            case 'remote_work': return 'Công tác / Remote';
            case 'leave': return 'Nghỉ phép';
            default: return type;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-blue-600 p-4 shrink-0 flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Gửi Giải Trình / Yêu Cầu
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 shrink-0">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'create' ? 'text-blue-600 border-blue-600 bg-blue-50' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}
                    >
                        Tạo yêu cầu mới
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'history' ? 'text-blue-600 border-blue-600 bg-blue-50' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}
                    >
                        Lịch sử yêu cầu
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {activeTab === 'create' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-800">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <p>Yêu cầu của bạn sẽ được gửi tới Quản lý xét duyệt. Chấm công sẽ được cập nhật sau khi duyệt.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-slate-700">Ngày cần giải trình</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-slate-700">Loại yêu cầu</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                >
                                    <option value="late_in">Giải trình Đi muộn</option>
                                    <option value="early_out">Giải trình Về sớm</option>
                                    <option value="missing_in">Quên Check-in</option>
                                    <option value="missing_out">Quên Check-out</option>
                                    <option value="remote_work">Công tác / Làm việc từ xa (Full ngày)</option>
                                    <option value="leave">Xin nghỉ phép</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-slate-700">Lý do chi tiết</label>
                                <textarea
                                    required
                                    placeholder="Ví dụ: Gặp khách hàng ABC tại quận 1..."
                                    rows={3}
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !userId}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Gửi Yêu Cầu
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8 text-slate-500">Đang tải lịch sử...</div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">Bạn chưa có yêu cầu nào.</p>
                                </div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-800 text-sm">{getTypeLabel(item.type)}</span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {item.date}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2 mb-2 italic">"{item.reason}"</p>
                                            {item.createdAt && (
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Đã gửi: {new Date(item.createdAt.seconds * 1000).toLocaleString('vi-VN')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="shrink-0">
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
