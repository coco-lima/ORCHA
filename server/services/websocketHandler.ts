import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { 
  WebSocketMessage, 
  MessageType, 
  CreateCardMessage, 
  UpdateCardMessage,
  Card,
  Agent
} from '../../shared/types';
import { CardManager } from './cardManager';
import { AIOrchestrator } from './aiOrchestrator';
import { Logger } from '../utils/logger';

export class WebSocketHandler {
  private logger = new Logger();
  private connectedClients: Set<string> = new Set();

  constructor(
    private io: SocketIOServer,
    private cardManager: CardManager,
    private aiOrchestrator: AIOrchestrator
  ) {
    this.setupEventHandlers();
    this.logger.info('WebSocket handler initialized');
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    // Listen to card manager events (if we add event emitter to CardManager)
    this.setupCardManagerListeners();
  }

  /**
   * Handle new client connection
   */
  private handleConnection(socket: Socket): void {
    this.connectedClients.add(socket.id);
    this.logger.info(`Client connected: ${socket.id} (Total: ${this.connectedClients.size})`);

    // Send initial data to client
    this.sendInitialData(socket);

    // Setup client event handlers
    this.setupClientEventHandlers(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.connectedClients.delete(socket.id);
      this.logger.info(`Client disconnected: ${socket.id} (Total: ${this.connectedClients.size})`);
    });
  }

  /**
   * Send initial data to newly connected client
   */
  private sendInitialData(socket: Socket): void {
    const cards = this.cardManager.getAllCards();
    const agents = this.aiOrchestrator.getAllAgents();
    const stats = this.cardManager.getCardStats();

    socket.emit('initial_data', {
      cards,
      agents,
      stats,
      timestamp: new Date()
    });
  }

  /**
   * Setup event handlers for client messages
   */
  private setupClientEventHandlers(socket: Socket): void {
    // Card operations
    socket.on('create_card', (data: CreateCardMessage) => {
      this.handleCreateCard(socket, data);
    });

    socket.on('update_card', (data: UpdateCardMessage) => {
      this.handleUpdateCard(socket, data);
    });

    socket.on('delete_card', (cardId: string) => {
      this.handleDeleteCard(socket, cardId);
    });

    // Agent operations
    socket.on('assign_task', (data: { cardId: string; agentId?: string }) => {
      this.handleAssignTask(socket, data);
    });

    socket.on('complete_task', (data: { cardId: string; success?: boolean }) => {
      this.handleCompleteTask(socket, data);
    });

    // Demo operations
    socket.on('start_demo', () => {
      this.handleStartDemo(socket);
    });

    // Data requests
    socket.on('get_cards', () => {
      socket.emit('cards_data', this.cardManager.getAllCards());
    });

    socket.on('get_agents', () => {
      socket.emit('agents_data', this.aiOrchestrator.getAllAgents());
    });

    socket.on('get_stats', () => {
      const cardStats = this.cardManager.getCardStats();
      const orchestratorStats = this.aiOrchestrator.getStats();
      socket.emit('stats_data', { cards: cardStats, orchestrator: orchestratorStats });
    });

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
    });
  }

  /**
   * Handle create card request
   */
  private handleCreateCard(socket: Socket, data: CreateCardMessage): void {
    try {
      const card = this.cardManager.createCard(data);
      
      // Broadcast to all clients
      this.broadcastMessage({
        type: MessageType.CREATE_CARD,
        payload: card,
        timestamp: new Date(),
        id: uuidv4()
      });

      // Auto-assign if requested
      if (data.agentId || process.env.AUTO_ASSIGN_TASKS === 'true') {
        this.aiOrchestrator.assignTask(card.id, data.agentId);
        
        // Broadcast assignment update
        const updatedCard = this.cardManager.getCard(card.id);
        if (updatedCard) {
          this.broadcastMessage({
            type: MessageType.UPDATE_CARD,
            payload: updatedCard,
            timestamp: new Date(),
            id: uuidv4()
          });
        }
      }

      this.logger.info(`Card created via WebSocket: ${card.id}`);
    } catch (error) {
      this.logger.error('Error creating card:', error);
      socket.emit('error', {
        message: 'Failed to create card',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle update card request
   */
  private handleUpdateCard(socket: Socket, data: UpdateCardMessage): void {
    try {
      const updatedCard = this.cardManager.updateCard(data.cardId, data.updates);
      
      if (updatedCard) {
        this.broadcastMessage({
          type: MessageType.UPDATE_CARD,
          payload: updatedCard,
          timestamp: new Date(),
          id: uuidv4()
        });
        this.logger.info(`Card updated via WebSocket: ${data.cardId}`);
      } else {
        socket.emit('error', { message: 'Card not found', cardId: data.cardId });
      }
    } catch (error) {
      this.logger.error('Error updating card:', error);
      socket.emit('error', {
        message: 'Failed to update card',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle delete card request
   */
  private handleDeleteCard(socket: Socket, cardId: string): void {
    try {
      const deleted = this.cardManager.deleteCard(cardId);
      
      if (deleted) {
        this.broadcastMessage({
          type: MessageType.DELETE_CARD,
          payload: { cardId },
          timestamp: new Date(),
          id: uuidv4()
        });
        this.logger.info(`Card deleted via WebSocket: ${cardId}`);
      } else {
        socket.emit('error', { message: 'Card not found', cardId });
      }
    } catch (error) {
      this.logger.error('Error deleting card:', error);
      socket.emit('error', {
        message: 'Failed to delete card',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle task assignment request
   */
  private handleAssignTask(socket: Socket, data: { cardId: string; agentId?: string }): void {
    try {
      const success = this.aiOrchestrator.assignTask(data.cardId, data.agentId);
      
      if (success) {
        const updatedCard = this.cardManager.getCard(data.cardId);
        if (updatedCard) {
          this.broadcastMessage({
            type: MessageType.TASK_ASSIGNMENT,
            payload: updatedCard,
            timestamp: new Date(),
            id: uuidv4()
          });
        }
        this.logger.info(`Task assigned via WebSocket: ${data.cardId}`);
      } else {
        socket.emit('error', { message: 'Failed to assign task', cardId: data.cardId });
      }
    } catch (error) {
      this.logger.error('Error assigning task:', error);
      socket.emit('error', {
        message: 'Failed to assign task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle task completion request
   */
  private handleCompleteTask(socket: Socket, data: { cardId: string; success?: boolean }): void {
    try {
      const success = this.aiOrchestrator.completeTask(data.cardId, data.success !== false);
      
      if (success) {
        const updatedCard = this.cardManager.getCard(data.cardId);
        if (updatedCard) {
          this.broadcastMessage({
            type: MessageType.TASK_COMPLETION,
            payload: updatedCard,
            timestamp: new Date(),
            id: uuidv4()
          });
        }
        this.logger.info(`Task completed via WebSocket: ${data.cardId}`);
      } else {
        socket.emit('error', { message: 'Failed to complete task', cardId: data.cardId });
      }
    } catch (error) {
      this.logger.error('Error completing task:', error);
      socket.emit('error', {
        message: 'Failed to complete task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle start demo request
   */
  private async handleStartDemo(socket: Socket): Promise<void> {
    try {
      if (process.env.DEMO_MODE === 'true') {
        await this.aiOrchestrator.startDemoSequence();
        this.broadcastMessage({
          type: MessageType.DEMO_STEP,
          payload: { message: 'Demo sequence started' },
          timestamp: new Date(),
          id: uuidv4()
        });
        this.logger.info('Demo sequence started via WebSocket');
      } else {
        socket.emit('error', { message: 'Demo mode is disabled' });
      }
    } catch (error) {
      this.logger.error('Error starting demo:', error);
      socket.emit('error', {
        message: 'Failed to start demo',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Setup listeners for card manager events
   */
  private setupCardManagerListeners(): void {
    // This would be implemented if CardManager extended EventEmitter
    // For now, we'll rely on explicit broadcasts from the handlers above
  }

  /**
   * Broadcast message to all connected clients
   */
  public broadcastMessage(message: WebSocketMessage): void {
    this.io.emit('message', message);
    this.logger.debug(`Broadcasted message: ${message.type} to ${this.connectedClients.size} clients`);
  }

  /**
   * Send message to specific client
   */
  public sendToClient(socketId: string, message: WebSocketMessage): void {
    this.io.to(socketId).emit('message', message);
    this.logger.debug(`Sent message: ${message.type} to client ${socketId}`);
  }

  /**
   * Broadcast card update
   */
  public broadcastCardUpdate(card: Card): void {
    this.broadcastMessage({
      type: MessageType.UPDATE_CARD,
      payload: card,
      timestamp: new Date(),
      id: uuidv4()
    });
  }

  /**
   * Broadcast agent status update
   */
  public broadcastAgentUpdate(agent: Agent): void {
    this.broadcastMessage({
      type: MessageType.AGENT_STATUS_UPDATE,
      payload: agent,
      timestamp: new Date(),
      id: uuidv4()
    });
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats() {
    return {
      connectedClients: this.connectedClients.size,
      totalConnections: this.connectedClients.size // Could track historical data
    };
  }
}
