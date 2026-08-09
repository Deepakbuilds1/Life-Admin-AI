import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  FolderLock, 
  Clock, 
  Eye, 
  HelpCircle,
  Zap,
  Lock
} from 'lucide-react';

interface Props {
  onStartDemo: () => void;
  onOpenAuthModal: () => void;
}

export const LandingView: React.FC<Props> = ({ onStartDemo, onOpenAuthModal }) => {
  return (
    <div className="space-y-16 pb-16 pt-4">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Meet Your Digital Personal Administrative Assistant</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Your Life Has Too Many Things to Remember.
        </h1>

        <p className="text-base sm:text-xl font-medium text-slate-600 dark:text-slate-300">
          Understand less. Accomplish more. Upload electricity bills, college notices, insurance documents, or government letters — Life Admin AI converts complicated paperwork into clear checklists and reminders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <span>Try Demo Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition"
          >
            Sign In / Register
          </button>
        </div>

        <div className="flex items-center justify-center space-x-6 text-xs text-slate-400 pt-3">
          <span className="flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strict Server-Side Auth</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span>Masks Sensitive Numbers</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Cited Source Evidence</span>
          </span>
        </div>
      </div>

      {/* Product Workflow: Understand -> Extract -> Organize -> Act -> Remind -> Complete */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
            End-to-End Administrative Journey
          </h2>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            How Life Admin AI Handles Paperwork
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center text-xs">
          {[
            { step: '1. Understand', desc: 'Analyzes document context & type' },
            { step: '2. Extract', desc: 'Finds dates, amounts, & requirements' },
            { step: '3. Organize', desc: 'Categories in Document Vault' },
            { step: '4. Act', desc: 'Prepares sub-task checklists' },
            { step: '5. Remind', desc: 'Sets custom time reminders' },
            { step: '6. Complete', desc: 'Tracks status to 100% finished' },
          ].map((s, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-extrabold text-slate-900 dark:text-white block">{s.step}</span>
              <p className="text-[10px] text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Upload Any Notice or Bill</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Drag and drop electricity bills, water invoices, college notices, or lease forms. AI parses raw details instantly.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Explain Simply in 3 Sentences</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Converts complex legal, tax, or government jargon into plain 5th-grade language or simplified Hindi explanations.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Source-Grounded Accuracy</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Never invents facts. Every extracted date or fee includes a "View Source" button highlighting exact document evidence.
          </p>
        </div>
      </div>
    </div>
  );
};
