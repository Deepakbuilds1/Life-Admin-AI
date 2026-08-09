import React, { useState } from 'react';
import { Calendar as CalendarIcon, Download, ChevronLeft, ChevronRight, CheckSquare, Receipt, AlertCircle, FileText } from 'lucide-react';
import { TaskItem, BillItem, DocumentItem, CalendarEvent } from '../../types';

interface Props {
  tasks: TaskItem[];
  bills: BillItem[];
  documents: DocumentItem[];
}

export const CalendarView: React.FC<Props> = ({ tasks, bills, documents }) => {
  const [currentMonth, setCurrentMonth] = useState('August 2026');

  // Combine events
  const events: CalendarEvent[] = [
    ...tasks.map((t) => ({
      id: t.id,
      title: t.title,
      date: t.dueDate,
      type: 'Task' as const,
      priority: t.priority,
    })),
    ...bills.map((b) => ({
      id: b.id,
      title: `${b.billerName} (${b.currency}${b.amount})`,
      date: b.dueDate,
      type: 'Bill' as const,
      priority: 'High' as const,
    })),
    ...documents
      .filter((d) => d.expiryDate)
      .map((d) => ({
        id: d.id,
        title: `${d.title} Expiry`,
        date: d.expiryDate!,
        type: 'Expiry' as const,
        priority: 'Low' as const,
      })),
  ];

  // Function to export ICS calendar file
  const exportIcsCalendar = () => {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Life Admin AI//EN
CALSCALE:GREGORIAN
X-WR-CALNAME:Life Admin AI Reminders
`;

    events.forEach((evt) => {
      const cleanDate = evt.date.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT
SUMMARY:${evt.title}
DTSTART;VALUE=DATE:${cleanDate}
DESCRIPTION:Life Admin AI Scheduled Deadline (${evt.type})
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Life_Admin_AI_Deadlines.ics';
    link.click();
    URL.revokeObjectURL(url);
  };

  const daysInAug2026 = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Administrative Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unified view of bill payment dates, task deadlines, appointments, and document expiries.
          </p>
        </div>

        <button
          onClick={exportIcsCalendar}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Export to Calendar (.ics)</span>
        </button>
      </div>

      {/* Month Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-slate-900 dark:text-white text-base">{currentMonth}</span>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid Representation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* August 1 2026 starts on Saturday (6 empty offset slots) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`offset-${i}`} className="h-16 sm:h-20 bg-slate-50/40 dark:bg-slate-800/20 rounded-xl opacity-30" />
          ))}

          {daysInAug2026.map((dayNum) => {
            const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
            const dayEvents = events.filter((e) => e.date === dateStr);
            const isToday = dayNum === 8;

            return (
              <div
                key={dayNum}
                className={`h-20 sm:h-24 p-1.5 sm:p-2 border rounded-xl flex flex-col justify-between overflow-hidden text-xs transition ${
                  isToday
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-[11px] ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {dayNum}
                  </span>
                  {isToday && <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400">TODAY</span>}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-12">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate ${
                        evt.type === 'Bill'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200'
                          : evt.type === 'Expiry'
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200'
                          : 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200'
                      }`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Agenda List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
          Agenda List View
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {events.map((evt) => (
            <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 w-24">{evt.date}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{evt.title}</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                {evt.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
