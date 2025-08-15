import React, { useState, useMemo } from 'react';
import { Card as CardComponent } from './Card';
import { Card, CardStatus, CardType, Priority, CardFilters } from '../types';
import { Search, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';

interface CardListProps {
  cards: Card[];
  loading?: boolean;
  onCardUpdate?: (cardId: string, updates: Partial<Card>) => void;
  onCardDelete?: (cardId: string) => void;
  onCardSelect?: (cardId: string) => void;
  selectedCardId?: string;
  className?: string;
}

type SortField = 'name' | 'createdAt' | 'updatedAt' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export const CardList: React.FC<CardListProps> = ({
  cards,
  loading = false,
  onCardUpdate,
  onCardDelete,
  onCardSelect,
  selectedCardId,
  className = ''
}) => {
  const [filters, setFilters] = useState<CardFilters>({
    search: '',
    status: '',
    type: '',
    priority: ''
  });
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchLower) ||
        card.description.toLowerCase().includes(searchLower) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(card => card.status === filters.status);
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(card => card.type === filters.type);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(card => card.priority === filters.priority);
    }

    // Sort cards
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date fields
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle priority sorting
      if (sortField === 'priority') {
        const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
        aValue = priorityOrder[aValue as Priority];
        bValue = priorityOrder[bValue as Priority];
      }

      // Handle status sorting
      if (sortField === 'status') {
        const statusOrder = { 
          pending: 0, 
          in_progress: 1, 
          paused: 2, 
          completed: 3, 
          failed: 4,
          cancelled: 5
        };
        aValue = statusOrder[aValue as CardStatus];
        bValue = statusOrder[bValue as CardStatus];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [cards, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      priority: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="flex items-center space-x-2 text-text-secondary">
          <div className="spinner" />
          <span>Loading cards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Search and Controls */}
      <div className="flex flex-col space-y-4 mb-6">
        {/* Search and View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search cards..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost flex items-center space-x-2 ${hasActiveFilters ? 'text-accent' : ''}`}
            >
              <Filter size={16} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-accent rounded-full" />
              )}
            </button>
          </div>

          {/* View Mode and Sort */}
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-surface-light rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="input-field text-sm"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Created</option>
                <option value="name">Name</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="btn-ghost p-2"
              >
                {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-surface-light rounded-lg p-4 border border-dark-600">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="">All Statuses</option>
                  <option value={CardStatus.PENDING}>Pending</option>
                  <option value={CardStatus.IN_PROGRESS}>In Progress</option>
                  <option value={CardStatus.COMPLETED}>Completed</option>
                  <option value={CardStatus.FAILED}>Failed</option>
                  <option value={CardStatus.PAUSED}>Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="">All Types</option>
                  <option value={CardType.TASK}>Task</option>
                  <option value={CardType.ANALYSIS}>Analysis</option>
                  <option value={CardType.INTEGRATION}>Integration</option>
                  <option value={CardType.AUTOMATION}>Automation</option>
                  <option value={CardType.REPORT}>Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="">All Priorities</option>
                  <option value={Priority.LOW}>Low</option>
                  <option value={Priority.MEDIUM}>Medium</option>
                  <option value={Priority.HIGH}>High</option>
                  <option value={Priority.URGENT}>Urgent</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="btn-secondary w-full"
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cards Grid/List */}
      <div className="flex-1 overflow-auto">
        {filteredAndSortedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">No cards found</h3>
            <p className="text-sm text-center max-w-md">
              {hasActiveFilters 
                ? "No cards match your current filters. Try adjusting your search criteria."
                : "No cards have been created yet. Cards will appear here as AI agents create new tasks."
              }
            </p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
              : 'space-y-3'
            }
          `}>
            {filteredAndSortedCards.map((card) => (
              <CardComponent
                key={card.id}
                card={card}
                onUpdate={onCardUpdate}
                onDelete={onCardDelete}
                onSelect={onCardSelect}
                isSelected={selectedCardId === card.id}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredAndSortedCards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-700 text-sm text-text-secondary">
          Showing {filteredAndSortedCards.length} of {cards.length} cards
          {hasActiveFilters && (
            <span className="ml-2 text-accent">
              (filtered)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
