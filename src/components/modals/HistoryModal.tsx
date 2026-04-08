import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { HistoryRecord } from '../../storage/db';
import { relativeTime } from '../../utils/relativeTime';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  records: HistoryRecord[];
  count: number;
  onLoadRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: number) => Promise<void>;
  onClearAll: () => Promise<void>;
  hasEditorContent: boolean;
  uiLanguage: string;
}

export default function HistoryModal({
  open,
  onClose,
  records,
  count,
  onLoadRecord,
  onDeleteRecord,
  onClearAll,
  hasEditorContent,
  uiLanguage,
}: HistoryModalProps) {
  const { t } = useTranslation();
  const [confirmLoadId, setConfirmLoadId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Reset confirmations when modal closes (render-time pattern)
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen && !open) {
    setPrevOpen(false);
    setConfirmLoadId(null);
    setConfirmDeleteId(null);
    setConfirmClearAll(false);
  } else if (!prevOpen && open) {
    setPrevOpen(true);
  }

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmLoadId !== null || confirmDeleteId !== null || confirmClearAll) {
          setConfirmLoadId(null);
          setConfirmDeleteId(null);
          setConfirmClearAll(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose, confirmLoadId, confirmDeleteId, confirmClearAll]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleRowClick = (record: HistoryRecord) => {
    if (hasEditorContent) {
      setConfirmLoadId(record.id!);
    } else {
      onLoadRecord(record);
      onClose();
    }
  };

  const handleConfirmLoad = (record: HistoryRecord) => {
    setConfirmLoadId(null);
    onLoadRecord(record);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await onDeleteRecord(id);
    setConfirmDeleteId(null);
  };

  const handleClearAll = async () => {
    await onClearAll();
    setConfirmClearAll(false);
  };

  const locale = uiLanguage === 'zh' ? 'zh' : 'en';

  // Task type badge label map
  const taskTypeLabels: Record<string, string> = {
    ask: locale === 'zh' ? '提问' : 'Ask',
    create: locale === 'zh' ? '创作' : 'Create',
    transform: locale === 'zh' ? '转化' : 'Transform',
    analyze: locale === 'zh' ? '分析' : 'Analyze',
    ideate: locale === 'zh' ? '构思' : 'Ideate',
    execute: locale === 'zh' ? '执行' : 'Execute',
  };

  // Format label map
  const formatLabels: Record<string, string> = {
    markdown: 'Markdown',
    json: 'JSON',
    yaml: 'YAML',
    xml: 'XML',
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div className="bg-bg-surface rounded-xl shadow-xl w-full max-w-[560px] mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-ink-primary">
            {t('history.title', '历史记录')}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary text-xl leading-none p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Record list — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {records.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-ink-muted">
              <svg
                className="w-12 h-12 mb-3 text-border-default"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">
                {t('history.empty', '暂无历史记录')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleRowClick(record)}
                  className="py-3 cursor-pointer hover:bg-bg-page transition-colors -mx-2 px-2 rounded"
                >
                  {/* Inline load confirmation */}
                  {confirmLoadId === record.id ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-ink-secondary">
                        {t(
                          'history.confirmLoad',
                          '加载此记录？当前编辑器内容将被替换。'
                        )}
                      </p>
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmLoadId(null);
                          }}
                          className="px-3 py-1 text-xs font-medium rounded-md border border-border-default text-ink-secondary hover:bg-bg-muted"
                        >
                          {t('common.cancel', '取消')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmLoad(record);
                          }}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-ink-primary text-accent-primary hover:opacity-90"
                        >
                          {t('common.load', '加载')}
                        </button>
                      </div>
                    </div>
                  ) : confirmDeleteId === record.id ? (
                    /* Inline delete confirmation */
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-status-danger font-medium">
                        {t('history.confirmDelete', '删除此记录？')}
                      </p>
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="px-3 py-1 text-xs font-medium rounded-md border border-border-default text-ink-secondary hover:bg-bg-muted"
                        >
                          {t('common.cancel', '取消')}
                        </button>
                        <button
                          onClick={(e) => handleConfirmDelete(e, record.id!)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-status-danger text-white hover:opacity-90"
                        >
                          {t('common.delete', '删除')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal record row */
                    <div className="flex items-start gap-3">
                      {/* Task type badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-ink-primary text-accent-primary flex-shrink-0 mt-0.5">
                        {taskTypeLabels[record.taskType] || record.taskType}
                      </span>

                      {/* Intent + metadata */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-primary truncate">
                          {(record.fields?.intent as string) || '(no intent)'}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {relativeTime(record.timestamp, locale)}
                          {' · '}
                          {formatLabels[record.outputFormat] || record.outputFormat}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteClick(e, record.id!)}
                        className="text-ink-disabled hover:text-status-danger transition-colors flex-shrink-0 p-1 mt-0.5"
                        aria-label="Delete record"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {records.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border-light flex-shrink-0">
            <span className="text-xs text-ink-muted">
              {count} {t('history.records', '条记录')}
            </span>
            {confirmClearAll ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="px-3 py-1 text-xs font-medium rounded-md border border-border-default text-ink-secondary hover:bg-bg-muted"
                >
                  {t('common.cancel', '取消')}
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-status-danger text-white hover:opacity-90"
                >
                  {t('history.confirmClearAll', '确认清空全部')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="text-xs font-medium text-status-danger hover:underline"
              >
                {t('history.clearAll', '清空全部')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
