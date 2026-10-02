import React, { useEffect, useRef, useState } from 'react';
import type { Rung } from '../../api/types';
import { sfx } from '../../lib/sfx';
import { useSessionStore } from '../../stores/sessionStore';
import {
  Button,
  Modal,

  IconThink,
  IconHint,
  IconExplain,
  IconExample,
  IconReveal,
  IconSend,
  IconStar,
  IconCheck,
  IconWarning,
  IconCartridge,
} from '../../ui';

interface LadderPanelProps {
  onAskHelp: (options?: { userReply?: string; confirmReveal?: boolean }) => void;
  className?: string;
}

interface RungMeta {
  rung: number;
  name: string;
  teaser: string;
  defaultXp: number;
}

const RUNGS_META: Record<number, RungMeta> = {
  1: {
    rung: 1,
    name: 'Reflection',
    teaser: 'A guiding question to unlock your reasoning.',
    defaultXp: 90,
  },
  2: {
    rung: 2,
    name: 'Hint',
    teaser: 'A targeted conceptual hint, without spoilers.',
    defaultXp: 75,
  },
  3: {
    rung: 3,
    name: 'Explanation',
    teaser: 'A clear explanation of the principle and syntax.',
    defaultXp: 55,
  },
  4: {
    rung: 4,
    name: 'Example',
    teaser: 'A similar use case with a concrete code example.',
    defaultXp: 40,
  },
  5: {
    rung: 5,
    name: 'Solution',
    teaser: 'The complete solution. 15 XP penalty and mandatory rematch.',
    defaultXp: 15,
  },
};

const RungIcon: React.FC<{ rung: number; size?: number; className?: string }> = ({
  rung,
  size = 14,
  className = '',
}) => {
  switch (rung) {
    case 1:
      return <IconThink size={size} className={className} />;
    case 2:
      return <IconHint size={size} className={className} />;
    case 3:
      return <IconExplain size={size} className={className} />;
    case 4:
      return <IconExample size={size} className={className} />;
    case 5:
      return <IconReveal size={size} className={className} />;
    default:
      return <IconHint size={size} className={className} />;
  }
};

interface CustomMessage {
  id: string;
  sender: 'user' | 'socrates';
  text: string;
  timestamp: number;
}

export const LadderPanel: React.FC<LadderPanelProps> = ({ onAskHelp, className = '' }) => {
  const ladderView = useSessionStore((s) => s.ladder);
  const testResults = useSessionStore((s) => s.testResults);
  const exercise = useSessionStore((s) => s.exercise);

  const [inputMessage, setInputMessage] = useState('');
  const [customMessages, setCustomMessages] = useState<CustomMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [revealCountdown, setRevealCountdown] = useState(9);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const highest = ladderView.ladder.highest;
  const nextRung = ladderView.ladder.next;
  const isLoading = ladderView.status === 'loading';

  // Robust internal auto-scroll to bottom of chat list
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    scrollToBottom('auto');
    const timer = setTimeout(() => scrollToBottom('smooth'), 50);
    return () => clearTimeout(timer);
  }, [highest, ladderView.messages, customMessages, isLoading, isTyping]);

  // Countdown inside Reveal confirmation modal
  useEffect(() => {
    if (!revealModalOpen) {
      setRevealCountdown(9);
      return;
    }
    const timer = setInterval(() => {
      setRevealCountdown((c) => (c > 1 ? c - 1 : 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [revealModalOpen]);

  const handleUnlockNext = () => {
    if (nextRung === null || isLoading) return;

    if (nextRung === 5) {
      setRevealModalOpen(true);
      return;
    }

    sfx.play('rung');
    onAskHelp();
  };

  const handleConfirmReveal = () => {
    sfx.play('reveal');
    setRevealModalOpen(false);
    onAskHelp({ confirmReveal: true });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isLoading) return;

    sfx.play('click');
    setInputMessage('');

    // 1. Add user message
    const userMsg: CustomMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };
    setCustomMessages((prev) => [...prev, userMsg]);

    // 2. If user is in Rung 1 dialogue, send it as dialectic answer to Socrates
    if (highest === 1 && !ladderView.messages[2]) {
      onAskHelp({ userReply: text });
      return;
    }

    // 3. If user explicitly asks for hint or next tier
    const lower = text.toLowerCase();
    if (
      lower.includes('indice') ||
      lower.includes('aide') ||
      lower.includes('hint') ||
      lower.includes('palier') ||
      lower.includes('suivant')
    ) {
      if (nextRung !== null) {
        handleUnlockNext();
      } else {
        setTimeout(() => {
          setCustomMessages((prev) => [
            ...prev,
            {
              id: `s-${Date.now()}`,
              sender: 'socrates',
              text: 'You have already unlocked all available rungs! Carefully analyze the solution code above to understand the logic.',
              timestamp: Date.now(),
            },
          ]);
        }, 300);
      }
      return;
    }

    // 4. Send message to AI backend for a real coaching response
    const sendToBackend = async () => {
      setIsTyping(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            exerciseContext: exercise
              ? {
                  id: exercise.id,
                  title: exercise.title,
                  concept: exercise.concept,
                  kind: exercise.kind,
                  brief: exercise.brief,
                  starterCode: exercise.starterCode,
                }
              : undefined,
            currentRung: highest,
            studentCode:
              (document.querySelector('.cm-content') as HTMLElement)?.textContent || '',
            conversationHistory: customMessages.slice(-10).map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        setCustomMessages((prev) => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            sender: 'socrates',
            text: data.message,
            timestamp: Date.now(),
          },
        ]);
      } catch {
        // Fallback to offline response if backend is unreachable
        const failed = testResults.filter((t) => t.status !== 'pass');
        let reply = '';

        if (failed.length > 0 && failed[0]) {
          const firstFailed = failed[0];
          reply = `I took a look at your tests. Test "${firstFailed.label}" is failing. Double check expected versus actual output.`;
        } else if (highest === 0) {
          reply = `Write your logic in the editor on the left and click Run Code. If you want a hint, click the button below!`;
        } else {
          reply = `Check variable types and loop conditions. You can request the next hint rung at any time.`;
        }

        setCustomMessages((prev) => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            sender: 'socrates',
            text: reply,
            timestamp: Date.now(),
          },
        ]);
      }
    };

    sendToBackend().finally(() => setIsTyping(false));
  };

  const nextMeta = nextRung ? RUNGS_META[nextRung] : null;
  const nextXp =
    nextRung && ladderView.ladder.xpTable[nextRung - 1] !== undefined
      ? ladderView.ladder.xpTable[nextRung - 1]
      : nextMeta?.defaultXp ?? 0;

  return (
    <div
      className={`rounded-xl border border-line bg-surface flex flex-col shadow-sm overflow-hidden h-full min-h-0 ${className}`}
    >
      {/* Modern Minimalist Header */}
      <div className="flex items-center justify-between border-b border-soft px-4 py-3 bg-surface flex-none">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-ink leading-tight">Socrates</span>
              <span className="rounded bg-sunken border border-soft px-1.5 py-0.2 text-[10px] font-mono text-soft">
                AI Coach
              </span>
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-pass"
                title="Socrates is online"
              />
            </div>
            <span className="text-[11px] text-soft">
              {exercise?.concept ? `Concept: ${exercise.concept}` : 'Live Guidance'}
            </span>
          </div>
        </div>

        {/* Live Bonus XP Pill */}
        <div
          className="flex items-center gap-1.5 rounded-full bg-xp/15 border border-xp/30 px-3 py-1 text-on-xp font-bold text-xs"
          title="Current XP Bonus"
        >
          <IconStar size={13} className="text-on-xp" />
          <span className="text-[10px] uppercase font-semibold text-soft">Bonus</span>
          <span className="font-mono text-ink font-bold">{ladderView.ladder.bonus} XP</span>
        </div>
      </div>

      {/* Modern Chat Stream (Airy, clean typography, internal scroll) */}
      <div
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-sm bg-bg/30 overscroll-contain select-text"
        tabIndex={0}
        aria-label="Chat with Socrates"
      >
        {/* Socrates Welcome Message */}
        <div className="py-1 space-y-1">
          <span className="font-semibold text-xs text-ink">Socrates</span>
          <p className="text-sm text-ink leading-relaxed">
            Hi! I am <strong>Socrates</strong>. Analyze the problem on the left and test your
            code. If you get stuck, ask me for advice or click the hint rung below.
          </p>
        </div>

        {/* Unlocked Hint Ladder Rungs */}
        {Array.from({ length: highest }, (_, i) => i + 1).map((r) => {
          const msgObj = ladderView.messages[r as Rung];
          const meta = RUNGS_META[r];
          if (!msgObj && !meta) return null;

          return (
            <div key={`rung-${r}`} className="py-1 animate-fadeIn">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-ink">Socrates</span>
                  <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary flex items-center gap-1.5">
                    <RungIcon rung={r} size={12} className="text-primary" />
                    <span>Rung {r} · {meta?.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-soft ml-auto">
                    {meta?.defaultXp} XP
                  </span>
                </div>

                <div className="rounded-xl bg-surface border border-soft p-3 text-sm text-ink leading-relaxed shadow-xs">
                  <p className="whitespace-pre-wrap">{msgObj?.message || 'Hint unlocked.'}</p>

                  {/* Code block if present */}
                  {msgObj?.codeBlock && (
                    <div className="mt-2.5 rounded-lg bg-sunken/80 border border-control p-2.5 font-mono text-xs text-ink overflow-x-auto">
                      <pre><code>{msgObj.codeBlock}</code></pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom User & Socrates Interactive Messages */}
        {customMessages.map((msg) =>
          msg.sender === 'user' ? (
            <div key={msg.id} className="flex justify-end py-1 animate-fadeIn">
              <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary px-4 py-2.5 text-sm text-on-primary font-medium shadow-xs leading-relaxed">
                {msg.text}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="py-1 animate-fadeIn">
              <div className="space-y-1">
                <span className="font-semibold text-xs text-ink">Socrates</span>
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ),
        )}
        {/* Shining Skeleton Loading Animation before Socrates displays response */}
        {(isTyping || isLoading) && (
          <div className="py-2 animate-fadeIn space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-ink">Socrates</span>
              <div className="flex items-center gap-1.5 text-xs text-soft">
                <span className="inline-flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span className="text-[11px] italic">Socrates is thinking...</span>
              </div>
            </div>

            {/* Glowing / Shining Skeleton Card */}
            <div className="rounded-xl border border-primary/30 bg-surface/90 p-3.5 space-y-2.5 shadow-sm skeleton-shimmer-card">
              <div className="h-3 w-4/5 rounded bg-primary/20" />
              <div className="h-3 w-full rounded bg-primary/15" />
              <div className="h-3 w-2/3 rounded bg-primary/20" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Docked Modern Chat Input Bar (Always Present & Fixed at Bottom) */}
      <div className="border-t border-soft bg-surface p-3 flex-none">
        {/* Next Tier Proposal Chip (Clean quick action above the input) */}
        {nextRung !== null && nextMeta ? (
          <div className="mb-2.5 flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-surface-sunken border border-soft hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-none">
                <RungIcon rung={nextRung} size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span>Rung {nextRung}: {nextMeta.name}</span>
                  <span className="text-[10px] font-mono text-primary font-bold">
                    {nextXp} XP
                  </span>
                </div>
                <p className="text-[11px] text-soft truncate leading-tight">{nextMeta.teaser}</p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleUnlockNext}
              disabled={isLoading}
              className="flex-none py-1.5 px-3 text-xs font-bold shadow-xs whitespace-nowrap"
            >
              {isLoading ? '...' : `Unlock (${nextXp} XP)`}
            </Button>
          </div>
        ) : (
          <div className="mb-2 text-center text-xs text-soft flex items-center justify-center gap-1.5">
            <IconCheck size={14} className="text-pass" />
            <span>All hint rungs have been unlocked.</span>
          </div>
        )}

        {/* Input Form with Send Button */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-control bg-sunken/60 px-3 py-1.5 focus-within:border-primary focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                highest === 1 && !ladderView.messages[2]
                  ? 'Type your answer for Socrates...'
                  : 'Ask Socrates a question or request a hint...'
              }
              className="w-full bg-transparent py-1 text-sm text-ink placeholder:text-soft outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="h-9 w-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex-none shadow-xs"
            title="Send message (Enter)"
            aria-label="Send message"
          >
            <IconSend size={15} />
          </button>
        </form>
      </div>

      {/* REVEAL CONFIRMATION MODAL */}
      <Modal
        open={revealModalOpen}
        title="Reveal full solution?"
        onClose={() => setRevealModalOpen(false)}
      >
        <div className="grid gap-3 text-sm text-ink">
          <p className="leading-relaxed">
            Viewing <strong className="text-fail">Rung 5 (Reveal)</strong> provides the complete
            solution code.
          </p>

          <div className="rounded-xl bg-fail/10 border border-fail/30 p-3 text-xs grid gap-2 text-fail">
            <div className="flex items-center gap-2 font-bold">
              <IconWarning size={16} className="text-fail flex-none" />
              <span>Penalty:</span>
              <span className="font-normal text-ink">Maximum XP reward drops to 15 XP for this cartridge.</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <IconCartridge size={16} className="text-fail flex-none" />
              <span>Condition:</span>
              <span className="font-normal text-ink">A rematch cartridge will be required to validate mastery.</span>
            </div>
          </div>

          <p className="text-xs text-soft">
            Take your time to think it through! Socrates recommends testing another hypothesis before
            revealing.
          </p>

          <div className="text-center font-mono font-bold text-xs text-soft py-1">
            Continue? {revealCountdown}…{Math.max(1, revealCountdown - 1)}…
            {Math.max(1, revealCountdown - 2)}…
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-soft">
            <Button data-autofocus variant="primary" onClick={() => setRevealModalOpen(false)}>
              No, keep trying
            </Button>
            <Button onClick={handleConfirmReveal} className="border-fail text-fail hover:bg-fail/10">
              Confirm Reveal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LadderPanel;
