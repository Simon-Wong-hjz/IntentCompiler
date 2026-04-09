import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Announcement } from '@/data/announcements';

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

export default function AnnouncementModal({
  open,
  onClose,
  announcements,
}: AnnouncementModalProps) {
  const { t, i18n } = useTranslation();
  const backdropRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language === 'en' ? 'en' : 'zh';

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      data-testid="announcement-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div className="bg-bg-surface rounded-xl shadow-xl w-full max-w-[600px] mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-ink-primary">
            {t('announcement.title', '更新公告')}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary text-xl leading-none p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          {announcements.length === 0 ? (
            <p className="text-ink-muted text-sm text-center py-8">
              {t('announcement.noAnnouncements', '暂无公告')}
            </p>
          ) : (
            <div className="space-y-6">
              {announcements.map((item, index) => (
                <div
                  key={item.version}
                  className={`${index === 0 ? 'border-l-2 border-accent-primary pl-4' : 'pl-4'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-ink-primary text-accent-primary">
                      {t('announcement.version', { version: item.version })}
                    </span>
                    <span className="text-xs text-ink-muted">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-ink-primary mb-2">
                    {item.title[lang]}
                  </h3>
                  {/* Safe: HTML is pre-rendered from project-owned .md files at build time */}
                  <div
                    className="text-sm text-ink-secondary leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:text-sm [&_p]:mb-2"
                    dangerouslySetInnerHTML={{ __html: item.content[lang] }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
