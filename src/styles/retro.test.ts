import { describe, expect, it } from 'vitest';
import retro from './retro.css?raw';

const pixelVars = (level: string): string[] => {
  const block = new RegExp(`\\[data-retro='${level}'\\]\\s*\\{([^}]*)\\}`).exec(retro)?.[1] ?? '';
  return [...block.matchAll(/(--font-[\w-]+):\s*([^;]+);/g)]
    .filter((m) => /pixel|press start/i.test(m[2] ?? ''))
    .map((m) => m[1]!)
    .sort();
};

describe('retro style levels', () => {
  it('clean: no variable references the pixel font', () => {
    expect(pixelVars('clean')).toEqual([]);
  });
  it('balanced: only logo and rank badge use the pixel font', () => {
    expect(pixelVars('balanced')).toEqual(['--font-logo', '--font-rank']);
  });
  it('arcade: pixel font is allowed', () => {
    expect(pixelVars('arcade').length).toBeGreaterThan(2);
  });
});
