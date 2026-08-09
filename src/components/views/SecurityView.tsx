import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Smartphone, 
  LogOut, 
  Download, 
  Trash2, 
  FileCheck,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { SecurityActivityLog, UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  securityLogs: SecurityActivityLog[];
  onToggleMasking: () => void;
  onLogoutAllDevices: () => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
}

export const SecurityView: React.FC<Props> = ({
  user,
  securityLogs,
  onToggleMasking,
  onLogoutAllDevices,
  onExportData,
  onDeleteAccount,
}) => {
  const [loggedOutAll, setLoggedOutAll] = useState(false);

  const handleLogoutAll = () => {
    setLoggedOutAll(true);
    onLogoutAllDevices();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Security & Privacy Control Center</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage strict server-side authorization, encryption, sensitive data masking, and session logs.
        </p>
      </div>

      {/* Sensitive Data Masking Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              {user.maskSensitiveData ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Sensitive Information Masking
              </h3>
              <p className="text-xs text-slate-500">
                Automatically masks 12-digit Aadhaar numbers, 16-digit cards, and bank account numbers (e.g. XXXX XXXX 4821).
              </p>
            </div>
          </div>

          <button
            onClick={onToggleMasking}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              user.maskSensitiveData
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {user.maskSensitiveData ? 'Enabled (Active)' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Security & Activity Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Sessions & Security Activity</h3>
          </div>

          <button
            onClick={handleLogoutAll}
            disabled={loggedOutAll}
            className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold text-xs rounded-xl hover:bg-rose-100 transition flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggedOutAll ? 'Logged Out All Devices' : 'Log Out All Devices'}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {securityLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                <p className="text-[10px] text-slate-500">{log.device} • {log.location} ({log.ipAddress})</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-bold text-[9px]">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Controls (Export Data, Delete Account) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Privacy Controls & Data Export</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Export Personal Data Archive</h4>
            <p className="text-[11px] text-slate-500">Download JSON dump of all stored documents, extracted tasks, and payment records.</p>
            <button
              onClick={onExportData}
              className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export My Data</span>
            </button>
          </div>

          <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
            <h4 className="font-bold text-rose-900 dark:text-rose-200 text-xs">Delete Account & Vault</h4>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">Irreversible action. Deletes all document records, tasks, and credentials.</p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to permanently delete your account and all stored documents?')) {
                  onDeleteAccount();
                }
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
