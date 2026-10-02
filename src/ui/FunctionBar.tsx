export interface FnKey {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface FunctionBarProps {
  keys: FnKey[];
  className?: string;
}

/**
 * Tactile arcade function keys bar (F1-F6).
 * Centered, responsive, and styled like retro terminal keycaps.
 */
export function FunctionBar({ keys, className = '' }: FunctionBarProps) {
  return (
    <nav aria-label="Arcade Actions" className={`fbar zone-touch ${className}`}>
      {keys.map((k, i) => (
        <button
          key={k.label}
          type="button"
          className="fkey t-rung"
          onClick={k.onClick}
          disabled={k.disabled}
          title={`${k.label} (F${i + 1})`}
        >
          <span className="fkey-n" aria-hidden="true">
            F{i + 1}
          </span>
          <span className="fkey-label">{k.label}</span>
        </button>
      ))}
    </nav>
  );
}
