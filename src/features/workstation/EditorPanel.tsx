import React from 'react';
import type { Exercise } from '../../api/types';
import { CodeEditor } from '../../ui';

interface EditorPanelProps {
  exercise: Exercise;
  code: string;
  onChangeCode: (val: string) => void;
  predictChoice: string;
  onChangePredictChoice: (val: string) => void;
  highlightLine?: number;
  onRun: () => void;
  isRunning: boolean;
  className?: string;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  exercise,
  code,
  onChangeCode,
  predictChoice,
  onChangePredictChoice,
  highlightLine,
  onRun,
  isRunning,
  className = '',
}) => {
  const isPredict = exercise.kind === 'predict';

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Code Editor */}
      <CodeEditor
        value={code}
        onChange={onChangeCode}
        readOnly={isPredict}
        highlightLine={highlightLine}
        fileName={isPredict ? 'inspect_code.js' : 'solution.js'}
        language="javascript"
        onRun={onRun}
        runDisabled={isRunning}
        className="flex-1"
      />

      {/* For PREDICT exercises: Interactive choice selection */}
      {isPredict && exercise.predictOptions && (
        <div className="rounded-[var(--radius)] border border-control bg-surface p-4 shadow-sm">
          <span className="t-label block mb-2 text-xs">
            Predict the Return Value:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {exercise.predictOptions.map((opt) => {
              const cleanOpt = opt.replace(/^"|"$/g, '');
              const isSelected = predictChoice === cleanOpt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangePredictChoice(cleanOpt)}
                  className={`p-2.5 rounded font-mono text-xs font-bold text-center border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-on-primary shadow-sm'
                      : 'border-soft bg-sunken hover:border-control text-ink'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
