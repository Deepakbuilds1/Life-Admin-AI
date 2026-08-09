import React from 'react';
import { X, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  simplifiedText: string;
  loading: boolean;
}

export const ExplainSimplyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentTitle,
  simplifiedText,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Explain Simply</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plain 6th-grade translation for: {documentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500">Simplifying document language for you...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>This summary strips out legal and corporate jargon so you can quickly understand what is required.</span>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200">
              {simplifiedText}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-sm rounded-xl transition flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Got it, thanks</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
