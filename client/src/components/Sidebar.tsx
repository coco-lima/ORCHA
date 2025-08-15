import React from 'react';
import { 
  Briefcase, 
  MessageSquare, 
  Code, 
  Star, 
  Settings,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import { SidebarProps } from '../types/index.ts';

interface SidebarItem {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    icon: Briefcase,
    label: 'Agent Dashboard',
  },
  {
    id: 'messages',
    icon: MessageSquare,
    label: 'Messages',
    badge: 3
  },
  {
    id: 'code',
    icon: Code,
    label: 'Code Integration',
  },
  {
    id: 'favorites',
    icon: Star,
    label: 'Favorites',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
  },
  {
    id: 'automation',
    icon: Zap,
    label: 'Automation',
  },
  {
    id: 'activity',
    icon: Activity,
    label: 'Activity',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  activeSection,
  onSectionChange
}) => {
  return (
    <div className={`
      flex flex-col bg-surface border-r border-dark-700 transition-all duration-300 ease-in-out
      ${collapsed ? 'w-16' : 'w-64'}
      h-full relative
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="font-semibold text-text-primary">ORCHA</span>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-surface-light transition-colors duration-200 text-text-secondary hover:text-text-primary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}>
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 8l4-4v3h6v2H7v3l-4-4z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-accent/10 text-accent border border-accent/20' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                    }
                    ${collapsed ? 'justify-center' : 'justify-start'}
                    group relative
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="relative">
                    <Icon 
                      size={20} 
                      className={`
                        transition-colors duration-200
                        ${isActive ? 'text-accent' : 'text-current'}
                      `} 
                    />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  {!collapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-dark-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Indicator */}
      <div className="p-4 border-t border-dark-700">
        <div className={`
          flex items-center space-x-3 px-3 py-2 rounded-lg bg-green-900/20 border border-green-800/50
          ${collapsed ? 'justify-center' : 'justify-start'}
        `}>
          <div className="relative">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
          
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-green-400 text-sm font-medium">System Online</span>
              <span className="text-green-300/70 text-xs">All agents active</span>
            </div>
          )}
        </div>
      </div>

      {/* Version Info (only when expanded) */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="text-xs text-text-muted text-center">
            v1.0.0 • AI Orchestrator
          </div>
        </div>
      )}
    </div>
  );
};
