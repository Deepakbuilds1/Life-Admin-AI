import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  X, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { AIMemory } from '../../types';
import { extractMemoryApi } from '../../services/api';

interface Props {
  memories: AIMemory[];
  onAddMemory: (mem: AIMemory) => void;
  onUpdateMemory: (mem: AIMemory) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
}

export const MemoriesView: React.FC<Props> = ({
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  onClearAllMemories,
}) => {
  const [inputStatement, setInputStatement] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMemory, setExtractedMemory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStatement.trim()) return;

    setIsExtracting(true);
    try {
      const res = await extractMemoryApi(inputStatement);
      if (res.success && res.memory) {
        setExtractedMemory(res.memory);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setExtractedMemory({
        key: 'Saved Detail',
        value: inputStatement,
        category: 'General',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmSave = () => {
    if (!extractedMemory) return;
    const newMem: AIMemory = {
      id: 'mem_' + Date.now(),
      key: extractedMemory.key || 'Fact',
      value: extractedMemory.value || inputStatement,
      category: extractedMemory.category || 'General',
      createdAt: '2026-08-08',
    };
    onAddMemory(newMem);
    setExtractedMemory(null);
    setInputStatement('');
  };

  const filteredMemories = memories.filter(
    (m) =>
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-600" />
          <span>“Remember This” AI Memory Store</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Tell AI facts to remember (e.g., "My passport expires in 2030"). AI stores long-term facts securely.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <form onSubmit={handleExtract} className="space-y-3">
          <label className="font-bold text-sm text-slate-800">Tell AI What to Remember</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputStatement}
              onChange={(e) => setInputStatement(e.target.value)}
              placeholder='e.g., "Remember that my Wi-Fi customer ID is 1088920144"'
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={isExtracting || !inputStatement.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isExtracting ? 'Analyzing...' : 'Remember'}</span>
            </button>
          </div>
        </form>

        {/* Confirmation Proposal Box */}
        {extractedMemory && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Extracted Memory Fact — Confirm Before Saving:</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-indigo-100 text-xs space-y-1">
              <div><span className="font-bold text-slate-500">Key:</span> <span className="font-bold text-slate-900">{extractedMemory.key}</span></div>
              <div><span className="font-bold text-slate-500">Value:</span> <span className="text-slate-800">{extractedMemory.value}</span></div>
              <div><span className="font-bold text-slate-500">Category:</span> <span className="font-semibold text-indigo-600">{extractedMemory.category}</span></div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setExtractedMemory(null)}
                className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Save Memory</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Memories Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base text-slate-900">Saved Long-Term Memories ({memories.length})</h3>
            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">ENCRYPTED AT REST</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>

            {memories.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-rose-600 font-bold hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition shrink-0"
              >
                Delete All
              </button>
            )}
          </div>
        </div>

        {/* Delete All Modal */}
        {showClearConfirm && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Are you sure you want to delete all saved memories? This action cannot be undone.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllMemories();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        )}

        {/* Memories List */}
        {filteredMemories.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-1">
            <Brain className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No Memories Saved Yet</div>
            <p className="text-xs text-slate-400">Use the input above to ask AI to remember key details.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMemories.map((mem) => {
              const isEditing = editingId === mem.id;
              return (
                <div key={mem.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {mem.key}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{mem.category}</span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onUpdateMemory({ ...mem, value: editVal });
                            setEditingId(null);
                          }}
                          className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-800 font-medium">{mem.value}</p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>Added {mem.createdAt}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(mem.id);
                          setEditVal(mem.value);
                        }}
                        className="p-1 hover:text-indigo-600 transition"
                        title="Edit Memory"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="p-1 hover:text-rose-600 transition"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
