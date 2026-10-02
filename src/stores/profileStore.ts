import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Rank } from '../api/types';
import type { SpriteName } from '../sprites/matrices';

export interface CompletedExerciseRecord {
  rank: Rank;
  xp: number;
  highestRung: number;
  completedAt: string;
}

export interface ProfileState {
  playerId: string;
  initials: string;
  avatar: SpriteName;
  courseId: 'javascript' | 'python';
  selfLevel: 'newcomer' | 'basics' | 'confident';
  coachLang: 'en' | 'fr';
  showOnLeaderboard: boolean;
  xp: number;
  hasStarted: boolean;
  completedExercises: Record<string, CompletedExerciseRecord>;
  rematchQueue: string[]; // exercise IDs requiring rematch
  authMode: 'guest' | 'authenticated';
  accountEmail?: string;

  // Actions
  createProfile: (data: {
    initials: string;
    avatar: SpriteName;
    courseId: 'javascript' | 'python';
    selfLevel: 'newcomer' | 'basics' | 'confident';
    coachLang: 'en' | 'fr';
    showOnLeaderboard: boolean;
  }) => void;
  updateProfile: (data: Partial<ProfileState>) => void;
  recordCompletion: (exerciseId: string, rank: Rank, xp: number, highestRung: number, rematchRequired: boolean, rematchVariantId?: string) => void;
  clearRematch: (exerciseId: string) => void;
  setAuthInfo: (authMode: 'guest' | 'authenticated', accountEmail?: string) => void;
  loadSavedProfile: (snapshot: Partial<ProfileState>) => void;
  resetAll: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      playerId: 'player-default',
      initials: 'ADA',
      avatar: 'avatar-hero',
      courseId: 'javascript',
      selfLevel: 'newcomer',
      coachLang: 'en',
      showOnLeaderboard: true,
      xp: 0,
      hasStarted: false,
      completedExercises: {},
      rematchQueue: [],
      authMode: 'guest',
      accountEmail: undefined,

      createProfile: (data) =>
        set({
          playerId: `usr-${crypto.randomUUID().slice(0, 8)}`,
          initials: data.initials.toUpperCase().slice(0, 3),
          avatar: data.avatar,
          courseId: data.courseId,
          selfLevel: data.selfLevel,
          coachLang: data.coachLang,
          showOnLeaderboard: data.showOnLeaderboard,
          hasStarted: true,
          authMode: 'guest',
        }),

      updateProfile: (data) => set((s) => ({ ...s, ...data })),

      setAuthInfo: (authMode, accountEmail) =>
        set((s) => ({
          ...s,
          authMode,
          accountEmail: authMode === 'authenticated' ? accountEmail : undefined,
        })),

      loadSavedProfile: (snapshot) =>
        set((s) => ({
          ...s,
          ...snapshot,
          hasStarted: true,
        })),

      recordCompletion: (exerciseId, rank, earnedXp, highestRung, rematchRequired, rematchVariantId) =>
        set((s) => {
          const nextCompleted = {
            ...s.completedExercises,
            [exerciseId]: {
              rank,
              xp: earnedXp,
              highestRung,
              completedAt: new Date().toISOString(),
            },
          };
          const nextQueue = [...s.rematchQueue];
          if (rematchRequired && rematchVariantId && !nextQueue.includes(rematchVariantId)) {
            nextQueue.push(rematchVariantId);
          }
          // Remove from rematch queue if this was a rematch
          const filteredQueue = nextQueue.filter((id) => id !== exerciseId);

          return {
            xp: s.xp + earnedXp,
            completedExercises: nextCompleted,
            rematchQueue: filteredQueue,
          };
        }),

      clearRematch: (exerciseId) =>
        set((s) => ({
          rematchQueue: s.rematchQueue.filter((id) => id !== exerciseId),
        })),

      resetAll: () =>
        set({
          playerId: `usr-${crypto.randomUUID().slice(0, 8)}`,
          initials: 'NEW',
          avatar: 'avatar-hero',
          courseId: 'javascript',
          selfLevel: 'newcomer',
          coachLang: 'en',
          showOnLeaderboard: true,
          xp: 0,
          hasStarted: false,
          completedExercises: {},
          rematchQueue: [],
          authMode: 'guest',
          accountEmail: undefined,
        }),
    }),
    { name: 'thinkcode-profile-v2' },
  ),
);

/** Calculate user level from total XP: 1 + floor(xp / 200) */
export function getPlayerLevel(xp: number): number {
  return Math.max(1, 1 + Math.floor(xp / 200));
}

/** Get XP progress in current level (0 to 100%) */
export function getLevelProgress(xp: number): { current: number; max: number; percent: number } {
  const currentLevelXp = xp % 200;
  return {
    current: currentLevelXp,
    max: 200,
    percent: Math.min(100, Math.floor((currentLevelXp / 200) * 100)),
  };
}
