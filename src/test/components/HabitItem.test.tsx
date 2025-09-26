import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import HabitItem from '@/components/habit/HabitItem';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}));

describe('HabitItem', () => {
  const mockHabit = {
    id: 'test-habit-id',
    name: 'Test Habit',
    category: 'Health',
    status: 'active',
    user_id: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    archived_at: null,
    default_tracking_type: 'completion',
    description: 'Test habit description',
    ended_at: null,
  };

  const mockHandlers = {
    onEdit: vi.fn(),
    onToggleArchive: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders habit name correctly', () => {
    render(
      <HabitItem 
        habit={mockHabit}
        onEdit={mockHandlers.onEdit}
        onToggleArchive={mockHandlers.onToggleArchive}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    expect(screen.getByText('Test Habit')).toBeInTheDocument();
  });

  it('shows habit category', () => {
    render(
      <HabitItem 
        habit={mockHabit}
        onEdit={mockHandlers.onEdit}
        onToggleArchive={mockHandlers.onToggleArchive}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('shows action menu', () => {
    render(
      <HabitItem 
        habit={mockHabit}
        onEdit={mockHandlers.onEdit}
        onToggleArchive={mockHandlers.onToggleArchive}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });
});