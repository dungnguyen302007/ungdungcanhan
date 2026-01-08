import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { AppShell } from './components/Layout/AppShell';
import { OverviewCards } from './components/Dashboard/OverviewCards';
import { TopCategories } from './components/Dashboard/TopCategories';
import { TransactionList } from './components/Transactions/TransactionList';
import { TransactionForm } from './components/Transactions/TransactionForm';
import { LoginForm } from './components/Auth/LoginForm';
import { ExpensePieChart, IncomeExpenseBarChart } from './components/Analytics/Charts';
import { ComparisonStat } from './components/Analytics/Comparison';
import { useStore } from './store/useStore';
import { formatMonth, getMonthTransactions, calculateTotals, getPreviousMonth } from './utils/analytics';
import { type Transaction } from './types';
import { Toaster } from 'react-hot-toast';

function App() {
  const { userId, transactions, fetchTransactions } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'history' | 'settings'>('overview');

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <LoginForm />
        <Toaster position="top-center" />
      </div>
    );
  }

  const currentMonthTransactions = getMonthTransactions(transactions, currentDate);
  const totals = calculateTotals(currentMonthTransactions);

  const prevDate = getPreviousMonth(currentDate);
  const prevMonthTransactions = getMonthTransactions(transactions, prevDate);
  const prevTotals = calculateTotals(prevMonthTransactions);

  const handlePrevMonth = () => setCurrentDate(prevDate);
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-md mx-auto space-y-9 relative pb-24 px-1">

        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
            {/* Header row with Title and Month Selector */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Tổng quan</h2>
              <div className="flex items-center gap-1 bg-[#F1F5F9] p-1.5 rounded-2xl border border-slate-100">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-lg transition-all text-slate-400">
                  <ChevronLeft className="w-5 h-5" strokeWidth={3} />
                </button>
                <span className="text-[13px] font-extrabold text-slate-700 px-1 capitalize min-w-[100px] text-center">
                  {formatMonth(currentDate)}
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-lg transition-all text-slate-400">
                  <ChevronRight className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>
            </div>

            <OverviewCards {...totals} />

            <TopCategories transactions={currentMonthTransactions} />

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight text-left">Giao dịch gần đây</h3>
              </div>
              <TransactionList
                transactions={currentMonthTransactions.slice(0, 5)}
                onEdit={handleEdit}
              />
            </section>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter pt-2">Báo cáo</h2>

            <div className="grid grid-cols-1 gap-4">
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

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[3rem] shadow-card border border-slate-50 font-black">
                <h3 className="text-xl font-black mb-8 text-center text-slate-800">Cơ cấu chi tiêu</h3>
                <ExpensePieChart transactions={currentMonthTransactions} />
              </div>
              <div className="bg-white p-8 rounded-[3rem] shadow-card border border-slate-50 font-black">
                <h3 className="text-xl font-black mb-8 text-center text-slate-800">Thu nhập vs Chi tiêu</h3>
                <IncomeExpenseBarChart transactions={currentMonthTransactions} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter pt-2 text-left">Lịch sử</h2>
            <TransactionList transactions={currentMonthTransactions} onEdit={handleEdit} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter pt-2 text-left">Cài đặt</h2>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-50 text-center space-y-4">
              <p className="text-slate-500 font-bold">Phiên bản 1.0.0</p>
              <button
                onClick={() => useStore.getState().setUserId(null)}
                className="w-full bg-red-50 text-red-600 font-black py-4 rounded-3xl hover:bg-red-100 transition-all"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-28 right-6 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all z-40 border-4 border-white"
        >
          <Plus className="w-8 h-8" strokeWidth={3} />
        </button>

        {isFormOpen && (
          <TransactionForm
            onClose={closeForm}
            initialData={editingTransaction}
          />
        )}
      </div>
      <Toaster position="top-center" />
    </AppShell>
  );
}

export default App;
