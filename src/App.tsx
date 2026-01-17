import { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardHome } from './components/Dashboard/DashboardHome';
import { FinanceApp } from './components/Finance/FinanceApp';
import { SettingsApp } from './components/Settings/SettingsApp';
import { TasksApp } from './components/Tasks/TasksApp';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ChatPage } from './components/Chat/ChatPage';
import { AuthLayout } from './components/Layout/AuthLayout';
import { NotificationBell } from './components/Notifications/NotificationBell';
import { useStore } from './store/useStore';
import { Toaster, toast } from 'react-hot-toast';
import { fetchWeather, formatWeatherNotification } from './utils/weather';
import { playNotificationSound } from './utils/sound';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from './store/useAuthStore';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const { userId, fetchTransactions, lastWeatherNotificationDate, addNotification, setUserId } = useStore();
  const { setUser, setLoading, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'tasks' | 'chat' | 'health' | 'settings' | 'admin'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync user auth state with Firestore and setup listeners
  useEffect(() => {
    const { setupNotificationsListener } = useStore.getState();

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || userData.displayName,
            role: userData.role,
            createdAt: userData.createdAt || new Date().toISOString()
          });
          setUserId(firebaseUser.uid);
        } else {
          setUser(null);
          setUserId(null);
        }
      } else {
        setUser(null);
        setUserId(null);
      }
      setLoading(false);
    });

    // Setup notifications listener
    const unsubNotifications = setupNotificationsListener();

    return () => {
      unsubAuth();
      unsubNotifications();
    };
  }, [setUser, setLoading, setUserId]);

  // If user is Admin -> Access everything
  // If user is Staff -> Access limited? (For now allow all tabs)

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  // Check for upcoming task deadlines and send notifications
  useEffect(() => {
    const checkDeadlines = async () => {
      const { tasks, updateTask, addNotification } = useStore.getState();
      const currentUser = useAuthStore.getState().user;

      console.log('[Deadline Checker] Running...', {
        tasksCount: tasks.length,
        currentUser: currentUser?.displayName,
        currentUserId: currentUser?.uid
      });

      if (!currentUser) return;

      const now = Date.now();

      tasks.forEach(async (task) => {
        console.log('[Task Check]', task.title, {
          dueDate: task.dueDate,
          status: task.status,
          notified: task.notified,
          reminderTime: task.reminderTime,
          assigneeId: task.assigneeId,
          currentUserId: currentUser.uid
        });

        // Skip if no deadline, already done, or already notified
        if (!task.dueDate || task.status === 'done' || task.notified) {
          console.log('[Skip]', !task.dueDate ? 'No dueDate' : task.status === 'done' ? 'Task done' : 'Already notified');
          return;
        }

        // Notify if current user is EITHER the assignee OR the creator
        const isAssignee = task.assigneeId === currentUser.uid;
        const isCreator = task.creatorId === currentUser.uid;

        if (!isAssignee && !isCreator) {
          console.log('[Skip] Not assignee or creator');
          return;
        }

        // Skip if no reminder set
        if (!task.reminderTime || task.reminderTime === 'none') return;

        const deadline = new Date(task.dueDate).getTime();

        // Calculate reminder offset in minutes
        let reminderOffsetMinutes = 0;
        switch (task.reminderTime) {
          case '0m': reminderOffsetMinutes = 0; break;
          case '1m': reminderOffsetMinutes = 1; break;
          case '5m': reminderOffsetMinutes = 5; break;
          case '15m': reminderOffsetMinutes = 15; break;
          case '30m': reminderOffsetMinutes = 30; break;
          case '45m': reminderOffsetMinutes = 45; break;
          case '1h': reminderOffsetMinutes = 60; break;
          case '2h': reminderOffsetMinutes = 120; break;
          case '1d': reminderOffsetMinutes = 1440; break;
          default: return;
        }

        const reminderTime = deadline - (reminderOffsetMinutes * 60 * 1000);

        console.log('[Time Check]', task.title, {
          now: new Date(now).toLocaleString('vi-VN'),
          deadline: new Date(deadline).toLocaleString('vi-VN'),
          reminderTime: new Date(reminderTime).toLocaleString('vi-VN'),
          shouldNotify: now >= reminderTime && now < deadline
        });

        // If current time is past reminder time but before deadline
        if (now >= reminderTime && now < deadline) {
          // Format time label
          const timeLabel = task.reminderTime === '0m' ? 'ngay bây giờ' :
            task.reminderTime === '1m' ? '1 phút' :
              task.reminderTime === '5m' ? '5 phút' :
                task.reminderTime === '15m' ? '15 phút' :
                  task.reminderTime === '30m' ? '30 phút' :
                    task.reminderTime === '45m' ? '45 phút' :
                      task.reminderTime === '1h' ? '1 giờ' :
                        task.reminderTime === '2h' ? '2 giờ' : '1 ngày';

          console.log('[SENDING NOTIFICATION]', task.title);

          // Customize message based on role and timing
          const message = task.reminderTime === '0m'
            ? (isAssignee
              ? `Task "${task.title}" đang đến hạn ${timeLabel}!`
              : `Task "${task.title}" (đã giao cho người khác) đang đến hạn ${timeLabel}!`)
            : (isAssignee
              ? `Task "${task.title}" sẽ đến hạn trong ${timeLabel}`
              : `Task "${task.title}" (đã giao cho người khác) sẽ đến hạn trong ${timeLabel}`);

          // Send notification
          addNotification({
            id: `task-${task.id}-${Date.now()}`,
            type: 'deadline',
            title: '⏰ Sắp đến hạn!',
            message,
            date: new Date().toISOString(),
            isRead: false
          });

          // Play notification sound
          await playNotificationSound();

          // Show toast notification for immediate visibility
          toast.error(`⏰ ${message}`, {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
              fontWeight: 'bold',
              border: '2px solid #FCA5A5'
            }
          });

          // Mark as notified
          updateTask(task.id, { notified: true });
        }
      });
    };

    // Check immediately
    checkDeadlines();

    // Then check every 1 minute
    const interval = setInterval(checkDeadlines, 60000);

    return () => clearInterval(interval);
  }, []);

  // NUCLEAR RESET: Force clear old data one time
  useEffect(() => {
    const hasWiped = localStorage.getItem('has_wiped_data_v4');
    if (!hasWiped) {
      console.log("Performing nuclear data wipe...");
      localStorage.removeItem('expense-tracker-storage');
      localStorage.setItem('has_wiped_data_v4', 'true');
      window.location.reload();
    }
  }, []);

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
        }
      }
    };

    checkWeather();
    const interval = setInterval(checkWeather, 60000);
    return () => clearInterval(interval);
  }, [userId, lastWeatherNotificationDate, addNotification]);



  return (
    <>
      <AuthLayout>
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
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Chào buổi sáng, {user?.displayName || 'Anh Dũng'} 👋</h2>
                <p className="text-sm text-slate-500 font-medium">Hôm nay là thứ {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <NotificationBell />
            </div>

            {/* Mobile Header Toggle */}
            <div className="lg:hidden p-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <Menu size={18} />
                </div>
                <span className="font-black text-slate-900">MyLife</span>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-100"
                >
                  {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {activeTab === 'dashboard' && <DashboardHome />}
            {activeTab === 'finance' && <FinanceApp />}
            {activeTab === 'settings' && <SettingsApp />}
            {activeTab === 'tasks' && <TasksApp />}
            {activeTab === 'chat' && <ChatPage />}
            {activeTab === 'admin' && <AdminDashboard />}

            {/* Placeholders for other tabs */}
            {(activeTab === 'health') && (
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

        </div>
      </AuthLayout>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
