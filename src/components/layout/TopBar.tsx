import { useTranslation } from 'react-i18next';
import { Megaphone, GraduationCap } from 'lucide-react';
import { setUILanguage } from '@/i18n/config';
import type { Language } from '@/compiler/types';

function UILanguageToggle() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language as Language;

  return (
    <div className="flex items-center rounded-sm border border-border-default text-sm">
      <button
        type="button"
        className={`px-2 py-0.5 font-medium rounded-l-sm transition-colors ${
          currentLang === 'zh'
            ? 'bg-ink-primary text-accent-primary'
            : 'bg-transparent text-ink-muted hover:bg-bg-muted hover:text-ink-secondary'
        }`}
        onClick={() => setUILanguage('zh')}
      >
        {t('common.zh')}
      </button>
      <button
        type="button"
        className={`px-2 py-0.5 font-medium rounded-r-sm transition-colors ${
          currentLang === 'en'
            ? 'bg-ink-primary text-accent-primary'
            : 'bg-transparent text-ink-muted hover:bg-bg-muted hover:text-ink-secondary'
        }`}
        onClick={() => setUILanguage('en')}
      >
        {t('common.en')}
      </button>
    </div>
  );
}

interface TopBarProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenAnnouncement: () => void;
  onStartTutorial: () => void;
}

export function TopBar({ onOpenHistory, onOpenSettings, onOpenAnnouncement, onStartTutorial }: TopBarProps) {
  const { t } = useTranslation();

  const iconButtonClass =
    'text-ink-secondary hover:text-ink-primary transition-colors p-1 rounded-md hover:bg-bg-muted';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border-default bg-bg-surface px-5 h-12">
      <h1
        className="text-xl font-extrabold text-ink-primary"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {t('topBar.appName')}
      </h1>

      <nav className="flex items-center gap-4">
        <button
          onClick={onOpenAnnouncement}
          className={iconButtonClass}
          title={t('topBar.announcement', '公告')}
          data-tutorial="announcement-button"
        >
          <Megaphone size={18} />
        </button>
        <button
          onClick={onStartTutorial}
          className={iconButtonClass}
          title={t('topBar.tutorial', '教程')}
          data-tutorial="tutorial-button"
        >
          <GraduationCap size={18} />
        </button>
        <button
          onClick={onOpenHistory}
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
          data-tutorial="history-button"
        >
          {t('topBar.history')}
        </button>
        <button
          onClick={onOpenSettings}
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
          data-tutorial="settings-button"
        >
          {t('topBar.settings')}
        </button>
        <UILanguageToggle />
      </nav>
    </header>
  );
}
