import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Transaction, type Category, DEFAULT_CATEGORIES, type AppNotification, MAX_TRANSACTION_AMOUNT } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';

interface AppState {
    transactions: Transaction[];
    categories: Category[];
    userId: string | null;
    notifications: AppNotification[];
    lastWeatherNotificationDate: string | null;
    setUserId: (id: string | null) => void;

    fetchTransactions: () => Promise<void>;

    addTransaction: (transaction: Transaction) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
    updateTransaction: (id: string, updated: Partial<Transaction>) => Promise<void>;

    addCategory: (category: Category) => void;
    resetData: () => void;

    addNotification: (notification: AppNotification) => void;
    markNotificationAsRead: (id: string) => void;
    clearNotifications: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            transactions: [],
            categories: DEFAULT_CATEGORIES,
            userId: null,
            notifications: [],
            lastWeatherNotificationDate: null,

            setUserId: (id) => set({ userId: id }),

            fetchTransactions: async () => {
                const { userId } = get();
                if (!userId) return;

                try {
                    const q = query(
                        collection(db, 'users', userId, 'transactions'),
                        orderBy('date', 'desc')
                    );
                    const querySnapshot = await getDocs(q);
                    const transactions: Transaction[] = [];
                    querySnapshot.forEach((doc) => {
                        transactions.push(doc.data() as Transaction);
                    });
                    set({ transactions });
                } catch (error) {
                    console.error("Error fetching transactions:", error);
                }
            },

            addTransaction: async (transaction) => {
                const { userId } = get();
                // Optimistic update
                set((state) => ({ transactions: [transaction, ...state.transactions] }));

                if (userId) {
                    try {
                        await setDoc(doc(db, 'users', userId, 'transactions', transaction.id), transaction);
                    } catch (error) {
                        console.error("Error adding transaction to Firestore:", error);
                    }
                }
            },

            removeTransaction: async (id) => {
                const { userId } = get();
                // Optimistic update
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                }));

                if (userId) {
                    try {
                        await deleteDoc(doc(db, 'users', userId, 'transactions', id));
                    } catch (error) {
                        console.error("Error deleting transaction from Firestore:", error);
                    }
                }
            },

            updateTransaction: async (id, updated) => {
                const { userId } = get();
                // Optimistic update
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...updated } : t
                    ),
                }));

                if (userId) {
                    try {
                        await updateDoc(doc(db, 'users', userId, 'transactions', id), updated);
                    } catch (error) {
                        console.error("Error updating transaction in Firestore:", error);
                    }
                }
            },

            addCategory: (category) =>
                set((state) => ({ categories: [...state.categories, category] })),

            resetData: () => set({ transactions: [], categories: DEFAULT_CATEGORIES }),

            addNotification: (notification) => {
                set((state) => {
                    const newState = {
                        notifications: [notification, ...state.notifications]
                    };
                    if (notification.type === 'weather') {
                        return { ...newState, lastWeatherNotificationDate: notification.date.split('T')[0] };
                    }
                    return newState;
                });
            },

            markNotificationAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, isRead: true } : n
                    )
                }));
            },

            clearNotifications: () => set({ notifications: [] }),
        }),
        {
            name: 'expense-tracker-storage',
            version: 4, // Force reset everything to 0
            migrate: (persistedState: any, version) => {
                if (version < 4) {
                    // Discard old state completely if version is less than 4
                    return {
                        transactions: [],
                        categories: DEFAULT_CATEGORIES,
                        userId: persistedState.userId || null,
                        notifications: [],
                        lastWeatherNotificationDate: null
                    };
                }
                return persistedState;
            },
            partialize: (state) => ({
                transactions: state.transactions.filter(t => {
                    const val = Number(t.amount);
                    return Number.isFinite(val) && val < MAX_TRANSACTION_AMOUNT;
                }),
                categories: state.categories,
                userId: state.userId,
                notifications: state.notifications,
                lastWeatherNotificationDate: state.lastWeatherNotificationDate
            }),
        }
    )
);
