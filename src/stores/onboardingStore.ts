import { create } from 'zustand';
import type { SpriteName } from '../sprites/matrices';
import type { RetroLevel } from './settingsStore';

export interface OnboardingState {
  step: number; // 1 to 5
  initials: string;
  avatar: SpriteName;
  courseId: 'javascript' | 'python' | null;
  selfLevel: 'newcomer' | 'basics' | 'confident' | null;
  coachLang: 'en' | 'fr';
  retroLevel: RetroLevel;
  showOnLeaderboard: boolean;
  sound: boolean;

  // Inline placement check state
  placementActive: boolean;
  placementAnswers: Record<string, string>;
  suggestedLevel: 'newcomer' | 'basics' | 'confident' | null;

  // Actions
  setStep: (s: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setInitials: (init: string) => void;
  setAvatar: (av: SpriteName) => void;
  setCourseId: (cid: 'javascript' | 'python') => void;
  setSelfLevel: (lvl: 'newcomer' | 'basics' | 'confident') => void;
  setCoachLang: (lang: 'en' | 'fr') => void;
  setRetroLevel: (rl: RetroLevel) => void;
  setShowOnLeaderboard: (show: boolean) => void;
  setSound: (snd: boolean) => void;
  setPlacementActive: (active: boolean) => void;
  setPlacementAnswer: (questionId: string, answerId: string) => void;
  setSuggestedLevel: (lvl: 'newcomer' | 'basics' | 'confident' | null) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  step: 1,
  initials: 'ADA',
  avatar: 'avatar-hero',
  courseId: null,
  selfLevel: null,
  coachLang: 'en',
  retroLevel: 'balanced',
  showOnLeaderboard: true,
  sound: false,

  placementActive: false,
  placementAnswers: {},
  suggestedLevel: null,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(5, s.step + 1) })),
  prevStep: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
  setInitials: (raw) =>
    set({ initials: raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) }),
  setAvatar: (avatar) => set({ avatar }),
  setCourseId: (courseId) => set({ courseId }),
  setSelfLevel: (selfLevel) => set({ selfLevel }),
  setCoachLang: (coachLang) => set({ coachLang }),
  setRetroLevel: (retroLevel) => set({ retroLevel }),
  setShowOnLeaderboard: (showOnLeaderboard) => set({ showOnLeaderboard }),
  setSound: (sound) => set({ sound }),
  setPlacementActive: (placementActive) => set({ placementActive }),
  setPlacementAnswer: (questionId, answerId) =>
    set((s) => ({
      placementAnswers: { ...s.placementAnswers, [questionId]: answerId },
    })),
  setSuggestedLevel: (suggestedLevel) => set({ suggestedLevel }),
  resetOnboarding: () =>
    set({
      step: 1,
      initials: 'ADA',
      avatar: 'avatar-hero',
      courseId: null,
      selfLevel: null,
      coachLang: 'en',
      retroLevel: 'balanced',
      showOnLeaderboard: true,
      sound: false,
      placementActive: false,
      placementAnswers: {},
      suggestedLevel: null,
    }),
}));
