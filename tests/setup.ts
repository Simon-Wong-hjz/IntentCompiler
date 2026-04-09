import '@testing-library/jest-dom/vitest';
import i18n from '@/i18n/config';

// Tests assert Chinese (primary UI language); jsdom defaults navigator.language to 'en'
i18n.changeLanguage('zh');
