import type { Transaction } from '../types';
import { isSameMonth, isSameYear, parseISO, format, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

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
        .reduce((sum, t) => {
            const val = Number(t.amount);
            return sum + (Number.isFinite(val) ? val : 0);
        }, 0);
    const expense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => {
            const val = Number(t.amount);
            return sum + (Number.isFinite(val) ? val : 0);
        }, 0);

    // Safety check for final result
    const safeIncome = Number.isFinite(income) ? income : 0;
    const safeExpense = Number.isFinite(expense) ? expense : 0;

    return {
        income: safeIncome,
        expense: safeExpense,
        balance: safeIncome - safeExpense,
    };
};

export const formatMonth = (date: Date) => {
    return format(date, 'MMMM, yyyy', { locale: vi });
};

export const getPreviousMonth = (date: Date) => {
    return subMonths(date, 1);
};

export const getCategoryStats = (transactions: Transaction[]) => {
    const stats: Record<string, number> = {};
    transactions.forEach((t) => {
        if (t.type === 'expense') {
            const val = Number(t.amount);
            if (Number.isFinite(val)) {
                stats[t.categoryId] = (stats[t.categoryId] || 0) + val;
            }
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
