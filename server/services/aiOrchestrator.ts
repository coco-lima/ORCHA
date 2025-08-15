import { v4 as uuidv4 } from 'uuid';
import { 
  Agent, 
  AgentType, 
  AgentStatus, 
  Card, 
  CardType, 
  CardStatus, 
  Priority, 
  TaskExecution, 
  ExecutionStep,
  DemoTask 
} from '../../shared/types';
import { CardManager } from './cardManager';
import { Logger } from '../utils/logger';

export class AIOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private activeExecutions: Map<string, TaskExecution> = new Map();
  private logger = new Logger();
  private demoTasks: DemoTask[] = [];

  constructor(private cardManager: CardManager) {
    this.logger.info('AI Orchestrator initialized');
    this.initializeAgents();
    this.initializeDemoTasks();
  }

  /**
   * Initialize default agents
   */
  private initializeAgents(): void {
    const defaultAgents: Omit<Agent, 'id' | 'createdAt' | 'lastActive'>[] = [
      {
        name: 'Customer Support Agent',
        type: AgentType.CUSTOMER_SUPPORT,
        status: AgentStatus.IDLE,
        capabilities: ['ticket_handling', 'email_response', 'chat_support'],
        currentTasks: [],
        maxConcurrentTasks: 3
      },
      {
        name: 'Data Analysis Agent',
        type: AgentType.DATA_ANALYSIS,
        status: AgentStatus.IDLE,
        capabilities: ['data_processing', 'report_generation', 'metrics_analysis'],
        currentTasks: [],
        maxConcurrentTasks: 2
      },
      {
        name: 'Integration Agent',
        type: AgentType.INTEGRATION,
        status: AgentStatus.IDLE,
        capabilities: ['api_integration', 'data_sync', 'webhook_handling'],
        currentTasks: [],
        maxConcurrentTasks: 5
      },
      {
        name: 'Automation Agent',
        type: AgentType.AUTOMATION,
        status: AgentStatus.IDLE,
        capabilities: ['workflow_automation', 'task_scheduling', 'process_optimization'],
        currentTasks: [],
        maxConcurrentTasks: 4
      }
    ];

    defaultAgents.forEach(agentData => {
      const agent: Agent = {
        ...agentData,
        id: uuidv4(),
        createdAt: new Date(),
        lastActive: new Date()
      };
      this.agents.set(agent.id, agent);
    });

    this.logger.info(`Initialized ${defaultAgents.length} agents`);
  }

  /**
   * Initialize demo tasks
   */
  private initializeDemoTasks(): void {
    this.demoTasks = [
      {
        name: 'Customer Support Ticket #4321',
        description: 'Respond to customer inquiry about billing issue',
        type: CardType.TASK,
        steps: [
          'Analyzing customer inquiry',
          'Checking billing records',
          'Preparing response',
          'Sending email to customer'
        ],
        duration: 8000,
        priority: Priority.HIGH
      },
      {
        name: 'Quarterly Sales Report',
        description: 'Generate Q4 sales analysis report',
        type: CardType.ANALYSIS,
        steps: [
          'Collecting sales data',
          'Processing metrics',
          'Creating visualizations',
          'Finalizing report'
        ],
        duration: 12000,
        priority: Priority.MEDIUM
      },
      {
        name: 'API Integration Setup',
        description: 'Configure new CRM integration endpoint',
        type: CardType.INTEGRATION,
        steps: [
          'Validating API credentials',
          'Setting up webhook endpoints',
          'Testing data synchronization',
          'Deploying configuration'
        ],
        duration: 10000,
        priority: Priority.HIGH
      },
      {
        name: 'User Metrics Analysis',
        description: 'Analyze user engagement patterns',
        type: CardType.ANALYSIS,
        steps: [
          'Extracting user data',
          'Computing engagement metrics',
          'Identifying trends',
          'Generating insights report'
        ],
        duration: 15000,
        priority: Priority.LOW
      }
    ];
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * Find available agent for task type
   */
  findAvailableAgent(taskType: CardType): Agent | null {
    const agents = Array.from(this.agents.values());
    
    // Find agents that can handle this task type and have capacity
    const availableAgents = agents.filter(agent => 
      agent.status === AgentStatus.IDLE || 
      (agent.status === AgentStatus.BUSY && agent.currentTasks.length < agent.maxConcurrentTasks)
    );

    // Prefer agents with relevant capabilities
    const suitableAgent = availableAgents.find(agent => {
      switch (taskType) {
        case CardType.TASK:
          return agent.type === AgentType.CUSTOMER_SUPPORT || agent.type === AgentType.GENERAL;
        case CardType.ANALYSIS:
          return agent.type === AgentType.DATA_ANALYSIS;
        case CardType.INTEGRATION:
          return agent.type === AgentType.INTEGRATION;
        case CardType.AUTOMATION:
          return agent.type === AgentType.AUTOMATION;
        default:
          return agent.type === AgentType.GENERAL;
      }
    });

    return suitableAgent || availableAgents[0] || null;
  }

  /**
   * Assign task to agent
   */
  assignTask(cardId: string, agentId?: string): boolean {
    const card = this.cardManager.getCard(cardId);
    if (!card) {
      this.logger.warn(`Cannot assign task: Card ${cardId} not found`);
      return false;
    }

    let agent: Agent | null;
    if (agentId) {
      agent = this.getAgent(agentId);
    } else {
      agent = this.findAvailableAgent(card.type);
    }

    if (!agent) {
      this.logger.warn(`No available agent found for card ${cardId}`);
      return false;
    }

    // Update agent
    agent.currentTasks.push(cardId);
    agent.status = AgentStatus.BUSY;
    agent.lastActive = new Date();
    this.agents.set(agent.id, agent);

    // Update card
    this.cardManager.updateCard(cardId, {
      agentId: agent.id,
      status: CardStatus.IN_PROGRESS
    });

    this.logger.info(`Task ${cardId} assigned to agent ${agent.id} (${agent.name})`);
    return true;
  }

  /**
   * Complete task
   */
  completeTask(cardId: string, success: boolean = true): boolean {
    const card = this.cardManager.getCard(cardId);
    if (!card || !card.agentId) {
      return false;
    }

    const agent = this.getAgent(card.agentId);
    if (!agent) {
      return false;
    }

    // Update agent
    agent.currentTasks = agent.currentTasks.filter(taskId => taskId !== cardId);
    agent.status = agent.currentTasks.length > 0 ? AgentStatus.BUSY : AgentStatus.IDLE;
    agent.lastActive = new Date();
    this.agents.set(agent.id, agent);

    // Update card
    this.cardManager.updateCard(cardId, {
      status: success ? CardStatus.COMPLETED : CardStatus.FAILED,
      progress: success ? 100 : card.progress
    });

    // Remove execution if exists
    this.activeExecutions.delete(cardId);

    this.logger.info(`Task ${cardId} ${success ? 'completed' : 'failed'} by agent ${agent.id}`);
    return true;
  }

  /**
   * Start demo sequence
   */
  async startDemoSequence(): Promise<void> {
    this.logger.info('Starting demo sequence');
    
    const delay = parseInt(process.env.DEMO_DELAY_MS || '2000');
    
    for (const demoTask of this.demoTasks) {
      // Create card for demo task
      const card = this.cardManager.createCard({
        cardId: uuidv4(),
        name: demoTask.name,
        description: demoTask.description,
        type: demoTask.type,
        priority: demoTask.priority,
        initialData: { demoTask: true }
      });

      // Assign to agent
      this.assignTask(card.id);

      // Simulate task execution
      this.simulateTaskExecution(card.id, demoTask);

      // Wait before next task
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Simulate task execution for demo
   */
  private async simulateTaskExecution(cardId: string, demoTask: DemoTask): Promise<void> {
    const stepDuration = demoTask.duration / demoTask.steps.length;
    
    for (let i = 0; i < demoTask.steps.length; i++) {
      const progress = Math.round(((i + 1) / demoTask.steps.length) * 100);
      
      // Update card progress
      this.cardManager.updateCardProgress(cardId, progress);
      
      // Wait for step completion
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    // Complete the task
    this.completeTask(cardId, true);
  }

  /**
   * Process incoming task (from external applications)
   */
  processIncomingTask(taskData: {
    name: string;
    description: string;
    type: CardType;
    priority: Priority;
    source: string;
    data: Record<string, any>;
  }): string {
    // Create card for the task
    const card = this.cardManager.createCard({
      cardId: uuidv4(),
      name: taskData.name,
      description: taskData.description,
      type: taskData.type,
      priority: taskData.priority,
      initialData: {
        source: taskData.source,
        ...taskData.data
      }
    });

    // Auto-assign to available agent
    this.assignTask(card.id);

    this.logger.info(`New task processed: ${card.id} from ${taskData.source}`);
    return card.id;
  }

  /**
   * Get orchestrator statistics
   */
  getStats() {
    const agents = this.getAllAgents();
    const cards = this.cardManager.getAllCards();
    
    return {
      agents: {
        total: agents.length,
        idle: agents.filter(a => a.status === AgentStatus.IDLE).length,
        busy: agents.filter(a => a.status === AgentStatus.BUSY).length,
        offline: agents.filter(a => a.status === AgentStatus.OFFLINE).length,
        error: agents.filter(a => a.status === AgentStatus.ERROR).length
      },
      tasks: {
        total: cards.length,
        active: cards.filter(c => c.status === CardStatus.IN_PROGRESS).length,
        pending: cards.filter(c => c.status === CardStatus.PENDING).length,
        completed: cards.filter(c => c.status === CardStatus.COMPLETED).length,
        failed: cards.filter(c => c.status === CardStatus.FAILED).length
      },
      executions: {
        active: this.activeExecutions.size
      }
    };
  }
}
