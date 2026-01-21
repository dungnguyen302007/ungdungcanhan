import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
    generateCalendarDays,
    formatDateKey,
    getDayStatus,
    isCurrentMonth,
    isToday,
    isWeekend,
    getMonthName,
    getWeekdayNames
} from '../../utils/calendarUtils';
import { DayDetailModal } from './DayDetailModal';

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

export const AttendanceCalendar: React.FC = () => {
    const { user } = useAuthStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceMap, setAttendanceMap] = useState<Record<string, DailyAttendance>>({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    useEffect(() => {
        fetchMonthAttendance();
    }, [user, currentYear, currentMonth]);

    const fetchMonthAttendance = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
            const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

            const q = query(
                collection(db, 'attendance_days'),
                where('userId', '==', user.uid),
                where('date', '>=', startDate),
                where('date', '<=', endDate)
            );

            const snapshot = await getDocs(q);
            const map: Record<string, DailyAttendance> = {};
            snapshot.forEach(doc => {
                const data = doc.data() as DailyAttendance;
                map[data.date] = data;
            });

            setAttendanceMap(map);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleDayClick = (date: Date) => {
        if (!isCurrentMonth(date, currentMonth)) return;
        setSelectedDay(date);
    };

    const calendarDays = generateCalendarDays(currentYear, currentMonth);
    const weekdays = getWeekdayNames();

    // Calculate stats (FIXED)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count only PAST workdays (excluding weekends and future dates)
    let totalPastWorkdays = 0;
    for (let i = 1; i <= new Date(currentYear, currentMonth + 1, 0).getDate(); i++) {
        const date = new Date(currentYear, currentMonth, i);
        date.setHours(0, 0, 0, 0);

        // Only count if: not weekend AND not future AND is current month
        if (!isWeekend(date) && date <= today && date.getMonth() === currentMonth) {
            totalPastWorkdays++;
        }
    }

    const presentDays = Object.values(attendanceMap).filter(r => r.status === 'present').length;
    const lateDays = Object.values(attendanceMap).filter(r => r.status === 'late' || r.status === 'late-early').length;
    const totalAttendedDays = Object.keys(attendanceMap).length;
    const absentDays = totalPastWorkdays - totalAttendedDays;


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-700 border-green-200';
            case 'late': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'early': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'late-early': return 'bg-red-100 text-red-700 border-red-200';
            case 'absent': return 'bg-red-50 text-red-400 border-red-100';
            case 'weekend': return 'bg-slate-50 text-slate-300';
            case 'future': return 'bg-slate-50 text-slate-400';
            default: return 'bg-white text-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-slate-500 mt-4">Đang tải lịch...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-blue-500" />
                        {getMonthName(currentMonth)} {currentYear}
                    </h2>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-xs">
                    <span className="text-slate-600">
                        <strong className="text-blue-600">{totalAttendedDays}</strong> ngày đi làm
                    </span>
                    <span className="text-slate-600">
                        <strong className="text-amber-600">{lateDays}</strong> trễ
                    </span>
                    <span className="text-slate-600">
                        <strong className="text-red-600">{absentDays}</strong> vắng
                    </span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekdays.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-slate-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((date, idx) => {
                        const dateKey = formatDateKey(date);
                        const record = attendanceMap[dateKey];
                        const status = getDayStatus(date, record);
                        const isCurrentMonthDay = isCurrentMonth(date, currentMonth);
                        const isTodayDate = isToday(date);

                        return (
                            <button
                                key={idx}
                                onClick={() => handleDayClick(date)}
                                disabled={!isCurrentMonthDay || status === 'weekend' || status === 'future'}
                                className={`
                                    aspect-square p-2 rounded-xl border-2 font-bold text-sm
                                    transition-all hover:shadow-md
                                    ${!isCurrentMonthDay ? 'opacity-30' : ''}
                                    ${isTodayDate ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                    ${getStatusColor(status)}
                                    ${status === 'weekend' || status === 'future' ? 'cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    <span>{date.getDate()}</span>
                                    {record && (
                                        <span className="text-[10px] mt-1">
                                            {record.details?.totalWorkHours || 0}h
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                        <span className="text-slate-600">Đúng giờ</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></div>
                        <span className="text-slate-600">Đi trễ</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-50 border border-red-100"></div>
                        <span className="text-slate-600">Vắng</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200"></div>
                        <span className="text-slate-600">Nghỉ/Chưa đến</span>
                    </div>
                </div>
            </div>

            {/* Day Detail Modal */}
            {selectedDay && (
                <DayDetailModal
                    date={selectedDay}
                    attendance={attendanceMap[formatDateKey(selectedDay)]}
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </div>
    );
};
