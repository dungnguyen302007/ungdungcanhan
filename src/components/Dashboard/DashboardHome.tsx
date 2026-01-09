import React from 'react';
import { Search, Bell, Calendar, Plus, Activity, CloudSun, Music } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { calculateTotals, getMonthTransactions } from '../../utils/analytics';

export const DashboardHome: React.FC = () => {
    // Safe data access
    const store = useStore();
    const transactions = store?.transactions || [];
    const notifications = store?.notifications || [];

    // Safe calculation
    let totals = { income: 0, expense: 0, balance: 0 };
    try {
        const monthTrans = getMonthTransactions(transactions, new Date());
        totals = calculateTotals(monthTrans);
    } catch (e) {
        console.error("Error:", e);
    }

    // Weather state
    const [weather, setWeather] = React.useState<{ temp: string, description: string } | null>(null);

    React.useEffect(() => {
        const loadWeather = async () => {
            // Import dynamically to avoid circular dependencies if any, or just use the import
            const { fetchWeather } = await import('../../utils/weather');
            const data = await fetchWeather();
            if (data) setWeather(data);
        };
        loadWeather();
    }, []);

    const unreadCount = notifications.filter(n => n && !n.isRead).length;
    const balance = totals.income - totals.expense;
    const spendPercent = Math.round((totals.expense / (totals.income || 1)) * 100);

    return (
        <div className="flex-1 min-h-screen bg-[#F8FAFC] p-4 lg:p-10 space-y-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="text-left space-y-1">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 flex items-center gap-3">
                        Chào buổi sáng, Anh Dũng
                        <span className="text-4xl">👋</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase">Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 relative">
                            <Bell className="w-5 h-5 text-slate-600" />
                            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </button>
                        <button className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                            <Calendar className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Finance Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">NGÂN SÁCH</span>
                            <h3 className="text-2xl font-black text-slate-900 mt-3">Tài chính cá nhân</h3>
                        </div>
                        <div className="text-right bg-slate-50 p-4 rounded-2xl">
                            <p className="text-xs text-slate-500 font-bold">SỐ DƯ</p>
                            <p className="text-3xl font-black text-slate-900">{balance.toLocaleString()} ₫</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Tiến độ chi tiêu</p>
                                    <p className="text-xs text-slate-500">Dựa trên thu nhập tháng</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-blue-500">{spendPercent}%</span>
                        </div>

                        <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                                style={{ width: `${Math.min(100, spendPercent)}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-600">Đã chi: {totals.expense.toLocaleString()} đ</span>
                            <span className="text-slate-600">Còn lại: {balance.toLocaleString()} đ</span>
                        </div>
                    </div>
                </div>

                {/* Task Widget */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">ƯU TIÊN</span>
                            <h4 className="text-lg font-black text-slate-900 mt-2">Công việc</h4>
                        </div>
                        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <span className="font-black">!</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 mb-4">
                        <p className="text-xs text-amber-600 font-bold mb-1">THỜI HẠN</p>
                        <p className="text-3xl font-black text-amber-700">03:42:15</p>
                        <p className="text-xs text-amber-600 font-bold mt-2">Hoàn thiện UI</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs text-slate-400 font-bold">NHIỆM VỤ (2)</p>
                        {['Xem báo cáo Q3', 'Họp khách hàng', 'Thiết kế V2'].map((task, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                                <div className={`w-5 h-5 rounded border-2 ${i === 2 ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}></div>
                                <p className={`text-sm font-bold ${i === 2 ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task}</p>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-500 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-bold">Thêm nhiệm vụ</span>
                    </button>
                </div>

                {/* Weather */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl p-6 text-white shadow-xl h-48 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">THỜI TIẾT</span>
                            <span className="text-4xl font-black">{weather ? weather.temp : '...'}</span>
                        </div>
                        <h4 className="text-xl font-black mt-3">Thành phố Huế</h4>
                        <div className="mt-4 bg-white/10 p-3 rounded-xl flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold capitalize">{weather ? weather.description : 'Đang cập nhật...'}</p>
                                <p className="text-xs opacity-70">Hôm nay</p>
                            </div>
                            <CloudSun className="w-8 h-8" />
                        </div>
                    </div>
                    <CloudSun className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                </div>

                {/* Health */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-3xl p-6 text-white shadow-xl h-48 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block">SỨC KHỎE</span>
                        <h4 className="text-4xl font-black mt-3">8,432</h4>
                        <p className="text-sm font-bold opacity-80">Bước chân hôm nay</p>
                        <div className="mt-4 space-y-2">
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full w-2/3"></div>
                            </div>
                            <p className="text-xs opacity-70">Mục tiêu: 10,000 bước</p>
                        </div>
                    </div>
                    <Activity className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
                </div>

                {/* Music */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl h-48">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full">GIẢI TRÍ</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                            <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                            <div className="w-1 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3 mt-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Music className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black">Radio Lofi</p>
                            <p className="text-xs text-slate-400">Chill cùng mưa</p>
                        </div>
                        <button className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 rotate-45" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
