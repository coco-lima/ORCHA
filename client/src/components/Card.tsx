import React from 'react';
import { 
  Cloud, 
  Share, 
  Terminal, 
  Upload, 
  Database,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Pause,
  MoreHorizontal,
  User
} from 'lucide-react';
import { CardComponentProps, CardStatus, CardType, Priority } from '../types';
import { formatDistanceToNow } from 'date-fns';

// Icon mapping for different card types
const getCardIcon = (type: CardType) => {
  switch (type) {
    case CardType.INTEGRATION:
      return Share;
    case CardType.ANALYSIS:
      return Database;
    case CardType.AUTOMATION:
      return Terminal;
    case CardType.REPORT:
      return Upload;
    case CardType.TASK:
    default:
      return Cloud;
  }
};

// Status icon mapping
const getStatusIcon = (status: CardStatus) => {
  switch (status) {
    case CardStatus.COMPLETED:
      return CheckCircle;
    case CardStatus.IN_PROGRESS:
      return Clock;
    case CardStatus.FAILED:
      return XCircle;
    case CardStatus.PAUSED:
      return Pause;
    case CardStatus.PENDING:
    default:
      return Clock;
  }
};

// Status color mapping
const getStatusColor = (status: CardStatus) => {
  switch (status) {
    case CardStatus.COMPLETED:
      return 'text-green-400 bg-green-900/20';
    case CardStatus.IN_PROGRESS:
      return 'text-blue-400 bg-blue-900/20';
    case CardStatus.FAILED:
      return 'text-red-400 bg-red-900/20';
    case CardStatus.PAUSED:
      return 'text-yellow-400 bg-yellow-900/20';
    case CardStatus.PENDING:
    default:
      return 'text-gray-400 bg-gray-900/20';
  }
};

// Priority color mapping
const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case Priority.URGENT:
      return 'text-red-400';
    case Priority.HIGH:
      return 'text-orange-400';
    case Priority.MEDIUM:
      return 'text-yellow-400';
    case Priority.LOW:
    default:
      return 'text-gray-400';
  }
};

export const Card: React.FC<CardComponentProps> = ({
  card,
  onUpdate,
  onDelete,
  onSelect,
  isSelected = false,
  showActions = true
}) => {
  const CardIcon = getCardIcon(card.type);
  const StatusIcon = getStatusIcon(card.status);
  const statusColor = getStatusColor(card.status);
  const priorityColor = getPriorityColor(card.priority);

  const handleCardClick = () => {
    onSelect?.(card.id);
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      const nextStatus = card.status === CardStatus.COMPLETED 
        ? CardStatus.PENDING 
        : CardStatus.COMPLETED;
      onUpdate(card.id, { status: nextStatus });
    }
  };

  const progress = card.progress || 0;

  return (
    <div
      className={`
        card p-4 cursor-pointer transition-all duration-200 hover:shadow-card-hover
        ${isSelected ? 'ring-2 ring-accent ring-opacity-50 border-accent/50' : ''}
        animate-slide-up
      `}
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Card Type Icon */}
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
            ${card.status === CardStatus.COMPLETED 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-surface-light text-text-secondary'
            }
          `}>
            <CardIcon size={20} />
          </div>

          {/* Card Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate text-sm">
              {card.name}
            </h3>
            <p className="text-text-secondary text-xs mt-1 line-clamp-2">
              {card.description}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <button
          onClick={handleStatusToggle}
          className={`
            flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
            ${statusColor} hover:scale-110
          `}
          title={`Status: ${card.status}`}
        >
          <StatusIcon size={14} />
        </button>
      </div>

      {/* Progress Bar */}
      {card.status === CardStatus.IN_PROGRESS && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Progress</span>
            <span className="text-xs text-text-secondary">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          {/* Priority Indicator */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${priorityColor.replace('text-', 'bg-')}`} />
            <span className={`capitalize ${priorityColor}`}>
              {card.priority}
            </span>
          </div>

          {/* Agent Assignment */}
          {card.agentId && (
            <div className="flex items-center space-x-1 text-text-muted">
              <User size={12} />
              <span>Agent</span>
            </div>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              {card.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-dark-700 text-text-muted rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {card.tags.length > 2 && (
                <span className="text-text-muted">+{card.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center space-x-2 text-text-muted">
          <span>
            {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
          </span>
          
          {showActions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle more actions menu
              }}
              className="p-1 hover:bg-surface-light rounded transition-colors duration-200"
            >
              <MoreHorizontal size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Estimated Completion */}
      {card.estimatedCompletion && card.status !== CardStatus.COMPLETED && (
        <div className="mt-2 pt-2 border-t border-dark-700">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Est. completion:</span>
            <span>
              {formatDistanceToNow(new Date(card.estimatedCompletion), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}

      {/* Demo Mode Indicator */}
      {card.data?.demoTask && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};
