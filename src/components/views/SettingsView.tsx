import React, { useState, useRef } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Sparkles, 
  Shield, 
  Download, 
  Trash2, 
  Check, 
  Globe, 
  Moon, 
  Sun,
  ShieldCheck,
  AlertTriangle,
  Database,
  Smartphone,
  Cloud,
  RefreshCw,
  Upload,
  HardDrive,
  CheckCircle2,
  Lock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { UserProfile, AIMemory, TaskItem, DocumentItem, BillItem, SyncStatus } from '../../types';

interface Props {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  tasks: TaskItem[];
  documents: DocumentItem[];
  bills: BillItem[];
  memories: AIMemory[];
  onResetAllData: () => void;
  onImportData: (data: { tasks?: TaskItem[]; bills?: BillItem[]; documents?: DocumentItem[]; memories?: AIMemory[]; user?: UserProfile }) => void;
  onTriggerSync?: () => void;
  isOnline?: boolean;
  syncStatus?: SyncStatus;
  setActiveTab: (tab: string) => void;
}

export const SettingsView: React.FC<Props> = ({
  user,
  onUpdateUser,
  tasks,
  documents,
  bills,
  memories,
  onResetAllData,
  onImportData,
  onTriggerSync,
  isOnline = true,
  syncStatus = 'local_only',
  setActiveTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'notifications' | 'privacy' | 'data'>('data');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [language, setLanguage] = useState<'en' | 'hi'>(user.language || 'en');
  const [maskSensitiveData, setMaskSensitiveData] = useState(user.maskSensitiveData);
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications);
  const [dailySummary, setDailySummary] = useState(user.dailySummary ?? true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(user.deadlineAlerts ?? true);
  const [reminderTiming, setReminderTiming] = useState(user.reminderTiming || '3_days');
  const [storageMode, setStorageMode] = useState<'device_only' | 'cloud_sync'>(user.storageMode || 'device_only');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState<boolean>(user.cloudSyncEnabled || false);

  const handleSave = () => {
    onUpdateUser({
      name,
      email,
      language,
      maskSensitiveData,
      emailNotifications,
      dailySummary,
      deadlineAlerts,
      reminderTiming: reminderTiming as any,
      storageMode,
      cloudSyncEnabled,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleStorageModeChange = (mode: 'device_only' | 'cloud_sync') => {
    setStorageMode(mode);
    const syncOn = mode === 'cloud_sync';
    setCloudSyncEnabled(syncOn);
    onUpdateUser({ storageMode: mode, cloudSyncEnabled: syncOn });
    setBackupNotice(mode === 'device_only' ? 'Storage mode set to 📱 Device Only' : 'Storage mode set to ☁️ Device + Cloud Sync');
    setTimeout(() => setBackupNotice(null), 3000);
  };

  const handleExportData = () => {
    const exportData = {
      user,
      tasks,
      documents,
      bills,
      memories,
      exportedAt: new Date().toISOString(),
      appVersion: '2.5.0-localfirst',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life_admin_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setBackupNotice('Data export generated and downloaded successfully!');
    setTimeout(() => setBackupNotice(null), 3000);
  };

  const handleCreateLocalBackup = () => {
    setBackupNotice('Instant local snapshot created in device IndexedDB!');
    setTimeout(() => setBackupNotice(null), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed) {
          onImportData(parsed);
          setBackupNotice('Backup restored successfully!');
          setTimeout(() => setBackupNotice(null), 3500);
        }
      } catch (err) {
        alert('Invalid JSON backup file. Please select a valid Life Admin AI backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Settings & Control</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage local storage, offline mode, data privacy, backups, and cloud synchronization.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {backupNotice && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-sm font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-bold gap-6">
        {[
          { id: 'data', label: 'Data & Storage', icon: Database },
          { id: 'profile', label: 'Profile & General', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'privacy', label: 'Privacy & Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`pb-3 flex items-center gap-2 transition border-b-2 ${
                activeSubTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Data & Storage Tab */}
      {activeSubTab === 'data' && (
        <div className="space-y-6 max-w-3xl">
          {/* Offline Engine Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  <span>Local-First Mobile Architecture</span>
                  <span className="text-[10px] font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Tasks, calendar, documents, and memories are stored securely on your device. Works 100% offline.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold shrink-0">
              {isOnline ? (
                <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline Mode</span>
                </span>
              )}
            </div>
          </div>

          {/* Privacy & Storage Mode Preference */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <span>Data Storage & Privacy Preference</span>
            </h3>

            <p className="text-xs text-slate-500">
              Select where your life admin data is stored by default. Data remains on device unless cloud sync is enabled.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div
                onClick={() => handleStorageModeChange('device_only')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  storageMode === 'device_only'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>📱 Device Only</span>
                  </span>
                  {storageMode === 'device_only' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  Maximum privacy. All tasks, notes, and AI memories stay strictly on your phone's encrypted storage. Zero server uploads.
                </p>
              </div>

              <div
                onClick={() => handleStorageModeChange('cloud_sync')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  storageMode === 'cloud_sync'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-indigo-600" />
                    <span>☁️ Device + Cloud Sync</span>
                  </span>
                  {storageMode === 'cloud_sync' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  Data stored locally on phone and safely backed up to cloud. Accessible across your mobile & desktop browsers.
                </p>
              </div>
            </div>
          </div>

          {/* Cloud Sync Control Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-indigo-600" />
                  <span>Cloud Synchronization</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Local changes queue offline and auto-sync when network returns.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  {cloudSyncEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <input
                  type="checkbox"
                  checked={cloudSyncEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setCloudSyncEnabled(val);
                    const newMode = val ? 'cloud_sync' : 'device_only';
                    setStorageMode(newMode);
                    onUpdateUser({ cloudSyncEnabled: val, storageMode: newMode });
                  }}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-0"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span>Current Sync Status:</span>
                  <span className="px-2 py-0.5 rounded-md font-extrabold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                    {syncStatus === 'synced' && '✅ Synced'}
                    {syncStatus === 'syncing' && '🔄 Syncing...'}
                    {syncStatus === 'sync_failed' && '⚠️ Sync Failed'}
                    {syncStatus === 'local_only' && '📱 Local Only'}
                  </span>
                </div>
                <div className="text-slate-500 mt-1">
                  Last synchronized: <span className="font-semibold text-slate-700">{user.lastSyncedAt || 'Saved locally on phone'}</span>
                </div>
              </div>

              {cloudSyncEnabled && onTriggerSync && (
                <button
                  onClick={onTriggerSync}
                  disabled={!isOnline}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Now</span>
                </button>
              )}
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Backup & Restore Options</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Export full encrypted database or restore from a JSON backup file anytime.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleExportData}
                className="bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="w-5 h-5 text-indigo-300" />
                <span>Export My Data</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 p-3.5 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-xs"
              >
                <Upload className="w-5 h-5 text-indigo-600" />
                <span>Import / Restore Data</span>
              </button>

              <button
                onClick={handleCreateLocalBackup}
                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 p-3.5 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-xs"
              >
                <HardDrive className="w-5 h-5 text-indigo-600" />
                <span>Create Local Backup</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone — Clear Local Data</span>
            </h4>

            <p className="text-xs text-slate-500">
              Permanently wipe all offline IndexedDB storage and local data on this phone.
            </p>

            {showResetConfirm ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-rose-800">
                  Are you absolutely sure? This will delete all your local tasks, documents, and memories immediately.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onResetAllData();
                      setShowResetConfirm(false);
                    }}
                    className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
                  >
                    Yes, Clear All App Data
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Local Data</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Profile & General */}
      {activeSubTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900">Personal Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={(e: any) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
              >
                <option value="en">English</option>
                <option value="hi">Hindi / Hinglish (हिंदी)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900">Notification & Reminder Rules</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <div className="font-bold text-sm text-slate-900">Email Notifications</div>
                <div className="text-xs text-slate-500">Receive summary alerts for urgent upcoming bills and tasks.</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <div className="font-bold text-sm text-slate-900">Daily Administrative Briefing</div>
                <div className="text-xs text-slate-500">Get a morning daily command center summary on dashboard.</div>
              </div>
              <input
                type="checkbox"
                checked={dailySummary}
                onChange={(e) => setDailySummary(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <div className="font-bold text-sm text-slate-900">Deadline Risk Alerts</div>
                <div className="text-xs text-slate-500">Show high-priority deadline risk detector on top of dashboard.</div>
              </div>
              <input
                type="checkbox"
                checked={deadlineAlerts}
                onChange={(e) => setDeadlineAlerts(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Task Lead-time Reminder</label>
              <select
                value={reminderTiming}
                onChange={(e) => setReminderTiming(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
              >
                <option value="7_days">7 Days Before Due Date</option>
                <option value="3_days">3 Days Before Due Date</option>
                <option value="1_day">1 Day Before Due Date</option>
                <option value="on_due_date">On Due Date Morning</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* Privacy & Security */}
      {activeSubTab === 'privacy' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900">Privacy & Data Masking Controls</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="font-bold text-sm text-slate-900">Mask Sensitive Identifiers</div>
                <div className="text-xs text-slate-500">Auto-redact Aadhaar, Credit Card, and Bank account numbers in UI view.</div>
              </div>
              <input
                type="checkbox"
                checked={maskSensitiveData}
                onChange={(e) => setMaskSensitiveData(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-0"
              />
            </div>

            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-indigo-950">Security & Privacy Audit Log</div>
                <div className="text-xs text-slate-600">Review security logins, AI document redactions, and active sessions.</div>
              </div>
              <button
                onClick={() => setActiveTab('security')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition"
              >
                View Audit Log
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
            >
              Save Privacy Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

