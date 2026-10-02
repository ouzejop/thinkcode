import React, { useState } from 'react';
import type { Exercise, TestResult } from '../../api/types';
import { sfx } from '../../lib/sfx';
import { useProfileStore } from '../../stores/profileStore';
import { IconBug, IconExample, IconStar, IconThink, IconTrophy, Led, type LedState, Panel } from '../../ui';
import { ExerciseLeaderboard } from './ExerciseLeaderboard';

interface MissionPanelProps {
  exercise: Exercise;
  results: TestResult[];
  revealedCount: number; // For staggered 80ms lighting
  className?: string;
  activeTab?: 'mission' | 'leaderboard';
  onTabChange?: (tab: 'mission' | 'leaderboard') => void;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  exercise,
  results,
  revealedCount,
  className = '',
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'mission' | 'leaderboard'>('mission');
  const currentTab = controlledTab ?? internalTab;

  const profile = useProfileStore();
  const userAttempt = profile.completedExercises[exercise.id];

  const handleTabSwitch = (tab: 'mission' | 'leaderboard') => {
    sfx.play('click');
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const renderDifficulty = (diff: number) => {
    const label = diff === 1 ? 'Facile' : diff === 2 ? 'Moyen' : 'Difficile';
    return (
      <div className="flex items-center gap-1.5" title={`Difficulté : ${label}`}>
        <div className="flex items-center gap-0.5">
          <IconStar size={12} filled={diff >= 1} className={diff >= 1 ? 'text-xp' : 'text-soft opacity-30'} />
          <IconStar size={12} filled={diff >= 2} className={diff >= 2 ? 'text-xp' : 'text-soft opacity-30'} />
          <IconStar size={12} filled={diff >= 3} className={diff >= 3 ? 'text-xp' : 'text-soft opacity-30'} />
        </div>
        <span className="text-xs font-semibold text-soft">{label}</span>
      </div>
    );
  };

  const renderKindBadge = (kind: Exercise['kind']) => {
    switch (kind) {
      case 'fix_bug':
      case 'fix':
        return (
          <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-bold text-primary text-[11px] uppercase flex items-center gap-1.5">
            <IconBug size={13} className="text-primary" />
            <span>Corriger le bug</span>
          </span>
        );
      case 'predict':
        return (
          <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-bold text-primary text-[11px] uppercase flex items-center gap-1.5">
            <IconThink size={13} className="text-primary" />
            <span>Prédire la sortie</span>
          </span>
        );
      case 'complete':
        return (
          <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-bold text-primary text-[11px] uppercase flex items-center gap-1.5">
            <IconExample size={13} className="text-primary" />
            <span>Compléter le code</span>
          </span>
        );
      default:
        return (
          <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-bold text-primary text-[11px] uppercase">
            Exercice
          </span>
        );
    }
  };

  return (
    <Panel zone="work" className={`flex flex-col gap-3 overflow-y-auto ${className}`}>
      {/* Top Segmented Controls: Mission vs Leaderboard */}
      <div className="flex items-center justify-between border-b border-soft pb-2 gap-2 flex-none">
        <div className="flex rounded bg-sunken p-1 border border-soft w-full">
          <button
            type="button"
            onClick={() => handleTabSwitch('mission')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs font-bold transition-all ${
              currentTab === 'mission'
                ? 'bg-surface text-ink shadow-sm border border-line'
                : 'text-soft hover:text-ink'
            }`}
          >
            <span>Mission & Tests</span>
            <span className="rounded bg-sunken px-1 text-[10px] font-mono text-soft">
              {results.filter((r) => r.status === 'pass').length}/{exercise.tests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('leaderboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs font-bold transition-all ${
              currentTab === 'leaderboard'
                ? 'bg-surface text-primary shadow-sm border border-primary/40'
                : 'text-soft hover:text-ink'
            }`}
          >
            <IconTrophy size={13} className={currentTab === 'leaderboard' ? 'text-primary' : 'text-soft'} />
            <span>Leaderboard</span>
            {userAttempt ? (
              <span className="flex items-center gap-0.5 rounded bg-pass/20 border border-pass/30 px-1 text-[10px] font-bold text-pass">
                {userAttempt.rank}
              </span>
            ) : (
              <span className="rounded bg-sunken px-1 text-[9px] font-mono text-soft">
                CPU
              </span>
            )}
          </button>
        </div>
      </div>

      {currentTab === 'leaderboard' ? (
        <ExerciseLeaderboard exercise={exercise} />
      ) : (
        <>
          {/* Breadcrumb & Kind Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-soft pb-2 text-xs">
            <nav aria-label="Breadcrumb" className="font-mono text-soft">
              <span>{exercise.concept}</span>
              <span className="mx-1.5">·</span>
              <span>JavaScript</span>
            </nav>
            {renderKindBadge(exercise.kind)}
          </div>

          {/* Title & Difficulty */}
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h1 className="text-xl font-bold text-ink leading-tight">
                {exercise.title}
              </h1>
              {renderDifficulty(exercise.difficulty)}
            </div>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-line mt-2">
              {exercise.brief}
            </p>
          </div>

          {/* Tests Section */}
          <div className="border-t border-soft pt-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="t-label text-xs uppercase text-soft font-bold">
                Test Suite ({exercise.tests.length})
              </h2>
              <span className="text-[11px] text-soft font-mono">
                {results.filter((r) => r.status === 'pass').length} / {exercise.tests.length} passed
              </span>
            </div>

            <ul className="grid gap-2" role="list">
              {exercise.tests.map((test, index) => {
                const result = results.find((r) => r.id === test.id);
                const isRevealed = revealedCount > index && result !== undefined;

                let ledState: LedState = 'off';
                let statusText = 'Not run';

                if (isRevealed && result) {
                  if (result.status === 'pass') {
                    ledState = 'pass';
                    statusText = 'Passed';
                  } else if (result.status === 'fail') {
                    ledState = 'fail';
                    statusText =
                      result.actual !== undefined
                        ? `Expected ${JSON.stringify(result.expected)}, got ${JSON.stringify(result.actual)}`
                        : 'Failed';
                  } else if (result.status === 'timeout') {
                    ledState = 'fail';
                    statusText = 'Timed out (2 s)';
                  } else {
                    ledState = 'fail';
                    statusText = result.message || 'Execution error';
                  }
                }

                return (
                  <li
                    key={test.id}
                    className="flex items-start gap-2.5 rounded bg-sunken/60 p-2 text-xs border border-soft transition-all duration-150"
                  >
                    <div className="mt-0.5">
                      <Led state={ledState} label={test.label} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-ink truncate">
                        {test.label}
                      </div>
                      <div
                        className={`mt-0.5 text-[11px] leading-tight ${
                          ledState === 'pass'
                            ? 'text-pass font-bold'
                            : ledState === 'fail'
                            ? 'text-fail font-bold'
                            : 'text-soft'
                        }`}
                      >
                        {statusText}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </Panel>
  );
};
