import React, { useState, useMemo } from 'react';
import { X, Calendar, FileText, Utensils, Home, Zap, GraduationCap, HeartPulse, Car, ShoppingBag, MoreHorizontal, Banknote, CreditCard, Wallet } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { calculateTotals, getMonthTransactions } from '../../utils/analytics';
import toast from 'react-hot-toast';
import type { Transaction } from '../../types';

interface TransactionFormProps {
    onClose: () => void;
    initialData?: Transaction | null;
}

const CATEGORIES = [
    { id: 'Ăn uống', name: 'Ăn uống', icon: <Utensils className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { id: 'Tiền nhà', name: 'Nhà ở', icon: <Home className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { id: 'Điện nước', name: 'Điện nước', icon: <Zap className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { id: 'Giáo dục', name: 'Giáo dục', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { id: 'Y tế', name: 'Y tế', icon: <HeartPulse className="w-6 h-6" />, color: 'bg-red-100 text-red-600 border-red-200' },
    { id: 'Di chuyển', name: 'Đi lại', icon: <Car className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600 border-purple-200' },
    { id: 'Mua sắm', name: 'Mua sắm', icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-pink-100 text-pink-600 border-pink-200' },
    { id: 'Khác', name: 'Khác', icon: <MoreHorizontal className="w-6 h-6" />, color: 'bg-gray-100 text-gray-600 border-gray-200' },
];

const PAYMENT_METHODS = [
    { id: 'Cash', name: 'Tiền mặt', icon: <Banknote className="w-5 h-5" /> },
    { id: 'Transfer', name: 'Chuyển khoản', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'E-Wallet', name: 'Ví điện tử', icon: <Wallet className="w-5 h-5" /> },
];

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, initialData }) => {
    const { addTransaction, updateTransaction, transactions } = useStore();

    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || 'Ăn uống');
    const [note, setNote] = useState(initialData?.note || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || 'Cash');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        // Check expense limit 20M
        if (type === 'expense') {
            const currentMonthTransactions = getMonthTransactions(transactions, new Date(date));
            const totals = calculateTotals(currentMonthTransactions);
            const currentTotalExpense = totals.expense;

            if (currentTotalExpense + numAmount > 20000000) {
                toast.error('Cảnh báo: Tổng chi tiêu tháng này đã vượt quá 20 triệu!', {
                    duration: 5000,
                    icon: '⚠️',
                });
            }
        }

        const transactionData = {
            id: initialData?.id || crypto.randomUUID(),
            type,
            amount: numAmount,
            categoryId,
            note,
            date,
            paymentMethod,
        };

        if (initialData) {
            await updateTransaction(initialData.id, transactionData);
            toast.success('Đã cập nhật giao dịch');
        } else {
            await addTransaction(transactionData);
            toast.success('Đã thêm giao dịch');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] transition-all">
            <div className="bg-white w-full max-w-lg md:rounded-[3rem] rounded-t-[3rem] overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-gray-50">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Sửa' : 'Thêm'} Giao dịch
                    </h2>
                    <div className="w-10"></div> {/* Spacer for symmetry */}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto max-h-[85vh]">
                    {/* Expense/Income Toggle */}
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex relative">
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-sm transition-all duration-300 ${type === 'income' ? 'translate-x-full' : 'translate-x-0'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${type === 'expense' ? 'text-blue-500' : 'text-gray-400'}`}
                        >
                            Chi tiêu
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${type === 'income' ? 'text-blue-500' : 'text-gray-400'}`}
                        >
                            Thu nhập
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div className="text-center space-y-2">
                        <label className="text-gray-400 text-sm font-medium">Số tiền</label>
                        <div className="flex items-center justify-center gap-2">
                            <input
                                autoFocus
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-5xl font-black text-gray-900 bg-transparent border-none focus:ring-0 w-full text-right outline-none p-0"
                                placeholder="0"
                            />
                            <span className="text-3xl font-bold text-gray-400 border-b-2 border-gray-100/50 pb-1">₫</span>
                        </div>
                    </div>

                    {/* Date & Note */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent focus-within:border-blue-100 focus-within:bg-white transition-all">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Ngày giao dịch</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-gray-700 w-full"
                                />
                            </div>
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">Hôm nay</span>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent focus-within:border-blue-100 focus-within:bg-white transition-all">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Ghi chú</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Thêm ghi chú (tùy chọn)..."
                                    className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-gray-700 w-full placeholder:text-gray-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-4">
                        <label className="text-base font-bold text-gray-800">Danh mục</label>
                        <div className="grid grid-cols-4 gap-4">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoryId(cat.id)}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${categoryId === cat.id ? `${cat.color} scale-110 shadow-lg` : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}>
                                        {cat.icon}
                                    </div>
                                    <span className={`text-[10px] font-bold truncate w-full text-center transition-colors ${categoryId === cat.id ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {cat.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method chips */}
                    <div className="space-y-4">
                        <label className="text-base font-bold text-gray-800">Hình thức thanh toán</label>
                        <div className="flex gap-3">
                            {PAYMENT_METHODS.map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-bold text-xs ${paymentMethod === method.id ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {method.icon}
                                    {method.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-bold py-5 rounded-3xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-200 text-lg active:scale-95 mt-4"
                    >
                        Lưu giao dịch
                    </button>
                </form>
            </div>
        </div>
    );
};
