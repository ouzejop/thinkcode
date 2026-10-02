import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'lavender' | 'night';
export type RetroLevel = 'clean' | 'balanced' | 'arcade';
export type FontSize = 'normal' | 'large' | 'xlarge';
export type MotionPreference = 'auto' | 'reduce' | 'no-preference';

interface SettingsState {
  theme: Theme;
  retroLevel: RetroLevel;
  sound: boolean;
  fontSize: FontSize;
  typewriter: boolean;
  reducedMotion: MotionPreference;
  zones: boolean;

  setTheme: (t: Theme) => void;
  setRetroLevel: (l: RetroLevel) => void;
  setSound: (s: boolean) => void;
  setFontSize: (f: FontSize) => void;
  setTypewriter: (tw: boolean) => void;
  setReducedMotion: (m: MotionPreference) => void;
  setZones: (z: boolean) => void;
  toggleZones: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'lavender',
      retroLevel: 'balanced',
      sound: false,
      fontSize: 'normal',
      typewriter: false,
      reducedMotion: 'auto',
      zones: false,

      setTheme: (theme) => set({ theme }),
      setRetroLevel: (retroLevel) => set({ retroLevel }),
      setSound: (sound) => set({ sound }),
      setFontSize: (fontSize) => set({ fontSize }),
      setTypewriter: (typewriter) => set({ typewriter }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setZones: (zones) => set({ zones }),
      toggleZones: () => set((s) => ({ zones: !s.zones })),
    }),
    { name: 'thinkcode-settings-v2' },
  ),
);

function applySettings(state: SettingsState) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Theme & retro style
  root.dataset.theme = state.theme;
  root.dataset.retro = state.retroLevel;

  // Font size
  root.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
  root.classList.add(`font-size-${state.fontSize}`);

  // Reduced motion
  if (state.reducedMotion === 'reduce') {
    root.dataset.reducedMotion = 'true';
  } else if (state.reducedMotion === 'no-preference') {
    root.dataset.reducedMotion = 'false';
  } else {
    delete root.dataset.reducedMotion;
  }

  // Zone debugging
  if (state.zones || new URLSearchParams(window.location.search).get('zones') === '1') {
    root.dataset.zones = '';
  } else {
    delete root.dataset.zones;
  }

  // Lazy-load pixel font only if balanced or arcade
  if (state.retroLevel !== 'clean') {
    void import('@fontsource/press-start-2p');
  }
}

export function initSettings() {
  if (typeof window === 'undefined') return;
  const state = useSettingsStore.getState();
  if (new URLSearchParams(window.location.search).get('zones') === '1') {
    useSettingsStore.getState().setZones(true);
  }
  applySettings(state);
  useSettingsStore.subscribe(applySettings);
}
