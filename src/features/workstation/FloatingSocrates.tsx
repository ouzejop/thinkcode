import React, { useEffect, useRef, useState } from 'react';
import type { CoachMessage, Rung } from '../../api/types';
import { sfx } from '../../lib/sfx';
import { useProfileStore } from '../../stores/profileStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Button, IconThink, Typewriter } from '../../ui';

interface FloatingSocratesProps {
  onAskHelp?: (options?: { userReply?: string; confirmReveal?: boolean }) => void;
  className?: string;
}

const RUNG_NAMES: Record<Rung, string> = {
  1: 'Think',
  2: 'Hint',
  3: 'Explain',
  4: 'Example',
  5: 'Reveal',
};

// Spontaneous thoughts Socrates can share when a user is working for a long time
const SPONTANEOUS_THOUGHTS_FR: Record<string, string[]> = {
  Variables: [
    'Une variable est une boîte étiquetée. Vérifie bien ce que tu mets dedans et ce que tu en ressors !',
    'Vérifie les opérations arithmétiques : une inversion de signe (+ au lieu de -) est vite arrivée.',
    'Prends ton temps pour bien lire le nom des paramètres passés à la fonction.',
  ],
  Conditions: [
    'Dans une condition if/else, teste mentalement les cas limites (nombres négatifs, zéro, égalités).',
    'La condition compare-t-elle strictement avec === ou vérifie-t-elle le bon booléen ?',
    'Si un test échoue, demande-toi : quelle branche de mon code a été exécutée ?',
  ],
  Loops: [
    'Attention aux bornes de la boucle : les indices commencent à 0 et se terminent à length - 1 !',
    "Le compteur s'incrémente-t-il bien à chaque passage (i++) sans boucle infinie ?",
    'Vérifie ce que contient la chaîne ou le tableau à chaque itération `str[i]`.',
  ],
  default: [
    'Tu réfléchis intensément ? Prends ton temps, le cheminement compte autant que le résultat.',
    'Décompose le problème en sous-étapes simples : entrée → transformation → résultat.',
    "Bloqué ? N'hésite pas à grimper d'un échelon sur la Hint Ladder (F2) pour un indice doux.",
    'Consulte la console pour voir exactement ce que tes tests produisent.',
  ],
};

const SPONTANEOUS_THOUGHTS_EN: Record<string, string[]> = {
  Variables: [
    'A variable is a labeled container. Double-check what value goes in and what comes out!',
    'Check your arithmetic operators: a sign flip (+ vs -) is a very common bug.',
    'Carefully trace the input parameters passed into your function.',
  ],
  Conditions: [
    'In if/else branches, test edge cases in your head: zero, negative numbers, or boundary equality.',
    'Are you comparing strictly with === ? Make sure you test the exact condition expected.',
    'If a test fails, ask yourself: which branch of code did the input actually take?',
  ],
  Loops: [
    'Watch your loop bounds: array and string indexes start at 0 and end at length - 1!',
    'Is your loop counter properly incrementing (i++) to avoid infinite loops?',
    'Inspect what str[i] evaluates to on every single iteration.',
  ],
  default: [
    'Deep in thought? Take your time, the struggle is where the real learning happens.',
    'Break the problem down into bite-sized steps: input → logic → return value.',
    'Stuck on syntax? Climb one rung on the Hint Ladder (F2) for a gentle nudge without spoilers.',
    'Check the console tab to see the exact return value of your failed tests.',
  ],
};

export const FloatingSocrates: React.FC<FloatingSocratesProps> = ({ onAskHelp }) => {
  const ladderView = useSessionStore((s) => s.ladder);
  const selectedReview = useSessionStore((s) => s.selectedRungReview);
  const exercise = useSessionStore((s) => s.exercise);
  const testResults = useSessionStore((s) => s.testResults);
  const coachLang = useProfileStore((s) => s.coachLang);

  const highest = ladderView.ladder.highest;
  const nextRung = ladderView.ladder.next;
  const isLoading = ladderView.status === 'loading';
  const hasError = ladderView.status === 'error';

  const activeRung = (selectedReview ?? highest) as Rung;
  const currentMessage: CoachMessage | undefined = ladderView.messages[activeRung];

  // Position state (defaults to bottom-right corner)
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const defaultX = Math.max(20, window.innerWidth - 180);
      const defaultY = Math.max(100, window.innerHeight - 250);
      return { x: defaultX, y: defaultY };
    }
    return { x: 800, y: 500 };
  });

  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [spontaneousThought, setSpontaneousThought] = useState<string | null>(null);
  const [thinkReply, setThinkReply] = useState('');
  const [hasNewThought, setHasNewThought] = useState(false);

  // Dragging state refs to avoid unnecessary re-renders
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });
  const hasMovedRef = useRef(false);
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const circleRef = useRef<HTMLDivElement>(null);


  // 1. Spontaneous Thought Timer: triggers when user has been idle/working for > 35s
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastInteractionTimeRef.current;
      // If > 35 seconds of struggle and no active message already opened
      if (elapsed > 35000 && !isBubbleOpen) {
        const concept = exercise?.concept || 'default';
        const thoughtsList =
          (coachLang === 'fr' ? SPONTANEOUS_THOUGHTS_FR[concept] : SPONTANEOUS_THOUGHTS_EN[concept]) ||
          (coachLang === 'fr' ? SPONTANEOUS_THOUGHTS_FR.default : SPONTANEOUS_THOUGHTS_EN.default) ||
          [];

        if (thoughtsList.length > 0) {
          const randomThought = thoughtsList[Math.floor(Math.random() * thoughtsList.length)];
          if (randomThought) {
            setSpontaneousThought(randomThought);
            setHasNewThought(true);
            setIsBubbleOpen(true);
            sfx.play('step');
            lastInteractionTimeRef.current = Date.now();
          }
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [exercise, isBubbleOpen, coachLang]);

  // 2. Trigger on failed tests (if tests fail)
  const failedCount = testResults.filter((t) => t.status !== 'pass').length;
  useEffect(() => {
    if (failedCount > 0 && !isBubbleOpen && !currentMessage) {
      const concept = exercise?.concept || 'default';
      const thoughtsList =
        (coachLang === 'fr' ? SPONTANEOUS_THOUGHTS_FR[concept] : SPONTANEOUS_THOUGHTS_EN[concept]) ||
        (coachLang === 'fr' ? SPONTANEOUS_THOUGHTS_FR.default : SPONTANEOUS_THOUGHTS_EN.default) ||
        [];
      if (thoughtsList.length > 0) {
        const pick = thoughtsList[Math.floor(Math.random() * thoughtsList.length)];
        if (pick) {
          setSpontaneousThought(pick);
          setHasNewThought(true);
          setIsBubbleOpen(true);
          sfx.play('step');
        }
      }
    }
  }, [failedCount]);

  // 3. Open thought bubble immediately when user asks for help or unlocks/reviews a rung
  useEffect(() => {
    if (activeRung > 0 && currentMessage) {
      setSpontaneousThought(null);
      setHasNewThought(false);
      setIsBubbleOpen(true);
      sfx.play('rung');
      lastInteractionTimeRef.current = Date.now();
    }
  }, [activeRung, currentMessage]);

  // Handle Drag via Pointer Events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    const newX = dragStartRef.current.startX + dx;
    const newY = dragStartRef.current.startY + dy;

    // Constrain within viewport boundaries
    const maxX = Math.max(10, window.innerWidth - 80);
    const maxY = Math.max(60, window.innerHeight - 130);
    const clampedX = Math.min(Math.max(16, newX), maxX);
    const clampedY = Math.min(Math.max(60, newY), maxY);

    setPos({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // If user clicked without dragging, toggle thought bubble
    if (!hasMovedRef.current) {
      sfx.play('click');
      setIsBubbleOpen((prev) => !prev);
      setHasNewThought(false);
      lastInteractionTimeRef.current = Date.now();
    }
  };

  // Orientation of thought bubble relative to Socrates position
  const isRightSide = typeof window !== 'undefined' ? pos.x > window.innerWidth / 2 : true;
  const isBottomSide = typeof window !== 'undefined' ? pos.y > window.innerHeight / 2 : true;

  return (
    <div
      ref={circleRef}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
      className="fixed z-40 select-none touch-none transition-transform duration-75"
    >
      {/* 1. Floating Socrates Circle (Petit cercle flottant déplaçable) */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Floating Socrates Coach. Drag to move, click to open thoughts."
        aria-expanded={isBubbleOpen}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsBubbleOpen((prev) => !prev);
          }
        }}
        className={`relative h-16 w-16 rounded-full border-2 cursor-grab active:cursor-grabbing flex items-center justify-center transition-all transform hover:scale-105 ${
          hasNewThought
            ? 'border-xp bg-surface ring-4 ring-xp/40 shadow-[0_0_30px_rgba(255,210,63,0.5)] animate-bounce'
            : isBubbleOpen
            ? 'border-primary bg-surface ring-4 ring-primary/25 shadow-[0_0_25px_rgba(91,79,201,0.35)]'
            : 'border-primary/80 bg-gradient-to-tr from-surface via-surface to-primary/10 hover:border-primary shadow-[0_8px_24px_rgba(91,79,201,0.22)] animate-float'
        }`}
        title="AI Coach (F2) — Drag me anywhere!"
      >
        <IconThink size={28} className="text-primary" />

        {/* Floating badge when thought bubble is available */}
        {hasNewThought && !isBubbleOpen && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-xp border border-line text-xs font-bold text-on-xp animate-bounce"
            title="Socrates has a thought for you!"
          >
            💭
          </span>
        )}

        {/* Small Drag handle indicator */}
        <span
          aria-hidden="true"
          className="absolute -bottom-1 rounded-full bg-sunken px-1.5 py-0 text-[8px] font-mono font-bold text-soft border border-soft opacity-70 group-hover:opacity-100"
        >
          DRAG
        </span>
      </div>

      {/* 2. Thought Bubble Connector Dots (Petites bulles de pensée reliant Socrate au nuage) */}
      {isBubbleOpen && (
        <div
          aria-hidden="true"
          className={`absolute pointer-events-none ${
            isRightSide
              ? isBottomSide
                ? '-top-6 -left-3 flex flex-col-reverse items-end gap-1.5'
                : 'top-10 -left-3 flex flex-col items-end gap-1.5'
              : isBottomSide
              ? '-top-6 -right-3 flex flex-col-reverse items-start gap-1.5'
              : 'top-10 -right-3 flex flex-col items-start gap-1.5'
          }`}
        >
          <div className="h-3.5 w-3.5 rounded-full border-2 border-primary bg-surface shadow-xs" />
          <div className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-surface shadow-xs" />
          <div className="h-1.5 w-1.5 rounded-full border border-primary bg-surface shadow-xs" />
        </div>
      )}

      {/* 3. Thought Bubble (Bulle de pensée / Dialogue Box) */}
      {isBubbleOpen && (
        <div
          role="region"
          aria-label="Socrates thought bubble"
          className={`absolute z-50 w-80 sm:w-96 rounded-2xl border-2 border-line bg-surface p-4 shadow-[var(--shadow-hard)] text-left transition-all ${
            isRightSide
              ? 'right-[76px]' // Pop to the left of the circle
              : 'left-[76px]' // Pop to the right of the circle
          } ${
            isBottomSide
              ? 'bottom-0' // Anchor to bottom
              : 'top-0' // Anchor to top
          }`}
        >
          {/* Bubble Header */}
          <div className="flex items-center justify-between border-b border-soft pb-2 mb-3">
            <div className="flex items-center gap-2">
              <IconThink size={18} className="text-primary flex-none" />
              <div>
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  Coach AI
                  <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                    {spontaneousThought ? 'THOUGHT' : 'COACH'}
                  </span>
                </span>
                <span className="text-[11px] text-soft font-mono block">
                  {spontaneousThought
                    ? 'Spontaneous thought'
                    : activeRung > 0
                    ? `Rung ${activeRung} of 5: ${RUNG_NAMES[activeRung] ?? ''} ${
                        selectedReview ? '(Archive)' : ''
                      }`
                    : 'Wise guidance'}
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                sfx.play('click');
                setIsBubbleOpen(false);
                setHasNewThought(false);
              }}
              className="h-6 w-6 rounded-full border border-soft bg-sunken hover:bg-surface text-soft hover:text-ink flex items-center justify-center text-xs font-bold transition-colors"
              title="Close thought bubble"
            >
              ✕
            </button>
          </div>

          {/* Bubble Content */}
          <div className="text-sm leading-relaxed text-ink min-h-[60px]">
            {isLoading ? (
              <div className="flex items-center gap-2 py-4 text-primary font-medium">
                <span aria-hidden="true" className="animate-spin text-lg">
                  ⏳
                </span>
                <span>Socrates is thinking…</span>
              </div>
            ) : hasError ? (
              <div className="p-3 rounded bg-fail/10 text-fail text-xs border border-fail/20">
                {ladderView.error || 'Connection error with coach.'}
              </div>
            ) : spontaneousThought ? (
              /* Spontaneous idle/struggle thought */
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-lg select-none">💭</span>
                  <p className="text-xs sm:text-sm text-ink font-medium leading-relaxed italic">
                    "{spontaneousThought}"
                  </p>
                </div>

                <div className="pt-2 border-t border-soft flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.play('click');
                      setIsBubbleOpen(false);
                      setSpontaneousThought(null);
                    }}
                    className="text-soft hover:text-ink text-[11px] underline"
                  >
                    Thanks Socrates, I'll keep going!
                  </button>

                  {nextRung && nextRung <= 5 && onAskHelp && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setIsBubbleOpen(true);
                        setSpontaneousThought(null);
                        onAskHelp();
                      }}
                      className="text-xs py-1 px-2.5"
                    >
                      Hint F2 ({RUNG_NAMES[nextRung as Rung]})
                    </Button>
                  )}
                </div>
              </div>
            ) : currentMessage ? (
              /* Active Hint Ladder Coach Message */
              <div className="space-y-2">
                <Typewriter text={currentMessage.message} className="text-xs sm:text-sm text-ink">
                  {currentMessage.codeBlock && (
                    <div className="mt-2.5 overflow-x-auto rounded bg-sunken p-2.5 text-xs font-mono text-ink border border-soft">
                      <pre>{currentMessage.codeBlock}</pre>
                    </div>
                  )}
                </Typewriter>

                {/* If on Rung 1 (Think dialogue), inline response form */}
                {highest === 1 && !ladderView.messages[2] && onAskHelp && (
                  <div className="mt-3 pt-2 border-t border-soft grid gap-2">
                    <label htmlFor="socrates-reply" className="text-[11px] font-bold text-soft">
                      Your response to Socrates:
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="socrates-reply"
                        type="text"
                        value={thinkReply}
                        onChange={(e) => setThinkReply(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && thinkReply.trim()) {
                            onAskHelp({ userReply: thinkReply.trim() });
                            setThinkReply('');
                          }
                        }}
                        placeholder="Explain what you think is wrong…"
                        className="flex-1 rounded border border-control bg-surface px-2.5 py-1 text-xs text-ink"
                      />
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (thinkReply.trim()) {
                            onAskHelp({ userReply: thinkReply.trim() });
                            setThinkReply('');
                          }
                        }}
                        disabled={!thinkReply.trim()}
                        className="text-xs py-1 px-2.5"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Default greeting */
              <div className="text-xs text-soft italic py-2 leading-relaxed">
                "Stuck? I won't write the code for you, but I will guide you to discover it yourself.
                Climb a rung on the Hint Ladder whenever you need a nudge!"
              </div>
            )}
          </div>

          {/* Bubble Footer */}
          <div className="mt-3 pt-2 border-t border-soft text-[10px] text-soft font-mono flex items-center justify-between">
            <span>Shortcut: F2 (Coach)</span>
            <span>💡 Drag Socrates anywhere</span>
          </div>
        </div>
      )}
    </div>
  );
};
