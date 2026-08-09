/**
 * Robust, leak-free WebSocket client service for Life Admin AI.
 * Handles auto-reconnect with exponential backoff, safe connection states,
 * heartbeat ping/pong, offline fallback, and event cleanup.
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

class WebSocketService {
  private socket: WebSocket | null = null;
  private status: WebSocketConnectionStatus = 'DISCONNECTED';

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelayMs = 1500;
  private maxReconnectDelayMs = 10000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingIntervalTimer: ReturnType<typeof setInterval> | null = null;

  private messageQueue: WebSocketMessage[] = [];
  private maxQueueSize = 30;

  private statusListeners: Set<StatusListener> = new Set();
  private messageListeners: Map<string, Set<MessageListener>> = new Map();
  private globalListeners: Set<MessageListener> = new Set();

  private isExplicitDisconnect = false;
  private isWindowListenersAttached = false;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.attachWindowListeners();
  }

  private attachWindowListeners() {
    if (typeof window === 'undefined' || this.isWindowListenersAttached) return;
    this.isWindowListenersAttached = true;

    window.addEventListener('online', () => {
      console.log('🌐 [WebSocket] Network came online. Attempting connection...');
      this.reconnectAttempts = 0;
      this.connect();
    });

    window.addEventListener('offline', () => {
      console.log('📡 [WebSocket] Network went offline. Pausing connection.');
      this.clearReconnectTimer();
      this.setStatus('DISCONNECTED');
    });
  }

  public getStatus(): WebSocketConnectionStatus {
    return this.status;
  }

  private setStatus(newStatus: WebSocketConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((listener) => {
        try {
          listener(newStatus);
        } catch (e) {
          console.error('[WebSocket] Status listener error:', e);
        }
      });
    }
  }

  /**
   * Connect to server WebSocket endpoint dynamically using /ws
   */
  public connect(urlOverride?: string): void {
    if (typeof window === 'undefined') return;

    // Do not attempt connection if browser is offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setStatus('DISCONNECTED');
      return;
    }

    // Do not duplicate active or pending connections
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.isExplicitDisconnect = false;
    this.cleanExistingSocket();

    this.setStatus(this.reconnectAttempts > 0 ? 'RECONNECTING' : 'CONNECTING');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const defaultUrl = `${protocol}//${window.location.host}/ws`;
    const wsUrl = urlOverride || defaultUrl;

    try {
      const ws = new WebSocket(wsUrl);
      this.socket = ws;

      ws.onopen = () => {
        if (this.socket !== ws) return;
        console.log('⚡ [WebSocket] Connected cleanly to', wsUrl);
        this.reconnectAttempts = 0;
        this.setStatus('CONNECTED');
        this.startHeartbeat();
        this.flushMessageQueue();
      };

      ws.onmessage = (event) => {
        if (this.socket !== ws) return;
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (_) {
          // Ignore non-JSON system frames
        }
      };

      ws.onerror = (_event) => {
        if (this.socket !== ws) return;
        // Suppress unhandled error logs in console when closing/reconnecting
        if (this.status !== 'CONNECTED') {
          this.setStatus('ERROR');
        }
      };

      ws.onclose = (_event) => {
        if (this.socket !== ws) return;
        this.stopHeartbeat();
        this.socket = null;

        if (this.isExplicitDisconnect) {
          this.setStatus('DISCONNECTED');
          return;
        }

        if (
          typeof navigator !== 'undefined' &&
          navigator.onLine &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect(wsUrl);
        } else {
          // Fall back gracefully to Local/Cloud sync
          this.setStatus('DISCONNECTED');
        }
      };
    } catch (err) {
      console.warn('[WebSocket] Setup exception:', err);
      this.setStatus('ERROR');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect(wsUrl);
      }
    }
  }

  private cleanExistingSocket() {
    if (this.socket) {
      const oldWs = this.socket;
      this.socket = null;
      // Detach listeners to prevent orphan error/close triggers
      oldWs.onopen = null;
      oldWs.onmessage = null;
      oldWs.onerror = null;
      oldWs.onclose = null;

      if (oldWs.readyState === WebSocket.OPEN || oldWs.readyState === WebSocket.CONNECTING) {
        try {
          oldWs.close(1000, 'Re-initializing connection');
        } catch (_) {}
      }
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(url: string) {
    this.clearReconnectTimer();

    this.reconnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelayMs * Math.pow(1.5, this.reconnectAttempts - 1) + Math.random() * 300,
      this.maxReconnectDelayMs
    );

    this.setStatus('RECONNECTING');

    this.reconnectTimer = setTimeout(() => {
      this.connect(url);
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingIntervalTimer = setInterval(() => {
      this.send('PING', { timestamp: new Date().toISOString() });
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }

  private flushMessageQueue() {
    if (this.messageQueue.length === 0) return;

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach((msg) => {
      this.send(msg.type, msg.payload);
    });
  }

  private handleIncomingMessage(message: WebSocketMessage) {
    this.globalListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('[WebSocket] Global listener error:', err);
      }
    });

    if (message.type && this.messageListeners.has(message.type)) {
      const typeListeners = this.messageListeners.get(message.type)!;
      typeListeners.forEach((listener) => {
        try {
          listener(message);
        } catch (err) {
          console.error(`[WebSocket] Listener error for type ${message.type}:`, err);
        }
      });
    }
  }

  /**
   * Send JSON message only if socket is OPEN
   */
  public send(type: string, payload: any = {}): boolean {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
        return true;
      } catch (err) {
        this.queueMessage(message);
        return false;
      }
    } else {
      this.queueMessage(message);
      return false;
    }
  }

  private queueMessage(message: WebSocketMessage) {
    if (message.type === 'PING') return;
    if (this.messageQueue.length >= this.maxQueueSize) {
      this.messageQueue.shift();
    }
    this.messageQueue.push(message);
  }

  public broadcastSync(payload: any): boolean {
    return this.send('SYNC_UPDATE', payload);
  }

  /**
   * Explicitly disconnect and cleanup socket & timers
   */
  public disconnect() {
    this.isExplicitDisconnect = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();
    this.cleanExistingSocket();
    this.setStatus('DISCONNECTED');
  }

  /**
   * Subscribe to connection status changes with instant initial emission
   */
  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    try {
      listener(this.status);
    } catch (_) {}

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Subscribe to specific message types
   */
  public subscribe<T = any>(type: string, listener: MessageListener<T>): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, new Set());
    }
    const typeListeners = this.messageListeners.get(type)!;
    typeListeners.add(listener);

    return () => {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        this.messageListeners.delete(type);
      }
    };
  }

  /**
   * Listen to all incoming messages
   */
  public onAnyMessage(listener: MessageListener): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }
}

export const webSocketService = new WebSocketService();
