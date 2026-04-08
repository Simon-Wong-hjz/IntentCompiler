import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListField } from '@/components/editor/fields/ListField';

describe('ListField', () => {
  const defaultProps = {
    field: {
      key: 'requirements',
      inputType: 'list' as const,
      scope: 'universal' as const,
      visibility: 'default' as const,
    },
    value: ['item one', 'item two'],
    onChange: vi.fn(),
  };

  it('renders existing items', () => {
    render(<ListField {...defaultProps} />);
    expect(screen.getByDisplayValue('item one')).toBeInTheDocument();
    expect(screen.getByDisplayValue('item two')).toBeInTheDocument();
  });

  it('renders the add button below items', () => {
    render(<ListField {...defaultProps} />);
    expect(screen.getByLabelText('add item')).toBeInTheDocument();
  });

  it('adds an empty item when add button is clicked', () => {
    const onChange = vi.fn();
    render(<ListField {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('add item'));
    expect(onChange).toHaveBeenCalledWith(['item one', 'item two', '']);
  });

  it('removes an item when delete button is clicked', () => {
    const onChange = vi.fn();
    render(<ListField {...defaultProps} onChange={onChange} />);
    const deleteButtons = screen.getAllByLabelText('delete item');
    fireEvent.click(deleteButtons[0]);
    expect(onChange).toHaveBeenCalledWith(['item two']);
  });

  it('updates an item when its text is edited', () => {
    const onChange = vi.fn();
    render(<ListField {...defaultProps} onChange={onChange} />);
    const input = screen.getByDisplayValue('item one');
    fireEvent.change(input, { target: { value: 'edited item' } });
    expect(onChange).toHaveBeenCalledWith(['edited item', 'item two']);
  });

  it('renders the field label', () => {
    render(<ListField {...defaultProps} />);
    expect(screen.getByText('需求')).toBeInTheDocument();
  });
});
