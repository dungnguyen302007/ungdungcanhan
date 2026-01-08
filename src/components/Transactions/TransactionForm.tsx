import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Transaction, TransactionType } from '../../types';
import { useStore } from '../../store/useStore';
import { X, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TransactionFormProps {
    onClose: () => void;
    initialData?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, initialData }) => {
    const { categories, transactions, addTransaction, updateTransaction } = useStore();
    const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(initialData?.description || '');
    const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>(initialData?.paymentMethod || 'cash');

    const filteredCategories = categories.filter((c) => c.type === type);

    useEffect(() => {
        if (!categoryId || !filteredCategories.find(c => c.id === categoryId)) {
            if (filteredCategories.length > 0) {
                setCategoryId(filteredCategories[0].id);
            }
        }
    }, [type, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId || !date) return;

        const numAmount = Number(amount.replace(/\D/g, ''));

        // Check expense limit
        if (type === 'expense') {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const currentTotalExpense = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.type === 'expense' &&
                        tDate.getMonth() === currentMonth &&
                        tDate.getFullYear() === currentYear &&
                        (initialData ? t.id !== initialData.id : true);
                })
                .reduce((sum, t) => sum + t.amount, 0);

            if (currentTotalExpense + numAmount > 20000000) {
                toast.error('Cảnh báo: Tổng chi tiêu tháng này đã vượt quá 20 triệu!', {
                    duration: 5000,
                    icon: '⚠️',
                    style: {
                        background: '#fff1f2', // red-50
                        color: '#be123c', // red-700
                        border: '1px solid #fda4af' // red-300
                    }
                });
            }
        }

        const transactionData: any = {
            amount: numAmount, // Clean formatting before saving
            categoryId,
            date,
            description,
            type,
            paymentMethod,
        };

        if (initialData) {
            updateTransaction(initialData.id, transactionData);
        } else {
            addTransaction({
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                ...transactionData,
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Sửa giao dịch' : 'Mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Type Selector */}
                    <div className="flex bg-gray-100/50 p-1.5 rounded-2xl">
                        <button
                            type="button"
                            className={cn(
                                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                                type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-gray-500 hover:text-gray-700'
                            )}
                            onClick={() => setType('expense')}
                        >
                            Chi tiêu
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                                type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:text-gray-700'
                            )}
                            onClick={() => setType('income')}
                        >
                            Thu nhập
                        </button>
                    </div>

                    <div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">VNĐ</span>
                            <input
                                type="text"
                                required
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-2xl font-bold text-gray-800 placeholder-gray-300"
                                placeholder="0"
                                value={amount ? new Intl.NumberFormat('vi-VN').format(Number(amount.replace(/\D/g, ''))) : ''}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\D/g, '');
                                    setAmount(rawValue);
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Ngày</label>
                            <input
                                type="date"
                                required
                                className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-700 font-medium"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Danh mục</label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-700 font-medium appearance-none"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                {filteredCategories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Ví thanh toán</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'cash', label: 'Tiền mặt' },
                                { id: 'transfer', label: 'Chuyển khoản' },
                                { id: 'e-wallet', label: 'Ví điện tử' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.id as any)}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium border rounded-xl transition-all",
                                        paymentMethod === method.id
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    )}
                                >
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Ghi chú</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-gray-700"
                            rows={2}
                            placeholder="Thêm ghi chú..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        {initialData ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}
                    </button>
                </form>
            </div>
        </div>
    );
};
