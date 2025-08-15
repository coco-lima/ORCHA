import { v4 as uuidv4 } from 'uuid';
import { Card, CardStatus, CardType, Priority, CreateCardMessage, UpdateCardMessage } from '../../shared/types';
import { Logger } from '../utils/logger';

export class CardManager {
  private cards: Map<string, Card> = new Map();
  private logger = new Logger();

  constructor() {
    this.logger.info('CardManager initialized');
  }

  /**
   * Create a new card
   */
  createCard(cardData: CreateCardMessage): Card {
    const card: Card = {
      id: cardData.cardId || uuidv4(),
      name: cardData.name,
      description: cardData.description,
      status: CardStatus.PENDING,
      type: cardData.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      data: cardData.initialData || {},
      priority: cardData.priority,
      tags: [],
      progress: 0
    };

    // Only set agentId if provided
    if (cardData.agentId) {
      card.agentId = cardData.agentId;
    }

    if (cardData.estimatedDuration) {
      card.estimatedCompletion = new Date(Date.now() + cardData.estimatedDuration * 1000);
    }

    this.cards.set(card.id, card);
    this.logger.info(`Card created: ${card.id} - ${card.name}`);
    
    return card;
  }

  /**
   * Update an existing card
   */
  updateCard(cardId: string, updates: Partial<Card>): Card | null {
    const card = this.cards.get(cardId);
    if (!card) {
      this.logger.warn(`Attempted to update non-existent card: ${cardId}`);
      return null;
    }

    const updatedCard: Card = {
      ...card,
      ...updates,
      id: card.id, // Prevent ID changes
      createdAt: card.createdAt, // Prevent creation date changes
      updatedAt: new Date()
    };

    this.cards.set(cardId, updatedCard);
    this.logger.info(`Card updated: ${cardId} - Status: ${updatedCard.status}`);
    
    return updatedCard;
  }

  /**
   * Delete a card
   */
  deleteCard(cardId: string): boolean {
    const deleted = this.cards.delete(cardId);
    if (deleted) {
      this.logger.info(`Card deleted: ${cardId}`);
    } else {
      this.logger.warn(`Attempted to delete non-existent card: ${cardId}`);
    }
    return deleted;
  }

  /**
   * Get a card by ID
   */
  getCard(cardId: string): Card | null {
    return this.cards.get(cardId) || null;
  }

  /**
   * Get all cards
   */
  getAllCards(): Card[] {
    return Array.from(this.cards.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get cards by status
   */
  getCardsByStatus(status: CardStatus): Card[] {
    return this.getAllCards().filter(card => card.status === status);
  }

  /**
   * Get cards by type
   */
  getCardsByType(type: CardType): Card[] {
    return this.getAllCards().filter(card => card.type === type);
  }

  /**
   * Get cards by agent
   */
  getCardsByAgent(agentId: string): Card[] {
    return this.getAllCards().filter(card => card.agentId === agentId);
  }

  /**
   * Get cards by priority
   */
  getCardsByPriority(priority: Priority): Card[] {
    return this.getAllCards().filter(card => card.priority === priority);
  }

  /**
   * Update card progress
   */
  updateCardProgress(cardId: string, progress: number): Card | null {
    const card = this.getCard(cardId);
    if (!card) return null;

    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    // Auto-update status based on progress
    let newStatus = card.status;
    if (clampedProgress === 0 && card.status === CardStatus.PENDING) {
      newStatus = CardStatus.PENDING;
    } else if (clampedProgress > 0 && clampedProgress < 100) {
      newStatus = CardStatus.IN_PROGRESS;
    } else if (clampedProgress === 100) {
      newStatus = CardStatus.COMPLETED;
    }

    return this.updateCard(cardId, { 
      progress: clampedProgress,
      status: newStatus
    });
  }

  /**
   * Add tag to card
   */
  addTagToCard(cardId: string, tag: string): Card | null {
    const card = this.getCard(cardId);
    if (!card) return null;

    const tags = [...new Set([...card.tags, tag])]; // Remove duplicates
    return this.updateCard(cardId, { tags });
  }

  /**
   * Remove tag from card
   */
  removeTagFromCard(cardId: string, tag: string): Card | null {
    const card = this.getCard(cardId);
    if (!card) return null;

    const tags = card.tags.filter(t => t !== tag);
    return this.updateCard(cardId, { tags });
  }

  /**
   * Search cards by name or description
   */
  searchCards(query: string): Card[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllCards().filter(card => 
      card.name.toLowerCase().includes(lowercaseQuery) ||
      card.description.toLowerCase().includes(lowercaseQuery) ||
      card.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get card statistics
   */
  getCardStats() {
    const cards = this.getAllCards();
    const stats = {
      total: cards.length,
      byStatus: {} as Record<CardStatus, number>,
      byType: {} as Record<CardType, number>,
      byPriority: {} as Record<Priority, number>,
      averageProgress: 0,
      completedToday: 0,
      overdue: 0
    };

    // Initialize counters
    Object.values(CardStatus).forEach(status => stats.byStatus[status] = 0);
    Object.values(CardType).forEach(type => stats.byType[type] = 0);
    Object.values(Priority).forEach(priority => stats.byPriority[priority] = 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let totalProgress = 0;

    cards.forEach(card => {
      stats.byStatus[card.status]++;
      stats.byType[card.type]++;
      stats.byPriority[card.priority]++;
      totalProgress += card.progress || 0;

      // Count completed today
      if (card.status === CardStatus.COMPLETED && 
          card.updatedAt >= today && 
          card.updatedAt < tomorrow) {
        stats.completedToday++;
      }

      // Count overdue
      if (card.estimatedCompletion && 
          card.estimatedCompletion < new Date() && 
          card.status !== CardStatus.COMPLETED) {
        stats.overdue++;
      }
    });

    stats.averageProgress = cards.length > 0 ? totalProgress / cards.length : 0;

    return stats;
  }

  /**
   * Clear all cards (useful for testing/demo reset)
   */
  clearAllCards(): void {
    this.cards.clear();
    this.logger.info('All cards cleared');
  }
}
