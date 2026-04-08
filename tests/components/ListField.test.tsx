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

  it('renders the add item row', () => {
    render(<ListField {...defaultProps} />);
    expect(screen.getByPlaceholderText('添加项...')).toBeInTheDocument();
  });

  it('adds an item when typing in the add row and pressing Enter', () => {
    const onChange = vi.fn();
    render(<ListField {...defaultProps} onChange={onChange} />);
    const addInput = screen.getByPlaceholderText('添加项...');
    fireEvent.change(addInput, { target: { value: 'new item' } });
    fireEvent.keyDown(addInput, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['item one', 'item two', 'new item']);
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
