import React from 'react';
import { 
  LayoutDashboard, 
  FolderLock, 
  CheckSquare, 
  Receipt, 
  Calendar, 
  Bell, 
  Bot, 
  Shield, 
  Settings,
  PlusCircle,
  Inbox,
  Brain
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  pendingTasksCount: number;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  pendingTasksCount,
  onOpenUpload,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Smart Inbox', icon: Inbox },
    { id: 'documents', label: 'Documents', icon: FolderLock },
    { 
      id: 'tasks', 
      label: 'Tasks', 
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'memories', label: 'Remember This', icon: Brain },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'chat', label: 'AI Assistant', icon: Bot, highlight: true },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white sticky top-0 h-screen z-30 shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-base shadow-xs">
            L
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">Life Admin AI</h1>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Personal Assistant
            </span>
          </div>
        </div>

        {/* Quick Upload CTA */}
        <div className="px-4 py-3">
          <button
            onClick={onOpenUpload}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4 text-indigo-100" />
            <span>Add Document</span>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-sm transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-indigo-600'
                        : item.highlight
                        ? 'text-indigo-500'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                      item.badgeColor || 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Vault / Storage Widget in Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xs space-y-2">
            <div className="text-[10px] opacity-70 font-bold uppercase tracking-wider">VAULT STORAGE</div>
            <div className="text-xs font-bold">1.2 GB of 5 GB used</div>
            <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-400 h-full w-[24%] rounded-full"></div>
            </div>
            <button 
              onClick={onOpenUpload}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold rounded-lg transition"
            >
              Manage Storage
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'documents', label: 'Docs', icon: FolderLock },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount },
          { id: 'bills', label: 'Bills', icon: Receipt },
          { id: 'chat', label: 'Ask AI', icon: Bot },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg relative ${
                isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {Boolean(item.badge) && (
                <span className="absolute top-0 right-2 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
