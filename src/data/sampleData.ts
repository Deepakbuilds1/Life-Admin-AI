import { 
  DocumentItem, 
  TaskItem, 
  BillItem, 
  NotificationItem, 
  SecurityActivityLog, 
  UserProfile,
  AIMemory
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_101',
  name: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  language: 'en',
  maskSensitiveData: true,
  emailNotifications: true,
  dailySummary: true,
  deadlineAlerts: true,
  reminderTiming: '3_days',
  lifeAdminScore: 82,
  storageMode: 'device_only',
  cloudSyncEnabled: false,
};

export const INITIAL_MEMORIES: AIMemory[] = [
  {
    id: 'mem_01',
    key: 'Passport Expiration Year',
    value: 'Passport expires in March 2030 (Passport No: Z9182301)',
    category: 'Document',
    createdAt: '2026-08-01',
  },
  {
    id: 'mem_02',
    key: 'Broadband Account ID',
    value: 'Airtel Fiber Account ID: 1088 9201 44',
    category: 'Personal',
    createdAt: '2026-08-05',
  },
  {
    id: 'mem_03',
    key: 'Health Policy Number',
    value: 'Star Health Policy Number: P/11029/01/2026/00912',
    category: 'Finance',
    createdAt: '2026-08-06',
  },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_elec_01',
    title: 'Electricity Bill - July 2026',
    category: 'Bills',
    fileName: 'Electricity_Bill_July2026.pdf',
    fileType: 'pdf',
    uploadDate: '2026-08-05',
    fileSize: '1.2 MB',
    content: `State Electricity Distribution Co. Ltd.
Consumer Name: Ananya Sharma
Consumer No: 4821 0092 1104
Bill No: BS-2026-07-8821
Billing Period: 01-Jul-2026 to 31-Jul-2026
Total Units Consumed: 285 kWh
Net Amount Payable: ₹2,450.00
Due Date: 18 August 2026
Late Payment Surcharge: ₹150 after due date.
Payment Helpline: 1800-233-3555`,
    summary: {
      whatIsThis: 'This is your monthly electricity bill for July 2026.',
      whatToDo: 'Pay ₹2,450 before 18 August 2026 to avoid late fees.',
      importantDate: '18 August 2026',
      amount: '₹2,450',
      priority: 'High',
      consequence: 'Late payment charge of ₹150 applies after 18 August 2026.',
    },
    extractedInfo: [
      { field: 'Document Type', value: 'Electricity Bill', confidence: 'High', sourceText: 'State Electricity Distribution Co. Ltd.', sourceLocation: 'Header, Page 1' },
      { field: 'Organization', value: 'State Electricity Distribution Co.', confidence: 'High', sourceText: 'State Electricity Distribution Co. Ltd.', sourceLocation: 'Line 1' },
      { field: 'Consumer Name', value: 'Ananya Sharma', confidence: 'High', sourceText: 'Consumer Name: Ananya Sharma', sourceLocation: 'Line 2' },
      { field: 'Consumer Number', value: 'XXXX XXXX 1104', confidence: 'High', sourceText: 'Consumer No: 4821 0092 1104', sourceLocation: 'Line 3' },
      { field: 'Due Date', value: '18 August 2026', confidence: 'High', sourceText: 'Due Date: 18 August 2026', sourceLocation: 'Line 7' },
      { field: 'Net Amount Payable', value: '₹2,450.00', confidence: 'High', sourceText: 'Net Amount Payable: ₹2,450.00', sourceLocation: 'Line 6' },
      { field: 'Late Surcharge', value: '₹150.00', confidence: 'High', sourceText: 'Late Payment Surcharge: ₹150', sourceLocation: 'Line 8' },
    ],
    checklists: [
      { id: 'c1', text: 'Verify 285 kWh meter reading', completed: true },
      { id: 'c2', text: 'Pay ₹2,450 via UPI or net banking', completed: false },
      { id: 'c3', text: 'Save payment confirmation receipt', completed: false },
    ],
    suggestedTasks: [
      {
        title: 'Pay Electricity Bill',
        description: 'Pay monthly power bill of ₹2,450 before late fee penalty applies.',
        dueDate: '2026-08-18',
        priority: 'High',
        status: 'Active',
        category: 'Bills',
        amount: '₹2,450',
        checklists: [
          { id: 'c1', text: 'Verify 285 kWh meter reading', completed: true },
          { id: 'c2', text: 'Pay ₹2,450 via UPI or net banking', completed: false },
          { id: 'c3', text: 'Save payment confirmation receipt', completed: false },
        ],
        reminders: { enabled: true, timing: '3_days' },
        sourceSnippet: 'Net Amount Payable: ₹2,450.00 | Due Date: 18 August 2026',
        sourceLocation: 'Page 1, Line 6',
        createdAt: '2026-08-05',
      },
    ],
  },
  {
    id: 'doc_scholarship_02',
    title: 'College Merit Scholarship Circular',
    category: 'Education',
    fileName: 'Scholarship_Notice_2026.pdf',
    fileType: 'pdf',
    uploadDate: '2026-08-06',
    fileSize: '850 KB',
    content: `National Institute of Science & Tech - Academic Cell
Notice Ref: NIST/ACAD/2026/891
Date: 04 August 2026
Subject: Merit-Cum-Means Scholarship Application 2026-27

Eligible students must submit the scholarship application form before 25 August 2026 at 5:00 PM in Room 102.

Required Documents to attach:
1. Annual Family Income Certificate (Issued by Tehsildar or competent officer)
2. Previous Semester Marksheet (SGPA > 8.0)
3. Self-attested Aadhaar Card copy
4. Bank Passbook first page copy showing IFSC & Account No.

Incomplete applications or submissions after 25 August 2026 will not be processed.`,
    summary: {
      whatIsThis: 'Official college notice regarding Merit-Cum-Means Scholarship for 2026-27.',
      whatToDo: 'Submit filled application form along with 4 required certificates to Room 102 before 25 August 2026.',
      importantDate: '25 August 2026',
      amount: 'Scholarship Grant',
      priority: 'High',
      consequence: 'Late or incomplete submissions will be rejected without review.',
    },
    extractedInfo: [
      { field: 'Document Type', value: 'College Circular', confidence: 'High', sourceText: 'Notice Ref: NIST/ACAD/2026/891', sourceLocation: 'Line 2' },
      { field: 'Institution', value: 'National Institute of Science & Tech', confidence: 'High', sourceText: 'National Institute of Science & Tech', sourceLocation: 'Line 1' },
      { field: 'Submission Deadline', value: '25 August 2026 (5:00 PM)', confidence: 'High', sourceText: 'before 25 August 2026 at 5:00 PM', sourceLocation: 'Line 6' },
      { field: 'Submission Office', value: 'Room 102, Academic Cell', confidence: 'High', sourceText: 'in Room 102', sourceLocation: 'Line 6' },
      { field: 'Min Academic Criteria', value: 'SGPA > 8.0', confidence: 'High', sourceText: 'SGPA > 8.0', sourceLocation: 'Line 10' },
      { field: 'Required Documents', value: 'Income Cert, Marksheet, Aadhaar, Bank Passbook', confidence: 'High', sourceText: '1. Annual Family Income Certificate... 4. Bank Passbook', sourceLocation: 'Lines 8-12' },
    ],
    checklists: [
      { id: 'sc1', text: 'Obtain Income Certificate from Tehsildar office', completed: true, requiredDocument: 'Income Certificate' },
      { id: 'sc2', text: 'Print previous semester SGPA marksheet', completed: true, requiredDocument: 'Marksheet' },
      { id: 'sc3', text: 'Photocopy & self-attest Aadhaar card', completed: false, requiredDocument: 'Aadhaar Card' },
      { id: 'sc4', text: 'Copy bank passbook showing IFSC & Account number', completed: false, requiredDocument: 'Bank Passbook' },
      { id: 'sc5', text: 'Submit physical bundle to Room 102', completed: false },
    ],
    suggestedTasks: [
      {
        title: 'Submit College Scholarship Form',
        description: 'Submit Merit Scholarship form with Income Cert, Marksheet, Aadhaar, and Bank Passbook to Room 102.',
        dueDate: '2026-08-25',
        priority: 'High',
        status: 'Active',
        category: 'Education',
        checklists: [
          { id: 'sc1', text: 'Obtain Income Certificate from Tehsildar office', completed: true, requiredDocument: 'Income Certificate' },
          { id: 'sc2', text: 'Print previous semester SGPA marksheet', completed: true, requiredDocument: 'Marksheet' },
          { id: 'sc3', text: 'Photocopy & self-attest Aadhaar card', completed: false, requiredDocument: 'Aadhaar Card' },
          { id: 'sc4', text: 'Copy bank passbook showing IFSC & Account number', completed: false, requiredDocument: 'Bank Passbook' },
          { id: 'sc5', text: 'Submit physical bundle to Room 102', completed: false },
        ],
        reminders: { enabled: true, timing: '3_days' },
        sourceSnippet: 'submit the scholarship application form before 25 August 2026 at 5:00 PM in Room 102',
        sourceLocation: 'Line 6',
        createdAt: '2026-08-06',
      },
    ],
  },
  {
    id: 'doc_internet_03',
    title: 'Airtel Fiber Broadband Bill',
    category: 'Bills',
    fileName: 'Airtel_Fiber_Aug2026.pdf',
    fileType: 'pdf',
    uploadDate: '2026-08-07',
    fileSize: '640 KB',
    content: `Airtel Broadband Monthly Invoice
Account ID: 1088 9201 44
Plan: Fiber Unlimited 200 Mbps
Invoice No: AP-2026-08-1102
Invoice Date: 05-Aug-2026
Amount Due: ₹799.00
Due Date: 21 August 2026
Auto-debit status: Disabled
Support: 121 / 1800-103-0121`,
    summary: {
      whatIsThis: 'Broadband internet bill for 200 Mbps Fiber connection.',
      whatToDo: 'Pay ₹799 before 21 August 2026 to avoid internet service disruption.',
      importantDate: '21 August 2026',
      amount: '₹799',
      priority: 'Medium',
      consequence: 'Service auto-suspension upon non-payment past due date.',
    },
    extractedInfo: [
      { field: 'Document Type', value: 'Internet Bill', confidence: 'High', sourceText: 'Airtel Broadband Monthly Invoice', sourceLocation: 'Line 1' },
      { field: 'Provider', value: 'Airtel Broadband', confidence: 'High', sourceText: 'Airtel Broadband', sourceLocation: 'Line 1' },
      { field: 'Plan Name', value: 'Fiber Unlimited 200 Mbps', confidence: 'High', sourceText: 'Plan: Fiber Unlimited 200 Mbps', sourceLocation: 'Line 3' },
      { field: 'Amount Due', value: '₹799.00', confidence: 'High', sourceText: 'Amount Due: ₹799.00', sourceLocation: 'Line 6' },
      { field: 'Due Date', value: '21 August 2026', confidence: 'High', sourceText: 'Due Date: 21 August 2026', sourceLocation: 'Line 7' },
    ],
    checklists: [
      { id: 'ib1', text: 'Pay ₹799 online bill via Airtel Thanks app or UPI', completed: false },
    ],
    suggestedTasks: [
      {
        title: 'Renew Internet Plan (Airtel Fiber)',
        description: 'Pay ₹799 for monthly broadband connection.',
        dueDate: '2026-08-21',
        priority: 'Medium',
        status: 'Active',
        category: 'Bills',
        amount: '₹799',
        checklists: [
          { id: 'ib1', text: 'Pay ₹799 online bill via Airtel Thanks app or UPI', completed: false },
        ],
        reminders: { enabled: true, timing: '1_day' },
        sourceSnippet: 'Amount Due: ₹799.00 | Due Date: 21 August 2026',
        sourceLocation: 'Lines 6-7',
        createdAt: '2026-08-07',
      },
    ],
  },
  {
    id: 'doc_passport_04',
    title: 'Republic of India Passport Document',
    category: 'Government',
    fileName: 'Passport_Scan.jpg',
    fileType: 'image',
    uploadDate: '2026-08-01',
    fileSize: '2.1 MB',
    content: `Passport / Passeport - Republic of India
Type: P | Country Code: IND | Passport No: Z9182301
Given Names: Ananya
Surname: Sharma
Nationality: Indian
Date of Birth: 14/05/1998
Date of Issue: 13/03/2020
Date of Expiry: 12/03/2030
Place of Issue: Regional Passport Office Delhi`,
    summary: {
      whatIsThis: 'Official Indian Travel Passport Document.',
      whatToDo: 'Track expiration date for future international travel plans.',
      importantDate: '12 March 2030',
      priority: 'Low',
      consequence: 'Renewal may be needed in the future before international travel.',
    },
    extractedInfo: [
      { field: 'Document Type', value: 'Passport', confidence: 'High', sourceText: 'Republic of India Passport', sourceLocation: 'Header' },
      { field: 'Passport Number', value: 'Z918XXXX', confidence: 'High', sourceText: 'Passport No: Z9182301', sourceLocation: 'Line 2' },
      { field: 'Holder Name', value: 'Ananya Sharma', confidence: 'High', sourceText: 'Given Names: Ananya Surname: Sharma', sourceLocation: 'Lines 3-4' },
      { field: 'Issue Date', value: '13 March 2020', confidence: 'High', sourceText: 'Date of Issue: 13/03/2020', sourceLocation: 'Line 7' },
      { field: 'Expiry Date', value: '12 March 2030', confidence: 'High', sourceText: 'Date of Expiry: 12/03/2030', sourceLocation: 'Line 8' },
    ],
    checklists: [],
    suggestedTasks: [],
    expiryDate: '2030-03-12',
  },
  {
    id: 'doc_health_05',
    title: 'Health Insurance Policy Schedule',
    category: 'Insurance',
    fileName: 'Health_Policy_2026-27.pdf',
    fileType: 'pdf',
    uploadDate: '2026-08-02',
    fileSize: '1.8 MB',
    content: `Star Health & Allied Insurance Co. Ltd.
Policy Number: P/11029/01/2026/00912
Insured Person: Ananya Sharma
Sum Insured: ₹5,00,000 (Five Lakhs)
Policy Period: 13-Mar-2026 to 12-Mar-2027
Annual Premium: ₹14,500.00
Grace Period for Renewal: 30 days post expiry.
Cashless Network Helpline: 1800-425-2255`,
    summary: {
      whatIsThis: 'Health insurance policy document with ₹5 Lakh sum insured cover.',
      whatToDo: 'Keep policy number handy and mark renewal due date for March 2027.',
      importantDate: '12 March 2027',
      amount: '₹14,500',
      priority: 'Low',
      consequence: 'Grace period of 30 days applies after 12 March 2027.',
    },
    extractedInfo: [
      { field: 'Document Type', value: 'Insurance Policy', confidence: 'High', sourceText: 'Health Insurance Policy Schedule', sourceLocation: 'Header' },
      { field: 'Insurer', value: 'Star Health & Allied Insurance', confidence: 'High', sourceText: 'Star Health & Allied Insurance Co. Ltd.', sourceLocation: 'Line 1' },
      { field: 'Sum Insured', value: '₹5,00,000', confidence: 'High', sourceText: 'Sum Insured: ₹5,00,000', sourceLocation: 'Line 4' },
      { field: 'Expiry Date', value: '12 March 2027', confidence: 'High', sourceText: '12-Mar-2027', sourceLocation: 'Line 5' },
    ],
    checklists: [],
    suggestedTasks: [],
    expiryDate: '2027-03-12',
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk_01',
    title: 'Pay Electricity Bill',
    description: 'Pay monthly power bill of ₹2,450 to avoid late fee surcharge.',
    dueDate: '2026-08-18',
    priority: 'High',
    status: 'Active',
    category: 'Bills',
    documentId: 'doc_elec_01',
    documentTitle: 'Electricity Bill - July 2026',
    amount: '₹2,450',
    checklists: [
      { id: 'c1', text: 'Verify 285 kWh meter reading', completed: true },
      { id: 'c2', text: 'Pay ₹2,450 via UPI or net banking', completed: false },
      { id: 'c3', text: 'Save payment confirmation receipt', completed: false },
    ],
    reminders: { enabled: true, timing: '3_days' },
    sourceSnippet: 'Net Amount Payable: ₹2,450.00 | Due Date: 18 August 2026',
    sourceLocation: 'Page 1, Line 6',
    createdAt: '2026-08-05',
  },
  {
    id: 'tsk_02',
    title: 'Submit College Scholarship Form',
    description: 'Submit Merit Scholarship form with Income Cert, Marksheet, Aadhaar, and Bank Passbook to Room 102.',
    dueDate: '2026-08-25',
    priority: 'High',
    status: 'Active',
    category: 'Education',
    documentId: 'doc_scholarship_02',
    documentTitle: 'College Merit Scholarship Circular',
    checklists: [
      { id: 'sc1', text: 'Obtain Income Certificate from Tehsildar office', completed: true, requiredDocument: 'Income Certificate' },
      { id: 'sc2', text: 'Print previous semester SGPA marksheet', completed: true, requiredDocument: 'Marksheet' },
      { id: 'sc3', text: 'Photocopy & self-attest Aadhaar card', completed: false, requiredDocument: 'Aadhaar Card' },
      { id: 'sc4', text: 'Copy bank passbook showing IFSC & Account number', completed: false, requiredDocument: 'Bank Passbook' },
      { id: 'sc5', text: 'Submit physical bundle to Room 102', completed: false },
    ],
    reminders: { enabled: true, timing: '3_days' },
    sourceSnippet: 'submit the scholarship application form before 25 August 2026 at 5:00 PM in Room 102',
    sourceLocation: 'Line 6',
    createdAt: '2026-08-06',
  },
  {
    id: 'tsk_03',
    title: 'Renew Internet Plan (Airtel Fiber)',
    description: 'Pay ₹799 for monthly broadband connection.',
    dueDate: '2026-08-21',
    priority: 'Medium',
    status: 'Active',
    category: 'Bills',
    documentId: 'doc_internet_03',
    documentTitle: 'Airtel Fiber Broadband Bill',
    amount: '₹799',
    checklists: [
      { id: 'ib1', text: 'Pay ₹799 online bill via Airtel Thanks app or UPI', completed: false },
    ],
    reminders: { enabled: true, timing: '1_day' },
    sourceSnippet: 'Amount Due: ₹799.00 | Due Date: 21 August 2026',
    sourceLocation: 'Lines 6-7',
    createdAt: '2026-08-07',
  },
  {
    id: 'tsk_ai_suggest_01',
    title: 'Upload Updated Income Tax Acknowledgement (AI Suggestion)',
    description: 'Suggested based on recent banking circular for scholarship verification.',
    dueDate: '2026-08-28',
    priority: 'Medium',
    status: 'Pending Approval',
    category: 'Banking',
    checklists: [
      { id: 's1', text: 'Download ITR-V for FY 2025-26', completed: false },
    ],
    reminders: { enabled: true, timing: '3_days' },
    sourceSnippet: 'Income proof mandatory for verification',
    createdAt: '2026-08-08',
  },
];

export const INITIAL_BILLS: BillItem[] = [
  {
    id: 'bill_01',
    billerName: 'State Electricity Distribution',
    category: 'Electricity',
    amount: 2450,
    currency: '₹',
    dueDate: '2026-08-18',
    status: 'Unpaid',
    documentId: 'doc_elec_01',
    autoRecognized: true,
  },
  {
    id: 'bill_02',
    billerName: 'Airtel Fiber Broadband',
    category: 'Internet',
    amount: 799,
    currency: '₹',
    dueDate: '2026-08-21',
    status: 'Unpaid',
    documentId: 'doc_internet_03',
    autoRecognized: true,
  },
  {
    id: 'bill_03',
    billerName: 'Star Health Insurance',
    category: 'Insurance',
    amount: 14500,
    currency: '₹',
    dueDate: '2027-03-12',
    status: 'Unpaid',
    documentId: 'doc_health_05',
    autoRecognized: true,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: '🔴 Urgent Bill Payment Due Soon',
    message: 'Electricity Bill of ₹2,450 is due on 18 August 2026. Late charge of ₹150 applies afterwards.',
    type: 'urgent',
    timestamp: '10 mins ago',
    read: false,
    linkTab: 'bills',
    relatedId: 'doc_elec_01',
  },
  {
    id: 'notif_2',
    title: '🎓 College Scholarship Deadline',
    message: 'College Merit Scholarship form & 4 documents must be submitted to Room 102 by 25 August 2026.',
    type: 'upcoming',
    timestamp: '2 hours ago',
    read: false,
    linkTab: 'tasks',
    relatedId: 'tsk_02',
  },
  {
    id: 'notif_3',
    title: '🤖 New AI Action Item Review Needed',
    message: 'AI detected a suggested task: "Upload Updated Income Tax Acknowledgement". Review & Approve to activate.',
    type: 'suggestion',
    timestamp: 'Yesterday',
    read: true,
    linkTab: 'tasks',
    relatedId: 'tsk_ai_suggest_01',
  },
];

export const INITIAL_SECURITY_LOGS: SecurityActivityLog[] = [
  {
    id: 'sec_1',
    action: 'Document Upload & AI Analysis',
    device: 'Chrome on macOS (Current Session)',
    location: 'New Delhi, India',
    ipAddress: '49.207.212.18',
    timestamp: '2026-08-08 22:45',
    status: 'Success',
  },
  {
    id: 'sec_2',
    action: 'Successful User Authentication',
    device: 'Chrome on macOS',
    location: 'New Delhi, India',
    ipAddress: '49.207.212.18',
    timestamp: '2026-08-08 21:10',
    status: 'Success',
  },
  {
    id: 'sec_3',
    action: 'Sensitive Number Masking Applied (Aadhaar & Bank No.)',
    device: 'Life Admin AI Security Engine',
    location: 'Server Enclave',
    ipAddress: '10.0.4.12',
    timestamp: '2026-08-06 14:30',
    status: 'Info',
  },
];
