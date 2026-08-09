import React, { useState, useEffect } from 'react';
import { 
  INITIAL_USER, 
  INITIAL_TASKS, 
  INITIAL_BILLS, 
  INITIAL_DOCUMENTS, 
  INITIAL_SECURITY_LOGS,
  INITIAL_MEMORIES 
} from './data/sampleData';
import { TaskItem, BillItem, DocumentItem, UserProfile, SecurityActivityLog, AIMemory, CalendarEvent, SyncStatus } from './types';
import { dbStorage } from './services/dbStorage';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { DashboardView } from './components/views/DashboardView';
import { DocumentUploadView } from './components/views/DocumentUploadView';
import { DocumentVaultView } from './components/views/DocumentVaultView';
import { TasksView } from './components/views/TasksView';
import { BillsView } from './components/views/BillsView';
import { CalendarView } from './components/views/CalendarView';
import { AIChatView } from './components/views/AIChatView';
import { SecurityView } from './components/views/SecurityView';
import { SmartInboxView } from './components/views/SmartInboxView';
import { MemoriesView } from './components/views/MemoriesView';
import { SettingsView } from './components/views/SettingsView';
import { LandingView } from './components/views/LandingView';
import { ExplainSimplyModal } from './components/modals/ExplainSimplyModal';
import { SourceHighlightModal } from './components/modals/SourceHighlightModal';
import { Lock, LogIn, UserPlus, X, ShieldCheck } from 'lucide-react';

export default function App() {
  // State
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [bills, setBills] = useState<BillItem[]>(INITIAL_BILLS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [securityLogs, setSecurityLogs] = useState<SecurityActivityLog[]>(INITIAL_SECURITY_LOGS);
  const [memories, setMemories] = useState<AIMemory[]>(INITIAL_MEMORIES);

  // Network & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local_only');

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Network Status Effect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user.cloudSyncEnabled) {
        handleTriggerSync();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('local_only');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user.cloudSyncEnabled]);

  // Initial Load from Local IndexedDB Storage
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedUser = await dbStorage.loadUser();
        const storedTasks = await dbStorage.loadCollection<TaskItem>('tasks');
        const storedBills = await dbStorage.loadCollection<BillItem>('bills');
        const storedDocs = await dbStorage.loadCollection<DocumentItem>('documents');
        const storedMems = await dbStorage.loadCollection<AIMemory>('memories');
        const storedLogs = await dbStorage.loadCollection<SecurityActivityLog>('securityLogs');

        if (storedUser) setUser(storedUser);
        if (storedTasks && storedTasks.length > 0) setTasks(storedTasks);
        if (storedBills && storedBills.length > 0) setBills(storedBills);
        if (storedDocs && storedDocs.length > 0) setDocuments(storedDocs);
        if (storedMems && storedMems.length > 0) setMemories(storedMems);
        if (storedLogs && storedLogs.length > 0) setSecurityLogs(storedLogs);

        // If completely empty first run, seed storage with default data
        if (!storedTasks || storedTasks.length === 0) {
          await dbStorage.saveCollection('tasks', INITIAL_TASKS);
          await dbStorage.saveCollection('bills', INITIAL_BILLS);
          await dbStorage.saveCollection('documents', INITIAL_DOCUMENTS);
          await dbStorage.saveCollection('memories', INITIAL_MEMORIES);
          await dbStorage.saveCollection('securityLogs', INITIAL_SECURITY_LOGS);
          await dbStorage.saveUser(INITIAL_USER);
        }
      } catch (e) {
        console.error('Error initializing local database:', e);
      }
    }
    loadStoredData();
  }, []);

  // Save to IndexedDB on any state change
  useEffect(() => {
    dbStorage.saveUser(user);
  }, [user]);

  useEffect(() => {
    dbStorage.saveCollection('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    dbStorage.saveCollection('bills', bills);
  }, [bills]);

  useEffect(() => {
    dbStorage.saveCollection('documents', documents);
  }, [documents]);

  useEffect(() => {
    dbStorage.saveCollection('memories', memories);
  }, [memories]);

  useEffect(() => {
    dbStorage.saveCollection('securityLogs', securityLogs);
  }, [securityLogs]);

  // Sync Handler
  const handleTriggerSync = () => {
    if (!isOnline) {
      setSyncStatus('sync_failed');
      return;
    }
    if (!user.cloudSyncEnabled) {
      setSyncStatus('local_only');
      return;
    }

    setSyncStatus('syncing');
    setTimeout(() => {
      const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setUser((prev) => ({ ...prev, lastSyncedAt: `Today at ${nowFormatted}` }));
      setSyncStatus('synced');
    }, 1200);
  };

  // Restore/Import Handler
  const handleImportData = async (data: {
    tasks?: TaskItem[];
    bills?: BillItem[];
    documents?: DocumentItem[];
    memories?: AIMemory[];
    user?: UserProfile;
  }) => {
    if (data.tasks) {
      setTasks(data.tasks);
      await dbStorage.saveCollection('tasks', data.tasks);
    }
    if (data.bills) {
      setBills(data.bills);
      await dbStorage.saveCollection('bills', data.bills);
    }
    if (data.documents) {
      setDocuments(data.documents);
      await dbStorage.saveCollection('documents', data.documents);
    }
    if (data.memories) {
      setMemories(data.memories);
      await dbStorage.saveCollection('memories', data.memories);
    }
    if (data.user) {
      setUser(data.user);
      await dbStorage.saveUser(data.user);
    }
  };

  // Modals state
  const [explainModal, setExplainModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    summary: any;
  }>({
    isOpen: false,
    title: '',
    content: '',
    summary: null,
  });

  const [sourceModal, setSourceModal] = useState<{
    isOpen: boolean;
    docTitle: string;
    field: string;
    val: string;
    srcTxt?: string;
    srcLoc?: string;
    fullTxt?: string;
  }>({
    isOpen: false,
    docTitle: '',
    field: '',
    val: '',
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');

  // Calculations
  const pendingApprovalsCount = tasks.filter((t) => t.status === 'Pending Approval').length;
  const overdueCount = tasks.filter((t) => t.status === 'Active' && new Date(t.dueDate) < new Date('2026-08-08')).length;

  // Handlers
  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Completed' } : t))
    );
  };

  const handleApproveTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Active' } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSnoozeTask = (taskId: string, days: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const current = new Date(t.dueDate);
        current.setDate(current.getDate() + days);
        return { ...t, dueDate: current.toISOString().split('T')[0] };
      })
    );
  };

  const handleAddNewTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleCheckitem = (taskId: string, checkitemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.checklists) return t;
        const updated = t.checklists.map((chk) =>
          chk.id === checkitemId ? { ...chk, completed: !chk.completed } : chk
        );
        return { ...t, checklists: updated };
      })
    );
  };

  const handlePayBill = (billId: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, status: 'Paid' } : b))
    );
  };

  const handleAddBill = (newBill: BillItem) => {
    setBills((prev) => [newBill, ...prev]);
  };

  const handleDocumentAdded = (newDoc: DocumentItem, newTasks: TaskItem[]) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setTasks((prev) => [...newTasks, ...prev]);
    setActiveTab('vault');
  };

  const handleDeleteDoc = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleToggleMasking = () => {
    setUser((prev) => ({ ...prev, maskSensitiveData: !prev.maskSensitiveData }));
  };

  const handleLogoutAllDevices = () => {
    setSecurityLogs((prev) => [
      {
        id: 'log_' + Date.now(),
        action: 'Terminated All Device Sessions',
        timestamp: 'Just now',
        ipAddress: '127.0.0.1',
        location: 'Current Browser Session',
        device: 'Web Client',
        status: 'Logged Out',
      },
      ...prev,
    ]);
  };

  const handleExportData = () => {
    const dataObj = { user, tasks, bills, documents, securityLogs };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Life_Admin_AI_Export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddMemory = (newMem: AIMemory) => {
    setMemories((prev) => [newMem, ...prev]);
  };

  const handleUpdateMemory = (updated: AIMemory) => {
    setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMemories = () => {
    setMemories([]);
  };

  const handleResetAllData = () => {
    setTasks([]);
    setBills([]);
    setDocuments([]);
    setMemories([]);
  };

  const handleDeleteAccount = () => {
    setUser({ ...user, name: 'Guest User', isAuthenticated: false });
    setTasks([]);
    setBills([]);
    setDocuments([]);
    setMemories([]);
    setActiveTab('landing');
  };

  const handleAddCalendarEvent = (event: CalendarEvent) => {
    // Also create task if applicable
    const newTask: TaskItem = {
      id: 'tsk_evt_' + Date.now(),
      title: event.title,
      dueDate: event.date,
      appointmentTime: event.time,
      priority: event.priority || 'Medium',
      status: 'Active',
      category: 'Personal',
      checklists: [],
      reminders: { enabled: true, timing: '3_days' },
      createdAt: '2026-08-08',
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleOpenSourceModal = (
    docTitle: string,
    field: string,
    val: string,
    srcTxt?: string,
    srcLoc?: string,
    fullTxt?: string
  ) => {
    setSourceModal({
      isOpen: true,
      docTitle,
      field,
      val,
      srcTxt,
      srcLoc,
      fullTxt,
    });
  };

  const handleOpenExplainModal = (title: string, content: string, summary: any) => {
    setExplainModal({
      isOpen: true,
      title,
      content,
      summary,
    });
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name: authEmail.split('@')[0] || 'Ananya Sharma',
      email: authEmail || 'ananya.s@example.com',
      isAuthenticated: true,
    });
    setAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased font-sans relative">
      {/* Top Header */}
      <Header
        user={user}
        unreadCount={pendingApprovalsCount + overdueCount}
        documents={documents}
        tasks={tasks}
        bills={bills}
        isOnline={isOnline}
        syncStatus={syncStatus}
        onOpenUpload={() => setActiveTab('upload')}
        setActiveTab={setActiveTab}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'))}
        onLogout={handleDeleteAccount}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-x-6">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingApprovalsCount={pendingApprovalsCount}
          user={user}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'landing' && (
            <LandingView
              onStartDemo={() => setActiveTab('dashboard')}
              onOpenAuthModal={() => setAuthModalOpen(true)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              tasks={tasks}
              bills={bills}
              documents={documents}
              onCompleteTask={handleCompleteTask}
              onPayBill={handlePayBill}
              onOpenUpload={() => setActiveTab('upload')}
              setActiveTab={setActiveTab}
              onViewSource={handleOpenSourceModal}
            />
          )}

          {activeTab === 'inbox' && (
            <SmartInboxView
              onAddTask={handleAddNewTask}
              onAddBill={handleAddBill}
              onAddEvent={handleAddCalendarEvent}
            />
          )}

          {activeTab === 'upload' && (
            <DocumentUploadView
              onDocumentAdded={handleDocumentAdded}
              onViewSource={handleOpenSourceModal}
              onOpenExplainSimply={handleOpenExplainModal}
            />
          )}

          {activeTab === 'vault' && (
            <DocumentVaultView
              documents={documents}
              onOpenUpload={() => setActiveTab('upload')}
              onDeleteDoc={handleDeleteDoc}
              onViewSource={handleOpenSourceModal}
              onOpenExplainSimply={handleOpenExplainModal}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentVaultView
              documents={documents}
              onOpenUpload={() => setActiveTab('upload')}
              onDeleteDoc={handleDeleteDoc}
              onViewSource={handleOpenSourceModal}
              onOpenExplainSimply={handleOpenExplainModal}
            />
          )}

          {activeTab === 'memories' && (
            <MemoriesView
              memories={memories}
              onAddMemory={handleAddMemory}
              onUpdateMemory={handleUpdateMemory}
              onDeleteMemory={handleDeleteMemory}
              onClearAllMemories={handleClearAllMemories}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={(upd) => setUser((prev) => ({ ...prev, ...upd }))}
              tasks={tasks}
              documents={documents}
              bills={bills}
              memories={memories}
              onResetAllData={handleResetAllData}
              onImportData={handleImportData}
              onTriggerSync={handleTriggerSync}
              isOnline={isOnline}
              syncStatus={syncStatus}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
              onApproveTask={handleApproveTask}
              onDeleteTask={handleDeleteTask}
              onSnoozeTask={handleSnoozeTask}
              onAddNewTask={handleAddNewTask}
              onToggleCheckitem={handleToggleCheckitem}
              onViewSource={handleOpenSourceModal}
            />
          )}

          {activeTab === 'bills' && (
            <BillsView
              bills={bills}
              onPayBill={handlePayBill}
              onAddBill={handleAddBill}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              bills={bills}
              documents={documents}
            />
          )}

          {activeTab === 'chat' && (
            <AIChatView
              documents={documents}
              tasks={tasks}
              bills={bills}
              language={language}
              onViewSource={handleOpenSourceModal}
            />
          )}

          {activeTab === 'security' && (
            <SecurityView
              user={user}
              securityLogs={securityLogs}
              onToggleMasking={handleToggleMasking}
              onLogoutAllDevices={handleLogoutAllDevices}
              onExportData={handleExportData}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </main>
      </div>

      {/* Floating AI Chat FAB Button */}
      {activeTab !== 'chat' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setActiveTab('chat')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-transform"
            title="Open AI Personal Assistant"
          >
            <span>💬</span>
          </button>
        </div>
      )}

      {/* Global Modals */}
      <ExplainSimplyModal
        isOpen={explainModal.isOpen}
        onClose={() => setExplainModal((prev) => ({ ...prev, isOpen: false }))}
        docTitle={explainModal.title}
        rawContent={explainModal.content}
        summary={explainModal.summary}
      />

      <SourceHighlightModal
        isOpen={sourceModal.isOpen}
        onClose={() => setSourceModal((prev) => ({ ...prev, isOpen: false }))}
        docTitle={sourceModal.docTitle}
        fieldName={sourceModal.field}
        extractedVal={sourceModal.val}
        sourceText={sourceModal.srcTxt}
        sourceLocation={sourceModal.srcLoc}
        fullDocText={sourceModal.fullTxt}
      />

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {authMode === 'login' ? 'Sign In to Life Admin AI' : 'Create Your Vault'}
                  </h3>
                  <p className="text-xs text-slate-500">Strict server-side encrypted authentication</p>
                </div>
              </div>

              <button
                onClick={() => setAuthModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  defaultValue="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-slate-800 dark:hover:bg-white transition"
              >
                {authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                {authMode === 'login' ? "Don't have an account? Register" : 'Already registered? Sign in'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUser({ ...user, isAuthenticated: true });
                  setAuthModalOpen(false);
                  setActiveTab('dashboard');
                }}
                className="text-slate-500 font-bold hover:underline"
              >
                Quick Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
