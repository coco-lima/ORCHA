import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { CardList } from './components/CardList.tsx';
import { InputArea } from './components/InputArea.tsx';
import { useWebSocket } from './hooks/useWebSocket.ts';
import {
  Card,
  Agent,
  WebSocketMessage,
  MessageType,
  CardStatus,
  CreateCardMessage,
  CardType,
  Priority
} from './types/index.ts';
import toast from 'react-hot-toast';

function App() {
  // State
  const [cards, setCards] = useState<Card[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [autoMode, setAutoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    completedToday: 0
  });

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);

    switch (message.type) {
      case MessageType.CREATE_CARD:
        const newCard = message.payload as Card;
        setCards(prev => [newCard, ...prev]);
        toast.success(`New task created: ${newCard.name}`, {
          duration: 4000,
          position: 'bottom-right'
        });
        break;

      case MessageType.UPDATE_CARD:
        const updatedCard = message.payload as Card;
        setCards(prev => prev.map(card => 
          card.id === updatedCard.id ? updatedCard : card
        ));
        
        // Show status change notifications
        if (updatedCard.status === CardStatus.COMPLETED) {
          toast.success(`Task completed: ${updatedCard.name}`, {
            duration: 3000,
            position: 'bottom-right'
          });
        } else if (updatedCard.status === CardStatus.FAILED) {
          toast.error(`Task failed: ${updatedCard.name}`, {
            duration: 4000,
            position: 'bottom-right'
          });
        }
        break;

      case MessageType.DELETE_CARD:
        const { cardId } = message.payload;
        setCards(prev => prev.filter(card => card.id !== cardId));
        toast.success('Task deleted', {
          duration: 2000,
          position: 'bottom-right'
        });
        break;

      case MessageType.AGENT_STATUS_UPDATE:
        const updatedAgent = message.payload as Agent;
        setAgents(prev => prev.map(agent => 
          agent.id === updatedAgent.id ? updatedAgent : agent
        ));
        break;

      case MessageType.SYSTEM_NOTIFICATION:
        // Handle initial data
        if (message.payload.cards) {
          setCards(message.payload.cards);
        }
        if (message.payload.agents) {
          setAgents(message.payload.agents);
        }
        if (message.payload.stats) {
          setStats(message.payload.stats);
        }
        setLoading(false);
        break;

      case MessageType.DEMO_STEP:
        toast.success(message.payload.message, {
          duration: 3000,
          position: 'bottom-right'
        });
        break;

      case MessageType.ERROR:
        toast.error(message.payload.message || 'An error occurred', {
          duration: 4000,
          position: 'bottom-right'
        });
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  }, []);

  // WebSocket connection
  const { connected, sendMessage } = useWebSocket(handleWebSocketMessage, {
    autoConnect: true,
    reconnectAttempts: 5,
    reconnectDelay: 3000
  });

  // Update stats when cards change
  useEffect(() => {
    const totalCards = cards.length;
    const activeCards = cards.filter(card => 
      card.status === CardStatus.IN_PROGRESS || card.status === CardStatus.PENDING
    ).length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = cards.filter(card => 
      card.status === CardStatus.COMPLETED && 
      new Date(card.updatedAt) >= today
    ).length;

    setStats({ totalCards, activeCards, completedToday });
  }, [cards]);

  // Handlers
  const handleCardUpdate = useCallback((cardId: string, updates: Partial<Card>) => {
    sendMessage('update_card', { cardId, updates });
  }, [sendMessage]);

  const handleCardDelete = useCallback((cardId: string) => {
    sendMessage('delete_card', cardId);
  }, [sendMessage]);

  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCardId(selectedCardId === cardId ? null : cardId);
  }, [selectedCardId]);

  const handleStartDemo = useCallback(() => {
    sendMessage('start_demo', {});
    toast.success('Starting demo sequence...', {
      duration: 2000,
      position: 'bottom-right'
    });
  }, [sendMessage]);

  const handleInputSubmit = useCallback((message: string) => {
    // Parse the message and create appropriate card
    const cardData: CreateCardMessage = {
      cardId: `task-${Date.now()}`,
      name: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      description: message,
      type: CardType.TASK,
      priority: Priority.MEDIUM,
      initialData: {
        userInput: true,
        originalMessage: message
      }
    };

    sendMessage('create_card', cardData);
    
    toast.success('Task created and assigned to agent', {
      duration: 3000,
      position: 'bottom-right'
    });
  }, [sendMessage]);

  const handleAutoModeToggle = useCallback(() => {
    setAutoMode(!autoMode);
    toast.success(`Auto mode ${!autoMode ? 'enabled' : 'disabled'}`, {
      duration: 2000,
      position: 'bottom-right'
    });
  }, [autoMode]);

  // Demo mode detection
  const demoMode = process.env.REACT_APP_DEMO_MODE === 'true' || 
                   cards.some(card => card.data?.demoTask);

  return (
    <div className="h-screen flex bg-background text-text-primary">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          demoMode={demoMode}
          onStartDemo={handleStartDemo}
          stats={stats}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Cards List */}
          <div className="flex-1 p-6 overflow-hidden">
            <CardList
              cards={cards}
              loading={loading}
              onCardUpdate={handleCardUpdate}
              onCardDelete={handleCardDelete}
              onCardSelect={handleCardSelect}
              selectedCardId={selectedCardId}
            />
          </div>

          {/* Input Area */}
          <InputArea
            onSubmit={handleInputSubmit}
            autoMode={autoMode}
            onAutoModeToggle={handleAutoModeToggle}
            disabled={!connected}
            placeholder={connected ? "Ask or instruct Agent" : "Connecting..."}
          />
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1F2B',
            color: '#ffffff',
            border: '1px solid #334155',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Connection Status Overlay */}
      {!connected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg border border-dark-600 text-center">
            <div className="spinner mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Connecting to AI Orchestrator
            </h3>
            <p className="text-text-secondary">
              Please wait while we establish connection...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
