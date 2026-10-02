import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'secondary', type = 'button', className = '', ...rest }: Props) {
  return (
    <button type={type} className={`btn ${variant === 'primary' ? 'btn-primary' : ''} ${className}`} {...rest} />
  );
}
