import React from 'react';
import { SPRITE_MATRICES, type SpriteName } from '../sprites/matrices';

const COLOR_MAP: Record<string, string> = {
  K: 'var(--ink)',
  S: 'var(--ink-soft)',
  P: 'var(--primary)',
  X: 'var(--xp)',
  W: 'var(--surface)',
  G: 'var(--pass)',
  R: 'var(--fail)',
  L: 'var(--line)',
  D: '#F59E0B', // gold
  A: '#94A3B8', // silver
  B: '#D97706', // bronze
};

interface PixelSpriteProps {
  name: SpriteName;
  size?: number; // visual size in px (defaults to matrix size * 2 or 3)
  className?: string;
  title?: string;
}

export const PixelSprite: React.FC<PixelSpriteProps> = ({
  name,
  size = 28,
  className = '',
  title,
}) => {
  const sprite = SPRITE_MATRICES[name] ?? SPRITE_MATRICES['bug'];
  const matrixSize = sprite.size;

  return (
    <svg
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={!title}
      viewBox={`0 0 ${matrixSize} ${matrixSize}`}
      width={size}
      height={size}
      style={{ shapeRendering: 'crispEdges' }}
      className={`inline-block flex-none select-none ${className}`}
    >
      {title && <title>{title}</title>}
      {sprite.rows.map((row, y) =>
        row.split('').map((char, x) => {
          if (char === '.' || !COLOR_MAP[char]) return null;
          return (
            <rect
              key={`${y}-${x}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={COLOR_MAP[char]}
            />
          );
        }),
      )}
    </svg>
  );
};
