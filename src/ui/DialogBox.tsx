import type { ReactNode } from 'react';

interface Props {
  speaker: string;
  subtitle?: string;
  portrait?: ReactNode;
  children: ReactNode;
}

export function DialogBox({ speaker, subtitle, portrait, children }: Props) {
  return (
    <div className="panel zone-work bubble flex gap-4">
      {portrait && <div className="shrink-0">{portrait}</div>}
      <div className="min-w-0 flex-1">
        <p className="font-bold">
          {speaker} {subtitle && <span className="text-sm font-normal text-soft">{subtitle}</span>}
        </p>
        <div aria-live="polite" className="mt-1 text-[17px]">
          {children}
        </div>
      </div>
    </div>
  );
}
