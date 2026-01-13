import { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardHome } from './components/Dashboard/DashboardHome';
import { FinanceApp } from './components/Finance/FinanceApp';
import { SettingsApp } from './components/Settings/SettingsApp';
import { Login } from './components/Auth/Login';
import { useStore } from './store/useStore';
import { Toaster, toast } from 'react-hot-toast';
import { fetchWeather, formatWeatherNotification, speakWeather } from './utils/weather';
import { Menu, X } from 'lucide-react';

function App() {
  const { userId, fetchTransactions, lastWeatherNotificationDate, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'tasks' | 'health' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  // Daily weather notification at 8:00 AM
  useEffect(() => {
    if (!userId) return;

    const checkWeather = async () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hours = now.getHours();

      if (hours === 8 && lastWeatherNotificationDate !== today) {
        const weather = await fetchWeather();
        if (weather) {
          const message = formatWeatherNotification(weather);
          addNotification({
            id: Date.now().toString(),
            title: 'Khởi đầu ngày mới',
            message: message,
            date: new Date().toISOString(),
            isRead: false,
            type: 'weather'
          });
          toast(message, { icon: '🌤️', duration: 6000 });
          speakWeather(message);
        }
      }
    };

    checkWeather();
    const interval = setInterval(checkWeather, 60000);
    return () => clearInterval(interval);
  }, [userId, lastWeatherNotificationDate, addNotification]);

  // Check if user tries to access Finance without login
  useEffect(() => {
    if (activeTab === 'finance' && !userId) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [activeTab, userId]);

  return (
    <>
      {/* Login Modal - only show when accessing Finance */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Đăng nhập</h3>
            <p className="text-slate-500 mb-6">Bạn cần đăng nhập để truy cập Tài chính</p>
            <Login />
            <button
              onClick={() => {
                setShowLoginModal(false);
                setActiveTab('dashboard');
              }}
              className="mt-4 w-full py-3 text-slate-600 hover:text-slate-900 font-bold text-sm"
            >
              Quay lại Tổng quan
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#F8FAFC] flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar container */}
        <div
          className={`fixed inset-y-0 left-0 z-[80] w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab as any);
              setIsSidebarOpen(false);
            }}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50/50">
          {/* Mobile Header Toggle */}
          <div className="lg:hidden p-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <Menu size={18} />
              </div>
              <span className="font-black text-slate-900">MyLife</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-100"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {activeTab === 'dashboard' && <DashboardHome />}
          {activeTab === 'finance' && userId && <FinanceApp />}
          {activeTab === 'settings' && <SettingsApp />}

          {/* Placeholders for other tabs */}
          {(activeTab === 'tasks' || activeTab === 'health') && (
            <div className="flex-1 flex items-center justify-center p-10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto border-4 border-white shadow-soft-sm">
                  <Menu size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight capitalize">{activeTab}</h3>
                <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">Tính năng này đang được phát triển. Anh vui lòng quay lại sau nhé!</p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-blue-500 font-black text-xs uppercase tracking-widest hover:underline"
                >
                  Quay lại Tổng quan
                </button>
              </div>
            </div>
          )}
        </main>

        <Toaster position="top-right" />
      </div>
    </>
  );
}

export default App;
