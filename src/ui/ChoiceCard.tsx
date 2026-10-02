import React, { type ReactNode } from 'react';

interface ChoiceCardProps {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  disabledReason?: string;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  selected = false,
  disabled = false,
  onClick,
  title,
  subtitle,
  badge,
  icon,
  children,
  className = '',
  disabledReason,
}) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`relative flex flex-col text-left transition-all ${
        disabled
          ? 'cursor-not-allowed bg-sunken opacity-75 border-dashed'
          : 'cursor-pointer hover:border-primary focus-visible:outline-primary'
      } ${
        selected
          ? 'border-2 border-primary bg-surface shadow-md'
          : 'border border-soft bg-surface'
      } rounded-[var(--radius)] p-4 ${className}`}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && <div className="flex-none">{icon}</div>}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">{title}</span>
              {badge && (
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-soft mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div
          aria-hidden="true"
          className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border ${
            selected
              ? 'border-primary bg-primary text-on-primary'
              : 'border-soft bg-surface'
          }`}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-on-primary" />}
        </div>
      </div>

      {children && <div className="mt-3 text-sm text-ink">{children}</div>}

      {disabled && disabledReason && (
        <div className="mt-2 rounded bg-sunken px-2 py-1 text-xs font-semibold text-soft">
          {disabledReason}
        </div>
      )}
    </button>
  );
};
