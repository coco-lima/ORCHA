import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, MessageType, Card, Agent } from '../types';
import toast from 'react-hot-toast';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  reconnecting: boolean;
  connectionAttempts: number;
  sendMessage: (type: string, payload: any) => void;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (
  onMessage?: (message: WebSocketMessage) => void,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    url = process.env.REACT_APP_WS_URL || 'http://localhost:3001',
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000
  } = options;

  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);

  // Update the callback ref when it changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    console.log('Connecting to WebSocket server...');
    
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      setReconnecting(false);
      setConnectionAttempts(0);
      
      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      toast.success('Connected to AI Orchestrator', {
        duration: 2000,
        position: 'bottom-right'
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }

      // Attempt to reconnect
      if (connectionAttempts < reconnectAttempts) {
        setReconnecting(true);
        setConnectionAttempts(prev => prev + 1);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Reconnection attempt ${connectionAttempts + 1}/${reconnectAttempts}`);
          socket.connect();
        }, reconnectDelay);
      } else {
        toast.error('Connection lost. Please refresh the page.', {
          duration: 0,
          position: 'bottom-right'
        });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
      
      if (connectionAttempts >= reconnectAttempts) {
        toast.error('Failed to connect to server', {
          duration: 5000,
          position: 'bottom-right'
        });
      }
    });

    // Handle incoming messages
    socket.on('message', (message: WebSocketMessage) => {
      console.log('Received WebSocket message:', message);
      setLastMessage(message);
      onMessageRef.current?.(message);
    });

    // Handle initial data
    socket.on('initial_data', (data: { cards: Card[]; agents: Agent[]; stats: any }) => {
      console.log('Received initial data:', data);
      onMessageRef.current?.({
        type: MessageType.SYSTEM_NOTIFICATION,
        payload: data,
        timestamp: new Date(),
        id: 'initial_data'
      });
    });

    // Handle specific card events
    socket.on('card_created', (card: Card) => {
      onMessageRef.current?.({
        type: MessageType.CREATE_CARD,
        payload: card,
        timestamp: new Date(),
        id: card.id
      });
    });

    socket.on('card_updated', (card: Card) => {
      onMessageRef.current?.({
        type: MessageType.UPDATE_CARD,
        payload: card,
        timestamp: new Date(),
        id: card.id
      });
    });

    socket.on('card_deleted', (data: { cardId: string }) => {
      onMessageRef.current?.({
        type: MessageType.DELETE_CARD,
        payload: data,
        timestamp: new Date(),
        id: data.cardId
      });
    });

    // Handle agent events
    socket.on('agent_updated', (agent: Agent) => {
      onMessageRef.current?.({
        type: MessageType.AGENT_STATUS_UPDATE,
        payload: agent,
        timestamp: new Date(),
        id: agent.id
      });
    });

    // Handle errors
    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      toast.error(error.message || 'An error occurred', {
        duration: 4000,
        position: 'bottom-right'
      });
    });

    // Handle heartbeat
    socket.on('pong', (data: { timestamp: Date }) => {
      console.log('Heartbeat response received:', data);
    });

    socketRef.current = socket;
  }, [url, connectionAttempts, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setConnected(false);
    setReconnecting(false);
    setConnectionAttempts(0);
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socketRef.current?.connected) {
      console.log('Sending WebSocket message:', { type, payload });
      socketRef.current.emit(type, payload);
    } else {
      console.warn('Cannot send message: WebSocket not connected');
      toast.error('Not connected to server', {
        duration: 3000,
        position: 'bottom-right'
      });
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Send periodic heartbeat
  useEffect(() => {
    if (!connected) return;

    const heartbeatInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');
      }
    }, 30000); // Send heartbeat every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [connected]);

  return {
    socket: socketRef.current,
    connected,
    reconnecting,
    connectionAttempts,
    sendMessage,
    lastMessage,
    connect,
    disconnect
  };
};
