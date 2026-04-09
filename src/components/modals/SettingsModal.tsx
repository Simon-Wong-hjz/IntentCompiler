import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createProvider } from '@/ai/connector';
import type { VerifyResult, ModelOption, AiProviderName } from '@/ai/types';
import type { PreferencesState } from '../../hooks/useStorage';
import type { PreferenceKey } from '../../storage/preferences';

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

// Styled label used across the AI config section
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5 block">
      {children}
    </span>
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
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);
  const modelComboRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const currentApiType = preferences.aiApiType || 'openai';
  const currentApiKey =
    currentApiType === 'openai'
      ? preferences.apiKey_openai
      : preferences.apiKey_anthropic;
  const currentEndpoint =
    currentApiType === 'openai'
      ? preferences.apiEndpoint_openai
      : preferences.apiEndpoint_anthropic;
  const currentModel =
    currentApiType === 'openai'
      ? preferences.model_openai
      : preferences.model_anthropic;

  // Reset verify status when API type changes (render-time pattern)
  const [prevApiType, setPrevApiType] = useState(currentApiType);
  if (prevApiType !== currentApiType) {
    setPrevApiType(currentApiType);
    setVerifyStatus('idle');
    setVerifyResult(null);
    setShowApiKey(false);
    setAvailableModels([]);
    setModelsLoading(false);
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

  // Close model dropdown on outside click
  useEffect(() => {
    if (!modelDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (modelComboRef.current && !modelComboRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modelDropdownOpen]);

  // Real API key verification + model fetching
  const verifyApiKey = useCallback(async (key: string, provider: string, endpoint: string) => {
    if (!key || key.trim() === '') {
      setVerifyStatus('idle');
      setVerifyResult(null);
      return;
    }

    setVerifyStatus('verifying');
    setVerifyResult(null);

    try {
      const aiProvider = createProvider(provider as AiProviderName);
      const result = await aiProvider.verifyKey(key, endpoint || undefined);

      setVerifyResult(result);
      setVerifyStatus(result.valid ? 'success' : 'error');

      // On success, fetch available models
      if (result.valid) {
        setModelsLoading(true);
        try {
          const models = await aiProvider.listModels(key, endpoint || undefined);
          setAvailableModels(models);
        } catch {
          setAvailableModels([]);
        } finally {
          setModelsLoading(false);
        }
      }
    } catch {
      setVerifyResult({ valid: false, error: 'Verification failed unexpectedly.' });
      setVerifyStatus('error');
    }
  }, []);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleApiKeyChange = (value: string) => {
    const key: PreferenceKey =
      currentApiType === 'openai' ? 'apiKey_openai' : 'apiKey_anthropic';
    onUpdatePreference(key, value);
    setVerifyStatus('idle');
    setVerifyResult(null);
    setAvailableModels([]);
  };

  const handleEndpointChange = (value: string) => {
    const key: PreferenceKey =
      currentApiType === 'openai' ? 'apiEndpoint_openai' : 'apiEndpoint_anthropic';
    onUpdatePreference(key, value);
  };

  const handleModelChange = (value: string) => {
    const key: PreferenceKey =
      currentApiType === 'openai' ? 'model_openai' : 'model_anthropic';
    onUpdatePreference(key, value);
  };

  const inputClassName =
    'w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-bg-surface outline-none transition-colors focus:border-accent-primary';

  // Model dropdown: include current saved model if not in fetched list
  const modelOptions = availableModels.length > 0
    ? (currentModel && !availableModels.some((m) => m.id === currentModel)
        ? [{ id: currentModel, name: currentModel }, ...availableModels]
        : availableModels)
    : [];
  const modelsReady = modelOptions.length > 0;

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
          {/* ── Output Configuration Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t('settings.outputConfiguration', '输出配置')}
            </span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          {/* ── Output Configuration Section ── */}
          <div>
            {/* Default Output Language */}
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {t('settings.defaultOutputLanguage', '默认输出语言')}
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
            <p className="text-xs text-ink-muted">
              {t(
                'settings.aiNetworkNote',
                '请求将从您的浏览器本地发送，请确保您的当前网络可以访问所设置的 API 端点。'
              )}
            </p>

            {/* AI API Type */}
            <div>
              <SectionLabel>
                {t('settings.aiApiType', 'API 类型')}
              </SectionLabel>
              <PillSelector
                options={[
                  { value: 'openai', label: 'OpenAI' },
                  // TODO: re-enable Anthropic after fixing browser request format
                  // { value: 'anthropic', label: 'Anthropic' },
                ]}
                value={currentApiType}
                onChange={(v) => onUpdatePreference('aiApiType', v)}
              />
              <p className="text-xs text-ink-muted mt-1.5">
                {t('settings.aiApiTypeHint', '选择 API 兼容格式，支持任意兼容端点')}
              </p>
            </div>

            {/* API Endpoint */}
            <div>
              <SectionLabel>
                {t('settings.apiEndpoint', 'API 端点')}
              </SectionLabel>
              <input
                type="url"
                value={currentEndpoint}
                onChange={(e) => handleEndpointChange(e.target.value)}
                placeholder={
                  currentApiType === 'openai'
                    ? 'https://api.openai.com/v1'
                    : 'https://api.anthropic.com'
                }
                className={inputClassName}
              />
              <p className="text-xs text-ink-muted mt-1.5">
                {t('settings.apiEndpointHint', '可填写第三方兼容端点地址')}
              </p>
            </div>

            {/* API Key (moved before Model) */}
            <div>
              <SectionLabel>
                {t('settings.apiKey', 'API 密钥')}
              </SectionLabel>
              <div className="flex gap-2">
                <input
                  ref={apiKeyInputRef}
                  type={showApiKey ? 'text' : 'password'}
                  value={currentApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder={currentApiType === 'openai' ? 'sk-...' : 'sk-ant-...'}
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
                <button
                  onClick={() => verifyApiKey(currentApiKey, currentApiType, currentEndpoint)}
                  disabled={!currentApiKey || currentApiKey.trim() === '' || verifyStatus === 'verifying'}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    !currentApiKey || currentApiKey.trim() === '' || verifyStatus === 'verifying'
                      ? 'border-border-default bg-bg-muted text-ink-muted cursor-not-allowed opacity-50'
                      : 'border-accent-primary bg-accent-primary text-ink-primary hover:opacity-90 cursor-pointer'
                  }`}
                >
                  {verifyStatus === 'verifying'
                    ? t('settings.verifying', '验证中...')
                    : t('settings.verify', '验证')}
                </button>
              </div>

              {/* Verification Status */}
              {verifyStatus === 'success' && verifyResult?.valid && (
                <p className="text-xs text-status-success mt-2 font-medium">
                  ✓ {t('settings.keyVerified', '密钥已验证')} — {currentApiType === 'openai' ? 'OpenAI' : 'Anthropic'}{' '}
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
                  '您的 API 密钥仅存储在浏览器本地，仅发送至您配置的 API 端点，不会发送到任何其他服务器。'
                )}
              </span>
            </div>

            {/* Model (custom combo: text input + filtered dropdown) */}
            <div ref={modelComboRef} className="relative">
              <SectionLabel>
                {t('settings.model', '模型')}
              </SectionLabel>
              {modelsLoading ? (
                <div className={`${inputClassName} opacity-50 animate-pulse`}>
                  {t('settings.loadingModels', '加载模型列表...')}
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentModel}
                      onChange={(e) => {
                        handleModelChange(e.target.value);
                        setModelDropdownOpen(true);
                      }}
                      onFocus={() => modelsReady && setModelDropdownOpen(true)}
                      placeholder={currentApiType === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514'}
                      className={inputClassName}
                    />
                    {modelsReady && (
                      <button
                        type="button"
                        onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary transition-colors p-1"
                        aria-label="Toggle model list"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`}>
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {modelDropdownOpen && modelsReady && (() => {
                    const query = currentModel.toLowerCase();
                    const filtered = modelOptions.filter(
                      (m) => m.id.toLowerCase().includes(query) || m.name.toLowerCase().includes(query)
                    );
                    if (filtered.length === 0) return null;
                    return (
                      <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border-default bg-bg-surface shadow-lg">
                        {filtered.map((m) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              onClick={() => {
                                handleModelChange(m.id);
                                setModelDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-bg-accent-light ${
                                m.id === currentModel ? 'text-accent-primary font-medium' : 'text-ink-primary'
                              }`}
                            >
                              {m.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </>
              )}
              <p className="text-xs text-ink-muted mt-1.5">
                {t('settings.modelHint', '验证密钥后从可用的模型中选择，或者直接输入模型名称')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
