import React, { useEffect, useState } from 'react';
import { X, Clock, CheckCircle2, LogOut, AlertCircle, MapPin, FileText, Briefcase } from 'lucide-react';
import { getGoogleMapsLink } from '../../utils/locationUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import type { DailyAttendance, AttendanceRequest } from '../../types';
import { getWorkDayStatus } from '../../utils/attendanceUtils';

interface DayDetailModalProps {
    date: Date;
    attendance?: DailyAttendance;
    onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ date, attendance, onClose }) => {
    const { user } = useAuthStore();
    const userId = user?.uid;
    const checkIn = attendance?.checkInTime?.toDate ? attendance.checkInTime.toDate() : null;
    const checkOut = attendance?.checkOutTime?.toDate ? attendance.checkOutTime.toDate() : null;
    const [requests, setRequests] = useState<AttendanceRequest[]>([]);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!userId) return;
            // Handle date offset timezone issues 
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            const dateStr = localDate.toISOString().split('T')[0];

            const q = query(
                collection(db, 'attendance_requests'),
                where('userId', '==', userId),
                where('date', '==', dateStr)
            );
            const snap = await getDocs(q);
            const fetchedRequests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRequest));
            setRequests(fetchedRequests);
        };
        fetchRequests();
    }, [date, userId]);

    const workDayStatus = getWorkDayStatus(attendance, requests);

    const getRequestStatusColor = (status: string) => {
        if (status === 'approved') return 'bg-green-100 text-green-700 border-green-200';
        if (status === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-amber-100 text-amber-700 border-amber-200';
    };

    const getRequestStatusText = (status: string) => {
        if (status === 'approved') return 'Đã được duyệt';
        if (status === 'rejected') return 'Bị từ chối';
        return 'Đang chờ duyệt';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">
                            {date.toLocaleDateString('vi-VN', { weekday: 'long' })}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                            {date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                {attendance ? (
                    <div className="space-y-4">

                        {/* Status / Request Info */}
                        {requests.length > 0 && requests.map(req => (
                            <div key={req.id} className={`p-4 rounded-xl border flex items-center gap-3 ${getRequestStatusColor(req.status)}`}>
                                <FileText className="w-5 h-5" />
                                <div>
                                    <p className="text-xs font-bold uppercase">Yêu cầu giải trình</p>
                                    <p className="font-bold text-sm">
                                        {getRequestStatusText(req.status)}
                                    </p>
                                    <p className="text-xs mt-1 opacity-80 line-clamp-1">Lý do: {req.reason}</p>
                                </div>
                            </div>
                        ))}

                        {/* Note in Attendance */}
                        {attendance.note && (
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-800 text-sm flex items-start gap-2">
                                <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{attendance.note}</span>
                            </div>
                        )}

                        {/* Check-in */}
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-600 uppercase">Check-in</p>
                                    <p className="text-lg font-black text-slate-900">
                                        {checkIn ? checkIn.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                </div>
                            </div>
                            {attendance.details?.lateMinutes > 0 && (
                                <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="font-bold">Trễ {attendance.details?.lateMinutes} phút</span>
                                </div>
                            )}
                        </div>

                        {/* Check-out */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <LogOut className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase">Check-out</p>
                                    <p className="text-lg font-black text-slate-900">
                                        {checkOut ? checkOut.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa về'}
                                    </p>
                                </div>
                            </div>
                            {attendance.details?.earlyLeaveMinutes > 0 && (
                                <div className="mt-2 flex items-center gap-2 text-orange-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="font-bold">Về sớm {attendance.details?.earlyLeaveMinutes} phút</span>
                                </div>
                            )}
                        </div>

                        {/* Total hours & Work Day Status */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    <p className="text-xs font-bold text-slate-500 uppercase">Tổng giờ</p>
                                </div>
                                <p className="text-2xl font-black text-slate-900">
                                    {attendance.details?.totalWorkHours || 0}h
                                </p>
                            </div>

                            {/* WORK DAY STATUS */}
                            <div className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center ${workDayStatus.color} ${workDayStatus.borderColor}`}>
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Briefcase className={`w-4 h-4 ${workDayStatus.textColor}`} />
                                    <p className={`text-xs font-bold uppercase ${workDayStatus.textColor}`}>Công</p>
                                </div>
                                <p className={`text-2xl font-black ${workDayStatus.textColor} leading-none`}>
                                    {workDayStatus.credit}
                                </p>
                                <p className={`text-[10px] uppercase font-bold mt-1 ${workDayStatus.textColor} opacity-80`}>
                                    {workDayStatus.label}
                                </p>
                            </div>
                        </div>


                        {/* Location Info */}
                        {(attendance.checkInLocation || attendance.checkOutLocation) && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    <p className="text-sm font-bold text-slate-600">Thông tin vị trí</p>
                                </div>
                                {attendance.checkInLocation && (
                                    <div className="text-xs text-slate-600 mb-2">
                                        <strong>Check-in:</strong>{' '}
                                        <span className={attendance.checkInLocation.isWithinRadius ? 'text-green-600' : 'text-red-600'}>
                                            {attendance.checkInLocation.distanceFromOffice}m từ văn phòng
                                        </span>
                                        {' '}|
                                        <a
                                            href={getGoogleMapsLink(attendance.checkInLocation.latitude, attendance.checkInLocation.longitude)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline ml-1"
                                        >
                                            Xem bản đồ
                                        </a>
                                    </div>
                                )}
                                {attendance.checkOutLocation && (
                                    <div className="text-xs text-slate-600">
                                        <strong>Check-out:</strong>{' '}
                                        <span className={attendance.checkOutLocation.isWithinRadius ? 'text-green-600' : 'text-red-600'}>
                                            {attendance.checkOutLocation.distanceFromOffice}m từ văn phòng
                                        </span>
                                        {' '}|
                                        <a
                                            href={getGoogleMapsLink(attendance.checkOutLocation.latitude, attendance.checkOutLocation.longitude)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline ml-1"
                                        >
                                            Xem bản đồ
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.length > 0 && requests.map(req => (
                            <div key={req.id} className={`p-4 rounded-xl border flex items-center gap-3 ${getRequestStatusColor(req.status)}`}>
                                <FileText className="w-5 h-5" />
                                <div>
                                    <p className="text-xs font-bold uppercase">Yêu cầu giải trình</p>
                                    <p className="font-bold text-sm">
                                        {getRequestStatusText(req.status)}
                                    </p>
                                    <p className="text-xs mt-1 opacity-80 line-clamp-1">Lý do: {req.reason}</p>
                                </div>
                            </div>
                        ))}

                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <p className="text-slate-900 font-bold text-lg">Không có dữ liệu chấm công</p>
                            <p className="text-slate-500 text-sm mt-2">Bạn chưa chấm công vào ngày này</p>
                        </div>
                    </div>
                )}

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};
