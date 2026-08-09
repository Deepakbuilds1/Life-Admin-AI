import React, { useState } from 'react';
import { 
  FolderLock, 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Archive, 
  Eye, 
  Download, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Plus,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { DocumentItem, DocumentCategory } from '../../types';

interface Props {
  documents: DocumentItem[];
  onOpenUpload: () => void;
  onDeleteDoc: (docId: string) => void;
  onViewSource: (docTitle: string, field: string, val: string, srcTxt?: string, srcLoc?: string, fullTxt?: string) => void;
  onOpenExplainSimply: (docTitle: string, content: string, summary: any) => void;
}

export const DocumentVaultView: React.FC<Props> = ({
  documents,
  onOpenUpload,
  onDeleteDoc,
  onViewSource,
  onOpenExplainSimply,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expiryFilter, setExpiryFilter] = useState<'All' | 'Valid' | 'Expiring Soon' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);

  const categories = [
    'All',
    'Bills',
    'Education',
    'Banking',
    'Government',
    'Insurance',
    'Employment',
    'Housing',
    'Personal',
    'Other',
  ];

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return 'Valid';
    const exp = new Date(expiryDate);
    const now = new Date('2026-08-08');
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays <= 180) return 'Expiring Soon';
    return 'Valid';
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const status = getExpiryStatus(doc.expiryDate);
    const matchesExpiry = expiryFilter === 'All' || status === expiryFilter;

    return matchesCategory && matchesSearch && matchesExpiry;
  });

  const handleDownload = (doc: DocumentItem) => {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || `${doc.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <FolderLock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Document Vault</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Encrypted personal document library with expiry tracking and smart extraction.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter Category Pills & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vault documents by name, keyword, or content..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-2xs"
            />
          </div>

          {/* Expiry Tracker Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            {(['All', 'Valid', 'Expiring Soon', 'Expired'] as const).map((ef) => (
              <button
                key={ef}
                onClick={() => setExpiryFilter(ef)}
                className={`px-3 py-1 rounded-lg transition ${
                  expiryFilter === ef
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {ef === 'Valid' && '🟢 '}
                {ef === 'Expiring Soon' && '🟡 '}
                {ef === 'Expired' && '🔴 '}
                {ef}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-3">
          <FolderLock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Documents Found</h3>
          <p className="text-xs text-slate-400">No vault items match your selected filter or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-[10px] font-bold">
                      {doc.category}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{doc.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{doc.summary?.whatIsThis}</p>
                </div>

                {/* Expiry Badge if tracked */}
                {doc.expiryDate && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Expiry: <strong>{doc.expiryDate}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setViewingDoc(doc)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Download document text"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                    title="Delete document from vault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DOCUMENT INSPECTOR MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Vault Document Details ({viewingDoc.category})
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{viewingDoc.title}</h2>
                <p className="text-xs text-slate-400 mt-1">Uploaded {viewingDoc.uploadDate} • {viewingDoc.fileName}</p>
              </div>

              <button
                onClick={() => setViewingDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Summary Block */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs sm:text-sm">
              <div>
                <strong className="text-slate-900 dark:text-white block">Overview:</strong>
                <p className="text-slate-600 dark:text-slate-300">{viewingDoc.summary?.whatIsThis}</p>
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block">Action Needed:</strong>
                <p className="text-slate-600 dark:text-slate-300">{viewingDoc.summary?.whatToDo}</p>
              </div>
            </div>

            {/* Extracted Facts */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Extracted Information ({viewingDoc.extractedInfo.length} Facts)
              </span>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden px-4">
                {viewingDoc.extractedInfo.map((fact, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">{fact.field}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{fact.value}</span>
                    </div>

                    <button
                      onClick={() => onViewSource(viewingDoc.title, fact.field, fact.value, fact.sourceText, fact.sourceLocation, viewingDoc.content)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      View Source
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Content Snippet */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Original Document Text Content
              </span>
              <pre className="font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                {viewingDoc.content}
              </pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  onOpenExplainSimply(viewingDoc.title, viewingDoc.content, viewingDoc.summary);
                }}
                className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold text-xs rounded-xl hover:bg-amber-100 transition"
              >
                Explain Simply
              </button>

              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
