
export const MAX_TRANSACTION_AMOUNT = 100_000_000_000; // 100 Billion VND Safety Cap

export type TransactionType = 'income' | 'expense';

export type UserRole = 'admin' | 'staff' | 'pending';

export interface AppUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    createdAt: number;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'doing' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string; // ISO String for Date + Time
    assigneeId?: string; // UID of the assigned user
    creatorId?: string; // UID of the creator (Admin)
    reminderTime?: 'none' | '0m' | '1m' | '5m' | '15m' | '30m' | '45m' | '1h' | '2h' | '1d'; // Reminder before deadline
    notified?: boolean; // Track if notification was sent
    assigneeName?: string; // Cached for display
    assigneeAvatar?: string; // Cached for display
    createdAt: number;
}

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    color: string;
    icon?: string;
    isDefault?: boolean;
}

export interface Transaction {
    id: string;
    date: string; // ISO Date YYYY-MM-DD
    amount: number;
    categoryId: string;
    description: string;
    type: TransactionType;
    paymentMethod: 'cash' | 'transfer' | 'e-wallet';
    createdAt: number; // Timestamp
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    date: string;
    isRead: boolean;
    type: 'weather' | 'system' | 'deadline';
}

export const DEFAULT_CATEGORIES: Category[] = [
    // Expense
    { id: 'c1', name: 'Ăn uống', type: 'expense', color: '#fbbf24', icon: 'Utensils', isDefault: true },
    { id: 'c2', name: 'Nhà ở', type: 'expense', color: '#4ecdc4', icon: 'Home', isDefault: true },
    { id: 'c3', name: 'Đi lại', type: 'expense', color: '#45b7d1', icon: 'Car', isDefault: true },
    { id: 'c4', name: 'Điện nước', type: 'expense', color: '#f7d794', icon: 'Zap', isDefault: true },
    { id: 'c5', name: 'Mua sắm', type: 'expense', color: '#ff9ff3', icon: 'ShoppingBag', isDefault: true },
    { id: 'c6', name: 'Y tế', type: 'expense', color: '#ffcccc', icon: 'HeartPulse', isDefault: true },
    { id: 'c7', name: 'Giáo dục', type: 'expense', color: '#cd84f1', icon: 'BookOpen', isDefault: true },
    { id: 'c8', name: 'Giải trí', type: 'expense', color: '#7efff5', icon: 'Gamepad2', isDefault: true },
    { id: 'c9', name: 'Khác', type: 'expense', color: '#d1ccc0', icon: 'MoreHorizontal', isDefault: true },
    // Income
    { id: 'i1', name: 'Lương', type: 'income', color: '#2ecc71', icon: 'Wallet', isDefault: true },
    { id: 'i2', name: 'Thưởng', type: 'income', color: '#27ae60', icon: 'Gift', isDefault: true },
    { id: 'i3', name: 'Kinh doanh', type: 'income', color: '#16a085', icon: 'TrendingUp', isDefault: true },
    { id: 'i4', name: 'Khác', type: 'income', color: '#95a5a6', icon: 'MoreHorizontal', isDefault: true },
];
