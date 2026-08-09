import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Languages, 
  Plus, 
  User, 
  LogOut, 
  ShieldCheck, 
  FileText, 
  CheckSquare, 
  Receipt,
  X,
  Smartphone,
  Check,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { UserProfile, DocumentItem, TaskItem, BillItem, SyncStatus } from '../../types';
import { WebSocketConnectionStatus } from '../../services/websocket';

interface Props {
  user: UserProfile;
  unreadCount: number;
  documents: DocumentItem[];
  tasks: TaskItem[];
  bills: BillItem[];
  isOnline?: boolean;
  syncStatus?: SyncStatus;
  wsStatus?: WebSocketConnectionStatus;
  onOpenUpload: () => void;
  setActiveTab: (tab: string) => void;
  onToggleLanguage: () => void;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({
  user,
  unreadCount,
  documents,
  tasks,
  bills,
  isOnline = true,
  syncStatus = 'local_only',
  wsStatus,
  onOpenUpload,
  setActiveTab,
  onToggleLanguage,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Search filter across documents, tasks, and bills
  const filteredDocs = searchQuery.trim()
    ? documents.filter((d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredTasks = searchQuery.trim()
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredBills = searchQuery.trim()
    ? bills.filter((b) =>
        b.billerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const totalResults = filteredDocs.length + filteredTasks.length + filteredBills.length;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, tasks, bills..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Sync / Storage / Realtime Status Badge */}
        <button
          onClick={() => setActiveTab('settings')}
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-[11px] font-bold text-slate-700"
          title="Data Storage & Real-Time Sync Settings"
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span>Offline Mode</span>
            </>
          ) : wsStatus === 'CONNECTING' || wsStatus === 'RECONNECTING' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>⚡ Reconnecting...</span>
            </>
          ) : wsStatus === 'CONNECTED' && syncStatus === 'synced' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>⚡ Realtime Synced</span>
            </>
          ) : syncStatus === 'syncing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : syncStatus === 'sync_failed' ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Sync Failed</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>📱 Local Only</span>
            </>
          )}
        </button>

        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-100 transition"
          title="Toggle Language"
        >
          <Languages className="w-3.5 h-3.5 text-indigo-600" />
          <span>{user.language === 'en' ? 'EN' : 'हिंदी'}</span>
        </button>

        {/* Quick Add Document CTA */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Doc</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative text-slate-400 hover:text-slate-600 p-1.5 transition"
        >
          <Bell className="w-5 h-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* User Info & Avatar */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 hover:opacity-90 transition text-left"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
              <div className="text-[11px] font-medium text-slate-500">Pro Member</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shadow-xs border border-indigo-200">
              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'RS'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-10 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-xs text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('security');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Security & Privacy</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-2"
              >
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Account Settings</span>
              </button>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
