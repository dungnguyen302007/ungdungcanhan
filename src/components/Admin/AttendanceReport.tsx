import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, UserX, Clock, CheckCircle2, FileDown } from 'lucide-react';
import { MonthlyAttendanceReport } from './MonthlyAttendanceReport';

interface ReportRow {
    userId: string;
    displayName: string;
    email: string;
    photoURL?: string;
    checkInTime?: Date;
    checkOutTime?: Date;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    totalWorkHours: number;
    status: 'present' | 'late' | 'absent' | 'leave'; // absent if no record
}

export const AttendanceReport: React.FC = () => {
    // Default to today
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
    const [reportData, setReportData] = useState<ReportRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 });

    useEffect(() => {
        if (viewMode === 'day') {
            fetchDailyReport();
        }
    }, [selectedDate, viewMode]);

    const fetchDailyReport = async () => {
        setLoading(true);
        try {
            // 1. Fetch ALL Users
            const usersSnap = await getDocs(collection(db, 'users'));
            const users = usersSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 2. Fetch Attendance for Selected Date
            // Query attendance_days where date == selectedDate
            const attendanceQuery = query(
                collection(db, 'attendance_days'),
                where('date', '==', selectedDate)
            );
            const attendanceSnap = await getDocs(attendanceQuery);
            const attendanceMap = new Map();

            attendanceSnap.docs.forEach(doc => {
                const data = doc.data();
                attendanceMap.set(data.userId, data);
            });

            // 3. Merge Data
            let countPresent = 0;
            let countLate = 0;
            let countAbsent = 0;

            const mergedData: ReportRow[] = users.map((user: any) => {
                const record = attendanceMap.get(user.id);

                let status: ReportRow['status'] = 'absent';
                let checkIn = undefined;
                let checkOut = undefined;
                let late = 0;
                let early = 0;
                let total = 0;

                if (record) {
                    checkIn = record.checkInTime?.toDate();
                    checkOut = record.checkOutTime?.toDate();
                    late = record.details?.lateMinutes || 0;
                    early = record.details?.earlyLeaveMinutes || 0;
                    total = record.details?.totalWorkHours || 0;

                    if (late > 0) {
                        status = 'late';
                        countLate++;
                        countPresent++; // Late is still present
                    } else {
                        status = 'present';
                        countPresent++;
                    }
                } else {
                    countAbsent++;
                }

                return {
                    userId: user.id,
                    displayName: user.displayName || 'Không tên',
                    email: user.email,
                    photoURL: user.photoURL,
                    checkInTime: checkIn,
                    checkOutTime: checkOut,
                    lateMinutes: late,
                    earlyLeaveMinutes: early,
                    totalWorkHours: total,
                    status
                };
            });

            setReportData(mergedData);
            setStats({ present: countPresent, late: countLate, absent: countAbsent });

        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date?: Date) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">
                        {viewMode === 'day' ? 'Báo Cáo Chấm Công Ngày' : 'Bảng Chấm Công Tháng'}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {viewMode === 'day' ? 'Xem chi tiết giờ giấc làm việc của nhân viên' : 'Tổng hợp công và chuyên cần theo tháng'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-bold">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Theo Ngày
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Theo Tháng
                        </button>
                    </div>

                    {viewMode === 'day' && (
                        <>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm hover:border-blue-300 transition-all cursor-pointer"
                                />
                            </div>
                            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Xuất Excel (Coming soon)">
                                <FileDown className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {viewMode === 'month' ? (
                <MonthlyAttendanceReport />
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Hiện diện</p>
                                <p className="text-2xl font-black text-green-700">{stats.present}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600">Đi muộn</p>
                                <p className="text-2xl font-black text-orange-700">{stats.late}</p>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Vắng mặt</p>
                                <p className="text-2xl font-black text-slate-700">{stats.absent}</p>
                            </div>
                            <div className="p-2 bg-slate-200 rounded-lg">
                                <UserX className="w-6 h-6 text-slate-500" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                        <th className="p-4">Nhân viên</th>
                                        <th className="p-4">Trạng thái</th>
                                        <th className="p-4">Check-in</th>
                                        <th className="p-4">Check-out</th>
                                        <th className="p-4 text-center">Tổng giờ</th>
                                        <th className="p-4 text-right">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                                Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                    ) : reportData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    ) : (
                                        reportData.map((row) => (
                                            <tr key={row.userId} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                            {row.photoURL ? (
                                                                <img src={row.photoURL} alt={row.displayName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-sm font-bold text-slate-500">{row.displayName?.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{row.displayName}</p>
                                                            <p className="text-xs text-slate-500">{row.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {row.status === 'absent' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                            Vắng mặt
                                                        </span>
                                                    ) : row.status === 'late' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200">
                                                            Đi muộn
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600 border border-green-200">
                                                            Đúng giờ
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`p-4 font-medium text-sm ${row.lateMinutes > 0 ? 'text-orange-600' : 'text-slate-700'}`}>
                                                    {formatTime(row.checkInTime)}
                                                </td>
                                                <td className={`p-4 font-medium text-sm ${row.earlyLeaveMinutes > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                    {formatTime(row.checkOutTime)}
                                                </td>
                                                <td className="p-4 text-center font-bold text-slate-700">
                                                    {row.totalWorkHours > 0 ? `${row.totalWorkHours}h` : '-'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex flex-col items-end gap-1 text-xs">
                                                        {row.lateMinutes > 0 && (
                                                            <span className="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                                                                Trễ {row.lateMinutes}p
                                                            </span>
                                                        )}
                                                        {row.earlyLeaveMinutes > 0 && (
                                                            <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                                                                Về sớm {row.earlyLeaveMinutes}p
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
