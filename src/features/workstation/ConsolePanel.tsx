import React from 'react';
import type { TestResult } from '../../api/types';
import { IconCheck, IconTerminal, IconWarning, Panel } from '../../ui';

interface ConsolePanelProps {
  logs: string[];
  results: TestResult[];
  totalTests: number;
  className?: string;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  logs,
  results,
  totalTests,
  className = '',
}) => {
  const passedCount = results.filter((r) => r.status === 'pass').length;
  const hasRun = results.length > 0;

  return (
    <Panel zone="work" className={`flex flex-col gap-2 p-3 ${className}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-soft pb-1 text-xs">
        <span className="t-label uppercase font-mono text-[11px] text-soft flex items-center gap-1.5">
          <IconTerminal size={14} className="text-primary" />
          <span>Console / Terminal</span>
        </span>
        {hasRun && (
          <span
            className={`font-mono font-bold text-xs flex items-center gap-1 ${
              passedCount === totalTests ? 'text-pass' : 'text-fail'
            }`}
          >
            {passedCount === totalTests ? (
              <>
                <IconCheck size={13} className="text-pass" />
                <span>Tous les {totalTests} tests réussis</span>
              </>
            ) : (
              <>
                <IconWarning size={13} className="text-fail" />
                <span>{passedCount} / {totalTests} tests réussis</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Logs Output */}
      <div
        role="region"
        aria-label="Console Output"
        className="flex-1 max-h-36 overflow-y-auto font-mono text-xs text-ink leading-relaxed space-y-1 select-text bg-sunken/40 p-2 rounded border border-soft"
      >
        {logs.length === 0 ? (
          <p className="text-soft italic">No output yet. Run your code to see console logs.</p>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-soft select-none">&gt;</span>
              <span className="whitespace-pre-wrap break-all">{log}</span>
            </div>
          ))
        )}

        {/* Any test failures or errors logged explicitly */}
        {results
          .filter((r) => r.status !== 'pass')
          .map((r) => (
            <div key={r.id} className="text-fail font-bold">
              [FAIL] {r.label}: {r.message || `Expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.actual)}`}
            </div>
          ))}
      </div>
    </Panel>
  );
};
