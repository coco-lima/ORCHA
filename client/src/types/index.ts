// Shared types (copied from shared/types.ts)
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

export enum CardStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export enum CardType {
  TASK = 'task',
  NOTIFICATION = 'notification',
  ANALYSIS = 'analysis',
  INTEGRATION = 'integration',
  REPORT = 'report',
  AUTOMATION = 'automation'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
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

export enum AgentType {
  GENERAL = 'general',
  CUSTOMER_SUPPORT = 'customer_support',
  DATA_ANALYSIS = 'data_analysis',
  INTEGRATION = 'integration',
  AUTOMATION = 'automation',
  MONITORING = 'monitoring'
}

export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ERROR = 'error'
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: Date;
  id: string;
}

export enum MessageType {
  // Card operations
  CREATE_CARD = 'create_card',
  UPDATE_CARD = 'update_card',
  DELETE_CARD = 'delete_card',
  CARD_STATUS_CHANGE = 'card_status_change',

  // Agent operations
  AGENT_STATUS_UPDATE = 'agent_status_update',
  TASK_ASSIGNMENT = 'task_assignment',
  TASK_COMPLETION = 'task_completion',

  // System messages
  SYSTEM_NOTIFICATION = 'system_notification',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',

  // Demo mode
  DEMO_STEP = 'demo_step'
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

// Frontend-specific types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  selectedCard: string | null;
  sidebarCollapsed: boolean;
  demoMode: boolean;
  autoMode: boolean;
}

export interface CardFilters {
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
  agentId?: string;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

export interface WebSocketState {
  connected: boolean;
  reconnecting: boolean;
  lastMessage: Date | null;
  connectionAttempts: number;
}

export interface AppState {
  cards: Card[];
  agents: Agent[];
  ui: UIState;
  websocket: WebSocketState;
  notifications: NotificationState[];
  filters: CardFilters;
  stats: {
    cards: any;
    orchestrator: any;
  };
}

// Component Props Types
export interface CardComponentProps {
  card: Card;
  onUpdate?: (cardId: string, updates: Partial<Card>) => void;
  onDelete?: (cardId: string) => void;
  onSelect?: (cardId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export interface HeaderProps {
  demoMode: boolean;
  onStartDemo?: () => void;
  stats?: {
    totalCards: number;
    activeCards: number;
    completedToday: number;
  };
}

export interface InputAreaProps {
  onSubmit: (message: string) => void;
  autoMode: boolean;
  onAutoModeToggle: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export interface StatusBadgeProps {
  status: CardStatus;
  className?: string;
}

export interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export interface AgentAvatarProps {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

// Hook Types
export interface UseWebSocketReturn {
  socket: any;
  connected: boolean;
  reconnecting: boolean;
  sendMessage: (type: string, payload: any) => void;
  lastMessage: any;
}

export interface UseCardsReturn {
  cards: Card[];
  loading: boolean;
  error: string | null;
  createCard: (cardData: CreateCardMessage) => Promise<Card>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<Card>;
  deleteCard: (cardId: string) => Promise<boolean>;
  refreshCards: () => Promise<void>;
}

export interface UseAgentsReturn {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  assignTask: (cardId: string, agentId?: string) => Promise<boolean>;
  completeTask: (cardId: string, success?: boolean) => Promise<boolean>;
  refreshAgents: () => Promise<void>;
}

// API Response Types
export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Event Types
export interface CardEvent {
  type: 'create' | 'update' | 'delete' | 'select';
  cardId: string;
  card?: Card;
  updates?: Partial<Card>;
}

export interface AgentEvent {
  type: 'status_change' | 'task_assigned' | 'task_completed';
  agentId: string;
  agent?: Agent;
  cardId?: string;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface CardAnimationProps {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: AnimationConfig;
}

// Theme Types
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Form Types
export interface CreateCardFormData {
  name: string;
  description: string;
  type: CardType;
  priority: Priority;
  agentId?: string;
  estimatedDuration?: number;
  tags: string[];
}

export interface FilterFormData {
  status: CardStatus | '';
  type: CardType | '';
  priority: Priority | '';
  search: string;
  agentId: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}
