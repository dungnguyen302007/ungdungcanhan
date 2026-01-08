import React from 'react';
import { Utensils, Home, Car, Zap, ShoppingBag, HeartPulse, GraduationCap, Gamepad2, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { type Transaction, DEFAULT_CATEGORIES } from '../../types';

interface TopCategoriesProps {
    transactions: Transaction[];
}

const CATEGORY_MAP: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    'c1': { icon: <Utensils className="w-5 h-5" />, color: 'bg-orange-500', bgColor: 'bg-orange-100 text-orange-600' },
    'c2': { icon: <Home className="w-5 h-5" />, color: 'bg-blue-500', bgColor: 'bg-blue-100 text-blue-600' },
    'c3': { icon: <Car className="w-5 h-5" />, color: 'bg-purple-500', bgColor: 'bg-purple-100 text-purple-600' },
    'c4': { icon: <Zap className="w-5 h-5" />, color: 'bg-yellow-500', bgColor: 'bg-yellow-100 text-yellow-600' },
    'c5': { icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-pink-500', bgColor: 'bg-pink-100 text-pink-600' },
    'c6': { icon: <HeartPulse className="w-5 h-5" />, color: 'bg-red-500', bgColor: 'bg-red-100 text-red-600' },
    'c7': { icon: <GraduationCap className="w-5 h-5" />, color: 'bg-indigo-500', bgColor: 'bg-indigo-100 text-indigo-600' },
    'c8': { icon: <Gamepad2 className="w-5 h-5" />, color: 'bg-cyan-500', bgColor: 'bg-cyan-100 text-cyan-600' },
    'c9': { icon: <MoreHorizontal className="w-5 h-5" />, color: 'bg-gray-500', bgColor: 'bg-gray-100 text-gray-600' },
};

export const TopCategories: React.FC<TopCategoriesProps> = ({ transactions }) => {
    const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Top chi tiêu</h3>
                <button className="text-[#3B82F6] font-extrabold text-base">Xem tất cả</button>
            </div>

            <div className="space-y-4">
                {sortedCategories.map(([catId, amount]) => {
                    const categoryInfo = DEFAULT_CATEGORIES.find(c => c.id === catId);
                    const design = CATEGORY_MAP[catId] || CATEGORY_MAP['c9'];

                    return (
                        <div key={catId} className="bg-white p-6 rounded-[2.5rem] shadow-soft-sm border border-slate-50 flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 ${design.bgColor}`}>
                                {React.cloneElement(design.icon as React.ReactElement, { className: 'w-7 h-7' })}
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">{categoryInfo?.name || 'Khác'}</span>
                                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">{formatCurrency(amount)}</span>
                                </div>

                                <div className="h-3 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${design.color} transition-all duration-1000 ease-out`}
                                        style={{ width: `${Math.min((amount / totalExpense) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {sortedCategories.length === 0 && (
                    <div className="text-center py-10 text-gray-400 italic font-medium">
                        Chưa có chi tiêu nào trong tháng này
                    </div>
                )}
            </div>
        </div>
    );
};
