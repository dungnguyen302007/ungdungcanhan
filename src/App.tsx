import { useEffect, useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/Layout/AppShell';
import { OverviewCards } from './components/Dashboard/OverviewCards';
import { TransactionForm } from './components/Transactions/TransactionForm';
import { TransactionList } from './components/Transactions/TransactionList';
import { TopCategories } from './components/Dashboard/TopCategories';
import { ExpensePieChart, IncomeExpenseBarChart } from './components/Analytics/Charts';
import { ComparisonStat } from './components/Analytics/Comparison';
import { useStore } from './store/useStore';
import { calculateTotals, getMonthTransactions } from './utils/analytics';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonth } from './utils/format';
import { addMonths, subMonths } from 'date-fns';
import type { Transaction } from './types';
import { Login } from './components/Auth/Login';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'history' | 'settings'>('overview');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { userId, fetchTransactions, transactions } = useStore();

  useEffect(() => {
    // If we have a userId (persisted), fetch latest data
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  const currentMonthTransactions = useMemo(
    () => getMonthTransactions(transactions, currentDate),
    [transactions, currentDate]
  );

  const prevMonthTransactions = useMemo(
    () => getMonthTransactions(transactions, subMonths(currentDate, 1)),
    [transactions, currentDate]
  );

  const totals = useMemo(
    () => calculateTotals(currentMonthTransactions),
    [currentMonthTransactions]
  );

  const prevTotals = useMemo(
    () => calculateTotals(prevMonthTransactions),
    [prevMonthTransactions]
  );

  const handlePrevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  }

  if (!userId) {
    return (
      <>
        <Toaster position="top-right" />
        <Login />
      </>
    );
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-md mx-auto space-y-8 relative pb-10">

        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-white shadow-soft">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-blue-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold min-w-[120px] text-center capitalize text-gray-700">
              {formatMonth(currentDate)}
            </h2>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-blue-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OverviewCards {...totals} />

            <TopCategories transactions={currentMonthTransactions} />

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Giao dịch gần đây</h3>
                <button className="text-blue-500 font-bold text-sm hover:underline">Xem tất cả</button>
              </div>
              <TransactionList
                transactions={currentMonthTransactions.slice(0, 5)}
                onEdit={handleEdit}
              />
            </section>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Báo cáo chi tiết</h2>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-soft border border-gray-50">
                <h3 className="text-lg font-bold mb-6 text-center text-gray-800">Cơ cấu chi tiêu</h3>
                <ExpensePieChart transactions={currentMonthTransactions} />
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-soft border border-gray-50">
                <h3 className="text-lg font-bold mb-6 text-center text-gray-800">Thu nhập vs Chi tiêu</h3>
                <IncomeExpenseBarChart transactions={currentMonthTransactions} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Lịch sử giao dịch</h2>
            <TransactionList
              transactions={currentMonthTransactions}
              onEdit={handleEdit}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Cài đặt</h2>
            <div className="bg-white rounded-[2rem] p-8 shadow-soft border border-gray-50 text-center text-gray-400">
              <SettingsIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              Tính năng đang được phát triển
            </div>
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-24 right-6 md:right-10 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-200 hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all z-40"
        >
          <Plus className="w-8 h-8" />
        </button>

      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <TransactionForm onClose={closeForm} initialData={editingTransaction} />
      )}
      <Toaster position="top-right" />
    </AppShell>
  );
}

// Helper icons for placeholder
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default App;
