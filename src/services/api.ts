import { DocumentItem, TaskItem, BillItem, ChatMessage } from '../types';

export async function analyzeDocumentApi(payload: {
  textContent?: string;
  base64Data?: string;
  mimeType?: string;
  fileName?: string;
}) {
  try {
    const res = await fetch('/api/documents/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze document');
    }
    return await res.json();
  } catch (error) {
    console.error('API analyze error:', error);
    throw error;
  }
}

export async function sendChatApi(payload: {
  message: string;
  documents: DocumentItem[];
  tasks: TaskItem[];
  bills: BillItem[];
  language: 'en' | 'hi';
}) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send chat message');
    }
    return await res.json();
  } catch (error) {
    console.error('API chat error:', error);
    throw error;
  }
}

export async function simplifyDocumentApi(payload: {
  documentTitle: string;
  content: string;
  summary: any;
}) {
  try {
    const res = await fetch('/api/documents/simplify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Failed to simplify document');
    }
    return await res.json();
  } catch (error) {
    console.error('API simplify error:', error);
    throw error;
  }
}

export async function analyzeInboxApi(payload: { rawText: string; sourceType?: string }) {
  try {
    const res = await fetch('/api/inbox/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Failed to analyze inbox content');
    }
    return await res.json();
  } catch (error) {
    console.error('API inbox error:', error);
    throw error;
  }
}

export async function interpretTaskApi(input: string) {
  try {
    const res = await fetch('/api/tasks/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    if (!res.ok) {
      throw new Error('Failed to interpret task');
    }
    return await res.json();
  } catch (error) {
    console.error('API interpret task error:', error);
    throw error;
  }
}

export async function extractMemoryApi(statement: string) {
  try {
    const res = await fetch('/api/memories/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statement }),
    });
    if (!res.ok) {
      throw new Error('Failed to extract memory');
    }
    return await res.json();
  } catch (error) {
    console.error('API extract memory error:', error);
    throw error;
  }
}
