import { useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/Layout/AppShell';
import { OverviewCards } from './components/Dashboard/OverviewCards';
import { TransactionForm } from './components/Transactions/TransactionForm';
import { TransactionList } from './components/Transactions/TransactionList';
import { ExpensePieChart, IncomeExpenseBarChart } from './components/Analytics/Charts';
import { ComparisonStat } from './components/Analytics/Comparison';
import { useStore } from './store/useStore';
import { calculateTotals, getMonthTransactions } from './utils/analytics';
import { Plus, ChevronLeft, ChevronRight, LayoutDashboard, PieChart } from 'lucide-react';
import { formatMonth } from './utils/format';
import { addMonths, subMonths } from 'date-fns';
import type { Transaction } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const transactions = useStore((state) => state.transactions);

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

  return (
    <AppShell>
      {/* Month Selector & Add Button */}
      {/* Sticky Header: Month Selector & Tabs */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 -mx-4 md:-mx-6 px-4 md:px-6 pt-4 mb-10 transition-all">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between md:justify-start flex-1 gap-4">
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-500 hover:text-indigo-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold min-w-[140px] text-center capitalize text-gray-800">
                  {formatMonth(currentDate)}
                </h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-500 hover:text-indigo-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-500 shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm giao dịch</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-transparent">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 pb-3 font-medium border-b-2 transition-all ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 pb-3 font-medium border-b-2 transition-all ${activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <PieChart className="w-4 h-4" /> Báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <OverviewCards {...totals} />

        {activeTab === 'overview' ? (
          <div>
            <h3 className="text-lg font-bold mb-4">Giao dịch trong tháng</h3>
            <TransactionList
              transactions={currentMonthTransactions}
              onEdit={handleEdit}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Comparison Stats */}
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
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-center">Cơ cấu chi tiêu</h3>
                <ExpensePieChart transactions={currentMonthTransactions} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-center">Thu nhập vs Chi tiêu</h3>
                <IncomeExpenseBarChart transactions={currentMonthTransactions} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <TransactionForm onClose={closeForm} initialData={editingTransaction} />
      )}
      <Toaster position="top-right" />
    </AppShell>
  );
}

export default App;
