import { TopBar } from '@/components/layout/TopBar';
import { TaskSelector } from '@/components/task-selector/TaskSelector';
import { EditorArea } from '@/components/editor/EditorArea';
import { PreviewArea } from '@/components/preview/PreviewArea';
import type { TaskType, FieldDefinition } from '@/registry/types';
import type { OutputFormat, Language } from '@/compiler/types';
import type { AiFillStatus } from '@/hooks/useAiFill';

interface PageLayoutProps {
  selectedType: TaskType | null;
  onSelectType: (type: TaskType) => void;
  fields: FieldDefinition[];
  fieldValues: Record<string, unknown>;
  onFieldChange: (key: string, value: unknown) => void;
  compiledOutput: string;
  hasContent: boolean;
  canCopy: boolean;
  skeletonOutput: string;
  addedFields: FieldDefinition[];
  onAddField: (field: FieldDefinition) => void;
  onRemoveField: (fieldKey: string) => void;
  outputFormat: OutputFormat;
  outputLanguage: Language;
  onFormatChange: (format: OutputFormat) => void;
  onOutputLanguageChange: (language: Language) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onAfterCopy?: () => void;
  // AI props
  aiFilledFields: Set<string>;
  aiFillStatus: AiFillStatus;
  aiFillDisabled: boolean;
  hasApiKey: boolean;
  filledCount: number;
  aiFillError: string;
  onAiFill: () => void;
  onCancelAiFill: () => void;
  onDismissError: () => void;
  allowAddFields: boolean;
  onAllowAddFieldsChange: (checked: boolean) => void;
}

export function PageLayout({
  selectedType,
  onSelectType,
  fields,
  fieldValues,
  onFieldChange,
  compiledOutput,
  hasContent,
  canCopy,
  skeletonOutput,
  addedFields,
  onAddField,
  onRemoveField,
  outputFormat,
  outputLanguage,
  onFormatChange,
  onOutputLanguageChange,
  onOpenHistory,
  onOpenSettings,
  onAfterCopy,
  aiFilledFields,
  aiFillStatus,
  aiFillDisabled,
  hasApiKey,
  filledCount,
  aiFillError,
  onAiFill,
  onCancelAiFill,
  onDismissError,
  allowAddFields,
  onAllowAddFieldsChange,
}: PageLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-bg-page" style={{ minWidth: '1024px' }}>
      <TopBar onOpenHistory={onOpenHistory} onOpenSettings={onOpenSettings} />

      {/* Spacer for fixed top bar */}
      <div className="flex-shrink-0 h-12" />

      <TaskSelector selectedType={selectedType} onSelect={onSelectType} />

      {/* Editor + Preview split */}
      <div className="flex-1 flex min-h-0">
        {/* Editor (left 50%) */}
        <div className="w-1/2 overflow-y-auto">
          <EditorArea
            fields={fields}
            fieldValues={fieldValues}
            onFieldChange={onFieldChange}
            selectedType={selectedType}
            addedFields={addedFields}
            onAddField={onAddField}
            onRemoveField={onRemoveField}
            aiFilledFields={aiFilledFields}
            aiFillStatus={aiFillStatus}
            aiFillDisabled={aiFillDisabled}
            hasApiKey={hasApiKey}
            filledCount={filledCount}
            aiFillError={aiFillError}
            onAiFill={onAiFill}
            onCancelAiFill={onCancelAiFill}
            onDismissError={onDismissError}
            onOpenSettings={onOpenSettings}
            allowAddFields={allowAddFields}
            onAllowAddFieldsChange={onAllowAddFieldsChange}
          />
        </div>

        {/* Vertical divider */}
        <div className="w-[1.5px] bg-border-light flex-shrink-0" />

        {/* Preview (right 50%) */}
        <div className="w-1/2 overflow-hidden flex flex-col">
          <PreviewArea
            compiledOutput={compiledOutput}
            hasContent={hasContent}
            canCopy={canCopy}
            skeletonOutput={skeletonOutput}
            outputFormat={outputFormat}
            outputLanguage={outputLanguage}
            onFormatChange={onFormatChange}
            onOutputLanguageChange={onOutputLanguageChange}
            onAfterCopy={onAfterCopy}
          />
        </div>
      </div>
    </div>
  );
}
