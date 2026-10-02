import type { Config } from 'tailwindcss';

const v = (name: string) => `var(--${name})`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), sunken: v('surface-sunken'),
        ink: v('ink'), soft: v('ink-soft'),
        primary: v('primary'), 'on-primary': v('on-primary'),
        xp: v('xp'), 'on-xp': v('on-xp'), pass: v('pass'), fail: v('fail'),
      },
    },
  },
} satisfies Config;
