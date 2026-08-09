import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  PlusCircle, 
  ChevronRight, 
  Sparkles,
  CalendarDays,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, BillItem, DocumentItem, UserProfile } from '../../types';
import { LifeAdminScoreWidget } from '../dashboard/LifeAdminScoreWidget';
import { DailyBriefingWidget } from '../dashboard/DailyBriefingWidget';

interface Props {
  user: UserProfile;
  tasks: TaskItem[];
  bills: BillItem[];
  documents: DocumentItem[];
  onCompleteTask: (taskId: string) => void;
  onPayBill: (billId: string) => void;
  onOpenUpload: () => void;
  setActiveTab: (tab: string) => void;
  onViewSource: (docTitle: string, field: string, val: string, srcTxt?: string, srcLoc?: string, fullTxt?: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  user,
  tasks,
  bills,
  documents,
  onCompleteTask,
  onPayBill,
  onOpenUpload,
  setActiveTab,
  onViewSource,
}) => {
  const activeTasks = tasks.filter((t) => t.status === 'Active');
  const todayStr = '2026-08-08';

  const overdueTasks = activeTasks.filter((t) => t.dueDate < todayStr);
  const todayTasks = activeTasks.filter((t) => t.dueDate === todayStr || t.dueDate === '2026-08-18');
  const upcomingTasks = activeTasks.filter((t) => t.dueDate > todayStr && t.dueDate !== '2026-08-18').slice(0, 4);

  const unpaidBills = bills.filter((b) => b.status === 'Unpaid');
  const pendingApprovals = tasks.filter((t) => t.status === 'Pending Approval');

  const handleCompleteWithCelebration = (taskId: string) => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onCompleteTask(taskId);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Good morning, {user.name} 👋
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              Here is your administrative overview for today.
            </p>

            <DailyBriefingWidget
              tasks={tasks}
              onOpenChat={() => setActiveTab('chat')}
              onCompleteTask={handleCompleteWithCelebration}
            />
          </section>

          {/* Today's Priority Tasks */}
          <section className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="font-bold text-lg text-slate-900">Today's Priority Tasks</h3>
              <button 
                onClick={() => setActiveTab('tasks')}
                className="text-sm text-indigo-600 font-bold hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {activeTasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                      {task.category === 'Bills' ? '⚡' : '🎓'}
                    </div>
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 text-sm sm:text-base truncate">{task.title}</div>
                      <div className="text-xs text-slate-500 truncate">{task.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-slate-900">{task.amount || 'N/A'}</div>
                      <div className={`text-[10px] font-bold uppercase ${task.dueDate <= todayStr ? 'text-red-500' : 'text-slate-400'}`}>
                        {task.dueDate <= todayStr ? 'Due Today' : `Due ${task.dueDate}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCompleteWithCelebration(task.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-bold transition shadow-xs"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              ))}

              {activeTasks.length === 0 && (
                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-500 text-sm">
                  All active priority tasks are completed!
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Life Admin Score */}
          <LifeAdminScoreWidget
            tasks={tasks}
            bills={bills}
            documents={documents}
            score={user.lifeAdminScore}
          />

          {/* Add New Document Indigo CTA Card */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📄</span>
              <div className="font-bold text-base">Add New Document</div>
            </div>

            <div 
              onClick={onOpenUpload}
              className="border-2 border-dashed border-indigo-400/50 rounded-xl p-6 text-center bg-indigo-500/20 mb-4 cursor-pointer hover:bg-indigo-500/30 transition"
            >
              <div className="text-sm font-medium opacity-90">Drop PDF or Image here</div>
              <div className="text-xs font-bold mt-1 underline">or browse files</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={onOpenUpload}
                className="bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold text-white transition"
              >
                Paste Text
              </button>
              <button 
                onClick={onOpenUpload}
                className="bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold text-white transition"
              >
                Take Photo
              </button>
            </div>
          </div>

          {/* Recent Vault Activity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
              <span>Recent Vault Activity</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">SECURE</span>
            </h3>

            <div className="space-y-3">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 uppercase">
                    {doc.fileName?.split('.').pop() || 'PDF'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">{doc.title}</div>
                    <div className="text-[10px] text-slate-400">Uploaded {doc.uploadDate} • Processed ✓</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
