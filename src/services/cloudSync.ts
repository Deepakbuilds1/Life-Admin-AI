import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, TaskItem, BillItem, DocumentItem, AIMemory, SyncStatus } from '../types';

export interface CloudSyncPayload {
  user: UserProfile;
  tasks: TaskItem[];
  bills: BillItem[];
  documents: DocumentItem[];
  memories: AIMemory[];
  updatedAt: string;
}

export interface SyncResult {
  status: SyncStatus;
  data?: {
    user: UserProfile;
    tasks: TaskItem[];
    bills: BillItem[];
    documents: DocumentItem[];
    memories: AIMemory[];
  };
  error?: string;
}

/**
 * Helper to deduplicate & merge items by ID (newer or existing)
 */
function mergeItems<T extends { id: string }>(localItems: T[], cloudItems: T[]): T[] {
  const map = new Map<string, T>();
  
  // First load cloud items
  cloudItems.forEach((item) => {
    if (item.id) map.set(item.id, item);
  });

  // Local items overwrite or add
  localItems.forEach((item) => {
    if (item.id) map.set(item.id, item);
  });

  return Array.from(map.values());
}

export const cloudSyncService = {
  /**
   * Save current local data to Firestore if user permits cloud sync
   */
  async saveToCloud(
    uid: string,
    user: UserProfile,
    tasks: TaskItem[],
    bills: BillItem[],
    documents: DocumentItem[],
    memories: AIMemory[]
  ): Promise<SyncResult> {
    // 1. Strict Privacy Toggle Check: If user explicitly chose Device Only or disabled cloud sync
    if (user.storageMode === 'device_only' || !user.cloudSyncEnabled) {
      console.log('🔒 Storage mode is Device Only. Skipping cloud backup.');
      return { status: 'local_only' };
    }

    try {
      const userRef = doc(db, 'users', uid);
      const now = new Date().toISOString();
      const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const updatedUser: UserProfile = {
        ...user,
        lastSyncedAt: `Today at ${formattedTime}`,
      };

      const payload: CloudSyncPayload = {
        user: updatedUser,
        tasks,
        bills,
        documents,
        memories,
        updatedAt: now,
      };

      await setDoc(userRef, payload, { merge: true });

      return {
        status: 'synced',
        data: {
          user: updatedUser,
          tasks,
          bills,
          documents,
          memories,
        },
      };
    } catch (error: any) {
      console.error('Cloud save error:', error);
      return {
        status: 'sync_failed',
        error: error.message || 'Failed to save data to cloud',
      };
    }
  },

  /**
   * Synchronize local preferences and state with Cloud state upon Login / Auth Change
   */
  async syncOnAuthLogin(
    uid: string,
    localUser: UserProfile,
    localTasks: TaskItem[],
    localBills: BillItem[],
    localDocs: DocumentItem[],
    localMemories: AIMemory[]
  ): Promise<SyncResult> {
    // 1. Check user preference toggle
    if (localUser.storageMode === 'device_only' || !localUser.cloudSyncEnabled) {
      console.log('🔒 Device Only mode active. Preserving local storage only.');
      return { status: 'local_only' };
    }

    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);

      const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (docSnap.exists()) {
        const cloudData = docSnap.data() as CloudSyncPayload;

        // Merge User Preferences (cloud preferences + local session auth details)
        const mergedUser: UserProfile = {
          ...localUser,
          ...(cloudData.user || {}),
          id: uid,
          isAuthenticated: true,
          storageMode: localUser.storageMode || cloudData.user?.storageMode || 'cloud_sync',
          cloudSyncEnabled: localUser.cloudSyncEnabled ?? cloudData.user?.cloudSyncEnabled ?? true,
          lastSyncedAt: `Today at ${formattedTime}`,
        };

        // Merge task/bill/doc/memory collections safely
        const mergedTasks = mergeItems(localTasks, cloudData.tasks || []);
        const mergedBills = mergeItems(localBills, cloudData.bills || []);
        const mergedDocs = mergeItems(localDocs, cloudData.documents || []);
        const mergedMemories = mergeItems(localMemories, cloudData.memories || []);

        // Write back merged state to cloud
        await setDoc(
          userRef,
          {
            user: mergedUser,
            tasks: mergedTasks,
            bills: mergedBills,
            documents: mergedDocs,
            memories: mergedMemories,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return {
          status: 'synced',
          data: {
            user: mergedUser,
            tasks: mergedTasks,
            bills: mergedBills,
            documents: mergedDocs,
            memories: mergedMemories,
          },
        };
      } else {
        // No existing cloud document for user yet -> upload initial local state
        const updatedUser: UserProfile = {
          ...localUser,
          id: uid,
          isAuthenticated: true,
          lastSyncedAt: `Today at ${formattedTime}`,
        };

        await setDoc(
          userRef,
          {
            user: updatedUser,
            tasks: localTasks,
            bills: localBills,
            documents: localDocs,
            memories: localMemories,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return {
          status: 'synced',
          data: {
            user: updatedUser,
            tasks: localTasks,
            bills: localBills,
            documents: localDocs,
            memories: localMemories,
          },
        };
      }
    } catch (error: any) {
      console.error('Error during cloud sync on login:', error);
      return {
        status: 'sync_failed',
        error: error.message || 'Cloud sync failed',
      };
    }
  },

  /**
   * Subscribe to real-time cloud changes via Firestore onSnapshot
   */
  subscribeToCloudSync(
    uid: string,
    onUpdate: (data: CloudSyncPayload) => void
  ): () => void {
    if (!uid) return () => {};
    try {
      const userRef = doc(db, 'users', uid);
      return onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as CloudSyncPayload;
            onUpdate(data);
          }
        },
        (error) => {
          console.warn('Firestore real-time sync status:', error.message);
        }
      );
    } catch (e) {
      console.warn('Could not attach Firestore real-time listener:', e);
      return () => {};
    }
  },
};
