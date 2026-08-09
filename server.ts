import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Shared Gemini AI instance
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. API calls will fail or fall back.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Healthcheck API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock Auth Endpoints for seamless demo and local auth session
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  // Simulated user session
  res.json({
    user: {
      id: 'usr_101',
      name: email.split('@')[0].replace('.', ' '),
      email,
      language: 'en',
      maskSensitiveData: true,
      emailNotifications: true,
      lifeAdminScore: 82,
    },
    token: 'jwt_simulated_token_' + Date.now(),
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email } = req.body;
  res.json({
    user: {
      id: 'usr_' + Date.now(),
      name: name || 'User',
      email: email || 'user@example.com',
      language: 'en',
      maskSensitiveData: true,
      emailNotifications: true,
      lifeAdminScore: 100,
    },
    token: 'jwt_simulated_token_' + Date.now(),
  });
});

// Helper to mask sensitive numbers in string (Aadhaar 12 digits, Credit Card 16 digits, long account nos)
function maskSensitiveText(text: string): { maskedText: string; count: number } {
  let count = 0;
  // Mask 12 digit numbers (like Aadhaar)
  let masked = text.replace(/\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/g, (_match, _p1, _p2, p3) => {
    count++;
    return `XXXX XXXX ${p3}`;
  });
  // Mask 16 digit numbers (like Credit Cards)
  masked = masked.replace(/\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/g, (_match, _p1, _p2, _p3, p4) => {
    count++;
    return `XXXX-XXXX-XXXX-${p4}`;
  });
  return { maskedText: masked, count };
}

// 1. AI Document Analysis Endpoint
app.post('/api/documents/analyze', async (req, res) => {
  try {
    const { textContent, base64Data, mimeType, fileName } = req.body;

    if (!textContent && !base64Data) {
      return res.status(400).json({ error: 'Please provide either textContent or base64Data' });
    }

    const ai = getGeminiClient();

    const parts: any[] = [];
    if (base64Data && mimeType) {
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const promptText = `You are Life Admin AI, an expert administrative assistant.
Analyze this document thoroughly and extract structured, accurate information.
Do NOT invent dates, amounts, or legal requirements. If something is not in the document, return empty string or null.

Document Name / Clues: ${fileName || 'Uploaded Document'}
Raw Text Content (if available):
${textContent || '(See image/PDF attachment)'}

Respond strictly in JSON matching the requested schema.`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Clear title for this document (e.g., "Electricity Bill July 2026")' },
            category: { 
              type: Type.STRING, 
              description: 'Category: Bills | Education | Banking | Government | Insurance | Employment | Housing | Personal | Other' 
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                whatIsThis: { type: Type.STRING, description: '1 sentence explaining what this document is' },
                whatToDo: { type: Type.STRING, description: '1-2 sentences on what action user needs to perform' },
                importantDate: { type: Type.STRING, description: 'Key due date, deadline, or appointment date (e.g. "18 August 2026")' },
                amount: { type: Type.STRING, description: 'Amount with currency symbol (e.g. "₹2,450" or "$150") if applicable' },
                priority: { type: Type.STRING, description: 'Priority: High | Medium | Low' },
                consequence: { type: Type.STRING, description: 'Late fee or penalty ONLY if explicitly stated in document, else empty' },
              },
              required: ['whatIsThis', 'whatToDo', 'priority'],
            },
            extractedInfo: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING, description: 'Name of extracted field (e.g. Due Date, Consumer No, Amount)' },
                  value: { type: Type.STRING, description: 'Extracted value' },
                  confidence: { type: Type.STRING, description: 'Confidence: High | Medium | Needs review' },
                  sourceText: { type: Type.STRING, description: 'Exact phrase or quote from the document' },
                  sourceLocation: { type: Type.STRING, description: 'Location hint in document (e.g. Page 1, Header, Line 4)' },
                },
                required: ['field', 'value', 'confidence'],
              },
            },
            checklists: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                  requiredDocument: { type: Type.STRING, description: 'Required attachment or certificate name if applicable' },
                },
                required: ['id', 'text', 'completed'],
              },
            },
            suggestedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  dueDate: { type: Type.STRING, description: 'YYYY-MM-DD format if date found' },
                  priority: { type: Type.STRING, description: 'High | Medium | Low' },
                  amount: { type: Type.STRING },
                  sourceSnippet: { type: Type.STRING },
                  sourceLocation: { type: Type.STRING },
                },
                required: ['title', 'priority'],
              },
            },
            expiryDate: { type: Type.STRING, description: 'YYYY-MM-DD format if document has an expiration date (e.g. Passport, Insurance)' },
            extractedRawText: { type: Type.STRING, description: 'Full text parsed from document' },
          },
          required: ['title', 'category', 'summary', 'extractedInfo', 'checklists', 'suggestedTasks'],
        },
      },
    });

    let resultText = response.text || '{}';
    let analysis: any = {};
    try {
      analysis = JSON.parse(resultText);
    } catch (e) {
      console.error('Failed to parse Gemini output JSON', e);
      analysis = {
        title: fileName || 'Uploaded Document',
        category: 'Other',
        summary: {
          whatIsThis: 'Document uploaded for administrative review.',
          whatToDo: 'Please review extracted information.',
          priority: 'Medium',
        },
        extractedInfo: [],
        checklists: [],
        suggestedTasks: [],
      };
    }

    // Apply sensitive data masking
    const rawContent = analysis.extractedRawText || textContent || 'Document content uploaded.';
    const maskedObj = maskSensitiveText(rawContent);

    res.json({
      success: true,
      data: {
        ...analysis,
        content: maskedObj.maskedText,
        maskedInfoCount: maskedObj.count,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/documents/analyze:', error);
    res.status(500).json({
      error: 'Failed to analyze document. Please check API key or file quality.',
      details: error?.message || String(error),
    });
  }
});

// 2. AI Chat Assistant Endpoint (Document Grounded)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, documents = [], tasks = [], bills = [], language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();

    // Prepare context from user's authorized documents & tasks
    const docsContext = documents.map((d: any) => `
DOCUMENT ID: ${d.id}
TITLE: ${d.title} (${d.category})
DUE/IMPORTANT DATE: ${d.summary?.importantDate || d.expiryDate || 'N/A'}
AMOUNT: ${d.summary?.amount || 'N/A'}
SUMMARY: ${d.summary?.whatIsThis} ${d.summary?.whatToDo}
EXTRACTED FACTS:
${(d.extractedInfo || []).map((f: any) => `- ${f.field}: ${f.value} [Source: "${f.sourceText || 'N/A'}" (${f.sourceLocation || 'N/A'})]`).join('\n')}
RAW TEXT: ${d.content?.slice(0, 800)}
----------------------------------
`).join('\n');

    const tasksContext = tasks.map((t: any) => `
TASK: ${t.title} | Priority: ${t.priority} | Due: ${t.dueDate} | Status: ${t.status}
Description: ${t.description || 'N/A'} | Source Doc: ${t.documentTitle || 'None'}
`).join('\n');

    const billsContext = bills.map((b: any) => `
BILL: ${b.billerName} (${b.category}) | Amount: ${b.currency}${b.amount} | Due: ${b.dueDate} | Status: ${b.status}
`).join('\n');

    const systemInstruction = `You are "Life Admin AI", a secure, ultra-helpful digital personal administrative assistant.
Answer the user's question accurately using ONLY their authorized documents, tasks, and bills provided below.

Rules:
1. Never invent deadlines, amounts, or document rules. If uncertain, clearly state it is not in their documents.
2. Provide concise, clear, direct answers with bullet points.
3. Whenever citing a document, explicitly cite the Document Title and location (e.g., "[Electricity Bill July 2026 — Page 1]").
4. Current Language Preference: ${language === 'hi' ? 'Hindi (Simple, natural Hindi or Hinglish as appropriate)' : 'English'}.
5. If user asks "Explain simply", break down the response in plain 6th-grade language without jargon.

USER'S AUTHORIZED DOCUMENTS:
${docsContext || 'No documents uploaded yet.'}

USER'S TASKS:
${tasksContext || 'No active tasks.'}

USER'S BILLS:
${billsContext || 'No bills tracked.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const replyText = response.text || 'I checked your administrative records, but could not find matching information.';

    res.json({
      success: true,
      reply: replyText,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process AI chat response.' });
  }
});

// 3. AI Document Simplifier Endpoint ("Explain Simply")
app.post('/api/documents/simplify', async (req, res) => {
  try {
    const { documentTitle, content, summary } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Explain this document in ultra-simple, 6th-grade level terms. Focus on:
1. What this document actually is in plain words.
2. What simple steps the person MUST take.
3. Why it matters (or penalties if any).
4. List of simple things to double check.

Document Title: ${documentTitle}
Summary: ${JSON.stringify(summary)}
Text Content: ${content}`,
      config: {
        systemInstruction: 'You are an accessible readability helper. Translate legal and corporate jargon into friendly, crystal-clear bullet points.',
      },
    });

    res.json({
      success: true,
      simplifiedText: response.text || 'Simplification unavailable.',
    });
  } catch (error: any) {
    console.error('Error in /api/documents/simplify:', error);
    res.status(500).json({ error: 'Failed to simplify document.' });
  }
});

// 4. Smart Life Inbox Analyzer
app.post('/api/inbox/analyze', async (req, res) => {
  try {
    const { rawText, sourceType = 'Text' } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const ai = getGeminiClient();

    const promptText = `You are Life Admin AI, a smart universal inbox analyzer.
Analyze the following text/email/note and extract structured action items.
Do NOT invent deadlines or numbers. Extract only what is present or reasonably inferred.

Content:
${rawText}

Respond strictly in JSON matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  dueDate: { type: Type.STRING, description: 'YYYY-MM-DD if present' },
                  priority: { type: Type.STRING, description: 'High | Medium | Low' },
                  category: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  recurring: { type: Type.STRING, description: 'None | Daily | Weekly | Monthly | Yearly | Custom' },
                },
                required: ['title', 'priority'],
              },
            },
            extractedPayments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  billerName: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  dueDate: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['billerName'],
              },
            },
            extractedAppointments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  date: { type: Type.STRING },
                  time: { type: Type.STRING },
                  priority: { type: Type.STRING },
                },
                required: ['title', 'date'],
              },
            },
            extractedContacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  contact: { type: Type.STRING },
                },
                required: ['name'],
              },
            },
            extractedNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['extractedTasks', 'extractedPayments', 'extractedAppointments', 'extractedContacts', 'extractedNotes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, extraction: parsed });
  } catch (error: any) {
    console.error('Error in /api/inbox/analyze:', error);
    res.status(500).json({ error: 'Failed to analyze inbox content' });
  }
});

// 5. Natural Language Task Interpreter
app.post('/api/tasks/interpret', async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: 'Input is required' });

    const ai = getGeminiClient();

    const promptText = `Convert this natural language task request into a structured task object.
Current date context: ${new Date().toISOString().split('T')[0]} (Year 2026).

Natural Request: "${input}"

Respond strictly in JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            dueDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
            priority: { type: Type.STRING, description: 'High | Medium | Low' },
            category: { type: Type.STRING, description: 'Bills | Education | Banking | Government | Insurance | Employment | Housing | Personal | Other' },
            recurring: { type: Type.STRING, description: 'None | Daily | Weekly | Monthly | Yearly | Custom' },
            recurringDetails: { type: Type.STRING },
            amount: { type: Type.STRING },
            appointmentTime: { type: Type.STRING },
          },
          required: ['title', 'dueDate', 'priority', 'category'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, task: parsed });
  } catch (error: any) {
    console.error('Error in /api/tasks/interpret:', error);
    res.status(500).json({ error: 'Failed to interpret task' });
  }
});

// 6. AI Memory Extractor ("Remember This")
app.post('/api/memories/extract', async (req, res) => {
  try {
    const { statement } = req.body;
    if (!statement) return res.status(400).json({ error: 'Statement is required' });

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Extract a structured long-term memory key, value, and category from this user statement.
User Statement: "${statement}"

Respond strictly in JSON matching schema.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING, description: 'Short title for the memory e.g., Passport Expiration' },
            value: { type: Type.STRING, description: 'The exact fact or detail to remember' },
            category: { type: Type.STRING, description: 'Personal | Document | Finance | Medical | General' },
          },
          required: ['key', 'value', 'category'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, memory: parsed });
  } catch (error: any) {
    console.error('Error in /api/memories/extract:', error);
    res.status(500).json({ error: 'Failed to extract memory' });
  }
});

// Start Express server + Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Life Admin AI full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
