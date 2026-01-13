import React from 'react';
import { Trash2, AlertCircle, Database } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';

export const SettingsApp: React.FC = () => {
    const { resetData } = useStore();

    const handleReset = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác.')) {
            resetData();
            // Clear localStorage specifically to be safe
            localStorage.removeItem('expense-tracker-storage');
            toast.success('Đã xóa dữ liệu thành công!');
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    return (
        <div className="flex-1 p-4 lg:p-10 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Cài đặt</h2>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Dữ liệu</h3>
                            <p className="text-sm text-slate-500 font-medium">Quản lý dữ liệu lưu trữ trên thiết bị</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-slate-400 shrink-0" />
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-slate-700">Khôi phục cài đặt gốc</h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Xóa toàn bộ giao dịch và thiết lập lại danh mục mặc định.
                                        Sử dụng tính năng này nếu bạn gặp lỗi hiển thị số liệu (như hiển thị vô cực hoặc NaN).
                                    </p>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa toàn bộ dữ liệu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
