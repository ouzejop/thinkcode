import { describe, expect, it } from 'vitest';
import themes from '../styles/themes.css?raw';
import { contrast, parseTokens } from './contrast';

// [foreground, background, minimum ratio]. If a pair fails, fix the token, never the threshold.
const RULES: [string, string, number][] = [
  ['ink', 'bg', 7], ['ink', 'surface', 7],
  ['ink-soft', 'bg', 4.5], ['ink-soft', 'surface', 4.5], ['ink-soft', 'surface-sunken', 4.5],
  ['primary', 'surface', 4.5], ['primary', 'surface-sunken', 4.5],
  ['on-primary', 'primary', 4.5], ['on-xp', 'xp', 7],
  ['pass', 'surface', 4.5], ['pass', 'surface-sunken', 4.5],
  ['fail', 'surface', 4.5], ['fail', 'surface-sunken', 4.5],
  ['on-status', 'pass', 4.5], ['on-status', 'fail', 4.5],
  ['border-control', 'surface', 3],
];

describe.each(['lavender', 'night'])('%s theme contrast', (theme) => {
  const t = parseTokens(themes, theme);
  it.each(RULES)('%s on %s >= %s:1', (fg, bg, min) => {
    expect(t[fg], `missing --${fg}`).toBeDefined();
    expect(t[bg], `missing --${bg}`).toBeDefined();
    expect(contrast(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(min);
  });
});
