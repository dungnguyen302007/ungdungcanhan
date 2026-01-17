import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Transaction, type Category, DEFAULT_CATEGORIES, type AppNotification, type Task, MAX_TRANSACTION_AMOUNT } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, getDocs, query, orderBy, onSnapshot, where } from 'firebase/firestore';

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

    addNotification: (notification: AppNotification) => Promise<void>;
    markNotificationAsRead: (id: string) => void;
    clearNotifications: () => void;
    setupNotificationsListener: () => () => void;

    // TASKS SLICE
    tasks: Task[];
    setupTasksListener: () => () => void; // Returns unsubscribe function
    addTask: (task: Task) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            transactions: [],
            categories: DEFAULT_CATEGORIES,
            userId: null,
            notifications: [],
            lastWeatherNotificationDate: null,
            tasks: [], // Initial state for tasks

            setUserId: (id) => set({ userId: id }),

            // ... (keep existing transaction methods) ...

            // Setup real-time listener for tasks
            setupTasksListener: () => {
                const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const tasksFromFirestore: Task[] = [];
                    snapshot.forEach((doc) => {
                        tasksFromFirestore.push({ id: doc.id, ...doc.data() } as Task);
                    });
                    set({ tasks: tasksFromFirestore });
                    console.log('[Tasks] Real-time update:', tasksFromFirestore.length, 'tasks');
                }, (error) => {
                    console.error("Error listening to tasks:", error);
                });

                return unsubscribe;
            },

            // TASKS ACTIONS
            addTask: async (task) => {
                set((state) => ({ tasks: [task, ...state.tasks] }));
                try {
                    await setDoc(doc(db, 'tasks', task.id), task);
                } catch (error) {
                    console.error("Error creating task:", error);
                }
            },

            updateTask: async (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
                }));
                try {
                    await updateDoc(doc(db, 'tasks', id), updates);
                } catch (error) {
                    console.error("Error updating task:", error);
                }
            },

            updateTaskStatus: async (id, status) => {
                set((state) => ({
                    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
                }));
                try {
                    await updateDoc(doc(db, 'tasks', id), { status });
                } catch (error) {
                    console.error("Error updating task status:", error);
                }
            },

            deleteTask: async (id) => {
                set((state) => ({
                    tasks: state.tasks.filter(t => t.id !== id)
                }));
                try {
                    await deleteDoc(doc(db, 'tasks', id));
                } catch (error) {
                    console.error("Error deleting task:", error);
                }
            },

            // EXISTING METHODS START HERE
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

            addNotification: async (notification: AppNotification) => {
                const userId = get().userId;
                if (!userId) return;

                // Add to local state
                set((state) => {
                    const newState = {
                        notifications: [notification, ...state.notifications]
                    };
                    if (notification.type === 'weather') {
                        return { ...newState, lastWeatherNotificationDate: notification.date.split('T')[0] };
                    }
                    return newState;
                });

                // Save to Firebase with userId
                try {
                    await setDoc(doc(db, 'notifications', notification.id), {
                        ...notification,
                        userId // Associate notification with user
                    });
                } catch (error) {
                    console.error('Error adding notification:', error);
                }
            },

            markNotificationAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, isRead: true } : n
                    )
                }));
            },

            setupNotificationsListener: () => {
                const userId = get().userId;
                if (!userId) return () => { };

                const q = query(
                    collection(db, 'notifications'),
                    where('userId', '==', userId),
                    orderBy('date', 'desc')
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const notificationsFromFirestore: AppNotification[] = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        notificationsFromFirestore.push({
                            id: data.id,
                            type: data.type,
                            title: data.title,
                            message: data.message,
                            date: data.date,
                            isRead: data.isRead
                        });
                    });
                    set({ notifications: notificationsFromFirestore });
                    console.log('[Notifications] Real-time update:', notificationsFromFirestore.length);
                }, (error) => {
                    console.error('Error listening to notifications:', error);
                });

                return unsubscribe;
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
                tasks: state.tasks, // Persist tasks
                userId: state.userId,
                notifications: state.notifications,
                lastWeatherNotificationDate: state.lastWeatherNotificationDate
            }),
        }
    )
);
