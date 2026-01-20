import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Clock, CheckCircle2, LogOut } from 'lucide-react';

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

export const AttendanceHistory: React.FC = () => {
    const { user } = useAuthStore();
    const [records, setRecords] = useState<DailyAttendance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                // Fetch from new collection 'attendance_days'
                const q = query(
                    collection(db, 'attendance_days'),
                    where('userId', '==', user.uid),
                    orderBy('date', 'desc'),
                    limit(7) // Last 7 days
                );

                const snapshot = await getDocs(q);
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
    }, [user]);

    if (loading) return <div className="text-center py-4 text-slate-400">Đang tải lịch sử...</div>;

    if (records.length === 0) return (
        <div className="text-center py-8 bg-slate-50 rounded-2xl">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 font-medium">Chưa có dữ liệu chấm công</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Bảng công gần đây
            </h3>

            <div className="space-y-4">
                {records.map(record => {
                    const checkIn = record.checkInTime?.toDate ? record.checkInTime.toDate() : null;
                    const checkOut = record.checkOutTime?.toDate ? record.checkOutTime.toDate() : null;
                    const isLate = record.details?.lateMinutes > 0;
                    const isEarly = record.details?.earlyLeaveMinutes > 0;

                    return (
                        <div key={record.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
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
        </div>
    );
};
