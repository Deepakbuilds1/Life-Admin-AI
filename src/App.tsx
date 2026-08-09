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
import { AuthModal } from './components/modals/AuthModal';
import { auth, onAuthStateChanged } from './services/firebase';
import { cloudSyncService } from './services/cloudSync';
import { webSocketService, WebSocketConnectionStatus } from './services/websocket';
import { Lock, LogIn, UserPlus, X, ShieldCheck } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';

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
  const [wsStatus, setWsStatus] = useState<WebSocketConnectionStatus>('DISCONNECTED');

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
  const handleTriggerSync = async () => {
    if (!isOnline) {
      setSyncStatus('sync_failed');
      return;
    }
    if (user.storageMode === 'device_only' || !user.cloudSyncEnabled) {
      setSyncStatus('local_only');
      return;
    }

    setSyncStatus('syncing');
    const syncRes = await cloudSyncService.saveToCloud(user.id, user, tasks, bills, documents, memories);
    setSyncStatus(syncRes.status);
    if (syncRes.status === 'synced' && syncRes.data) {
      setUser(syncRes.data.user);
    }
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
  const [isReminderPrompt, setIsReminderPrompt] = useState(false);

  // Firebase Auth State Listener & Cloud Sync
  useEffect(() => {
    let cloudUnsubscribe: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (cloudUnsubscribe) {
        cloudUnsubscribe();
        cloudUnsubscribe = null;
      }

      if (fbUser) {
        // Base user details from Firebase
        setUser((prevUser) => {
          const updatedUser: UserProfile = {
            ...prevUser,
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || prevUser.name || 'User',
            email: fbUser.email || prevUser.email || '',
            isAuthenticated: true,
          };

          // Synchronize with cloud asynchronously if cloud sync is enabled
          if (updatedUser.storageMode !== 'device_only' && updatedUser.cloudSyncEnabled) {
            setSyncStatus('syncing');
            cloudSyncService
              .syncOnAuthLogin(fbUser.uid, updatedUser, tasks, bills, documents, memories)
              .then((res) => {
                setSyncStatus(res.status);
                if (res.status === 'synced' && res.data) {
                  setUser(res.data.user);
                  setTasks(res.data.tasks);
                  setBills(res.data.bills);
                  setDocuments(res.data.documents);
                  setMemories(res.data.memories);
                }
              })
              .catch((err) => {
                console.error('Failed cloud sync on login:', err);
                setSyncStatus('sync_failed');
              });

            // Subscribe to Firestore real-time updates
            cloudUnsubscribe = cloudSyncService.subscribeToCloudSync(fbUser.uid, (data) => {
              if (data) {
                if (data.tasks) setTasks(data.tasks);
                if (data.bills) setBills(data.bills);
                if (data.documents) setDocuments(data.documents);
                if (data.memories) setMemories(data.memories);
                if (data.user) setUser((prev) => ({ ...prev, ...data.user }));
                setSyncStatus('synced');
              }
            });
          } else {
            setSyncStatus('local_only');
          }

          return updatedUser;
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (cloudUnsubscribe) cloudUnsubscribe();
    };
  }, []);

  // Show authentication reminder popup after 2-3 minutes (120 seconds) if unauthenticated or guest
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user.isAuthenticated || user.name === 'Guest User') {
        setIsReminderPrompt(true);
        setAuthModalOpen(true);
      }
    }, 120000); // 2 minutes popup

    return () => clearTimeout(timer);
  }, [user.isAuthenticated, user.name]);

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

  const handleUpdateUser = (updatedProps: Partial<UserProfile>) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedProps };
      if (newUser.storageMode === 'device_only' || !newUser.cloudSyncEnabled) {
        setSyncStatus('local_only');
      } else if (
        (prev.storageMode === 'device_only' && newUser.storageMode === 'cloud_sync') ||
        (!prev.cloudSyncEnabled && newUser.cloudSyncEnabled)
      ) {
        // Toggled from Device Only -> Cloud Sync: trigger cloud sync immediately
        if (isOnline && newUser.isAuthenticated) {
          setSyncStatus('syncing');
          cloudSyncService
            .saveToCloud(newUser.id, newUser, tasks, bills, documents, memories)
            .then((res) => {
              setSyncStatus(res.status);
              if (res.status === 'synced' && res.data) {
                setUser(res.data.user);
              }
            });
        }
      }
      return newUser;
    });
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased font-sans relative transition-colors duration-200">
      {/* Top Header */}
      <Header
        user={user}
        unreadCount={pendingApprovalsCount + overdueCount}
        documents={documents}
        tasks={tasks}
        bills={bills}
        isOnline={isOnline}
        syncStatus={syncStatus}
        wsStatus={wsStatus}
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
              memories={memories}
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
              onUpdateUser={handleUpdateUser}
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
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        isReminderPrompt={isReminderPrompt}
        onAuthSuccess={(userProfile) => {
          setUser(userProfile);
          setAuthModalOpen(false);
          setIsReminderPrompt(false);
        }}
      />
      
      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}
