import type { Transaction } from '../types';
import { isSameMonth, isSameYear, parseISO } from 'date-fns';

export const getMonthTransactions = (
    transactions: Transaction[],
    monthDate: Date
): Transaction[] => {
    return transactions.filter((t) => {
        const tDate = parseISO(t.date);
        return isSameMonth(tDate, monthDate) && isSameYear(tDate, monthDate);
    });
};

export const calculateTotals = (transactions: Transaction[]) => {
    const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    return {
        income,
        expense,
        balance: income - expense,
    };
};

export const getCategoryStats = (transactions: Transaction[]) => {
    const stats: Record<string, number> = {};
    transactions.forEach((t) => {
        if (t.type === 'expense') {
            stats[t.categoryId] = (stats[t.categoryId] || 0) + t.amount;
        }
    });
    return Object.entries(stats).map(([categoryId, total]) => ({
        categoryId,
        total,
    }));
};

export const getComparisonStats = (
    currentMonthTrans: Transaction[],
    prevMonthTrans: Transaction[]
) => {
    const current = calculateTotals(currentMonthTrans);
    const prev = calculateTotals(prevMonthTrans);

    const getPercent = (curr: number, pre: number) => {
        if (pre === 0) return curr > 0 ? 100 : 0;
        return ((curr - pre) / pre) * 100;
    };

    return {
        incomeIncr: current.income - prev.income,
        expenseIncr: current.expense - prev.expense,
        incomePercent: getPercent(current.income, prev.income),
        expensePercent: getPercent(current.expense, prev.expense),
    };
};
