import React from 'react';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';

interface OverviewCardsProps {
    income: number;
    expense: number;
    balance: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ income, expense, balance }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
                title="Số dư hiện tại"
                amount={balance}
                icon={<Wallet className="w-6 h-6 text-white" />}
                gradient="from-violet-500 to-indigo-600"
                shadow="shadow-indigo-200"
            />
            <Card
                title="Tổng thu nhập"
                amount={income}
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                gradient="from-emerald-400 to-emerald-600"
                shadow="shadow-emerald-200"
            />
            <Card
                title="Tổng chi tiêu"
                amount={expense}
                icon={<TrendingDown className="w-6 h-6 text-white" />}
                gradient="from-rose-400 to-rose-600"
                shadow="shadow-rose-200"
            />
        </div>
    );
};

const Card = ({ title, amount, icon, gradient, shadow }: any) => (
    <div className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-transform hover:-translate-y-1 duration-300",
        `bg-gradient-to-br ${gradient} shadow-${shadow}`
    )}>
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-blue-100 font-medium text-sm mb-1">{title}</p>
                <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">{formatCurrency(amount)}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {icon}
            </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
    </div>
);
