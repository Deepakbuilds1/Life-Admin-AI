import React, { useState } from 'react';
import { 
  Inbox, 
  Sparkles, 
  Plus, 
  Check, 
  X, 
  Calendar, 
  Receipt, 
  UserCheck, 
  FileText, 
  Clock, 
  AlertCircle,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { TaskItem, BillItem, CalendarEvent } from '../../types';
import { analyzeInboxApi } from '../../services/api';

interface Props {
  onAddTask: (task: TaskItem) => void;
  onAddBill: (bill: BillItem) => void;
  onAddEvent: (event: CalendarEvent) => void;
  onAddMemory?: (statement: string) => void;
}

export const SmartInboxView: React.FC<Props> = ({
  onAddTask,
  onAddBill,
  onAddEvent,
}) => {
  const [inputText, setInputText] = useState('');
  const [sourceType, setSourceType] = useState<'Text' | 'Email/Paste' | 'Note'>('Email/Paste');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [savedCount, setSavedCount] = useState(0);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeInboxApi({ rawText: inputText, sourceType });
      if (res.success && res.extraction) {
        setAnalysisResult(res.extraction);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveTask = (taskObj: any, index: number) => {
    const newTask: TaskItem = {
      id: 'tsk_inbox_' + Date.now() + '_' + index,
      title: taskObj.title || 'Extracted Task',
      description: taskObj.description || '',
      dueDate: taskObj.dueDate || '2026-08-20',
      priority: taskObj.priority === 'High' ? 'High' : taskObj.priority === 'Low' ? 'Low' : 'Medium',
      status: 'Active',
      category: taskObj.category || 'Personal',
      amount: taskObj.amount,
      recurring: taskObj.recurring || 'None',
      checklists: [],
      reminders: { enabled: true, timing: '3_days' },
      createdAt: '2026-08-08',
    };
    onAddTask(newTask);
    setSavedCount((c) => c + 1);

    // Remove from candidate list
    setAnalysisResult((prev: any) => ({
      ...prev,
      extractedTasks: prev.extractedTasks.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleApprovePayment = (payObj: any, index: number) => {
    const newBill: BillItem = {
      id: 'bill_inbox_' + Date.now() + '_' + index,
      billerName: payObj.billerName || 'Biller',
      category: payObj.category || 'Other',
      amount: Number(payObj.amount) || 500,
      currency: '₹',
      dueDate: payObj.dueDate || '2026-08-20',
      status: 'Unpaid',
      autoRecognized: true,
    };
    onAddBill(newBill);
    setSavedCount((c) => c + 1);

    setAnalysisResult((prev: any) => ({
      ...prev,
      extractedPayments: prev.extractedPayments.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleApproveAppointment = (appObj: any, index: number) => {
    const newEvent: CalendarEvent = {
      id: 'evt_inbox_' + Date.now() + '_' + index,
      title: appObj.title || 'Appointment',
      date: appObj.date || '2026-08-20',
      time: appObj.time || '10:00 AM',
      type: 'Appointment',
      priority: appObj.priority || 'Medium',
    };
    onAddEvent(newEvent);
    setSavedCount((c) => c + 1);

    setAnalysisResult((prev: any) => ({
      ...prev,
      extractedAppointments: prev.extractedAppointments.filter((_: any, i: number) => i !== index),
    }));
  };

  const sampleTexts = [
    {
      label: 'Sample Email Notice',
      text: `Hi Ananya, Please remember that your car insurance renewal for DL-01-AB-1234 is due on 25 August 2026. The premium amount is ₹8,500. Call agent Rajesh at 9876543210 for queries.`,
    },
    {
      label: 'Sample Message Note',
      text: `Meeting with Dr. Verma tomorrow at 4 PM for annual health checkup. Remember to bring blood test reports.`,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Inbox className="w-6 h-6 text-indigo-600" />
          <span>Smart Life Inbox</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Paste emails, typed notes, or messages. AI extracts tasks, dates, contacts, and payments for your review.
        </p>
      </div>

      {/* Capture Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="font-bold text-sm text-slate-800">Paste or Type Content</label>
          <div className="flex gap-2">
            {sampleTexts.map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(st.text)}
                className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
              >
                + {st.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste email, SMS, notice, or type instructions (e.g. 'Car insurance renewal due on 25th August, ₹8,500...')."
          className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition resize-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            🔒 Content is analyzed privately on your account. No data is stored publicly.
          </span>

          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Extracting Action Items...' : 'Extract & Preview'}</span>
          </button>
        </div>
      </div>

      {/* Extraction Candidate Results */}
      {analysisResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>AI Analysis Complete! Review extracted items below before saving.</span>
            </div>
            {savedCount > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                {savedCount} item(s) approved & saved
              </span>
            )}
          </div>

          {/* Extracted Tasks */}
          {analysisResult.extractedTasks?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Extracted Tasks ({analysisResult.extractedTasks.length})</span>
              </h3>

              <div className="space-y-3">
                {analysisResult.extractedTasks.map((task: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Due: <span className="font-bold text-slate-800">{task.dueDate || 'Soon'}</span> • Priority: <span className="font-bold text-slate-800">{task.priority || 'Medium'}</span>
                        {task.amount && ` • Amount: ${task.amount}`}
                        {task.recurring && task.recurring !== 'None' && ` • Recurring: ${task.recurring}`}
                      </div>
                      {task.description && <div className="text-xs text-slate-600 mt-1">{task.description}</div>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveTask(task, idx)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Payments */}
          {analysisResult.extractedPayments?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                <span>Extracted Bill Payments ({analysisResult.extractedPayments.length})</span>
              </h3>

              <div className="space-y-3">
                {analysisResult.extractedPayments.map((pay: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{pay.billerName}</div>
                      <div className="text-xs text-slate-500">
                        Amount: <span className="font-bold text-slate-900">₹{pay.amount}</span> • Due: <span className="font-bold text-slate-800">{pay.dueDate || 'Upcoming'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApprovePayment(pay, idx)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bill</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Appointments */}
          {analysisResult.extractedAppointments?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span>Extracted Appointments ({analysisResult.extractedAppointments.length})</span>
              </h3>

              <div className="space-y-3">
                {analysisResult.extractedAppointments.map((app: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{app.title}</div>
                      <div className="text-xs text-slate-500">
                        Date: <span className="font-bold text-slate-800">{app.date}</span> {app.time && `at ${app.time}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApproveAppointment(app, idx)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Calendar</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Contacts */}
          {analysisResult.extractedContacts?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-600" />
                <span>Important Contacts Mentioned</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisResult.extractedContacts.map((c: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-slate-500">{c.role} {c.contact && `• ${c.contact}`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
