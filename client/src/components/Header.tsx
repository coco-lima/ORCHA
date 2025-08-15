import React from 'react';
import { Play, Pause, RotateCcw, Activity, CheckCircle, Clock } from 'lucide-react';
import { HeaderProps } from '../types/index.ts';

export const Header: React.FC<HeaderProps> = ({
  demoMode = false,
  onStartDemo,
  stats = {
    totalCards: 0,
    activeCards: 0,
    completedToday: 0
  }
}) => {
  return (
    <div className="flex flex-col">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="demo-banner px-6 py-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="font-medium">Demo Mode</span>
              </div>
              <span className="text-blue-200/80">
                This simulates a real AI execution plan. Enable Backend Functions in your dashboard for real integration.
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onStartDemo}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors duration-200"
              >
                <Play size={12} />
                <span>Start Demo</span>
              </button>
              
              <button className="flex items-center space-x-1 px-3 py-1 bg-blue-800/50 hover:bg-blue-700/50 text-blue-200 rounded-lg text-xs font-medium transition-colors duration-200">
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="px-6 py-4 border-b border-dark-700">
        <div className="flex items-center justify-between">
          {/* Title and Stats */}
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                AI Agent Dashboard
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Monitor and manage your AI agents and tasks
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-surface-light rounded-lg flex items-center justify-center">
                  <Activity size={16} className="text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {stats.totalCards}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Total Tasks
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-surface-light rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {stats.activeCards}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Active
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-surface-light rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {stats.completedToday}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Completed Today
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-surface-light rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-text-secondary">Connected</span>
            </div>

            {/* Settings Button */}
            <button className="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="m21 12-6-6-6 6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
