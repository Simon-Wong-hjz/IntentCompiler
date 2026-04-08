import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectField } from '@/components/editor/fields/SelectField';

describe('SelectField', () => {
  const defaultProps = {
    field: {
      key: 'question_type',
      inputType: 'select' as const,
      scope: 'task' as const,
      visibility: 'default' as const,
      options: ['factual', 'conceptual', 'how-to', 'opinion'],
    },
    value: '',
    onChange: vi.fn(),
  };

  it('renders all options as pill buttons', () => {
    render(<SelectField {...defaultProps} />);
    expect(screen.getByText('factual')).toBeInTheDocument();
    expect(screen.getByText('conceptual')).toBeInTheDocument();
    expect(screen.getByText('how-to')).toBeInTheDocument();
    expect(screen.getByText('opinion')).toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(<SelectField {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('conceptual'));
    expect(onChange).toHaveBeenCalledWith('conceptual');
  });

  it('highlights the selected option', () => {
    render(<SelectField {...defaultProps} value="how-to" />);
    const selected = screen.getByText('how-to');
    expect(selected.closest('button')).toHaveClass('font-semibold');
  });

  it('deselects when clicking the already-selected option', () => {
    const onChange = vi.fn();
    render(<SelectField {...defaultProps} value="factual" onChange={onChange} />);
    fireEvent.click(screen.getByText('factual'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders the field label', () => {
    render(<SelectField {...defaultProps} />);
    expect(screen.getByText('问题类型')).toBeInTheDocument();
  });
});
