import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddFieldPanel } from '@/components/editor/AddFieldPanel';
import type { FieldDefinition } from '@/registry/types';

const taskOptionalFields: FieldDefinition[] = [
  { key: 'tech_stack', inputType: 'text', scope: 'task', visibility: 'optional' },
  { key: 'target_length', inputType: 'text', scope: 'task', visibility: 'optional' },
];

const universalOptionalFields: FieldDefinition[] = [
  { key: 'goal', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
  { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
  { key: 'custom_fields', inputType: 'key-value', scope: 'universal', visibility: 'optional' },
];

describe('AddFieldPanel', () => {
  const defaultProps = {
    taskOptionalFields,
    universalOptionalFields,
    onAddField: vi.fn(),
  };

  it('renders collapsed state with "+ 添加字段" button', () => {
    render(<AddFieldPanel {...defaultProps} />);
    expect(screen.getByText('+ 添加字段')).toBeInTheDocument();
  });

  it('expands when button is clicked', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ 添加字段'));
    expect(screen.getByText('★ 推荐')).toBeInTheDocument();
    expect(screen.getByText('其他')).toBeInTheDocument();
  });

  it('shows task optional fields under Recommended section', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ 添加字段'));
    expect(screen.getByText('技术栈')).toBeInTheDocument();
    expect(screen.getByText('目标长度')).toBeInTheDocument();
  });

  it('shows universal optional fields under Others section', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ 添加字段'));
    expect(screen.getByText('目标')).toBeInTheDocument();
    expect(screen.getByText('角色')).toBeInTheDocument();
  });

  it('shows custom_fields section at the bottom', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ 添加字段'));
    // Section header + field row name both show "自定义字段"
    const matches = screen.getAllByText('自定义字段');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onAddField when a field "+" button is clicked', () => {
    const onAddField = vi.fn();
    render(<AddFieldPanel {...defaultProps} onAddField={onAddField} />);
    fireEvent.click(screen.getByText('+ 添加字段'));
    const addButtons = screen.getAllByLabelText(/添加字段/);
    fireEvent.click(addButtons[0]);
    expect(onAddField).toHaveBeenCalledWith(taskOptionalFields[0]);
  });

  it('collapses when clicking the collapse button', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ 添加字段'));
    expect(screen.getByText('★ 推荐')).toBeInTheDocument();
    fireEvent.click(screen.getByText('− 收起'));
    expect(screen.getByText('+ 添加字段')).toBeInTheDocument();
  });
});
