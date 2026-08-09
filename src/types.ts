export type DocumentCategory = 
  | 'Bills'
  | 'Education'
  | 'Banking'
  | 'Government'
  | 'Insurance'
  | 'Employment'
  | 'Housing'
  | 'Personal'
  | 'Other';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type ConfidenceLevel = 'High' | 'Medium' | 'Needs review';

export type TaskStatus = 'Pending Approval' | 'Active' | 'Completed' | 'Snoozed' | 'Ignored';

export type RecurringFrequency = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Custom';

export interface AIMemory {
  id: string;
  key: string;
  value: string;
  category: 'Personal' | 'Document' | 'Finance' | 'Medical' | 'General';
  sourceSnippet?: string;
  createdAt: string;
}

export interface ExtractedFact {
  field: string;
  value: string;
  confidence: ConfidenceLevel;
  sourceText?: string;
  sourceLocation?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  requiredDocument?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileType: 'pdf' | 'image' | 'text' | 'doc';
  uploadDate: string;
  fileSize?: string;
  content: string; // raw or extracted text
  summary: {
    whatIsThis: string;
    whatToDo: string;
    importantDate?: string;
    amount?: string;
    priority: PriorityLevel;
    consequence?: string;
  };
  extractedInfo: ExtractedFact[];
  checklists: ChecklistItem[];
  suggestedTasks: Omit<TaskItem, 'id' | 'documentId'>[];
  expiryDate?: string;
  renewalDate?: string;
  maskedInfoCount?: number;
  isArchived?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: PriorityLevel;
  status: TaskStatus;
  category: DocumentCategory;
  documentId?: string;
  documentTitle?: string;
  amount?: string;
  checklists: ChecklistItem[];
  reminders: {
    enabled: boolean;
    timing: '7_days' | '3_days' | '1_day' | 'on_due_date' | 'custom';
    customDaysBefore?: number;
  };
  recurring?: RecurringFrequency;
  recurringDetails?: string;
  appointmentTime?: string;
  sourceSnippet?: string;
  sourceLocation?: string;
  createdAt: string;
  snoozedUntil?: string;
  notes?: string;
}

export interface BillItem {
  id: string;
  billerName: string;
  category: 'Electricity' | 'Water' | 'Internet' | 'Mobile' | 'Rent' | 'Insurance' | 'Subscription' | 'Other';
  amount: number;
  currency: string;
  dueDate: string;
  status: 'Unpaid' | 'Paid' | 'Overdue';
  paidDate?: string;
  documentId?: string;
  autoRecognized?: boolean;
  recurring?: RecurringFrequency;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Task' | 'Bill' | 'Expiry' | 'Appointment';
  priority: PriorityLevel;
  relatedId?: string;
  time?: string;
}

export interface InboxExtraction {
  id: string;
  rawText: string;
  sourceType: 'Text' | 'Email/Paste' | 'Note' | 'Document';
  extractedTasks: Partial<TaskItem>[];
  extractedPayments: Partial<BillItem>[];
  extractedAppointments: Partial<CalendarEvent>[];
  extractedContacts: { name: string; role?: string; contact?: string }[];
  extractedNotes: string[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'upcoming' | 'payment' | 'expiry' | 'suggestion';
  timestamp: string;
  read: boolean;
  linkTab?: string;
  relatedId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: {
    documentTitle: string;
    documentId: string;
    snippet: string;
  }[];
  simplifiedText?: string;
}

export interface SecurityActivityLog {
  id: string;
  action: string;
  device: string;
  location: string;
  ipAddress: string;
  timestamp: string;
  status: 'Success' | 'Warning' | 'Info';
}

export type SyncStatus = 'synced' | 'syncing' | 'sync_failed' | 'local_only';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  language: 'en' | 'hi';
  maskSensitiveData: boolean;
  emailNotifications: boolean;
  dailySummary: boolean;
  deadlineAlerts: boolean;
  reminderTiming: '3_days' | '1_day' | 'on_due_date';
  lifeAdminScore: number;
  storageMode: 'device_only' | 'cloud_sync';
  cloudSyncEnabled: boolean;
  lastSyncedAt?: string;
}
