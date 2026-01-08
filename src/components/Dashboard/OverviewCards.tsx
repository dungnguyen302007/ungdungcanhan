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
            <div className="balance-card-gradient rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group transition-all hover:scale-[1.01] duration-500">
                {/* Decorative Pattern / Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                    <span className="text-blue-100 text-sm font-medium">Số dư khả dụng</span>
                    <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        {formatCurrency(balance)}
                    </h3>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4 mt-10">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 flex flex-col items-center gap-1 border border-white/10">
                        <div className="flex items-center gap-2 text-blue-100 text-[10px] font-bold uppercase tracking-wider">
                            <TrendingUp className="w-3 h-3" /> TỔNG THU
                        </div>
                        <span className="text-lg font-bold">{formatCurrency(income).replace('₫', 'k')}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 flex flex-col items-center gap-1 border border-white/10">
                        <div className="flex items-center gap-2 text-blue-100 text-[10px] font-bold uppercase tracking-wider">
                            <TrendingDown className="w-3 h-3" /> TỔNG CHI
                        </div>
                        <span className="text-lg font-bold">{formatCurrency(expense).replace('₫', 'k')}</span>
                    </div>
                </div>
            </div>

            {/* Warning Message if any */}
            {(expense > income * 0.8) && (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                        <span className="text-xl font-bold">⚠️</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-red-900 text-sm mb-1 text-left">Cảnh báo chi tiêu</h4>
                        <p className="text-red-700/80 text-xs leading-relaxed text-left">
                            Chi tiêu tháng này đã vượt 80% thu nhập! Hãy cân nhắc cắt giảm các khoản không cần thiết.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
