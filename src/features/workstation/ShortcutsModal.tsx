import React from 'react';
import {
  Button,
  Modal,
  IconPlay,

  IconExplain,
  IconCartridge,
  IconGear,
  IconClose,
} from '../../ui';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    action: 'Run tests',
    keys: ['Ctrl', 'Enter'],
    icon: <IconPlay size={14} className="text-primary flex-none" />,
  },
  {
    action: 'Run tests (arcade)',
    keys: ['F1'],
    icon: <IconPlay size={14} className="text-primary flex-none" />,
  },
  {
    action: 'Ask Socrates for guidance',
    keys: ['F2'],
    icon: null,
  },
  {
    action: 'Review previous hints',
    keys: ['F3'],
    icon: <IconExplain size={14} className="text-primary flex-none" />,
  },
  {
    action: 'Reset starter code',
    keys: ['F4'],
    icon: <IconCartridge size={14} className="text-primary flex-none" />,
  },
  {
    action: 'Open settings',
    keys: ['F6'],
    icon: <IconGear size={14} className="text-primary flex-none" />,
  },
  {
    action: 'Close modals',
    keys: ['Esc'],
    icon: <IconClose size={14} className="text-primary flex-none" />,
  },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} title="Keyboard Shortcuts" onClose={onClose}>
      <div className="py-1">
        <ul className="divide-y divide-soft text-sm" role="list">
          {SHORTCUTS.map((s, idx) => (
            <li key={idx} className="flex items-center justify-between py-2 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-6 w-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-none">
                  {s.icon}
                </span>
                <span className="text-ink font-medium text-xs sm:text-sm truncate">{s.action}</span>
              </div>
              <div className="flex items-center gap-1 flex-none">
                {s.keys.map((k, kIdx) => (
                  <React.Fragment key={kIdx}>
                    <kbd className="px-2 py-0.5 rounded bg-sunken border border-control text-xs font-mono font-bold text-primary shadow-xs">
                      {k}
                    </kbd>
                    {kIdx < s.keys.length - 1 && <span className="text-soft text-xs">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-3 border-t border-soft flex items-center justify-between text-xs text-soft">
          <span>F5 = Standard page refresh</span>
          <Button variant="secondary" onClick={onClose} className="text-xs py-1 px-3">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
