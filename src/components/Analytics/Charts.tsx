import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Transaction } from '../../types';
import { formatCurrency } from '../../utils/format';
import { useStore } from '../../store/useStore';

interface ChartsProps {
    transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a29bfe', '#ff7675', '#55efc4', '#fd79a8'];

export const ExpensePieChart: React.FC<ChartsProps> = ({ transactions }) => {
    const { categories } = useStore();

    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryTotals: Record<string, number> = {};

        expenses.forEach(t => {
            categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
        });

        return Object.keys(categoryTotals).map(catId => {
            const category = categories.find(c => c.id === catId);
            return {
                name: category?.name || 'Unknown',
                value: categoryTotals[catId],
                color: category?.color || '#ccc'
            };
        }).sort((a, b) => b.value - a.value);
    }, [transactions, categories]);

    if (data.length === 0) return <div className="text-center text-gray-400 py-10">Chưa có dữ liệu chi tiêu</div>;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const IncomeExpenseBarChart: React.FC<ChartsProps> = ({ transactions }) => {
    const data = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return [
            { name: 'Thu nhập', amount: income, fill: '#4ade80' }, // green-400
            { name: 'Chi tiêu', amount: expense, fill: '#f87171' }, // red-400
        ];
    }, [transactions]);

    if (data.every(d => d.amount === 0)) return <div className="text-center text-gray-400 py-10">Chưa có dữ liệu</div>;

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`} />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={50} >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
