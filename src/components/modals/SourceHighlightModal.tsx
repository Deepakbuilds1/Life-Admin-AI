import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  fieldLabel: string;
  extractedValue: string;
  sourceText?: string;
  sourceLocation?: string;
  fullContent?: string;
}

export const SourceHighlightModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentTitle,
  fieldLabel,
  extractedValue,
  sourceText,
  sourceLocation,
  fullContent,
}) => {
  if (!isOpen) return null;

  // Highlight the sourceText snippet inside the full text if available
  const renderHighlightedContent = () => {
    if (!fullContent) {
      return (
        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl text-sm font-mono text-amber-900 dark:text-amber-200">
          "{sourceText || extractedValue}"
        </div>
      );
    }

    if (!sourceText || sourceText.length < 3) {
      return (
        <pre className="font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto">
          {fullContent}
        </pre>
      );
    }

    const index = fullContent.toLowerCase().indexOf(sourceText.toLowerCase());
    if (index === -1) {
      return (
        <div className="space-y-3">
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
            <strong>Cited Phrase:</strong> "{sourceText}"
          </div>
          <pre className="font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto">
            {fullContent}
          </pre>
        </div>
      );
    }

    const before = fullContent.substring(0, index);
    const match = fullContent.substring(index, index + sourceText.length);
    const after = fullContent.substring(index + sourceText.length);

    return (
      <pre className="font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto">
        {before}
        <mark className="bg-amber-300 dark:bg-amber-600 text-slate-900 dark:text-white font-semibold px-1 rounded">
          {match}
        </mark>
        {after}
      </pre>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Source Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{documentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Extracted Fact ({fieldLabel})
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 inline-block">
              {extractedValue}
            </span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Source Location
            </span>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span>{sourceLocation || 'Page 1, Document Body'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Document Source Context (Highlighted)
            </span>
            <span className="text-xs text-slate-500 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Fact</span>
            </span>
          </div>

          {renderHighlightedContent()}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-sm rounded-xl transition flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Close Verification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
