import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateWorkDay } from '../../utils/attendanceUtils';
import type { AttendanceRequest } from '../../types';
import { DayDetailModal } from '../Attendance/DayDetailModal';

interface AttendanceSimple {
    date: string; // YYYY-MM-DD
    status: 'present' | 'late' | 'absent' | 'leave';
    lateMinutes: number;
    earlyLeaveMinutes: number;
    totalWorkHours: number;
    checkInTime?: Date;
    checkOutTime?: Date;
}

interface UserRow {
    userId: string;
    displayName: string;
    photoURL?: string;
    attendance: { [date: string]: AttendanceSimple };
    stats: {
        present: number;
        late: number;
        absent: number;
        totalWorkDays: number; // ADDED: Actual work days based on calculateWorkDay
    };
}

export const MonthlyAttendanceReport: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<UserRow[]>([]);
    const [selectedDay, setSelectedDay] = useState<{ date: Date; userId: string } | null>(null);

    useEffect(() => {
        fetchMonthlyData();
    }, [currentDate]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => {
            const d = new Date(year, month, i + 1);
            return {
                day: i + 1,
                dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
                isWeekend: d.getDay() === 0 || d.getDay() === 6
            };
        });
    };

    const daysInMonth = getDaysInMonth(currentDate);

    const fetchMonthlyData = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            // Format for query string match if needed, or better range query
            // Since ID is userId_YYYY-MM-DD, we can't easily range query on ID.
            // But we have 'date' field.

            // Calculate start and end date of month string
            const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
            const endStr = `${year}-${String(month).padStart(2, '0')}-${daysInMonth.length}`;

            // 1. Fetch Users
            const usersSnap = await getDocs(collection(db, 'users'));
            const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 2. Fetch Attendance
            const q = query(
                collection(db, 'attendance_days'),
                where('date', '>=', startStr),
                where('date', '<=', endStr)
            );
            const attendanceSnap = await getDocs(q);

            // 3. Fetch Attendance Requests (CRITICAL FOR WORK DAY CALC)
            const qRequests = query(
                collection(db, 'attendance_requests'),
                where('date', '>=', startStr),
                where('date', '<=', endStr)
            );
            const requestsSnap = await getDocs(qRequests);

            // Build requests map by userId->date->requests[]
            const requestsMap = new Map<string, Map<string, AttendanceRequest[]>>();
            requestsSnap.docs.forEach(doc => {
                const req = { id: doc.id, ...doc.data() } as AttendanceRequest;
                if (!requestsMap.has(req.userId)) {
                    requestsMap.set(req.userId, new Map());
                }
                const userReqMap = requestsMap.get(req.userId)!;
                if (!userReqMap.has(req.date)) {
                    userReqMap.set(req.date, []);
                }
                userReqMap.get(req.date)!.push(req);
            });

            // 4. Process Data
            const attendanceMap = new Map<string, { [date: string]: AttendanceSimple }>();

            attendanceSnap.docs.forEach(doc => {
                const data = doc.data();
                const userId = data.userId;

                if (!attendanceMap.has(userId)) {
                    attendanceMap.set(userId, {});
                }

                const userRecord = attendanceMap.get(userId)!;

                // Determine simple status
                let status: 'present' | 'late' | 'leave' = 'present';
                if (data.details?.lateMinutes > 0) status = 'late';
                // absent is default if no record

                userRecord[data.date] = {
                    date: data.date,
                    status,
                    lateMinutes: data.details?.lateMinutes || 0,
                    earlyLeaveMinutes: data.details?.earlyLeaveMinutes || 0,
                    totalWorkHours: data.details?.totalWorkHours || 0,
                    checkInTime: data.checkInTime?.toDate(),
                    checkOutTime: data.checkOutTime?.toDate()
                };
            });

            // 5. Build Rows with Work Day Calculation
            const rows: UserRow[] = users.map((user: any) => {
                const userAttendance = attendanceMap.get(user.id) || {};
                const userRequests = requestsMap.get(user.id);

                // Calc stats
                let present = 0;
                let late = 0;
                let totalWorkDays = 0;

                Object.entries(userAttendance).forEach(([date, r]) => {
                    if (r.status === 'late') late++;
                    if (r.status === 'present' || r.status === 'late') present++;

                    // CRITICAL: Calculate work days using request data
                    const dailyRequests = userRequests?.get(date) || [];
                    const attendanceForCalc: any = {
                        id: `${user.id}_${date}`,
                        date,
                        checkInTime: r.checkInTime,
                        checkOutTime: r.checkOutTime,
                        status: r.status as any, // Type workaround
                        details: {
                            lateMinutes: r.lateMinutes,
                            earlyLeaveMinutes: r.earlyLeaveMinutes,
                            totalWorkHours: r.totalWorkHours
                        }
                    };
                    totalWorkDays += calculateWorkDay(attendanceForCalc, dailyRequests);
                });

                return {
                    userId: user.id,
                    displayName: user.displayName || 'User',
                    photoURL: user.photoURL,
                    attendance: userAttendance,
                    stats: {
                        present,
                        late,
                        absent: 0,
                        totalWorkDays // FIXED: Use calculated work days, not just presence count
                    }
                };
            });

            setReportData(rows);

        } catch (error) {
            console.error("Error fetching monthly report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const getCellColor = (data?: AttendanceSimple, isWeekend?: boolean) => {
        if (!data) {
            return isWeekend ? 'bg-slate-100' : 'bg-white';
        }
        if (data.status === 'late') return 'bg-orange-200 text-orange-700 hover:bg-orange-300';
        if (data.totalWorkHours < 4) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'; // Half day?
        return 'bg-green-100 text-green-700 hover:bg-green-200';
    };

    const getCellContent = (data?: AttendanceSimple) => {
        if (!data) return '';
        if (data.status === 'late') return 'Trễ';
        return '✓'; // or check icon
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-800">
                            Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}
                        </h3>
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-green-200 block"></span> Đúng giờ
                        <span className="w-3 h-3 rounded-full bg-orange-200 block ml-2"></span> Đi muộn
                        <span className="w-3 h-3 rounded-full bg-slate-100 block ml-2"></span> Vắng/Nghỉ
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="overflow-x-auto pb-2">
                    <table className="border-collapse w-full min-w-[1000px]">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-20 bg-slate-50 border-b border-r border-slate-200 p-3 text-left w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Nhân viên</span>
                                </th>
                                {daysInMonth.map(d => (
                                    <th key={d.day} className={`p-2 border-b border-r border-slate-200 min-w-[40px] text-center ${d.isWeekend ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-600'}`}>
                                        <div className="text-xs font-bold">{d.day}</div>
                                        <div className="text-[10px] font-normal">{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(d.dateStr).getDay()]}</div>
                                    </th>
                                ))}
                                <th className="p-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 text-center uppercase min-w-[60px]">
                                    Công
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={daysInMonth.length + 2} className="p-10 text-center text-slate-500 italic">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : (
                                reportData.map(row => (
                                    <tr key={row.userId} className="hover:bg-slate-50 transition-colors">
                                        <td className="sticky left-0 z-10 bg-white border-r border-b border-slate-100 p-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                    {row.photoURL ? <img src={row.photoURL} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{row.displayName[0]}</span>}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-medium text-slate-700 text-sm truncate max-w-[120px]">{row.displayName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {daysInMonth.map(d => {
                                            const cellData = row.attendance[d.dateStr];
                                            return (
                                                <td
                                                    key={d.day}
                                                    className={`border-r border-b border-slate-100 p-1 text-center relative group cursor-pointer ${getCellColor(cellData, d.isWeekend)}`}
                                                    title={cellData ? `Vào: ${cellData.checkInTime?.toLocaleTimeString('vi-VN') || '--'} - Ra: ${cellData.checkOutTime?.toLocaleTimeString('vi-VN') || '--'}` : 'Click để xem chi tiết'}
                                                    onClick={() => {
                                                        if (!d.isWeekend) {
                                                            setSelectedDay({
                                                                date: new Date(d.dateStr),
                                                                userId: row.userId
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center justify-center h-8 text-[10px] font-bold">
                                                        {getCellContent(cellData)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="border-b border-slate-100 p-2 text-center font-bold text-blue-600 text-sm">
                                            {row.stats.totalWorkDays}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Day Detail Modal */}
            {selectedDay && (() => {
                const user = reportData.find(r => r.userId === selectedDay.userId);
                const dateKey = selectedDay.date.toISOString().split('T')[0];
                const attendanceData = user?.attendance[dateKey];

                // Convert to DailyAttendance format
                const attendance = attendanceData ? {
                    id: `${selectedDay.userId}_${dateKey}`,
                    date: dateKey,
                    checkInTime: attendanceData.checkInTime,
                    checkOutTime: attendanceData.checkOutTime,
                    status: attendanceData.status as any,
                    details: {
                        lateMinutes: attendanceData.lateMinutes,
                        earlyLeaveMinutes: attendanceData.earlyLeaveMinutes,
                        totalWorkHours: attendanceData.totalWorkHours
                    }
                } : undefined;

                return (
                    <DayDetailModal
                        date={selectedDay.date}
                        attendance={attendance}
                        onClose={() => setSelectedDay(null)}
                    />
                );
            })()}
        </div>
    );
};
