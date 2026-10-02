import React from 'react';
import type { CoachMessage, Rung } from '../../api/types';
import { useSessionStore } from '../../stores/sessionStore';
import { IconThink, Typewriter } from '../../ui';

interface CoachPanelProps {
  className?: string;
}

const RUNG_NAMES: Record<Rung, string> = {
  1: 'Think',
  2: 'Hint',
  3: 'Explain',
  4: 'Example',
  5: 'Reveal',
};

export const CoachPanel: React.FC<CoachPanelProps> = ({ className = '' }) => {
  const ladderView = useSessionStore((s) => s.ladder);
  const selectedReview = useSessionStore((s) => s.selectedRungReview);

  const highest = ladderView.ladder.highest;
  const isLoading = ladderView.status === 'loading';
  const hasError = ladderView.status === 'error';

  // If user selected a previously unlocked rung to review, show that; otherwise show active message
  const activeRung = (selectedReview ?? highest) as Rung;
  const currentMessage: CoachMessage | undefined = ladderView.messages[activeRung];

  return (
    <div
      role="region"
      aria-label="AI Coach Socrates"
      aria-live="polite"
      className={`zone-work rounded-[var(--radius)] border border-control bg-surface p-4 shadow-sm flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header: Portrait + Speaker Name + Subtitle */}
        <div className="flex items-center gap-3 border-b border-soft pb-3 mb-3">
          <div className="h-10 w-10 flex-none rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center shadow-inner">
            <IconThink size={20} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-ink">
                Socrates.exe
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                COACH
              </span>
            </div>
            <p className="text-xs text-soft font-mono truncate">
              {activeRung > 0
                ? `Rung ${activeRung} of 5: ${RUNG_NAMES[activeRung] ?? ''} ${
                    selectedReview ? '(Archive Review)' : ''
                  }`
                : 'Awaiting your question'}
            </p>
          </div>
        </div>

        {/* Message Bubble or States */}
        {isLoading ? (
          <div className="flex items-center gap-2 p-4 text-sm font-medium text-primary">
            <span aria-hidden="true" className="animate-spin text-base">
              ⏳
            </span>
            <span>Socrates is thinking…</span>
          </div>
        ) : hasError ? (
          <div className="p-4 rounded bg-fail/10 text-fail text-sm font-medium border border-fail/20">
            {ladderView.error || 'Connection error with coach.'}
          </div>
        ) : !currentMessage ? (
          <div className="p-4 rounded bg-sunken text-soft text-sm italic leading-relaxed border border-soft">
            "Stuck? I won't solve it for you, but I'll get you unstuck. Climb the Hint Ladder when you need a nudge."
          </div>
        ) : (
          <div className="bubble rounded-[var(--radius)] p-4 border border-primary/20 text-ink leading-relaxed">
            {/* Typewriter message */}
            <Typewriter text={currentMessage.message} className="text-base text-ink">
              {currentMessage.codeBlock && (
                <div className="mt-3 overflow-x-auto rounded bg-sunken p-3 text-xs font-mono text-ink border border-soft">
                  <pre>{currentMessage.codeBlock}</pre>
                </div>
              )}
            </Typewriter>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-3 pt-2 border-t border-soft text-[11px] text-soft flex items-center justify-between">
        <span>Press F2 for quick coach advice</span>
        <span>Atkinson 16px</span>
      </div>
    </div>
  );
};
