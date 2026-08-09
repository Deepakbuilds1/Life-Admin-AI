import React from 'react';
import { Bot, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { TaskItem } from '../../types';

interface Props {
  tasks: TaskItem[];
  onOpenChat: () => void;
  onCompleteTask: (taskId: string) => void;
}

export const DailyBriefingWidget: React.FC<Props> = ({ tasks, onOpenChat, onCompleteTask }) => {
  const activeTasks = tasks.filter((t) => t.status === 'Active');

  const urgentTasks = activeTasks.filter((t) => t.priority === 'High');
  const importantTasks = activeTasks.filter((t) => t.priority === 'Medium');
  const normalTasks = activeTasks.filter((t) => t.priority === 'Low');

  // Today's priorities
  const topPriorities = [...urgentTasks, ...importantTasks, ...normalTasks].slice(0, 4);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2 text-base text-slate-900">
          <span className="text-indigo-600 text-lg">✨</span> Your Daily AI Briefing
        </h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
          {topPriorities.length} NEW ITEMS
        </span>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed mb-4">
        You have {urgentTasks.length} urgent payment{urgentTasks.length !== 1 ? 's' : ''}, {importantTasks.length} important form submission{importantTasks.length !== 1 ? 's' : ''}, and {normalTasks.length} renewal task{normalTasks.length !== 1 ? 's' : ''}. Based on current deadlines, prioritizing immediate payments is recommended to avoid late fees.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {urgentTasks.slice(0, 1).map((task) => (
          <div key={task.id} className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl">
            <span className="mt-0.5 text-base">🔴</span>
            <div>
              <div className="text-sm font-bold text-red-900 italic">Urgent: {task.title}</div>
              <div className="text-xs text-red-700 font-medium">Due by {task.dueDate} {task.amount ? `• ${task.amount}` : ''}</div>
            </div>
          </div>
        ))}

        {importantTasks.slice(0, 1).map((task) => (
          <div key={task.id} className="flex items-start gap-3 p-3.5 bg-orange-50 border border-orange-100 rounded-xl">
            <span className="mt-0.5 text-base">🟠</span>
            <div>
              <div className="text-sm font-bold text-orange-900">{task.title}</div>
              <div className="text-xs text-orange-700 font-medium">{task.category} • Due {task.dueDate}</div>
            </div>
          </div>
        ))}

        {urgentTasks.length === 0 && importantTasks.length === 0 && (
          <div className="col-span-2 flex items-start gap-3 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
            <span className="mt-0.5 text-base">🟢</span>
            <div>
              <div className="text-sm font-bold text-indigo-900">All Urgent Tasks Clear</div>
              <div className="text-xs text-indigo-700 font-medium">You are on top of your administrative items!</div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Need AI assistance with a document or notice?</span>
        <button
          onClick={onOpenChat}
          className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
        >
          <span>Ask AI Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
