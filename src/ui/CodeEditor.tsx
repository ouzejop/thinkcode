import React, { useEffect, useRef, useState } from 'react';
import { IconPlay } from './Icons';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language?: string;
  fileName?: string;
  readOnly?: boolean;
  highlightLine?: number; // Faulty line at reveal (1-indexed)
  onRun?: () => void;
  runDisabled?: boolean;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  fileName = 'solution.js',
  readOnly = false,
  highlightLine,
  onRun,
  runDisabled = false,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const lines = value.split('\n');
  const lineCount = Math.max(1, lines.length);

  // Sync scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateCursorPos = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = value.substring(0, pos);
    const line = textBefore.split('\n').length;
    const col = pos - textBefore.lastIndexOf('\n');
    setCursorPos({ line, col });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!runDisabled && onRun) {
        onRun();
      }
      return;
    }

    if (readOnly) return;

    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      if (e.shiftKey) {
        // Outdent if 2 leading spaces exist
        const before = value.substring(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        if (value.substring(lineStart, lineStart + 2) === '  ') {
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + 2);
          onChange(newValue);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = Math.max(
                lineStart,
                start - 2,
              );
            }
          }, 0);
        }
      } else {
        // Indent with 2 spaces
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    }
  };

  useEffect(() => {
    updateCursorPos();
  }, [value]);

  return (
    <div
      className={`zone-work flex flex-col rounded-[var(--radius)] border border-control bg-surface shadow-sm overflow-hidden ${className}`}
    >
      {/* File Tab and Header */}
      <div className="flex items-center justify-between border-b border-soft bg-sunken px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-t bg-surface px-3 py-1 font-mono font-bold text-ink border-t-2 border-primary">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
            {fileName}
          </span>
          {readOnly && (
            <span className="rounded bg-sunken border border-soft px-1.5 py-0.5 font-semibold text-soft">
              Read-only
            </span>
          )}
        </div>

        {onRun && (
          <button
            type="button"
            onClick={onRun}
            disabled={runDisabled}
            className="btn btn-primary min-h-[30px] px-3 py-1 text-xs"
            title="Run tests (Ctrl+Enter)"
          >
            <IconPlay size={12} className="flex-none" />
            <span>Run Code</span>
          </button>
        )}
      </div>

      {/* Editor Body: Gutter + Textarea */}
      <div className="relative flex flex-1 min-h-[220px] font-mono text-sm leading-6">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-12 flex-none select-none overflow-hidden bg-sunken/60 py-3 text-right text-soft border-r border-soft font-mono"
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNum = i + 1;
            const isFaulty = highlightLine === lineNum;
            const isCurrent = cursorPos.line === lineNum;
            return (
              <div
                key={lineNum}
                className={`pr-2.5 transition-colors ${
                  isFaulty
                    ? 'bg-xp text-on-xp font-bold'
                    : isCurrent
                    ? 'text-primary font-bold bg-primary/10'
                    : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursorPos}
            onClick={updateCursorPos}
            onScroll={handleScroll}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label={`Code editor for ${fileName}`}
            className="w-full h-full resize-none bg-transparent p-3 font-mono text-ink outline-none leading-6 whitespace-pre overflow-auto tab-size-2"
            style={{ tabSize: 2 }}
          />

          {/* Yellow highlight bar on reveal faulty line */}
          {highlightLine && highlightLine <= lineCount && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-0 border-l-4 border-xp bg-xp/20"
              style={{
                top: `${(highlightLine - 1) * 24 + 12}px`,
                height: '24px',
              }}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-soft bg-sunken px-3 py-1 text-xs text-soft font-mono">
        <div className="flex items-center gap-3">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="uppercase">{language}</span>
          <span className="hidden sm:inline">Ctrl+Enter to run</span>
        </div>
      </div>
    </div>
  );
};
