import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface OverviewCardsProps {
    balance: number;
    income: number;
    expense: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ balance, income, expense }) => {
    return (
        <div className="space-y-6">
            {/* Primary Balance Card */}
            <div className="balance-card-gradient rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group transition-all duration-500">
                {/* Subtle Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                    <span className="text-white/80 text-sm font-medium">Số dư khả dụng</span>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tight">
                        {formatCurrency(balance)}
                    </h3>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-5 flex flex-col items-center gap-1.5 border border-white/10">
                        <div className="flex items-center gap-1.5 text-white text-[11px] font-black tracking-wider opacity-80">
                            <TrendingUp className="w-4 h-4" strokeWidth={3} /> TỔNG THU
                        </div>
                        <span className="text-xl font-black">{formatCurrency(income).replace('₫', 'k')}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-5 flex flex-col items-center gap-1.5 border border-white/10">
                        <div className="flex items-center gap-1.5 text-white text-[11px] font-black tracking-wider opacity-80">
                            <TrendingDown className="w-4 h-4" strokeWidth={3} /> TỔNG CHI
                        </div>
                        <span className="text-xl font-black">{formatCurrency(expense).replace('₫', 'k')}</span>
                    </div>
                </div>
            </div>

            {/* Warning Message Match */}
            {(expense > income * 0.8 && income > 0) && (
                <div className="bg-[#FEF1F1] rounded-[2rem] p-6 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FEE2E2] flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-8 h-8 text-[#EF4444]" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-extrabold text-[#991B1B] text-base text-left">Cảnh báo chi tiêu</h4>
                        <p className="text-[#B91C1C] text-sm leading-snug font-medium opacity-80 text-left">
                            Chi tiêu tháng này đã vượt 80% thu nhập! Hãy cân nhắc cắt giảm các khoản không cần thiết.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
