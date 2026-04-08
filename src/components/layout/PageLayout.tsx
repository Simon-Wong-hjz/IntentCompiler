import { TopBar } from '@/components/layout/TopBar';
import { TaskSelector } from '@/components/task-selector/TaskSelector';
import { EditorArea } from '@/components/editor/EditorArea';
import { PreviewArea } from '@/components/preview/PreviewArea';
import type { TaskType, FieldDefinition } from '@/registry/types';
import type { OutputFormat, Language } from '@/compiler/types';

interface PageLayoutProps {
  selectedType: TaskType | null;
  onSelectType: (type: TaskType) => void;
  fields: FieldDefinition[];
  fieldValues: Record<string, unknown>;
  onFieldChange: (key: string, value: unknown) => void;
  compiledOutput: string;
  hasContent: boolean;
  canCopy: boolean;
  addedFields: FieldDefinition[];
  onAddField: (field: FieldDefinition) => void;
  onRemoveField: (fieldKey: string) => void;
  outputFormat: OutputFormat;
  outputLanguage: Language;
  onFormatChange: (format: OutputFormat) => void;
  onOutputLanguageChange: (language: Language) => void;
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
  addedFields,
  onAddField,
  onRemoveField,
  outputFormat,
  outputLanguage,
  onFormatChange,
  onOutputLanguageChange,
}: PageLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-bg-page" style={{ minWidth: '1024px' }}>
      <TopBar />

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
            outputFormat={outputFormat}
            outputLanguage={outputLanguage}
            onFormatChange={onFormatChange}
            onOutputLanguageChange={onOutputLanguageChange}
          />
        </div>
      </div>
    </div>
  );
}
