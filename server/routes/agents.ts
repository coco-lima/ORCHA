import { Router, Request, Response } from 'express';
import { AIOrchestrator } from '../services/aiOrchestrator';
import { CardType, Priority } from '../../shared/types';
import { Logger } from '../utils/logger';

const logger = new Logger();

export default function createAgentRoutes(aiOrchestrator: AIOrchestrator): Router {
  const router = Router();

  /**
   * GET /api/agents - Get all agents
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const agents = aiOrchestrator.getAllAgents();
      
      res.json({
        success: true,
        data: agents
      });
    } catch (error) {
      logger.error('Error fetching agents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agents'
      });
    }
  });

  /**
   * GET /api/agents/:id - Get agent by ID
   */
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const agent = aiOrchestrator.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      logger.error('Error fetching agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agent'
      });
    }
  });

  /**
   * POST /api/agents/:id/assign - Assign task to agent
   */
  router.post('/:id/assign', (req: Request, res: Response) => {
    try {
      const { cardId } = req.body;
      
      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      const success = aiOrchestrator.assignTask(cardId, req.params.id);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Failed to assign task to agent'
        });
      }

      res.json({
        success: true,
        message: 'Task assigned successfully'
      });
    } catch (error) {
      logger.error('Error assigning task to agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign task to agent'
      });
    }
  });

  /**
   * POST /api/agents/assign-auto - Auto-assign task to best available agent
   */
  router.post('/assign-auto', (req: Request, res: Response) => {
    try {
      const { cardId } = req.body;
      
      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      const success = aiOrchestrator.assignTask(cardId);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'No available agent found for this task'
        });
      }

      res.json({
        success: true,
        message: 'Task auto-assigned successfully'
      });
    } catch (error) {
      logger.error('Error auto-assigning task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to auto-assign task'
      });
    }
  });

  /**
   * POST /api/agents/complete-task - Complete a task
   */
  router.post('/complete-task', (req: Request, res: Response) => {
    try {
      const { cardId, success = true } = req.body;
      
      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      const completed = aiOrchestrator.completeTask(cardId, success);
      
      if (!completed) {
        return res.status(400).json({
          success: false,
          error: 'Failed to complete task'
        });
      }

      res.json({
        success: true,
        message: `Task ${success ? 'completed' : 'failed'} successfully`
      });
    } catch (error) {
      logger.error('Error completing task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete task'
      });
    }
  });

  /**
   * POST /api/agents/process-task - Process incoming external task
   */
  router.post('/process-task', (req: Request, res: Response) => {
    try {
      const { name, description, type, priority, source, data } = req.body;
      
      // Validate required fields
      if (!name || !description || !source) {
        return res.status(400).json({
          success: false,
          error: 'Name, description, and source are required'
        });
      }

      const taskData = {
        name,
        description,
        type: type || CardType.TASK,
        priority: priority || Priority.MEDIUM,
        source,
        data: data || {}
      };

      const cardId = aiOrchestrator.processIncomingTask(taskData);
      
      res.status(201).json({
        success: true,
        data: { cardId },
        message: 'Task processed and assigned successfully'
      });
    } catch (error) {
      logger.error('Error processing incoming task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process incoming task'
      });
    }
  });

  /**
   * GET /api/agents/stats - Get orchestrator statistics
   */
  router.get('/stats', (req: Request, res: Response) => {
    try {
      const stats = aiOrchestrator.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching orchestrator stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orchestrator statistics'
      });
    }
  });

  /**
   * POST /api/agents/demo/start - Start demo sequence
   */
  router.post('/demo/start', async (req: Request, res: Response) => {
    try {
      if (process.env.DEMO_MODE !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'Demo mode is disabled'
        });
      }

      await aiOrchestrator.startDemoSequence();
      
      res.json({
        success: true,
        message: 'Demo sequence started successfully'
      });
    } catch (error) {
      logger.error('Error starting demo sequence:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start demo sequence'
      });
    }
  });

  /**
   * GET /api/agents/available/:taskType - Find available agent for task type
   */
  router.get('/available/:taskType', (req: Request, res: Response) => {
    try {
      const taskType = req.params.taskType as CardType;
      
      if (!Object.values(CardType).includes(taskType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid task type'
        });
      }

      const agent = aiOrchestrator.findAvailableAgent(taskType);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'No available agent found for this task type'
        });
      }

      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      logger.error('Error finding available agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to find available agent'
      });
    }
  });

  return router;
}
