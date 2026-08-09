import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  Check,
  Cloud
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from '../../services/firebase';
import { UserProfile } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userProfile: UserProfile) => void;
  isReminderPrompt?: boolean;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  isReminderPrompt = false,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedStorageMode, setSelectedStorageMode] = useState<'cloud_sync' | 'device_only'>('cloud_sync');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const isCloudOn = selectedStorageMode === 'cloud_sync';
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCred.user;

        const newUserProfile: UserProfile = {
          id: fbUser.uid,
          name: name.trim() || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || email,
          language: 'en',
          maskSensitiveData: false,
          emailNotifications: true,
          dailySummary: true,
          deadlineAlerts: true,
          reminderTiming: '3_days',
          lifeAdminScore: 88,
          storageMode: selectedStorageMode,
          cloudSyncEnabled: isCloudOn,
          lastSyncedAt: isCloudOn ? 'Just now' : 'Local Only',
        };

        onAuthSuccess(newUserProfile);
        onClose();
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCred.user;

        const userProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Authenticated User',
          email: fbUser.email || email,
          language: 'en',
          maskSensitiveData: false,
          emailNotifications: true,
          dailySummary: true,
          deadlineAlerts: true,
          reminderTiming: '3_days',
          lifeAdminScore: 88,
          storageMode: selectedStorageMode,
          cloudSyncEnabled: isCloudOn,
          lastSyncedAt: isCloudOn ? 'Just now' : 'Local Only',
        };

        onAuthSuccess(userProfile);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errMsg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password. Please try again or sign up.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'An account with this email already exists. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password should be at least 6 characters.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const isCloudOn = selectedStorageMode === 'cloud_sync';
      const userProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        language: 'en',
        maskSensitiveData: false,
        emailNotifications: true,
        dailySummary: true,
        deadlineAlerts: true,
        reminderTiming: '3_days',
        lifeAdminScore: 88,
        storageMode: selectedStorageMode,
        cloudSyncEnabled: isCloudOn,
        lastSyncedAt: isCloudOn ? 'Just now' : 'Local Only',
      };

      onAuthSuccess(userProfile);
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background Decorative Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 rounded-full text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Firebase Secure Auth</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isReminderPrompt
              ? '⚡ Protect Your Life Admin Data'
              : isSignUp
              ? 'Create Your Secure Account'
              : 'Sign In to Life Admin AI'}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isReminderPrompt
              ? 'Sign in or create an account to activate Firebase cloud sync, multi-device backup, and encrypted vault storage.'
              : 'Access your tasks, bills, expiring documents, and AI memories across all your devices.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition ${
              !isSignUp
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition ${
              isSignUp
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Storage Choice Preference Selector */}
          <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Data Privacy & Storage Choice
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                Changeable anytime
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedStorageMode('cloud_sync')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  selectedStorageMode === 'cloud_sync'
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/90 border-indigo-500 text-indigo-950 dark:text-indigo-100 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Cloud className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="min-w-0 space-y-0.5">
                  <div className="truncate font-bold text-xs flex items-center gap-1">
                    <span>Cloud Sync</span>
                    <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-extrabold">Recommended</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    Encrypted Firebase Firestore backup & multi-device access
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStorageMode('device_only')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  selectedStorageMode === 'device_only'
                    ? 'bg-amber-50/90 dark:bg-amber-950/90 border-amber-500 text-amber-950 dark:text-amber-100 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0 space-y-0.5">
                  <div className="truncate font-bold text-xs">Device Only</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    100% Local sandbox; zero data leaves your browser
                  </div>
                </div>
              </button>
            </div>

            {/* Mode Benefits Explainer Card */}
            <div className="p-2.5 rounded-xl text-[11px] leading-relaxed transition border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              {selectedStorageMode === 'cloud_sync' ? (
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cloud Sync Benefits:</span>
                  </div>
                  <ul className="list-disc list-inside text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pl-0.5">
                    <li>Seamless automatic sync across phone, laptop, and tablet</li>
                    <li>Firebase AES-256 cloud encryption for vault documents</li>
                    <li>Prevents accidental data loss if browser storage is cleared</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Device Only Privacy:</span>
                  </div>
                  <ul className="list-disc list-inside text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pl-0.5">
                    <li>Strict local storage isolated to this browser instance</li>
                    <li>No document summaries or bill records transmitted to external clouds</li>
                    <li>Can be upgraded to Cloud Sync anytime in Settings</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Connecting to Firebase...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Sign Up & Sync' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google Sign In</span>
        </button>

        {/* Guest fallback option */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium underline"
          >
            Continue as Guest (Local Offline Mode)
          </button>
        </div>

      </div>
    </div>
  );
};
