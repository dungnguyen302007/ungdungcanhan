import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Clock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WorkConfig {
    START_TIME: string;
    END_TIME: string;
    LATE_BUFFER_MINUTES: number;
    EARLY_LEAVE_BUFFER_MINUTES: number;
    LUNCH_BREAK_HOURS: number;
}

const DEFAULT_CONFIG: WorkConfig = {
    START_TIME: '08:00',
    END_TIME: '17:30',
    LATE_BUFFER_MINUTES: 15,
    EARLY_LEAVE_BUFFER_MINUTES: 0,
    LUNCH_BREAK_HOURS: 1.5,
};

export const WorkHoursSettings: React.FC = () => {
    const [config, setConfig] = useState<WorkConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const docRef = doc(db, 'settings', 'work_config');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setConfig({ ...DEFAULT_CONFIG, ...docSnap.data() } as WorkConfig); // Merge default
            }
        } catch (error) {
            console.error('Error loading work config:', error);
            setMessage({ type: 'error', text: 'Không thể tải cấu hình giờ làm việc.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await setDoc(doc(db, 'settings', 'work_config'), config);
            setMessage({ type: 'success', text: 'Đã lưu cấu hình giờ làm việc thành công!' });
        } catch (error) {
            console.error('Error saving work config:', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu cấu hình.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Đang tải cấu hình...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Cấu hình Giờ làm việc
                </h3>
                <p className="text-sm text-slate-500">
                    Thiết lập thời gian làm việc chuẩn để tính toán đi muộn/về sớm tự động.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Giờ Bắt Đầu (Check-in)</label>
                    <input
                        type="time"
                        value={config.START_TIME}
                        onChange={(e) => setConfig({ ...config, START_TIME: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                    <p className="text-xs text-slate-400">Giờ bắt đầu tính công buổi sáng</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Giờ Kết Thúc (Check-out)</label>
                    <input
                        type="time"
                        value={config.END_TIME}
                        onChange={(e) => setConfig({ ...config, END_TIME: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                    <p className="text-xs text-slate-400">Giờ kết thúc ngày làm việc</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Cho phép đi muộn (phút)</label>
                    <input
                        type="number"
                        min="0"
                        value={config.LATE_BUFFER_MINUTES}
                        onChange={(e) => setConfig({ ...config, LATE_BUFFER_MINUTES: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                    <p className="text-xs text-slate-400">Số phút được phép trễ trước khi tính là đi muộn</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Cho phép về sớm (phút)</label>
                    <input
                        type="number"
                        min="0"
                        value={config.EARLY_LEAVE_BUFFER_MINUTES}
                        onChange={(e) => setConfig({ ...config, EARLY_LEAVE_BUFFER_MINUTES: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                    <p className="text-xs text-slate-400">Số phút được phép về trước giờ quy định</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Thời gian nghỉ trưa (giờ)</label>
                    <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={config.LUNCH_BREAK_HOURS}
                        onChange={(e) => setConfig({ ...config, LUNCH_BREAK_HOURS: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                    <p className="text-xs text-slate-400">Sẽ được trừ vào tổng giờ làm nếu làm việc cả ngày</p>
                </div>
            </div>

            {/* Preview Calculation */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-blue-800">Tổng giờ công chuẩn / ngày</h4>
                    <p className="text-xs text-blue-600">Check-out - Check-in - Nghỉ trưa</p>
                </div>
                <div className="text-2xl font-black text-blue-600">
                    {(() => {
                        const start = new Date(`2000-01-01T${config.START_TIME}`);
                        const end = new Date(`2000-01-01T${config.END_TIME}`);
                        let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        if (diff > 0) {
                            diff -= config.LUNCH_BREAK_HOURS;
                        }
                        return Math.max(0, diff).toFixed(1);
                    })()} giờ
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Lưu Cấu Hình
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
