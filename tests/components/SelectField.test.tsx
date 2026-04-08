import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComboField } from '@/components/editor/fields/ComboField';

/**
 * These tests cover the combo field (which now replaces the former select field).
 * ComboField renders pill buttons for predefined options plus a custom text input.
 */
describe('ComboField (merged select + combo)', () => {
  const defaultProps = {
    field: {
      key: 'question_type',
      inputType: 'combo' as const,
      scope: 'task' as const,
      visibility: 'default' as const,
      options: ['factual', 'conceptual', 'how-to', 'opinion'],
    },
    value: '',
    onChange: vi.fn(),
  };

  it('renders all options as pill buttons', () => {
    render(<ComboField {...defaultProps} />);
    expect(screen.getByText('factual')).toBeInTheDocument();
    expect(screen.getByText('conceptual')).toBeInTheDocument();
    expect(screen.getByText('how-to')).toBeInTheDocument();
    expect(screen.getByText('opinion')).toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(<ComboField {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('conceptual'));
    expect(onChange).toHaveBeenCalledWith('conceptual');
  });

  it('highlights the selected option', () => {
    render(<ComboField {...defaultProps} value="how-to" />);
    const selected = screen.getByText('how-to');
    expect(selected.closest('button')).toHaveClass('font-semibold');
  });

  it('deselects when clicking the already-selected option', () => {
    const onChange = vi.fn();
    render(<ComboField {...defaultProps} value="factual" onChange={onChange} />);
    fireEvent.click(screen.getByText('factual'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders the field label', () => {
    render(<ComboField {...defaultProps} />);
    expect(screen.getByText('问题类型')).toBeInTheDocument();
  });

  it('renders custom text input', () => {
    render(<ComboField {...defaultProps} />);
    expect(screen.getByPlaceholderText('或自定义输入...')).toBeInTheDocument();
  });

  it('calls onChange when custom text is entered', () => {
    const onChange = vi.fn();
    render(<ComboField {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('或自定义输入...'), {
      target: { value: 'custom type' },
    });
    expect(onChange).toHaveBeenCalledWith('custom type');
  });
});
