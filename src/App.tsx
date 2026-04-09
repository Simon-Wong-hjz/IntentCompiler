import { useState, useCallback, useEffect, useMemo } from 'react';
import '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/layout/PageLayout';
import { getTemplate } from '@/registry/template-registry';
import { useCompiler } from '@/hooks/useCompiler';
import { usePreferences, useHistory } from '@/hooks/useStorage';
import { useAiFill } from '@/hooks/useAiFill';
import SettingsModal from '@/components/modals/SettingsModal';
import HistoryModal from '@/components/modals/HistoryModal';
import type { HistoryRecord } from '@/storage/db';
import type { TaskType, FieldDefinition } from '@/registry/types';
import type { OutputFormat, Language } from '@/compiler/types';
import type { AiProviderName } from '@/ai/types';

function App() {
  const [selectedType, setSelectedType] = useState<TaskType | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
  const [addedFields, setAddedFields] = useState<FieldDefinition[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('markdown');
  const [outputLanguage, setOutputLanguage] = useState<Language>('zh');
  const { t } = useTranslation();

  // AI state
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [allowAddFields, setAllowAddFields] = useState(false);

  // Storage hooks
  const { preferences, updatePreference, loading: prefsLoading } = usePreferences();
  const {
    records: historyRecords,
    count: historyCount,
    addRecord: addHistoryRecord,
    removeRecord: removeHistoryRecord,
    clearAll: clearHistory,
    refresh: refreshHistory,
  } = useHistory();

  // Modal open/close state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Initialize output defaults from Dexie (render-time state adjustment)
  const [prefsApplied, setPrefsApplied] = useState(false);
  if (!prefsLoading && !prefsApplied) {
    setPrefsApplied(true);
    if (preferences.defaultOutputLanguage) {
      setOutputLanguage(preferences.defaultOutputLanguage as Language);
    }
    if (preferences.defaultOutputFormat) {
      setOutputFormat(preferences.defaultOutputFormat as OutputFormat);
    }
  }

  // Migrate UI language from localStorage to Dexie (one-time side effect)
  useEffect(() => {
    if (prefsApplied && !preferences.uiLanguage) {
      const legacyLang = localStorage.getItem('intent-compiler-ui-lang');
      if (legacyLang) {
        updatePreference('uiLanguage', legacyLang);
        localStorage.removeItem('intent-compiler-ui-lang');
      }
    }
  }, [prefsApplied]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get the current template's field definitions
  const template = selectedType ? getTemplate(selectedType) : undefined;
  const fields: FieldDefinition[] = useMemo(
    () => template?.fields ?? [],
    [template],
  );

  // Build display-order fields: intent → defaults → added optionals
  // This ensures compiled output matches the editor's visual order
  const displayOrderFields: FieldDefinition[] = useMemo(() => {
    const intentField = fields.find((f) => f.key === 'intent');
    const defaultFields = fields.filter(
      (f) => f.key !== 'intent' && f.visibility === 'default',
    );
    return [
      ...(intentField ? [intentField] : []),
      ...defaultFields,
      ...addedFields,
    ];
  }, [fields, addedFields]);

  // Compile fields into preview output (using display order)
  const { compiledOutput, hasContent } = useCompiler(
    displayOrderFields,
    fieldValues,
    outputFormat,
    outputLanguage,
  );

  // Copy requires both content and a non-empty Intent
  const intentFilled = ((fieldValues['intent'] as string) ?? '').trim().length > 0;
  const canCopy = hasContent && intentFilled;

  // Derive AI provider info from preferences
  const providerName = (preferences.aiApiType || null) as AiProviderName | null;
  const hasApiKey = !!(
    providerName === 'openai'
      ? preferences.apiKey_openai
      : providerName === 'anthropic'
        ? preferences.apiKey_anthropic
        : ''
  );

  const getApiKey = useCallback((): string | null => {
    if (providerName === 'openai') return preferences.apiKey_openai || null;
    if (providerName === 'anthropic') return preferences.apiKey_anthropic || null;
    return null;
  }, [providerName, preferences.apiKey_openai, preferences.apiKey_anthropic]);

  // Derive fields for AI: current fields (excluding intent), all optional fields not yet added
  const currentFieldsForAi = useMemo(
    () => displayOrderFields.filter((f) => f.key !== 'intent'),
    [displayOrderFields],
  );
  const allOptionalFieldsForAi = useMemo(() => {
    const addedKeys = new Set(addedFields.map((f) => f.key));
    return fields.filter(
      (f) => f.visibility === 'optional' && !addedKeys.has(f.key),
    );
  }, [fields, addedFields]);

  const {
    status: aiFillStatus,
    filledCount,
    errorMessage: aiFillError,
    triggerFill,
    reset: resetAiFill,
    isDisabled: aiFillDisabled,
  } = useAiFill({
    taskType: selectedType,
    intent: (fieldValues['intent'] as string) ?? '',
    currentFields: currentFieldsForAi,
    allOptionalFields: allOptionalFieldsForAi,
    allowAddFields,
    providerName,
    getApiKey,
  });

  // Handle AI fill response: update field values, track filled fields, add optional fields
  const handleAiFill = useCallback(async () => {
    const response = await triggerFill();
    if (!response) return;

    // Update field values with AI-filled data
    setFieldValues((prev) => {
      const updated = { ...prev };
      for (const [key, value] of Object.entries(response.filledFields)) {
        updated[key] = value;
      }
      return updated;
    });

    // Track which fields were AI-filled (latest fill only)
    setAiFilledFields(new Set(Object.keys(response.filledFields)));

    // If AI added optional fields, add them to the active fields list
    if (response.addedFieldKeys && response.addedFieldKeys.length > 0) {
      setAddedFields((prev) => {
        const updated = [...prev];
        const existingKeys = new Set(updated.map((f) => f.key));
        for (const key of response.addedFieldKeys!) {
          if (!existingKeys.has(key)) {
            const fieldDef = fields.find((f) => f.key === key);
            if (fieldDef) {
              updated.push(fieldDef);
            }
          }
        }
        return updated;
      });
    }
  }, [triggerFill, fields]);

  const handleSelectType = useCallback(
    (type: TaskType) => {
      if (type === selectedType) return;

      const hasNonIntentValues = Object.entries(fieldValues).some(
        ([key, val]) => {
          if (key === 'intent') return false;
          if (typeof val === 'string') return val.trim().length > 0;
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === 'boolean') return val;
          if (typeof val === 'number') return val !== 0;
          return val != null;
        },
      );

      if (selectedType !== null && hasNonIntentValues) {
        if (
          !window.confirm(t('editor.switchTaskConfirm'))
        ) {
          return;
        }
      }

      const intentValue = (fieldValues['intent'] as string) ?? '';
      setSelectedType(type);
      setFieldValues(intentValue ? { intent: intentValue } : {});
      setAddedFields([]);
      // Clear AI state on task switch
      setAiFilledFields(new Set());
      setAllowAddFields(false);
      resetAiFill();
    },
    [selectedType, fieldValues, t, resetAiFill],
  );

  const handleFieldChange = useCallback((key: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAddField = useCallback((field: FieldDefinition) => {
    setAddedFields((prev) => [...prev, field]);
  }, []);

  const handleRemoveField = useCallback((fieldKey: string) => {
    setAddedFields((prev) => prev.filter((f) => f.key !== fieldKey));
    setFieldValues((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  }, []);

  // Save history record after successful copy
  const handleAfterCopy = useCallback(async () => {
    if (!selectedType) return;
    await addHistoryRecord({
      taskType: selectedType,
      fields: fieldValues,
      outputLanguage,
      outputFormat,
      timestamp: Date.now(),
    });
  }, [selectedType, fieldValues, outputLanguage, outputFormat, addHistoryRecord]);

  // Load a history record into the editor
  const handleLoadRecord = useCallback((record: HistoryRecord) => {
    setSelectedType(record.taskType as TaskType);
    setFieldValues(record.fields);
    setOutputLanguage(record.outputLanguage as Language);
    setOutputFormat(record.outputFormat as OutputFormat);
    setAddedFields([]);
    setAiFilledFields(new Set());
    setAllowAddFields(false);
    resetAiFill();
  }, [resetAiFill]);

  // Check if editor has content (for History modal's load confirmation)
  const hasEditorContent = useMemo(() => {
    return Object.values(fieldValues).some((v) => {
      if (typeof v === 'string') return v.trim() !== '';
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'object' && v !== null) return Object.keys(v).length > 0;
      return v !== undefined && v !== null && v !== false && v !== 0;
    });
  }, [fieldValues]);

  return (
    <>
    <PageLayout
      selectedType={selectedType}
      onSelectType={handleSelectType}
      fields={fields}
      fieldValues={fieldValues}
      onFieldChange={handleFieldChange}
      compiledOutput={compiledOutput}
      hasContent={hasContent}
      canCopy={canCopy}
      addedFields={addedFields}
      onAddField={handleAddField}
      onRemoveField={handleRemoveField}
      outputFormat={outputFormat}
      outputLanguage={outputLanguage}
      onFormatChange={setOutputFormat}
      onOutputLanguageChange={setOutputLanguage}
      onOpenHistory={() => { refreshHistory(); setHistoryOpen(true); }}
      onOpenSettings={() => setSettingsOpen(true)}
      onAfterCopy={handleAfterCopy}
      aiFilledFields={aiFilledFields}
      aiFillStatus={aiFillStatus}
      aiFillDisabled={aiFillDisabled}
      hasApiKey={hasApiKey}
      filledCount={filledCount}
      aiFillError={aiFillError}
      onAiFill={handleAiFill}
      onDismissError={resetAiFill}
      allowAddFields={allowAddFields}
      onAllowAddFieldsChange={setAllowAddFields}
    />
    <SettingsModal
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      preferences={preferences}
      onUpdatePreference={updatePreference}
    />
    <HistoryModal
      open={historyOpen}
      onClose={() => setHistoryOpen(false)}
      records={historyRecords}
      count={historyCount}
      onLoadRecord={handleLoadRecord}
      onDeleteRecord={removeHistoryRecord}
      onClearAll={clearHistory}
      hasEditorContent={hasEditorContent}
      uiLanguage={preferences.uiLanguage || 'zh'}
    />
  </>
  );
}

export default App;
