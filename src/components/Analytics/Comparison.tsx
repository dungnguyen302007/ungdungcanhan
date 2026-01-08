import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface ComparisonProps {
    current: number;
    previous: number;
    label: string;
    type: 'income' | 'expense';
}

export const ComparisonStat: React.FC<ComparisonProps> = ({ current, previous, label, type }) => {
    const diff = current - previous;
    const percent = previous === 0 ? (current > 0 ? 100 : 0) : ((diff / previous) * 100);
    const isIncrease = diff > 0;

    // Logic for color: 
    // Income increase = Good (Green), Decrease = Bad (Red)
    // Expense increase = Bad (Red), Decrease = Good (Green)
    const isGood = type === 'income' ? isIncrease : !isIncrease;
    const colorClass = diff === 0 ? 'text-gray-500' : (isGood ? 'text-green-600' : 'text-red-600');

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">{label} so với tháng trước</p>
            <div className="flex items-end gap-2">
                <span className="text-xl font-bold">{formatCurrency(Math.abs(diff))}</span>
                <div className={`flex items-center text-sm font-medium ${colorClass} mb-1`}>
                    {diff !== 0 ? (
                        <>
                            {isIncrease ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            {Math.abs(percent).toFixed(1)}%
                        </>
                    ) : <Minus className="w-4 h-4" />}
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Tháng trước: {formatCurrency(previous)}</p>
        </div>
    )
}
