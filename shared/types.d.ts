export interface Card {
    id: string;
    name: string;
    description: string;
    status: CardStatus;
    type: CardType;
    createdAt: Date;
    updatedAt: Date;
    data: Record<string, any>;
    agentId?: string;
    taskId?: string;
    progress: number;
    estimatedCompletion?: Date;
    priority: Priority;
    tags: string[];
}
export declare enum CardStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    PAUSED = "paused",
    CANCELLED = "cancelled"
}
export declare enum CardType {
    TASK = "task",
    NOTIFICATION = "notification",
    ANALYSIS = "analysis",
    INTEGRATION = "integration",
    REPORT = "report",
    AUTOMATION = "automation"
}
export declare enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export interface Agent {
    id: string;
    name: string;
    type: AgentType;
    status: AgentStatus;
    capabilities: string[];
    currentTasks: string[];
    maxConcurrentTasks: number;
    createdAt: Date;
    lastActive: Date;
}
export declare enum AgentType {
    GENERAL = "general",
    CUSTOMER_SUPPORT = "customer_support",
    DATA_ANALYSIS = "data_analysis",
    INTEGRATION = "integration",
    AUTOMATION = "automation",
    MONITORING = "monitoring"
}
export declare enum AgentStatus {
    IDLE = "idle",
    BUSY = "busy",
    OFFLINE = "offline",
    ERROR = "error"
}
export interface WebSocketMessage {
    type: MessageType;
    payload: any;
    timestamp: Date;
    id: string;
}
export declare enum MessageType {
    CREATE_CARD = "create_card",
    UPDATE_CARD = "update_card",
    DELETE_CARD = "delete_card",
    CARD_STATUS_CHANGE = "card_status_change",
    AGENT_STATUS_UPDATE = "agent_status_update",
    TASK_ASSIGNMENT = "task_assignment",
    TASK_COMPLETION = "task_completion",
    SYSTEM_NOTIFICATION = "system_notification",
    ERROR = "error",
    HEARTBEAT = "heartbeat",
    DEMO_STEP = "demo_step"
}
export interface CreateCardMessage {
    cardId: string;
    name: string;
    description: string;
    type: CardType;
    priority: Priority;
    initialData: Record<string, any>;
    agentId?: string;
    estimatedDuration?: number;
}
export interface UpdateCardMessage {
    cardId: string;
    updates: Partial<Card>;
}
export interface TaskExecution {
    id: string;
    cardId: string;
    agentId: string;
    steps: ExecutionStep[];
    status: CardStatus;
    startTime: Date;
    endTime?: Date;
    error?: string;
}
export interface ExecutionStep {
    id: string;
    name: string;
    description: string;
    status: CardStatus;
    startTime?: Date;
    endTime?: Date;
    output?: any;
    error?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface DemoConfig {
    enabled: boolean;
    stepDelay: number;
    autoProgress: boolean;
    simulatedTasks: DemoTask[];
}
export interface DemoTask {
    name: string;
    description: string;
    type: CardType;
    steps: string[];
    duration: number;
    priority: Priority;
}
//# sourceMappingURL=types.d.ts.map