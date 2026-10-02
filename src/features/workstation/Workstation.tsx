import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApi } from '../../api/client';
import type { Completion, TestResult } from '../../api/types';
import { runTests } from '../../engine/runTests';
import { useKeyboardShortcuts } from '../../lib/keyboard';
import { sfx } from '../../lib/sfx';
import { useLeaderboardStore } from '../../stores/leaderboardStore';
import { useProfileStore } from '../../stores/profileStore';
import { useSessionStore } from '../../stores/sessionStore';
import { IconCartridge, IconKeyboard, Tabs, type TabItem } from '../../ui';
import { ConsolePanel } from './ConsolePanel';
import { EditorPanel } from './EditorPanel';
import { ExerciseLeaderboard } from './ExerciseLeaderboard';
import { LadderPanel } from './LadderPanel';
import { MissionPanel } from './MissionPanel';
import { ShortcutsModal } from './ShortcutsModal';
import { StageClearModal } from './StageClearModal';
import { TopBar } from './TopBar';

interface WorkstationProps {
  onOpenSettings: () => void;
}

export const Workstation: React.FC<WorkstationProps> = ({ onOpenSettings }) => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();

  const profile = useProfileStore();
  const session = useSessionStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'mission' | 'code' | 'leaderboard' | 'coach' | 'console'>('code');
  const [leftPanelTab, setLeftPanelTab] = useState<'mission' | 'leaderboard'>('mission');
  const [revealedCount, setRevealedCount] = useState(0);
  const [completionResult, setCompletionResult] = useState<Completion | null>(null);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);


  // Initialize or reload exercise session
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!exerciseId) return;
      setLoading(true);
      setError(null);
      try {
        const api = await getApi();
        const ex = await api.getExercise(exerciseId);
        const sess = await api.startSession(exerciseId, profile.playerId);

        if (mounted) {
          session.start(sess, ex);
          setLoading(false);
          setRevealedCount(ex.tests.length); // initially off
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load exercise session. Please retry.');
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [exerciseId, profile.playerId]);

  const handleRunTests = async () => {
    if (!session.exercise || session.isRunning) return;

    sfx.play('run');
    session.setIsRunning(true);
    setRevealedCount(0);

    const codeToRun = session.userCode;
    const entryPoint = session.exercise.entryPoint;
    const tests = session.exercise.tests;

    try {
      const results: TestResult[] = await runTests(
        { code: codeToRun, entryPoint, tests },
        {
          perTestMs: 2000,
          totalMs: 5000,
        },
      );

      session.setTestResults(results);

      // Extract console logs
      const combinedLogs = results.flatMap((r) => r.logs);
      if (combinedLogs.length > 0) {
        session.appendLogs(combinedLogs);
      }

      // Staggered LED lighting animation: 80ms delay per test
      for (let i = 1; i <= tests.length; i++) {
        await new Promise((r) => setTimeout(r, 80));
        setRevealedCount(i);
      }

      const allPassed = results.length > 0 && results.every((r) => r.status === 'pass');

      if (allPassed) {
        sfx.play('pass');
        // Submit completion to API
        const api = await getApi();
        const comp = await api.complete(session.sessionId!, results);
        setCompletionResult(comp);

        // Record in profile store
        profile.recordCompletion(
          session.exercise.id,
          comp.rank,
          comp.xp,
          session.ladder.ladder.highest,
          comp.rematchRequired,
          session.exercise.rematchVariantId,
        );

        // Record in real leaderboard store
        useLeaderboardStore.getState().recordExerciseCompletion({
          exerciseId: session.exercise.id,
          playerId: profile.playerId,
          initials: profile.initials,
          avatar: profile.avatar,
          level: Math.max(1, 1 + Math.floor((profile.xp + comp.xp) / 200)),
          rank: comp.rank,
          xp: comp.xp,
          highestRung: session.ladder.ladder.highest,
          completedAt: new Date().toISOString(),
          courseId: 'javascript',
          isYou: true,
        });
      } else {
        sfx.play('fail');
      }

    } catch (err) {
      session.appendLogs([`Execution error: ${String(err)}`]);
      sfx.play('fail');
    } finally {
      session.setIsRunning(false);
    }
  };

  const handleAskHelp = async (options?: { userReply?: string; confirmReveal?: boolean }) => {
    if (!session.sessionId) return;
    session.dispatchLadder({ type: 'request' });

    try {
      const api = await getApi();
      const res = await api.requestHelp(session.sessionId, {
        code: session.userCode,
        testResults: session.testResults,
        userReply: options?.userReply,
        confirmReveal: options?.confirmReveal,
      });

      sfx.play('rung');
      session.dispatchLadder({ type: 'help', res });
      session.setSelectedRungReview(null);
    } catch (err: any) {
      session.dispatchLadder({ type: 'fail', error: err, now: Date.now() });
    }
  };

  const handleResetCode = () => {
    sfx.play('click');
    if (session.exercise) {
      session.setUserCode(session.exercise.starterCode);
    }
  };

  // Keyboard shortcuts (F1 - F4, Ctrl+Enter, Esc)
  useKeyboardShortcuts({
    onRun: handleRunTests,
    onAsk: () => handleAskHelp(),
    onReview: () => {
      if (session.ladder.ladder.highest > 0) {
        session.setSelectedRungReview(session.ladder.ladder.highest);
      }
    },
    onReset: handleResetCode,
    onEscape: () => setShortcutsModalOpen(false),
    onSettings: onOpenSettings,
  });

  const mobileTabs: TabItem[] = [
    { id: 'code', label: 'Code' },
    { id: 'mission', label: 'Mission' },
    { id: 'leaderboard', label: '🏆 Ranks' },
    { id: 'coach', label: 'Socrates' },
    { id: 'console', label: 'Console' },
  ];

  if (loading) {
    return (
      <div className="zone-work flex min-h-screen items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <IconCartridge size={36} className="text-primary animate-bounce" />
          <p className="font-bold text-ink">Inserting Cartridge into Workstation…</p>
        </div>
      </div>
    );
  }

  if (error || !session.exercise) {
    return (
      <div className="zone-work flex min-h-screen flex-col items-center justify-center p-6 text-center gap-4">
        <p className="text-fail font-bold text-lg">{error || 'Cartridge not found.'}</p>
        <button type="button" onClick={() => navigate('/shelf')} className="btn btn-primary">
          Back to Cartridge Shelf
        </button>
      </div>
    );
  }

  // Determine highlight line for Reveal (if on rung 5)
  const isRevealActive = session.ladder.ladder.highest === 5;
  const highlightLine = isRevealActive ? 2 : undefined;

  return (
    <div className="flex flex-col min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-bg">
      {/* Top Bar */}
      <TopBar
        onOpenSettings={onOpenSettings}
        onToggleLeaderboard={() => {
          sfx.play('click');
          setLeftPanelTab((prev) => (prev === 'leaderboard' ? 'mission' : 'leaderboard'));
        }}
      />

      {/* Mobile Tab Navigation (< 768px) */}
      <div className="block md:hidden border-b border-soft bg-surface px-3 py-1 flex-none">
        <Tabs
          tabs={mobileTabs}
          activeTab={activeMobileTab}
          onChange={(id) => setActiveMobileTab(id as any)}
        />
      </div>

      {/* Main Workstation Layout */}
      <main className="flex-1 min-h-0 p-2.5 sm:p-3 lg:p-4 max-w-7xl mx-auto w-full flex flex-col lg:overflow-hidden">
        {/* Desktop 3-Column Layout (>= 1024px: 3 locked columns with internal scroll) */}
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr_340px] xl:grid-cols-[300px_1fr_370px] gap-3 xl:gap-4 h-full min-h-0">
          {/* Left Column: Mission + Tests / Leaderboard */}
          <div className="h-full min-h-0 flex flex-col">
            <MissionPanel
              exercise={session.exercise}
              results={session.testResults}
              revealedCount={revealedCount}
              activeTab={leftPanelTab}
              onTabChange={setLeftPanelTab}
              className="h-full min-h-0"
            />
          </div>

          {/* Center Column: Editor + Console */}
          <div className="flex flex-col gap-3 xl:gap-4 h-full min-h-0">
            <EditorPanel
              exercise={session.exercise}
              code={session.userCode}
              onChangeCode={session.setUserCode}
              predictChoice={session.predictChoice}
              onChangePredictChoice={session.setPredictChoice}
              highlightLine={highlightLine}
              onRun={handleRunTests}
              isRunning={session.isRunning}
              className="flex-1 min-h-0"
            />
            <ConsolePanel
              logs={session.consoleLogs}
              results={session.testResults}
              totalTests={session.exercise.tests.length}
              className="h-40 xl:h-44 flex-none"
            />
          </div>

          {/* Right Column: Socrates Chat & Hint Ladder */}
          <div className="h-full min-h-0 flex flex-col">
            <LadderPanel onAskHelp={handleAskHelp} className="h-full min-h-0" />
          </div>
        </div>

        {/* Medium Layout (768px - 1023px: 2 columns, chat fixed height) */}
        <div className="hidden md:grid lg:hidden md:grid-cols-[1fr_320px] gap-4 h-[calc(100vh-85px)] min-h-0">
          {/* Left Column: Stacked Mission, Editor, Console (scrollable) */}
          <div className="flex flex-col gap-4 overflow-y-auto min-h-0 pr-1">
            <MissionPanel
              exercise={session.exercise}
              results={session.testResults}
              revealedCount={revealedCount}
              activeTab={leftPanelTab}
              onTabChange={setLeftPanelTab}
            />
            <EditorPanel
              exercise={session.exercise}
              code={session.userCode}
              onChangeCode={session.setUserCode}
              predictChoice={session.predictChoice}
              onChangePredictChoice={session.setPredictChoice}
              highlightLine={highlightLine}
              onRun={handleRunTests}
              isRunning={session.isRunning}
            />
            <ConsolePanel
              logs={session.consoleLogs}
              results={session.testResults}
              totalTests={session.exercise.tests.length}
              className="h-44 flex-none"
            />
          </div>

          {/* Right Column: Socrates Chat & Hint Ladder (fixed height with internal scroll) */}
          <div className="h-full min-h-0 flex flex-col">
            <LadderPanel onAskHelp={handleAskHelp} className="h-full min-h-0" />
          </div>
        </div>

        {/* Small Screen Layout (< 768px: Tabbed) */}
        <div className="block md:hidden pb-16 flex-1 min-h-0">
          {activeMobileTab === 'code' && (
            <EditorPanel
              exercise={session.exercise}
              code={session.userCode}
              onChangeCode={session.setUserCode}
              predictChoice={session.predictChoice}
              onChangePredictChoice={session.setPredictChoice}
              highlightLine={highlightLine}
              onRun={handleRunTests}
              isRunning={session.isRunning}
            />
          )}

          {activeMobileTab === 'mission' && (
            <MissionPanel
              exercise={session.exercise}
              results={session.testResults}
              revealedCount={revealedCount}
              activeTab={leftPanelTab}
              onTabChange={setLeftPanelTab}
            />
          )}

          {activeMobileTab === 'leaderboard' && (
            <div className="h-[calc(100vh-140px)] flex flex-col min-h-0 bg-surface p-3 rounded border border-soft overflow-y-auto">
              <ExerciseLeaderboard exercise={session.exercise} />
            </div>
          )}

          {activeMobileTab === 'coach' && (
            <div className="h-[calc(100vh-140px)] flex flex-col min-h-0">
              <LadderPanel onAskHelp={handleAskHelp} className="h-full min-h-0" />
            </div>
          )}

          {activeMobileTab === 'console' && (
            <ConsolePanel
              logs={session.consoleLogs}
              results={session.testResults}
              totalTests={session.exercise.tests.length}
            />
          )}
        </div>
      </main>


      {/* Arcade-themed Keyboard Shortcuts Trigger Button */}
      <div className="fixed bottom-3.5 left-3.5 z-30">
        <button
          type="button"
          onClick={() => setShortcutsModalOpen(true)}
          className="btn min-h-[32px] px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-2 border-2 border-line bg-surface text-ink hover:border-primary hover:text-primary active:translate-y-0.5 shadow-[var(--shadow-hard)] cursor-pointer"
          title="Keyboard shortcuts (F1-F6)"
          aria-label="Keyboard shortcuts"
        >
          <IconKeyboard size={15} className="text-primary" />
          <span>SHORTCUTS</span>
          <span className="hidden sm:inline-block rounded bg-sunken px-1.5 py-0.5 text-[10px] text-soft border border-soft font-mono">
            F1–F6
          </span>
        </button>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        open={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Stage Clear Modal */}
      {completionResult && (
        <StageClearModal
          open={Boolean(completionResult)}
          completion={completionResult}
          exerciseTitle={session.exercise.title}
          onClose={() => setCompletionResult(null)}
        />
      )}
    </div>
  );
};

export default Workstation;
