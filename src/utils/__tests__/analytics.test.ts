import { describe, it, expect } from 'vitest';
import { calculateTotals, getMonthTransactions, getCategoryStats } from '../analytics';
import type { Transaction } from '../../types';

describe('calculateTotals', () => {
    it('should calculate income, expense, and balance correctly', () => {
        const transactions: Transaction[] = [
            {
                id: '1',
                type: 'income',
                amount: 10000000,
                categoryId: 'c1',
                description: 'Salary',
                date: '2026-01-15',
                paymentMethod: 'transfer',
                createdAt: Date.now(),
            },
            {
                id: '2',
                type: 'expense',
                amount: 2000000,
                categoryId: 'c1',
                description: 'Food',
                date: '2026-01-16',
                paymentMethod: 'cash',
                createdAt: Date.now(),
            },
            {
                id: '3',
                type: 'expense',
                amount: 1000000,
                categoryId: 'c2',
                description: 'Rent',
                date: '2026-01-17',
                paymentMethod: 'transfer',
                createdAt: Date.now(),
            },
        ];

        const totals = calculateTotals(transactions);

        expect(totals.income).toBe(10000000);
        expect(totals.expense).toBe(3000000);
        expect(totals.balance).toBe(7000000);
    });

    it('should handle empty array', () => {
        const totals = calculateTotals([]);
        expect(totals.income).toBe(0);
        expect(totals.expense).toBe(0);
        expect(totals.balance).toBe(0);
    });

    it('should handle only income transactions', () => {
        const transactions: Transaction[] = [
            {
                id: '1',
                type: 'income',
                amount: 5000000,
                categoryId: 'c1',
                description: '',
                date: '2026-01-01',
                paymentMethod: 'cash',
                createdAt: Date.now(),
            },
        ];

        const totals = calculateTotals(transactions);
        expect(totals.income).toBe(5000000);
        expect(totals.expense).toBe(0);
        expect(totals.balance).toBe(5000000);
    });
});

describe('getMonthTransactions', () => {
    const transactions: Transaction[] = [
        {
            id: '1',
            type: 'income',
            amount: 1000000,
            categoryId: 'c1',
            description: 'Jan transaction',
            date: '2026-01-15',
            paymentMethod: 'cash',
            createdAt: Date.now(),
        },
        {
            id: '2',
            type: 'expense',
            amount: 500000,
            categoryId: 'c1',
            description: 'Feb transaction',
            date: '2026-02-10',
            paymentMethod: 'cash',
            createdAt: Date.now(),
        },
        {
            id: '3',
            type: 'expense',
            amount: 300000,
            categoryId: 'c1',
            description: 'Jan transaction 2',
            date: '2026-01-20',
            paymentMethod: 'cash',
            createdAt: Date.now(),
        },
    ];

    it('should filter transactions by month', () => {
        const janDate = new Date('2026-01-01');
        const janTransactions = getMonthTransactions(transactions, janDate);

        expect(janTransactions).toHaveLength(2);
        expect(janTransactions[0].id).toBe('1');
        expect(janTransactions[1].id).toBe('3');
    });

    it('should return empty array for month with no transactions', () => {
        const marchDate = new Date('2026-03-01');
        const marchTransactions = getMonthTransactions(transactions, marchDate);

        expect(marchTransactions).toHaveLength(0);
    });
});

describe('getCategoryStats', () => {
    it('should aggregate expense amounts by category', () => {
        const transactions: Transaction[] = [
            {
                id: '1',
                type: 'expense',
                amount: 1000000,
                categoryId: 'c1',
                description: '',
                date: '2026-01-01',
                paymentMethod: 'cash',
                createdAt: Date.now(),
            },
            {
                id: '2',
                type: 'expense',
                amount: 500000,
                categoryId: 'c1',
                description: '',
                date: '2026-01-02',
                paymentMethod: 'cash',
                createdAt: Date.now(),
            },
            {
                id: '3',
                type: 'expense',
                amount: 2000000,
                categoryId: 'c2',
                description: '',
                date: '2026-01-03',
                paymentMethod: 'cash',
                createdAt: Date.now(),
            },
            {
                id: '4',
                type: 'income',
                amount: 10000000,
                categoryId: 'c1',
                description: 'Should be ignored',
                date: '2026-01-04',
                paymentMethod: 'cash',
                createdAt: Date.now(),
            },
        ];

        const stats = getCategoryStats(transactions);

        expect(stats).toHaveLength(2);
        expect(stats.find(s => s.categoryId === 'c1')?.total).toBe(1500000);
        expect(stats.find(s => s.categoryId === 'c2')?.total).toBe(2000000);
    });

    it('should return empty array for transactions with no expenses', () => {
        const transactions: Transaction[] = [
            {
                id: '1',
                type: 'income',
                amount: 5000000,
                categoryId: 'c1',
                description: '',
                date: '2026-01-01',
                paymentMethod: 'cash',
                createdAt: Date.now(),
            },
        ];

        const stats = getCategoryStats(transactions);
        expect(stats).toHaveLength(0);
    });
});
