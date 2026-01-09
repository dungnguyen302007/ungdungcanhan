import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { OverviewCards } from '../Dashboard/OverviewCards';
import { TopCategories } from '../Dashboard/TopCategories';
import { TransactionList } from '../Transactions/TransactionList';
import { TransactionForm } from '../Transactions/TransactionForm';
import { ExpensePieChart, IncomeExpenseBarChart } from '../Analytics/Charts';
import { ComparisonStat } from '../Analytics/Comparison';
import { useStore } from '../../store/useStore';
import { getMonthTransactions, calculateTotals, getPreviousMonth, formatMonth } from '../../utils/analytics';
import { type Transaction } from '../../types';

export const FinanceApp: React.FC = () => {
    const { transactions } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeFinanceTab, setActiveFinanceTab] = useState<'overview' | 'analytics' | 'history'>('overview');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const currentMonthTransactions = getMonthTransactions(transactions, currentDate);
    const totals = calculateTotals(currentMonthTransactions);

    const prevDate = getPreviousMonth(currentDate);
    const prevMonthTransactions = getMonthTransactions(transactions, prevDate);
    const prevTotals = calculateTotals(prevMonthTransactions);

    const handlePrevMonth = () => setCurrentDate(prevDate);
    const handleNextMonth = () => {
        const nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        setCurrentDate(nextDate);
    };

    const handleEdit = (t: Transaction) => {
        setEditingTransaction(t);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingTransaction(null);
    };

    return (
        <div className="flex-1 p-4 lg:p-10 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Finance Tab Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-40 py-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Tài chính</h2>
                        <div className="flex bg-white p-1 rounded-xl shadow-soft-sm border border-slate-100">
                            {['overview', 'analytics', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveFinanceTab(tab as any)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeFinanceTab === tab ? 'bg-blue-500 text-white shadow-blue-glow' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {tab === 'overview' ? 'Tổng quan' : tab === 'analytics' ? 'Báo cáo' : 'Lịch sử'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-soft-sm">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 rounded-lg transition-all text-slate-400">
                                <ChevronLeft className="w-5 h-5" strokeWidth={3} />
                            </button>
                            <span className="text-[11px] font-black text-slate-700 px-2 capitalize min-w-[100px] text-center">
                                {formatMonth(currentDate)}
                            </span>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 rounded-lg transition-all text-slate-400">
                                <ChevronRight className="w-5 h-5" strokeWidth={3} />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-blue-500 text-white p-2.5 rounded-2xl shadow-blue-glow hover:scale-110 active:scale-95 transition-all"
                        >
                            <Plus className="w-6 h-6" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {activeFinanceTab === 'overview' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                        <OverviewCards {...totals} />
                        <TopCategories transactions={currentMonthTransactions} />
                        <section className="space-y-6">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight text-left">Giao dịch gần đây</h3>
                            <TransactionList
                                transactions={currentMonthTransactions.slice(0, 10)}
                                onEdit={handleEdit}
                            />
                        </section>
                    </div>
                )}

                {activeFinanceTab === 'analytics' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ComparisonStat
                                label="Tổng thu nhập"
                                current={totals.income}
                                previous={prevTotals.income}
                                type="income"
                            />
                            <ComparisonStat
                                label="Tổng chi tiêu"
                                current={totals.expense}
                                previous={prevTotals.expense}
                                type="expense"
                            />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-50">
                                <h3 className="text-lg font-black mb-8 text-center text-slate-800">Cơ cấu chi tiêu</h3>
                                <ExpensePieChart transactions={currentMonthTransactions} />
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-50">
                                <h3 className="text-lg font-black mb-8 text-center text-slate-800">Thu nhập vs Chi tiêu</h3>
                                <IncomeExpenseBarChart transactions={currentMonthTransactions} />
                            </div>
                        </div>
                    </div>
                )}

                {activeFinanceTab === 'history' && (
                    <div className="animate-in slide-in-from-bottom-6 duration-500">
                        <TransactionList transactions={currentMonthTransactions} onEdit={handleEdit} />
                    </div>
                )}

                {isFormOpen && (
                    <TransactionForm
                        onClose={closeForm}
                        initialData={editingTransaction}
                    />
                )}
            </div>
        </div>
    );
};
