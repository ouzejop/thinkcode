import { useEffect } from 'react';

export interface ShortcutHandlers {
  onRun?: () => void;
  onAsk?: () => void;
  onReview?: () => void;
  onReset?: () => void;
  onShelf?: () => void;
  onSettings?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Run: Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (handlers.onRun) {
          e.preventDefault();
          handlers.onRun();
        }
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }

      // Function keys: avoid intercepting if user is inside a form control unless it's explicit F1-F6
      switch (e.key) {
        case 'F1':
          if (handlers.onRun) {
            e.preventDefault();
            handlers.onRun();
          }
          break;
        case 'F2':
          if (handlers.onAsk) {
            e.preventDefault();
            handlers.onAsk();
          }
          break;
        case 'F3':
          if (handlers.onReview) {
            e.preventDefault();
            handlers.onReview();
          }
          break;
        case 'F4':
          if (handlers.onReset) {
            e.preventDefault();
            handlers.onReset();
          }
          break;
        // Note: F5 is intentionally NOT intercepted to allow standard browser page reload
        case 'F6':
          if (handlers.onSettings) {
            e.preventDefault();
            handlers.onSettings();
          }
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers, enabled]);
}
