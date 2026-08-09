import React from 'react';
import { ShieldCheck, Info, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { TaskItem, BillItem, DocumentItem } from '../../types';

interface Props {
  tasks: TaskItem[];
  bills: BillItem[];
  documents: DocumentItem[];
  score: number;
}

export const LifeAdminScoreWidget: React.FC<Props> = ({ tasks, bills, documents, score }) => {
  // Calculate dynamic status label
  let statusText = "Good";
  if (score < 60) {
    statusText = 'Needs Attention';
  } else if (score < 80) {
    statusText = 'Fair';
  } else if (score >= 90) {
    statusText = 'Excellent';
  }

  const dashArrayVal = `${Math.min(100, Math.max(0, score))}, 100`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-xs">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
        Life Admin Score
      </h3>

      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#4F46E5"
            strokeWidth="3"
            strokeDasharray={dashArrayVal}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900">{score}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{statusText}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-medium">
        You're doing well! Completing active tasks increases your score by 4 pts.
      </p>
    </div>
  );
};
