import React, { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface TypewriterProps {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speedMs = 25,
  onComplete,
  className = '',
  children,
}) => {
  const isTypewriterEnabled = useSettingsStore((s) => s.typewriter);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  // If typewriter disabled or reduced-motion active, render full text immediately
  const shouldSkip =
    !isTypewriterEnabled ||
    reducedMotion === 'reduce' ||
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      reducedMotion !== 'no-preference');

  const [displayedLength, setDisplayedLength] = useState<number>(() =>
    shouldSkip ? text.length : 0,
  );
  const [isFinished, setIsFinished] = useState<boolean>(shouldSkip);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldSkip) {
      setDisplayedLength(text.length);
      setIsFinished(true);
      onComplete?.();
      return;
    }

    setDisplayedLength(0);
    setIsFinished(false);

    let current = 0;
    timerRef.current = window.setInterval(() => {
      current++;
      setDisplayedLength(current);
      if (current >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsFinished(true);
        onComplete?.();
      }
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speedMs, shouldSkip, onComplete]);

  // Click or Space to instantly finish
  const skipToEnd = () => {
    if (isFinished) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedLength(text.length);
    setIsFinished(true);
    onComplete?.();
  };

  return (
    <div
      role="region"
      aria-live="polite"
      tabIndex={0}
      onClick={skipToEnd}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          skipToEnd();
        }
      }}
      className={`relative cursor-pointer focus:outline-none ${className}`}
      title={!isFinished ? 'Click or press Space to show full message' : undefined}
    >
      <span>{text.slice(0, displayedLength)}</span>
      {!isFinished && (
        <span
          aria-hidden="true"
          className="inline-block w-2 bg-primary animate-pulse ml-0.5"
        >
          _
        </span>
      )}
      {isFinished && children}
    </div>
  );
};
