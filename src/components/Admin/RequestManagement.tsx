import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Check, X, Calendar, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAttendanceConfig } from '../../utils/attendanceUtils';

interface Request {
    id: string;
    userId: string;
    displayName: string;
    date: string;
    type: 'late_in' | 'early_out' | 'missing_in' | 'missing_out' | 'remote_work' | 'leave';
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
}

export const RequestManagement: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let q;
            if (filter === 'pending') {
                q = query(
                    collection(db, 'attendance_requests'),
                    where('status', '==', 'pending')
                    // orderBy('createdAt', 'desc') // Requires index, temporarily removed
                );
            } else {
                q = query(
                    collection(db, 'attendance_requests')
                    // orderBy('createdAt', 'desc')
                );
            }

            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Request));

            // Client-side sort
            data.sort((a, b) => {
                const tA = a.createdAt?.seconds || 0;
                const tB = b.createdAt?.seconds || 0;
                return tB - tA;
            });

            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (req: Request) => {
        if (!confirm(`Bạn có chắc muốn DUYỆT yêu cầu này của ${req.displayName}?`)) return;

        try {
            // 1. Update Request Status
            await updateDoc(doc(db, 'attendance_requests', req.id), {
                status: 'approved',
                processedAt: serverTimestamp()
            });

            // 2. Update/Create Attendance Record
            const recordId = `${req.userId}_${req.date}`; // e.g. user123_2023-10-25
            const recordRef = doc(db, 'attendance_days', recordId);
            // const recordSnap = await getDoc(recordRef); // Unused

            const config = await getAttendanceConfig();

            // Logic depending on type
            let updateData: any = {
                status: 'present', // Force present by default for most cases
                note: `Đã duyệt yêu cầu: ${req.reason}`
            };

            const [startH, startM] = config.START_TIME.split(':').map(Number);
            const [endH, endM] = config.END_TIME.split(':').map(Number);

            // Construct standard times
            const standardCheckIn = new Date(req.date);
            standardCheckIn.setHours(startH, startM, 0);

            const standardCheckOut = new Date(req.date);
            standardCheckOut.setHours(endH, endM, 0);

            // 1. Missing Check-in: Only update checkInTime -> Standard Start Time
            if (req.type === 'missing_in') {
                updateData = {
                    ...updateData,
                    checkInTime: standardCheckIn,
                    'details.lateMinutes': 0, // Assume on time if approved
                };
            }

            // 2. Missing Check-out: Only update checkOutTime -> Standard End Time
            if (req.type === 'missing_out') {
                updateData = {
                    ...updateData,
                    checkOutTime: standardCheckOut,
                    'details.earlyLeaveMinutes': 0
                };
            }

            // 3. Late In (Giải trình đi muộn): Keep actual check-in time, but reset lateMinutes
            if (req.type === 'late_in') {
                updateData = {
                    ...updateData,
                    'details.lateMinutes': 0,
                    note: `Đã duyệt giải trình đi muộn: ${req.reason}`
                };
            }

            // 4. Early Out (Giải trình về sớm): Keep actual check-out time, but reset earlyMinutes
            if (req.type === 'early_out') {
                updateData = {
                    ...updateData,
                    'details.earlyLeaveMinutes': 0,
                    note: `Đã duyệt giải trình về sớm: ${req.reason}`
                };
            }

            // 5. Remote / Full Day Work: Set both times
            if (req.type === 'remote_work') {
                updateData = {
                    ...updateData,
                    checkInTime: standardCheckIn,
                    checkOutTime: standardCheckOut,
                    details: {
                        lateMinutes: 0,
                        earlyLeaveMinutes: 0,
                        totalWorkHours: 8 // Standard day
                    }
                };
            }

            // 6. Leave
            if (req.type === 'leave') {
                updateData = {
                    status: 'leave',
                    note: `Nghỉ phép: ${req.reason}`,
                    details: {
                        lateMinutes: 0,
                        earlyLeaveMinutes: 0,
                        totalWorkHours: 0
                    }
                };
            }

            // Recalculate Total Work Hours if check-in/out changed (simplified)
            // Ideally we should pull existing data and recalc, but for simplicity:
            // If we set checkIn/Out, we assume standard productivity or rely on next update.
            // For now, let's just merge.

            // Merge update
            await setDoc(recordRef, {
                id: recordId,
                userId: req.userId,
                date: req.date,
                ...updateData
            }, { merge: true }); // merge ensure we don't wipe other data if exists

            toast.success("Đã duyệt yêu cầu thành công!");
            fetchRequests(); // Refresh

        } catch (error) {
            console.error("Error approving:", error);
            toast.error("Có lỗi xảy ra khi duyệt.");
        }
    };

    const handleReject = async (req: Request) => {
        if (!confirm("Từ chối yêu cầu này?")) return;
        try {
            await updateDoc(doc(db, 'attendance_requests', req.id), {
                status: 'rejected',
                processedAt: serverTimestamp()
            });
            toast.success("Đã từ chối yêu cầu.");
            fetchRequests();
        } catch (error) {
            toast.error("Lỗi khi từ chối.");
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'late_in': return 'bg-orange-100 text-orange-700';
            case 'early_out': return 'bg-amber-100 text-amber-700';
            case 'missing_in':
            case 'missing_out': return 'bg-purple-100 text-purple-700';
            case 'remote_work': return 'bg-blue-100 text-blue-700';
            case 'leave': return 'bg-slate-100 text-slate-700';
            default: return 'bg-gray-100 text-gray-700';
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Quản Lý Yêu Cầu / Giải Trình</h3>
                    <p className="text-sm text-slate-500">Duyệt các đơn từ, lý do đi muộn của nhân viên</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        Chờ duyệt
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        Tất cả
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Check className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 font-medium">Không có yêu cầu nào.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between md:justify-start gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{req.displayName}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" /> {req.date}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(req.type)}`}>
                                        {getTypeLabel(req.type)}
                                    </span>
                                    {req.status !== 'pending' && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {req.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                        </span>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-sm text-slate-700 italic">"{req.reason}"</p>
                                </div>
                            </div>

                            {req.status === 'pending' && (
                                <div className="flex md:flex-col gap-2 justify-center shrink-0 min-w-[120px]">
                                    <button
                                        onClick={() => handleApprove(req)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Check className="w-4 h-4" /> Duyệt
                                    </button>
                                    <button
                                        onClick={() => handleReject(req)}
                                        className="flex-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200"
                                    >
                                        <X className="w-4 h-4" /> Từ chối
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
