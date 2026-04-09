import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnouncementModal from '../../src/components/modals/AnnouncementModal';
import type { Announcement } from '../../src/data/announcements';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | Record<string, unknown>) => {
      if (typeof fallback === 'string') return fallback;
      if (key === 'announcement.version') return `v${(fallback as Record<string, unknown>)?.version ?? ''}`;
      return key;
    },
    i18n: { language: 'zh' },
  }),
}));

const mockAnnouncements: Announcement[] = [
  {
    version: '0.6.0',
    date: '2026-04-09',
    title: { zh: '帮助系统上线', en: 'Help system launched' },
    content: { zh: '<p>新增帮助系统</p>', en: '<p>Added help system</p>' },
  },
  {
    version: '0.5.0',
    date: '2026-04-01',
    title: { zh: 'AI 填充', en: 'AI Fill' },
    content: { zh: '<p>AI 功能</p>', en: '<p>AI feature</p>' },
  },
];

describe('AnnouncementModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <AnnouncementModal open={false} onClose={vi.fn()} announcements={mockAnnouncements} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders announcements when open', () => {
    render(
      <AnnouncementModal open={true} onClose={vi.fn()} announcements={mockAnnouncements} />
    );
    expect(screen.getByText('帮助系统上线')).toBeInTheDocument();
    expect(screen.getByText('AI 填充')).toBeInTheDocument();
  });

  it('renders content HTML', () => {
    render(
      <AnnouncementModal open={true} onClose={vi.fn()} announcements={mockAnnouncements} />
    );
    expect(screen.getByText('新增帮助系统')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(
      <AnnouncementModal open={true} onClose={onClose} announcements={mockAnnouncements} />
    );
    await userEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn();
    render(
      <AnnouncementModal open={true} onClose={onClose} announcements={mockAnnouncements} />
    );
    await userEvent.click(screen.getByTestId('announcement-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
