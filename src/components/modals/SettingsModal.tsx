import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { PreferencesState } from '../../hooks/useStorage';
import type { PreferenceKey } from '../../storage/preferences';
import { verifyApiKey, type VerifyResult } from '../../storage/apiKeyVerifier';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  preferences: PreferencesState;
  onUpdatePreference: (key: PreferenceKey, value: string) => Promise<void>;
}

type VerifyStatus = 'idle' | 'verifying' | 'success' | 'error';

// Pill selector — defined outside the component to avoid re-creation on render
function PillSelector({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            value === opt.value
              ? 'bg-ink-primary text-accent-primary border-accent-primary'
              : 'bg-bg-muted text-ink-muted border-border-default hover:bg-bg-accent-light'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsModal({
  open,
  onClose,
  preferences,
  onUpdatePreference,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('idle');
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const currentProvider = preferences.aiProvider || 'openai';
  const currentApiKey =
    currentProvider === 'openai'
      ? preferences.apiKey_openai
      : preferences.apiKey_anthropic;

  // Reset verify status when provider changes (render-time pattern)
  const [prevProvider, setPrevProvider] = useState(currentProvider);
  if (prevProvider !== currentProvider) {
    setPrevProvider(currentProvider);
    setVerifyStatus('idle');
    setVerifyResult(null);
    setShowApiKey(false);
  }

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

  const handleApiKeyChange = (value: string) => {
    const key: PreferenceKey =
      currentProvider === 'openai' ? 'apiKey_openai' : 'apiKey_anthropic';
    onUpdatePreference(key, value);
    setVerifyStatus('idle');
    setVerifyResult(null);
  };

  const handleVerifyKey = async () => {
    if (!currentApiKey || currentApiKey.trim() === '') return;
    setVerifyStatus('verifying');
    const result = await verifyApiKey(currentProvider, currentApiKey);
    setVerifyStatus(result.success ? 'success' : 'error');
    setVerifyResult(result);
  };

  const handleApiKeyBlur = () => {
    if (currentApiKey && currentApiKey.trim() !== '') {
      handleVerifyKey();
    }
  };

  const handleApiKeyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerifyKey();
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div className="bg-bg-surface rounded-xl shadow-xl w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-bold text-ink-primary">
            {t('settings.title', '设置')}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary text-xl leading-none p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* ── Output Defaults Section ── */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-4">
              {t('settings.outputDefaults', '输出默认值')}
            </h3>

            {/* Default Output Language */}
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {t('settings.defaultOutputLanguage', '默认输出语言')}
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-bg-muted text-ink-muted text-[10px] cursor-help">
                  ?
                </span>
              </div>
              <PillSelector
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'zh', label: '中文' },
                ]}
                value={preferences.defaultOutputLanguage || 'zh'}
                onChange={(v) => onUpdatePreference('defaultOutputLanguage', v)}
              />
              <p className="text-xs text-ink-muted mt-1.5">
                {t('settings.canBeOverridden', '可在每次使用时覆盖')}
              </p>
            </div>

            {/* Default Output Format */}
            <div className="mb-2">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {t('settings.defaultOutputFormat', '默认输出格式')}
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-bg-muted text-ink-muted text-[10px] cursor-help">
                  ?
                </span>
              </div>
              <PillSelector
                options={[
                  { value: 'markdown', label: 'Markdown' },
                  { value: 'json', label: 'JSON' },
                  { value: 'yaml', label: 'YAML' },
                  { value: 'xml', label: 'XML' },
                ]}
                value={preferences.defaultOutputFormat || 'markdown'}
                onChange={(v) => onUpdatePreference('defaultOutputFormat', v)}
              />
              <p className="text-xs text-ink-muted mt-1.5">
                {t('settings.canBeOverridden', '可在每次使用时覆盖')}
              </p>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t('settings.aiConfiguration', 'AI 配置')}
            </span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          {/* ── AI Configuration Section ── */}
          <div className="space-y-4">
            {/* AI Provider */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5 block">
                {t('settings.aiProvider', 'AI 提供商')}
              </span>
              <PillSelector
                options={[
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'anthropic', label: 'Anthropic' },
                ]}
                value={currentProvider}
                onChange={(v) => onUpdatePreference('aiProvider', v)}
              />
            </div>

            {/* API Key */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5 block">
                {t('settings.apiKey', 'API 密钥')}
              </span>
              <div className="flex gap-2">
                <input
                  ref={apiKeyInputRef}
                  type={showApiKey ? 'text' : 'password'}
                  value={currentApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  onBlur={handleApiKeyBlur}
                  onKeyDown={handleApiKeyKeyDown}
                  placeholder={`${currentProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}`}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-bg-surface transition-colors ${
                    verifyStatus === 'error'
                      ? 'border-status-danger'
                      : 'border-border-default focus:border-accent-primary'
                  } outline-none`}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-border-default bg-bg-muted text-ink-secondary hover:bg-bg-accent-light transition-colors"
                >
                  {showApiKey
                    ? t('settings.hide', '隐藏')
                    : t('settings.show', '显示')}
                </button>
              </div>

              {/* Verification Status */}
              {verifyStatus === 'verifying' && (
                <p className="text-xs text-ink-muted mt-2 animate-pulse">
                  {t('settings.verifying', '验证中...')}
                </p>
              )}
              {verifyStatus === 'success' && verifyResult && (
                <p className="text-xs text-status-success mt-2 font-medium">
                  ✓ {t('settings.keyVerified', '密钥已验证')} — {verifyResult.provider}{' '}
                  {verifyResult.model}
                </p>
              )}
              {verifyStatus === 'error' && verifyResult && (
                <p className="text-xs text-status-danger mt-2 font-medium">
                  ✗ {verifyResult.error || t('settings.invalidKey', '无效的 API 密钥，请检查后重试。')}
                </p>
              )}
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2 text-xs text-ink-muted">
              <span className="mt-0.5">🔒</span>
              <span>
                {t(
                  'settings.securityNote',
                  '您的 API 密钥仅存储在浏览器本地，仅发送至 AI 提供商的 API，不会发送到任何其他服务器。'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
