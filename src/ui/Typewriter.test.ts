import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '../stores/settingsStore';

describe('Typewriter settings', () => {
  it('defaults to disabled (typewriter = false)', () => {
    expect(useSettingsStore.getState().typewriter).toBe(false);
  });

  it('can be toggled in settings', () => {
    useSettingsStore.getState().setTypewriter(true);
    expect(useSettingsStore.getState().typewriter).toBe(true);

    useSettingsStore.getState().setTypewriter(false);
    expect(useSettingsStore.getState().typewriter).toBe(false);
  });
});
