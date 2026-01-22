import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Clock, CheckCircle2, LogOut, FileText, Calendar } from 'lucide-react';

interface DailyAttendance {
    id: string;
    date: string;
    checkInTime: any;
    checkOutTime: any;
    status: 'present' | 'late' | 'early' | 'late-early' | 'absent';
    details: {
        lateMinutes: number;
        earlyLeaveMinutes: number;
        totalWorkHours: number;
    };
}

interface RequestHistoryItem {
    id: string;
    date: string;
    type: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
}

export const AttendanceHistory: React.FC = () => {
    const { user } = useAuthStore();
    const [records, setRecords] = useState<DailyAttendance[]>([]);
    const [requests, setRequests] = useState<RequestHistoryItem[]>([]); // New state for requests
    const [stats, setStats] = useState({
        totalDays: 0,
        lateDays: 0,
        earlyDays: 0,
        onTimeDays: 0,
        totalHours: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                // 1. Fetch current month's records for stats
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

                const qStats = query(
                    collection(db, 'attendance_days'),
                    where('userId', '==', user.uid),
                    where('date', '>=', startOfMonth),
                    where('date', '<=', endOfMonth)
                );

                const statsSnapshot = await getDocs(qStats);
                let totalDays = 0;
                let lateDays = 0;
                let earlyDays = 0;
                let onTimeDays = 0;
                let totalHours = 0;

                statsSnapshot.forEach(doc => {
                    const data = doc.data() as DailyAttendance;
                    totalDays++;
                    totalHours += data.details?.totalWorkHours || 0;

                    const isLate = data.details?.lateMinutes > 0;
                    const isEarly = data.details?.earlyLeaveMinutes > 0;

                    if (isLate) lateDays++;
                    if (isEarly) earlyDays++;
                    if (!isLate && !isEarly) onTimeDays++;
                });

                setStats({ totalDays, lateDays, earlyDays, onTimeDays, totalHours: parseFloat(totalHours.toFixed(1)) });

                // 2. Fetch Recent Records for list
                const qRecent = query(
                    collection(db, 'attendance_days'),
                    where('userId', '==', user.uid),
                    orderBy('date', 'desc'),
                    limit(7)
                );

                const snapshot = await getDocs(qRecent);
                const fetchedRecords = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as DailyAttendance[];

                setRecords(fetchedRecords);

            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        // 3. Real-time Requests Listener
        if (!user) return;

        const qRequests = query(
            collection(db, 'attendance_requests'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(qRequests, (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RequestHistoryItem[];

            fetchedRequests.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setRequests(fetchedRequests.slice(0, 5));
        });

        return () => unsubscribe();

    }, [user]);

    const getRequestStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded border border-green-200">Đã duyệt</span>;
            case 'rejected': return <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200">Từ chối</span>;
            default: return <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-1 rounded border border-amber-200">Chờ duyệt</span>;
        }
    };

    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case 'late_in': return 'Đi muộn';
            case 'early_out': return 'Về sớm';
            case 'missing_in': return 'Quên Check-in';
            case 'missing_out': return 'Quên Check-out';
            case 'remote_work': return 'Công tác';
            case 'leave': return 'Nghỉ phép';
            default: return type;
        }
    };

    if (loading) return <div className="text-center py-4 text-slate-400">Đang tải lịch sử...</div>;

    return (
        <div className="space-y-6 mt-6">
            {/* Monthly Stats Dashboard */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
                    <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Ngày Công</p>
                    <p className="text-3xl font-black mt-1">{stats.totalDays}</p>
                    <p className="text-[10px] mt-2 opacity-80">Tháng {new Date().getMonth() + 1}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Giờ</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalHours}h</p>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">
                            {stats.onTimeDays} Đúng giờ
                        </span>
                    </div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Đi Trễ</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats.lateDays}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Về Sớm</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats.earlyDays}</p>
                </div>
            </div>

            {/* List Attendance */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Bảng công gần đây
                </h3>

                {records.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-400 font-medium">Chưa có dữ liệu chấm công</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {records.map(record => {
                            const checkIn = record.checkInTime?.toDate ? record.checkInTime.toDate() : null;
                            const checkOut = record.checkOutTime?.toDate ? record.checkOutTime.toDate() : null;
                            const isLate = record.details?.lateMinutes > 0;
                            const isEarly = record.details?.earlyLeaveMinutes > 0;

                            return (
                                <div key={record.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {checkIn ? checkIn.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' }) : record.date}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                {isLate && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Đi trễ {record.details.lateMinutes}p</span>}
                                                {isEarly && <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Về sớm {record.details.earlyLeaveMinutes}p</span>}
                                                {!isLate && !isEarly && <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Đúng giờ</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 font-medium">Tổng giờ làm</p>
                                            <p className="text-lg font-black text-blue-600">{record.details?.totalWorkHours || 0}h</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white p-2 rounded-lg flex items-center gap-2 border border-slate-100">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLate ? 'bg-amber-100 text-amber-500' : 'bg-green-100 text-green-500'}`}>
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Check-in</p>
                                                <p className="font-bold text-slate-700 text-sm">
                                                    {checkIn ? checkIn.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white p-2 rounded-lg flex items-center gap-2 border border-slate-100">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isEarly ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'}`}>
                                                <LogOut size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Check-out</p>
                                                <p className="font-bold text-slate-700 text-sm">
                                                    {checkOut ? checkOut.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa về'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* List Requests - NEW SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Lịch sử giải trình / Yêu cầu
                </h3>

                {requests.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-400 font-medium text-sm">Chưa có yêu cầu nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{getRequestTypeLabel(req.type)}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {req.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {getRequestStatusBadge(req.status)}
                                    <p className="text-[10px] text-slate-400 mt-1 max-w-[100px] truncate italic">"{req.reason}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
