import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Transaction, type Category, DEFAULT_CATEGORIES } from '../types';

interface AppState {
    transactions: Transaction[];
    categories: Category[];
    addTransaction: (transaction: Transaction) => void;
    removeTransaction: (id: string) => void;
    updateTransaction: (id: string, updated: Partial<Transaction>) => void;
    addCategory: (category: Category) => void;
    resetData: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            transactions: [],
            categories: DEFAULT_CATEGORIES,
            addTransaction: (transaction) =>
                set((state) => ({ transactions: [transaction, ...state.transactions] })),
            removeTransaction: (id) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                })),
            updateTransaction: (id, updated) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...updated } : t
                    ),
                })),
            addCategory: (category) =>
                set((state) => ({ categories: [...state.categories, category] })),
            resetData: () => set({ transactions: [], categories: DEFAULT_CATEGORIES }),
        }),
        {
            name: 'expense-tracker-storage', // name of the item in the storage (must be unique)
        }
    )
);
