import { TaskItem, BillItem, DocumentItem, AIMemory, UserProfile, SecurityActivityLog } from '../types';

const DB_NAME = 'LifeAdminLocalDB';
const DB_VERSION = 1;

export interface AppLocalData {
  user: UserProfile;
  tasks: TaskItem[];
  bills: BillItem[];
  documents: DocumentItem[];
  memories: AIMemory[];
  securityLogs: SecurityActivityLog[];
  offlineQueue: Array<{ id: string; action: string; payload: any; timestamp: string }>;
}

class LocalDBService {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<IDBDatabase | null> {
    if (this.db) return this.db;
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      return null;
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('user')) db.createObjectStore('user', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('bills')) db.createObjectStore('bills', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('documents')) db.createObjectStore('documents', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('memories')) db.createObjectStore('memories', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('securityLogs')) db.createObjectStore('securityLogs', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('offlineQueue')) db.createObjectStore('offlineQueue', { keyPath: 'id' });
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (err) => {
        console.error('IndexedDB open error:', err);
        resolve(null);
      };
    });
  }

  // Generic Save to Store
  async saveCollection<T>(storeName: string, items: T[]): Promise<boolean> {
    try {
      const db = await this.initDB();
      if (!db) {
        localStorage.setItem(`la_${storeName}`, JSON.stringify(items));
        return true;
      }

      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();

        items.forEach((item: any) => {
          store.put(item);
        });

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => {
          localStorage.setItem(`la_${storeName}`, JSON.stringify(items));
          resolve(false);
        };
      });
    } catch (e) {
      console.error(`Error saving collection ${storeName}:`, e);
      localStorage.setItem(`la_${storeName}`, JSON.stringify(items));
      return false;
    }
  }

  // Generic Load Store
  async loadCollection<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.initDB();
      if (!db) {
        const raw = localStorage.getItem(`la_${storeName}`);
        return raw ? JSON.parse(raw) : [];
      }

      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const res = request.result || [];
          if (res.length === 0) {
            const raw = localStorage.getItem(`la_${storeName}`);
            if (raw) resolve(JSON.parse(raw));
            else resolve([]);
          } else {
            resolve(res);
          }
        };

        request.onerror = () => {
          const raw = localStorage.getItem(`la_${storeName}`);
          resolve(raw ? JSON.parse(raw) : []);
        };
      });
    } catch (e) {
      const raw = localStorage.getItem(`la_${storeName}`);
      return raw ? JSON.parse(raw) : [];
    }
  }

  // Save Single User Profile
  async saveUser(user: UserProfile): Promise<boolean> {
    try {
      const db = await this.initDB();
      if (!db) {
        localStorage.setItem('la_user', JSON.stringify(user));
        return true;
      }
      return new Promise((resolve) => {
        const tx = db.transaction('user', 'readwrite');
        tx.objectStore('user').put(user);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => {
          localStorage.setItem('la_user', JSON.stringify(user));
          resolve(false);
        };
      });
    } catch (e) {
      localStorage.setItem('la_user', JSON.stringify(user));
      return false;
    }
  }

  // Load User Profile
  async loadUser(): Promise<UserProfile | null> {
    try {
      const db = await this.initDB();
      if (!db) {
        const raw = localStorage.getItem('la_user');
        return raw ? JSON.parse(raw) : null;
      }
      return new Promise((resolve) => {
        const tx = db.transaction('user', 'readonly');
        const req = tx.objectStore('user').getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result[0]);
          } else {
            const raw = localStorage.getItem('la_user');
            resolve(raw ? JSON.parse(raw) : null);
          }
        };
        req.onerror = () => {
          const raw = localStorage.getItem('la_user');
          resolve(raw ? JSON.parse(raw) : null);
        };
      });
    } catch (e) {
      const raw = localStorage.getItem('la_user');
      return raw ? JSON.parse(raw) : null;
    }
  }

  // Queue Offline Change
  async queueOfflineChange(action: string, payload: any): Promise<void> {
    const queueItem = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      action,
      payload,
      timestamp: new Date().toISOString(),
    };
    const queue = await this.loadCollection<any>('offlineQueue');
    queue.push(queueItem);
    await this.saveCollection('offlineQueue', queue);
  }

  // Clear All Local Stores
  async clearAllData(): Promise<void> {
    const db = await this.initDB();
    if (db) {
      const storeNames = ['user', 'tasks', 'bills', 'documents', 'memories', 'securityLogs', 'offlineQueue'];
      const tx = db.transaction(storeNames, 'readwrite');
      storeNames.forEach((s) => tx.objectStore(s).clear());
    }
    // Clear localStorage items
    ['la_user', 'la_tasks', 'la_bills', 'la_documents', 'la_memories', 'la_securityLogs', 'la_offlineQueue'].forEach((k) =>
      localStorage.removeItem(k)
    );
  }
}

export const dbStorage = new LocalDBService();
