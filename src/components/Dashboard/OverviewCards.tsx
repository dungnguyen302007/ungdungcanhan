import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface OverviewCardsProps {
    balance: number;
    income: number;
    expense: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ balance, income, expense }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Tổng quan</h2>

            {/* Primary Balance Card */}
            <div className="balance-card-gradient bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group transition-all hover:scale-[1.01] duration-500 min-h-[220px] flex flex-col justify-between">
                {/* Decorative Pattern / Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-10 -mt-20 blur-3xl group-hover:bg-white/30 transition-all duration-500"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                    <span className="text-blue-100/80 text-xs font-bold uppercase tracking-widest">Số dư khả dụng</span>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-sm">
                        {formatCurrency(balance)}
                    </h3>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex flex-col items-center gap-1 border border-white/20 shadow-inner">
                        <div className="flex items-center gap-1.5 text-blue-50 text-[10px] font-black uppercase tracking-wider">
                            <TrendingUp className="w-3.5 h-3.5 text-green-300" /> TỔNG THU
                        </div>
                        <span className="text-lg font-black tracking-tight">{formatCurrency(income).replace('₫', 'k')}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex flex-col items-center gap-1 border border-white/20 shadow-inner">
                        <div className="flex items-center gap-1.5 text-blue-50 text-[10px] font-black uppercase tracking-wider">
                            <TrendingDown className="w-3.5 h-3.5 text-red-300" /> TỔNG CHI
                        </div>
                        <span className="text-lg font-black tracking-tight">{formatCurrency(expense).replace('₫', 'k')}</span>
                    </div>
                </div>
            </div>

            {/* Warning Message if any */}
            {(expense > income * 0.8 && income > 0) && (
                <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-5 flex items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                        <span className="text-xl">⚠️</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-rose-900 text-sm mb-0.5">Cảnh báo chi tiêu</h4>
                        <p className="text-rose-700/80 text-xs leading-relaxed">
                            Chi tiêu tháng này đã vượt 80% thu nhập! Hãy cân nhắc cắt giảm các khoản không cần thiết.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
