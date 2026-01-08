import React from 'react';
import type { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Trash2, Edit2, Inbox } from 'lucide-react';
import { useStore } from '../../store/useStore';
import * as Icons from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit }) => {
    const { categories, removeTransaction } = useStore();

    const getCategory = (id: string) => categories.find((c) => c.id === id);

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, t) => {
        const date = t.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(t);
        return groups;
    }, {} as Record<string, Transaction[]>);

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (transactions.length === 0) {
        return (
            <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">Chưa có giao dịch</h3>
                <p className="text-gray-500 text-sm mt-1">Hãy thêm giao dịch đầu tiên của bạn trong tháng này.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {sortedDates.map((date) => (
                <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{formatDate(date, 'EEEE, dd/MM/yyyy')}</h3>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {groupedTransactions[date].map((t, index) => {
                            const category = getCategory(t.categoryId);
                            const IconComponent = category?.icon && AsKey(category.icon, Icons)
                                ? Icons[category.icon as keyof typeof Icons] as any
                                : Icons.Circle;

                            return (
                                <div key={t.id} className={`p-4 sm:p-5 flex items-center justify-between group hover:bg-gray-50/80 transition-all ${index !== groupedTransactions[date].length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                                            style={{ backgroundColor: category?.color || '#ccc' }}
                                        >
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{category?.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{t.description || t.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <span className={`text-base font-bold tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => onEdit(t)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => removeTransaction(t.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

function AsKey(key: string, obj: any): boolean {
    return key in obj;
}
