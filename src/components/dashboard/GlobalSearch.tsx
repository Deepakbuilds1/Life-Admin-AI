import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  X, 
  Receipt, 
  CheckSquare, 
  FileText, 
  Brain, 
  Calendar, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { TaskItem, BillItem, DocumentItem, AIMemory } from '../../types';

interface Props {
  tasks: TaskItem[];
  bills: BillItem[];
  documents: DocumentItem[];
  memories: AIMemory[];
  onCompleteTask: (taskId: string) => void;
  onPayBill: (billId: string) => void;
  setActiveTab: (tab: string) => void;
}

export const GlobalSearch: React.FC<Props> = ({
  tasks,
  bills,
  documents,
  memories,
  onCompleteTask,
  onPayBill,
  setActiveTab,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bills' | 'tasks' | 'docs' | 'memories'>('all');

  const todayStr = '2026-08-08';
  const currentMonth = '2026-08';

  // Sample natural language query presets
  const sampleQueries = [
    'show my overdue payments',
    'what expires this month',
    'upcoming tasks this week',
    'saved memories & facts',
    'electricity & utility bills',
  ];

  // Smart Query Interpreter & Search Logic
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        matchedBills: [],
        matchedTasks: [],
        matchedDocs: [],
        matchedMemories: [],
        intentExplanation: null,
      };
    }

    let isOverdueQuery = q.includes('overdue') || q.includes('late') || q.includes('unpaid') || q.includes('pending payment');
    let isPaymentQuery = q.includes('payment') || q.includes('bill') || q.includes('pay') || q.includes('electricity') || q.includes('water') || q.includes('rent');
    let isExpiryQuery = q.includes('expire') || q.includes('expiry') || q.includes('expiring') || q.includes('this month') || q.includes('renew');
    let isMemoryQuery = q.includes('memory') || q.includes('memories') || q.includes('fact') || q.includes('remember') || q.includes('saved');
    let isTaskQuery = q.includes('task') || q.includes('due') || q.includes('todo') || q.includes('upcoming');

    let intentText = '';
    if (isOverdueQuery && isPaymentQuery) {
      intentText = 'Filtering unpaid bills & overdue payment obligations';
    } else if (isExpiryQuery) {
      intentText = `Searching documents & obligations expiring in ${currentMonth}`;
    } else if (isMemoryQuery) {
      intentText = 'Filtering saved AI memories and captured facts';
    } else if (isTaskQuery) {
      intentText = 'Filtering active tasks, deadlines, and reminders';
    } else {
      intentText = `Searching across tasks, notes, bills, documents & AI memories for "${q}"`;
    }

    // Bills filter
    let matchedBills = bills.filter((b) => {
      if (isOverdueQuery) return b.status === 'Unpaid' || b.status === 'Overdue';
      if (isPaymentQuery) return true;
      return (
        b.billerName.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
      );
    });

    // Tasks filter
    let matchedTasks = tasks.filter((t) => {
      if (isOverdueQuery) return t.dueDate < todayStr && t.status === 'Active';
      if (isTaskQuery) return t.status === 'Active';
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    });

    // Documents filter
    let matchedDocs = documents.filter((d) => {
      if (isExpiryQuery) {
        return (
          (d.expiryDate && d.expiryDate.startsWith(currentMonth)) ||
          d.title.toLowerCase().includes('insurance') ||
          d.title.toLowerCase().includes('passport') ||
          d.title.toLowerCase().includes('license')
        );
      }
      return (
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        (d.summary?.whatIsThis && d.summary.whatIsThis.toLowerCase().includes(q))
      );
    });

    // Memories filter
    let matchedMemories = memories.filter((m) => {
      if (isMemoryQuery) return true;
      return (
        m.key.toLowerCase().includes(q) ||
        m.value.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });

    return {
      matchedBills,
      matchedTasks,
      matchedDocs,
      matchedMemories,
      intentExplanation: intentText,
    };
  }, [query, bills, tasks, documents, memories]);

  const totalResults =
    searchResults.matchedBills.length +
    searchResults.matchedTasks.length +
    searchResults.matchedDocs.length +
    searchResults.matchedMemories.length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Search Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Unified Natural Language Search</h3>
            <p className="text-xs text-slate-500">
              Query across tasks, notes, bills, expiring documents, and AI memories.
            </p>
          </div>
        </div>
      </div>

      {/* Main Input Field */}
      <div className="relative">
        <Search className="w-5 h-5 text-indigo-500 absolute left-4 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'show my overdue payments', 'what expires this month', or type any keyword..."
          className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition shadow-inner"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preset Natural Language Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Quick Prompts:
        </span>
        {sampleQueries.map((preset) => (
          <button
            key={preset}
            onClick={() => setQuery(preset)}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap border transition shrink-0 ${
              query === preset
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Active Search Intent & Results Breakdown */}
      {query.trim() && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          {searchResults.intentExplanation && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-medium">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{searchResults.intentExplanation}</span>
              </div>
              <span className="font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[10px]">
                {totalResults} {totalResults === 1 ? 'match' : 'matches'}
              </span>
            </div>
          )}

          {totalResults === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm">
              No matching records found for "{query}". Try searching "overdue", "insurance", "electricity", or "tasks".
            </div>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {/* Bills Results */}
              {searchResults.matchedBills.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Bills & Payments ({searchResults.matchedBills.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.matchedBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{bill.billerName}</div>
                          <div className="text-slate-500 mt-0.5">
                            Due: <span className="font-semibold text-slate-700">{bill.dueDate}</span> • ₹{bill.amount}
                          </div>
                        </div>
                        {bill.status === 'Unpaid' ? (
                          <button
                            onClick={() => onPayBill(bill.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-xs transition shrink-0"
                          >
                            Pay Bill
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Results */}
              {searchResults.matchedTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tasks & Deadlines ({searchResults.matchedTasks.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.matchedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="pr-2 min-w-0">
                          <div className="font-bold text-slate-900 truncate">{task.title}</div>
                          <div className="text-slate-500 mt-0.5 truncate">
                            Due: {task.dueDate} • Priority: <span className="font-semibold text-slate-700">{task.priority}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onCompleteTask(task.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold shadow-xs transition shrink-0"
                        >
                          Mark Done
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Results */}
              {searchResults.matchedDocs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Documents & Files ({searchResults.matchedDocs.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.matchedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 truncate">{doc.title}</div>
                          <div className="text-slate-500 mt-0.5">
                            Category: {doc.category} {doc.expiryDate && `• Expires: ${doc.expiryDate}`}
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('documents')}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 shrink-0"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memories Results */}
              {searchResults.matchedMemories.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Saved Memories ({searchResults.matchedMemories.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.matchedMemories.map((mem) => (
                      <div
                        key={mem.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                      >
                        <div className="font-bold text-indigo-900">{mem.key}</div>
                        <div className="text-slate-700">{mem.value}</div>
                        <div className="text-[10px] text-slate-400">Category: {mem.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
