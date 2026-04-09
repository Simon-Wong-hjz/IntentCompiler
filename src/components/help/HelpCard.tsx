import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HelpContent } from '@/data/help-content';

interface HelpCardProps {
  content: HelpContent;
  isOpen: boolean;
}

export function HelpCard({ content, isOpen }: HelpCardProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'zh' ? 'zh' : 'en';
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, content, lang]);

  return (
    <div
      className="overflow-hidden transition-all duration-200 ease-in-out"
      style={{ maxHeight: isOpen ? `${height}px` : '0px' }}
    >
      <div
        ref={contentRef}
        className="rounded-lg border-[1.5px] border-accent-primary bg-bg-accent-warm px-3 py-[10px] mb-1"
      >
        {/* What is this? -- always shown */}
        <p className="text-xs text-ink-primary">
          <span className="font-semibold">
            {lang === 'en' ? 'What is this?' : '\u8fd9\u662f\u4ec0\u4e48\uff1f'}
          </span>{' '}
          {content.whatIsThis[lang]}
        </p>

        {/* Suggestions -- optional */}
        {content.suggestions && (
          <p className="text-xs text-ink-secondary mt-1.5">
            <span className="font-semibold">
              {lang === 'en' ? 'Suggestions:' : '\u5efa\u8bae\uff1a'}
            </span>{' '}
            {content.suggestions[lang]}
          </p>
        )}

        {/* Example -- optional */}
        {content.example && (
          <p className="text-xs text-ink-secondary mt-1.5 italic">
            <span className="font-semibold not-italic">
              {lang === 'en' ? 'Example:' : '\u793a\u4f8b\uff1a'}
            </span>{' '}
            {content.example[lang]}
          </p>
        )}
      </div>
    </div>
  );
}
