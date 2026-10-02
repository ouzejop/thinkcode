import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconClose } from './Icons';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Native <dialog>: focus trap and Escape for free. Mark the default-focus control with data-autofocus. */
export function Modal({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="panel zone-work max-w-md w-full backdrop:bg-black/60 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-soft pb-2.5 mb-3">
        <h2 id={titleId} className="text-lg font-bold text-ink">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="h-7 w-7 rounded border border-control bg-sunken hover:bg-surface text-soft hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
        >
          <IconClose size={14} />
        </button>
      </div>
      {open && children}
    </dialog>
  );
}
