import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Clock, CheckCircle2 } from 'lucide-react';

interface AttendanceLog {
    id: string;
    timestamp: any;
    type: string;
    method: string;
}

export const AttendanceHistory: React.FC = () => {
    const { user } = useAuthStore();
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, 'attendance_logs'),
                    where('userId', '==', user.uid),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                );

                const snapshot = await getDocs(q);
                const fetchedLogs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as AttendanceLog[];

                setLogs(fetchedLogs);
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [user]);

    if (loading) return <div className="text-center py-4 text-slate-400">Đang tải lịch sử...</div>;

    if (logs.length === 0) return (
        <div className="text-center py-8 bg-slate-50 rounded-2xl">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 font-medium">Chưa có lịch sử chấm công</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Lịch sử chấm công gần đây
            </h3>

            <div className="space-y-3">
                {logs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">
                                    {log.type === 'check-in' ? 'Check-in' : 'Check-out'}
                                </p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                    {log.method}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900">
                                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Wait...'}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }) : ''}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
