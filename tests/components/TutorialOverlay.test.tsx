import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TutorialOverlay } from '../../src/components/tutorial/TutorialOverlay';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'tutorial.next': '下一步',
        'tutorial.prev': '上一步',
        'tutorial.skip': '跳过教程',
        'tutorial.finish': '完成',
      };
      if (key === 'tutorial.step') return `${opts?.current} / ${opts?.total}`;
      return map[key] ?? key;
    },
    i18n: { language: 'zh' },
  }),
}));

// Mock tutorial steps — only 2 steps for simpler test
vi.mock('../../src/data/tutorial-steps', () => ({
  tutorialSteps: [
    {
      targetSelector: '[data-tutorial="step-one"]',
      title: { zh: '步骤一', en: 'Step One' },
      description: { zh: '描述一', en: 'Description one' },
      placement: 'bottom',
    },
    {
      targetSelector: '[data-tutorial="step-two"]',
      title: { zh: '步骤二', en: 'Step Two' },
      description: { zh: '描述二', en: 'Description two' },
      placement: 'top',
    },
  ],
}));

describe('TutorialOverlay', () => {
  beforeEach(() => {
    // Create mock target elements in the DOM
    const el1 = document.createElement('div');
    el1.setAttribute('data-tutorial', 'step-one');
    el1.getBoundingClientRect = () => ({
      top: 100, left: 100, bottom: 140, right: 300,
      width: 200, height: 40, x: 100, y: 100, toJSON: () => {},
    });
    document.body.appendChild(el1);

    const el2 = document.createElement('div');
    el2.setAttribute('data-tutorial', 'step-two');
    el2.getBoundingClientRect = () => ({
      top: 300, left: 100, bottom: 340, right: 300,
      width: 200, height: 40, x: 100, y: 300, toJSON: () => {},
    });
    document.body.appendChild(el2);
  });

  it('renders nothing when not active', () => {
    const { container } = render(
      <TutorialOverlay active={false} onComplete={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders first step when active', () => {
    render(<TutorialOverlay active={true} onComplete={vi.fn()} />);
    expect(screen.getByText('步骤一')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('advances to next step on click', async () => {
    render(<TutorialOverlay active={true} onComplete={vi.fn()} />);
    await userEvent.click(screen.getByText('下一步'));
    expect(screen.getByText('步骤二')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('calls onComplete when finishing last step', async () => {
    const onComplete = vi.fn();
    render(<TutorialOverlay active={true} onComplete={onComplete} />);
    await userEvent.click(screen.getByText('下一步'));
    await userEvent.click(screen.getByText('完成'));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('calls onComplete when skipping', async () => {
    const onComplete = vi.fn();
    render(<TutorialOverlay active={true} onComplete={onComplete} />);
    await userEvent.click(screen.getByText('跳过教程'));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
