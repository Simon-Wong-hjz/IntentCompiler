import { useTranslation } from 'react-i18next';

interface TutorialTooltipProps {
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  current: number;
  total: number;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  targetRect: DOMRect | null;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
}

const TOOLTIP_GAP = 12;
const VIEWPORT_PADDING = 12;
const TOOLTIP_WIDTH = 320;

function computePosition(
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center',
  targetRect: DOMRect | null,
): React.CSSProperties {
  if (placement === 'center' || !targetRect) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const maxLeft = window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_PADDING;

  // Horizontal center aligned with target, clamped to viewport
  const centeredLeft = Math.max(
    VIEWPORT_PADDING,
    Math.min(targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2, maxLeft),
  );

  switch (placement) {
    case 'bottom':
      return { top: targetRect.bottom + TOOLTIP_GAP, left: centeredLeft };
    case 'top':
      return {
        bottom: window.innerHeight - targetRect.top + TOOLTIP_GAP,
        left: centeredLeft,
      };
    case 'right':
      return {
        top: targetRect.top + targetRect.height / 2 - 40,
        left: Math.min(targetRect.right + TOOLTIP_GAP, maxLeft),
      };
    case 'left':
      return {
        top: targetRect.top + targetRect.height / 2 - 40,
        right: Math.max(
          VIEWPORT_PADDING,
          window.innerWidth - targetRect.left + TOOLTIP_GAP,
        ),
      };
  }
}

export function TutorialTooltip({
  title,
  description,
  current,
  total,
  placement,
  targetRect,
  onPrev,
  onNext,
  onSkip,
}: TutorialTooltipProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'zh';
  const isFirst = current === 0;
  const isLast = current === total - 1;
  const style: React.CSSProperties = {
    ...computePosition(placement, targetRect),
    width: TOOLTIP_WIDTH,
  };

  return (
    <div
      className="fixed z-[61] bg-bg-surface rounded-xl shadow-xl border border-border-default p-4 transition-all duration-300"
      style={style}
      data-testid="tutorial-tooltip"
    >
      {/* Title + progress */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-ink-primary">{title[lang]}</h3>
        <span className="text-xs text-ink-muted">
          {t('tutorial.step', { current: current + 1, total })}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-ink-secondary leading-relaxed mb-4">
        {description[lang]}
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-xs text-ink-muted hover:text-ink-secondary transition-colors"
        >
          {t('tutorial.skip', '跳过教程')}
        </button>
        <div className="flex gap-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border-default text-ink-secondary hover:bg-bg-muted transition-colors"
            >
              {t('tutorial.prev', '上一步')}
            </button>
          )}
          <button
            onClick={onNext}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-ink-primary text-accent-primary hover:opacity-90 transition-colors"
          >
            {isLast ? t('tutorial.finish', '完成') : t('tutorial.next', '下一步')}
          </button>
        </div>
      </div>
    </div>
  );
}
