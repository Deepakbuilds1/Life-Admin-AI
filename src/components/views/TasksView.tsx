import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Plus, 
  FileText, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, PriorityLevel, TaskStatus } from '../../types';

interface Props {
  tasks: TaskItem[];
  onCompleteTask: (taskId: string) => void;
  onApproveTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string, days: number) => void;
  onAddNewTask: (task: TaskItem) => void;
  onToggleCheckitem: (taskId: string, checkitemId: string) => void;
  onViewSource: (docTitle: string, field: string, val: string, srcTxt?: string, srcLoc?: string, fullTxt?: string) => void;
}

export const TasksView: React.FC<Props> = ({
  tasks,
  onCompleteTask,
  onApproveTask,
  onDeleteTask,
  onSnoozeTask,
  onAddNewTask,
  onToggleCheckitem,
  onViewSource,
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-08-25');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('High');
  const [newCategory, setNewCategory] = useState<any>('Bills');
  const [newDesc, setNewDesc] = useState('');

  const todayStr = '2026-08-08';

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'All') return t.status !== 'Ignored';
    if (filter === 'Pending Review') return t.status === 'Pending Approval';
    if (filter === 'Today') return t.dueDate <= todayStr || t.dueDate === '2026-08-18';
    if (filter === 'Upcoming') return t.dueDate > todayStr;
    if (filter === 'Overdue') return t.dueDate < todayStr && t.status === 'Active';
    if (filter === 'Completed') return t.status === 'Completed';
    if (filter === 'High Priority') return t.priority === 'High' && t.status === 'Active';
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: TaskItem = {
      id: 'tsk_' + Date.now(),
      title: newTitle,
      description: newDesc,
      dueDate: newDueDate,
      priority: newPriority,
      status: 'Active',
      category: newCategory,
      checklists: [],
      reminders: { enabled: true, timing: '3_days' },
      createdAt: todayStr,
    };

    onAddNewTask(task);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const pendingApprovals = tasks.filter((t) => t.status === 'Pending Approval');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Task & Checklist Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AI-extracted tasks, human approval queue, custom deadlines, and reminders.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Pending Approval Section */}
      {pendingApprovals.length > 0 && filter !== 'Pending Review' && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-white">
                {pendingApprovals.length} AI Suggested Task{pendingApprovals.length > 1 ? 's' : ''} Pending Review
              </h3>
              <p className="text-xs text-slate-300">Human approval is required before activating task reminders.</p>
            </div>
          </div>

          <button
            onClick={() => setFilter('Pending Review')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Pending Review', 'Today', 'Upcoming', 'Overdue', 'Completed', 'High Priority'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                filter === f
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f} {f === 'Pending Review' && pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tasks..."
          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
        />
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Tasks Found</h3>
          <p className="text-xs text-slate-400">There are no items matching filter "{filter}".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isPending = task.status === 'Pending Approval';
            const isOverdue = task.dueDate < todayStr && !isCompleted;

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 transition shadow-2xs space-y-3 ${
                  isPending
                    ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : isOverdue
                    ? 'border-rose-200 dark:border-rose-900/60'
                    : isCompleted
                    ? 'border-slate-200/60 dark:border-slate-800/60 opacity-70'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => {
                        if (isPending) {
                          onApproveTask(task.id);
                        } else {
                          confetti({ particleCount: 30, spread: 40 });
                          onCompleteTask(task.id);
                        }
                      }}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isPending
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h3 className={`font-bold text-sm sm:text-base ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </h3>

                        {task.amount && (
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            ({task.amount})
                          </span>
                        )}

                        {isPending && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold rounded-full">
                            AI Suggestion
                          </span>
                        )}

                        {isOverdue && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Priority & Due Tag */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{task.dueDate}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{task.priority} Priority</span>
                  </div>
                </div>

                {/* Checklist items */}
                {task.checklists && task.checklists.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sub-tasks Checklist:</span>
                    {task.checklists.map((chk) => (
                      <label key={chk.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chk.completed}
                          onChange={() => onToggleCheckitem(task.id, chk.id)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className={chk.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}>
                          {chk.text}
                        </span>
                        {chk.requiredDocument && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 rounded">
                            Req: {chk.requiredDocument}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {task.documentTitle ? (
                    <span className="text-slate-400 text-[11px]">Source: {task.documentTitle}</span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Manual Task</span>
                  )}

                  <div className="flex items-center space-x-2">
                    {isPending ? (
                      <button
                        onClick={() => onApproveTask(task.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition"
                      >
                        Approve Task
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onSnoozeTask(task.id, 3)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] transition flex items-center space-x-1"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Snooze +3 days</span>
                        </button>

                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create Custom Task</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Submit Income Tax Return"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional notes or instructions..."
                className="w-full h-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
