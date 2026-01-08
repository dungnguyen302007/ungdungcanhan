import React from 'react';
import { Utensils, Home, Car, ShoppingBag, GraduationCap, HeartPulse, Zap, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { type Transaction } from '../../types';

interface TopCategoriesProps {
    transactions: Transaction[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'Ăn uống': <Utensils className="w-5 h-5" />,
    'Tiền nhà': <Home className="w-5 h-5" />,
    'Di chuyển': <Car className="w-5 h-5" />,
    'Mua sắm': <ShoppingBag className="w-5 h-5" />,
    'Giáo dục': <GraduationCap className="w-5 h-5" />,
    'Y tế': <HeartPulse className="w-5 h-5" />,
    'Điện nước': <Zap className="w-5 h-5" />,
    'Khác': <MoreHorizontal className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
    'Ăn uống': 'bg-orange-500',
    'Tiền nhà': 'bg-blue-500',
    'Di chuyển': 'bg-purple-500',
    'Mua sắm': 'bg-pink-500',
    'Giáo dục': 'bg-indigo-500',
    'Y tế': 'bg-red-500',
    'Điện nước': 'bg-yellow-500',
    'Khác': 'bg-gray-500',
};

const CATEGORY_BG_COLORS: Record<string, string> = {
    'Ăn uống': 'bg-orange-100 text-orange-600',
    'Tiền nhà': 'bg-blue-100 text-blue-600',
    'Di chuyển': 'bg-purple-100 text-purple-600',
    'Mua sắm': 'bg-pink-100 text-pink-600',
    'Giáo dục': 'bg-indigo-100 text-indigo-600',
    'Y tế': 'bg-red-100 text-red-600',
    'Điện nước': 'bg-yellow-100 text-yellow-600',
    'Khác': 'bg-gray-100 text-gray-600',
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
        .slice(0, 3); // Showing top 3 like in design

    const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Top chi tiêu</h3>
                <button className="text-blue-500 font-bold text-sm hover:underline">Xem tất cả</button>
            </div>

            <div className="space-y-3">
                {sortedCategories.map(([name, amount]) => (
                    <div key={name} className="bg-white p-5 rounded-3xl shadow-soft border border-gray-50 flex items-center gap-4 transition-all hover:translate-x-1">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${CATEGORY_BG_COLORS[name] || 'bg-gray-100 text-gray-600'}`}>
                            {CATEGORY_ICONS[name] || <MoreHorizontal className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-800">{name}</span>
                                <span className="font-bold text-gray-800">{formatCurrency(amount)}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${CATEGORY_COLORS[name] || 'bg-gray-400'}`}
                                    style={{ width: `${Math.min((amount / totalExpense) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}

                {sortedCategories.length === 0 && (
                    <div className="text-center py-10 text-gray-400 italic">
                        Chưa có chi tiêu nào trong tháng này
                    </div>
                )}
            </div>
        </div>
    );
};
