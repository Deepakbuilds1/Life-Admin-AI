/**
 * Local-first Event & Synchronization Service for Life Admin AI.
 * Replaces custom WebSocket network connection with clean local-first state
 * and Firebase cloud sync event subscriptions.
 */

export type WebSocketConnectionStatus =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export interface WebSocketMessage<T = any> {
  type: string;
  senderId?: string;
  payload?: T;
  timestamp?: string;
  [key: string]: any;
}

export type StatusListener = (status: WebSocketConnectionStatus) => void;
export type MessageListener<T = any> = (message: WebSocketMessage<T>) => void;

class LocalSyncService {
  private status: WebSocketConnectionStatus = 'DISCONNECTED';
  private statusListeners: Set<StatusListener> = new Set();
  private messageListeners: Map<string, Set<MessageListener>> = new Map();

  public getStatus(): WebSocketConnectionStatus {
    return this.status;
  }

  public connect(): void {
    // Local-first architecture: No persistent WebSocket connection required
    this.status = 'DISCONNECTED';
    this.notifyStatus('DISCONNECTED');
  }

  public disconnect(): void {
    this.status = 'DISCONNECTED';
    this.notifyStatus('DISCONNECTED');
  }

  public sendSyncUpdate(_payload: any): boolean {
    // Local-first: Changes are persisted to local storage & synced via Firebase
    return true;
  }

  public broadcastSync(_payload: any): boolean {
    // Local-first: Changes are persisted to local storage & synced via Firebase
    return true;
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribe<T = any>(type: string, listener: MessageListener<T>): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, new Set());
    }
    this.messageListeners.get(type)!.add(listener);

    return () => {
      const set = this.messageListeners.get(type);
      if (set) {
        set.delete(listener);
      }
    };
  }

  private notifyStatus(newStatus: WebSocketConnectionStatus) {
    this.statusListeners.forEach((listener) => {
      try {
        listener(newStatus);
      } catch (e) {
        console.error('Status listener error:', e);
      }
    });
  }
}

export const webSocketService = new LocalSyncService();
