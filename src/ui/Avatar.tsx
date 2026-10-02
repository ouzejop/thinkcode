import React, { useState } from 'react';
import { PixelSprite } from './PixelSprite';
import type { SpriteName } from '../sprites/matrices';

export type AvatarStyle = 'pixel-art' | 'bottts' | 'fun-emoji';

interface AvatarProps {
  seed: string;
  style?: AvatarStyle;
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Free DiceBear Avatar Library integration with fallback.
 * Uses official DiceBear API (free, open source) for pixel-art and bottts avatars,
 * with graceful fallback to crisp local vector sprites if offline.
 */
export const Avatar: React.FC<AvatarProps> = ({
  seed,
  style = 'pixel-art',
  size = 32,
  className = '',
  title,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);

  // Clean seed for DiceBear URL
  const cleanSeed = encodeURIComponent((seed || 'hero').replace(/^avatar-/, ''));
  const diceBearUrl = `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}&radius=10`;

  // Fallback map to local sprite if image fails to load or offline
  const getFallbackSprite = (): SpriteName => {
    const s = seed.toLowerCase();
    if (s.includes('wizard')) return 'avatar-wizard';
    if (s.includes('robot') || s.includes('bob')) return 'avatar-robot';
    if (s.includes('cat') || s.includes('lin') || s.includes('ray')) return 'avatar-cat';
    if (s.includes('ghost') || s.includes('joy') || s.includes('lea')) return 'avatar-ghost';
    if (s.includes('knight') || s.includes('sam') || s.includes('mia')) return 'avatar-knight';
    return 'avatar-hero';
  };

  if (loadFailed) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-[var(--radius)] overflow-hidden bg-sunken flex-none ${className}`}
        style={{ width: size, height: size }}
      >
        <PixelSprite name={getFallbackSprite()} size={Math.round(size * 0.85)} title={title} />
      </div>
    );
  }

  return (
    <img
      src={diceBearUrl}
      alt={title || `Avatar ${seed}`}
      width={size}
      height={size}
      onError={() => setLoadFailed(true)}
      loading="lazy"
      className={`inline-block rounded-[var(--radius)] object-cover flex-none bg-sunken border border-soft ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
