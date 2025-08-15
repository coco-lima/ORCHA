import { Router, Request, Response } from 'express';
import { CardManager } from '../services/cardManager';
import { WebSocketHandler } from '../services/websocketHandler';
import { CreateCardMessage, UpdateCardMessage, CardStatus, CardType, Priority } from '../../shared/types';
import { Logger } from '../utils/logger';

const logger = new Logger();

export default function createCardRoutes(cardManager: CardManager, wsHandler: WebSocketHandler): Router {
  const router = Router();

  /**
   * GET /api/cards - Get all cards
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const { status, type, priority, search, page = 1, limit = 50 } = req.query;
      
      let cards = cardManager.getAllCards();

      // Apply filters
      if (status) {
        cards = cards.filter(card => card.status === status);
      }
      if (type) {
        cards = cards.filter(card => card.type === type);
      }
      if (priority) {
        cards = cards.filter(card => card.priority === priority);
      }
      if (search) {
        cards = cardManager.searchCards(search as string);
      }

      // Apply pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedCards = cards.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          cards: paginatedCards,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: cards.length,
            hasNext: endIndex < cards.length,
            hasPrev: pageNum > 1
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching cards:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cards'
      });
    }
  });

  /**
   * GET /api/cards/:id - Get card by ID
   */
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const card = cardManager.getCard(req.params.id);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      res.json({
        success: true,
        data: card
      });
    } catch (error) {
      logger.error('Error fetching card:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch card'
      });
    }
  });

  /**
   * POST /api/cards - Create new card
   */
  router.post('/', (req: Request, res: Response) => {
    try {
      const cardData: CreateCardMessage = req.body;

      // Validate required fields
      if (!cardData.name || !cardData.description) {
        return res.status(400).json({
          success: false,
          error: 'Name and description are required'
        });
      }

      // Set defaults
      if (!cardData.type) cardData.type = CardType.TASK;
      if (!cardData.priority) cardData.priority = Priority.MEDIUM;
      if (!cardData.initialData) cardData.initialData = {};

      const card = cardManager.createCard(cardData);

      // Broadcast to WebSocket clients
      wsHandler.broadcastCardUpdate(card);

      res.status(201).json({
        success: true,
        data: card,
        message: 'Card created successfully'
      });
    } catch (error) {
      logger.error('Error creating card:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create card'
      });
    }
  });

  /**
   * PUT /api/cards/:id - Update card
   */
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const updates = req.body;
      const updatedCard = cardManager.updateCard(req.params.id, updates);

      if (!updatedCard) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      // Broadcast to WebSocket clients
      wsHandler.broadcastCardUpdate(updatedCard);

      res.json({
        success: true,
        data: updatedCard,
        message: 'Card updated successfully'
      });
    } catch (error) {
      logger.error('Error updating card:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update card'
      });
    }
  });

  /**
   * PATCH /api/cards/:id/progress - Update card progress
   */
  router.patch('/:id/progress', (req: Request, res: Response) => {
    try {
      const { progress } = req.body;

      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          error: 'Progress must be a number between 0 and 100'
        });
      }

      const updatedCard = cardManager.updateCardProgress(req.params.id, progress);

      if (!updatedCard) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      // Broadcast to WebSocket clients
      wsHandler.broadcastCardUpdate(updatedCard);

      res.json({
        success: true,
        data: updatedCard,
        message: 'Card progress updated successfully'
      });
    } catch (error) {
      logger.error('Error updating card progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update card progress'
      });
    }
  });

  /**
   * POST /api/cards/:id/tags - Add tag to card
   */
  router.post('/:id/tags', (req: Request, res: Response) => {
    try {
      const { tag } = req.body;

      if (!tag || typeof tag !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Tag is required and must be a string'
        });
      }

      const updatedCard = cardManager.addTagToCard(req.params.id, tag);

      if (!updatedCard) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      // Broadcast to WebSocket clients
      wsHandler.broadcastCardUpdate(updatedCard);

      res.json({
        success: true,
        data: updatedCard,
        message: 'Tag added successfully'
      });
    } catch (error) {
      logger.error('Error adding tag to card:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add tag to card'
      });
    }
  });

  /**
   * DELETE /api/cards/:id/tags/:tag - Remove tag from card
   */
  router.delete('/:id/tags/:tag', (req: Request, res: Response) => {
    try {
      const updatedCard = cardManager.removeTagFromCard(req.params.id, req.params.tag);

      if (!updatedCard) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      // Broadcast to WebSocket clients
      wsHandler.broadcastCardUpdate(updatedCard);

      res.json({
        success: true,
        data: updatedCard,
        message: 'Tag removed successfully'
      });
    } catch (error) {
      logger.error('Error removing tag from card:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove tag from card'
      });
    }
  });

  /**
   * DELETE /api/cards/:id - Delete card
   */
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const deleted = cardManager.deleteCard(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      // Broadcast deletion to WebSocket clients
      wsHandler.broadcastMessage({
        type: 'delete_card' as any,
        payload: { cardId: req.params.id },
        timestamp: new Date(),
        id: req.params.id
      });

      res.json({
        success: true,
        message: 'Card deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting card:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete card'
      });
    }
  });

  /**
   * GET /api/cards/stats - Get card statistics
   */
  router.get('/stats', (req: Request, res: Response) => {
    try {
      const stats = cardManager.getCardStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching card stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch card statistics'
      });
    }
  });

  return router;
}
