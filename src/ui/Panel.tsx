import type { HTMLAttributes } from 'react';

export type Zone = 'work' | 'arcade' | 'touch';

interface Props extends HTMLAttributes<HTMLElement> {
  title?: string;
  zone?: Zone;
}

export function Panel({ title, zone = 'work', className = '', children, ...rest }: Props) {
  return (
    <section className={`panel zone-${zone} ${className}`} {...rest}>
      {title && <h2 className="t-label mb-3">{title}</h2>}
      {children}
    </section>
  );
}
