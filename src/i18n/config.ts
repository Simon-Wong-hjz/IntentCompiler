import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';

const STORAGE_KEY = 'intent-compiler-ui-lang';

export function detectBrowserLanguage(): 'en' | 'zh' {
  const browserLang = navigator.language?.toLowerCase() ?? '';
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

function getStoredLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || detectBrowserLanguage();
  } catch {
    return detectBrowserLanguage();
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
});

/**
 * Change UI language and persist to localStorage.
 */
export function setUILanguage(lang: 'en' | 'zh'): void {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable — silent fail
  }
}

export default i18n;
