import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExerciseLeaderboardEntry, LeaderboardEntry, Rank } from '../api/types';
import { CPU_PLAYERS, CPU_EXERCISE_DATA } from '../api/mock/leaderboard';
import { useAuthStore } from './authStore';
import { useProfileStore } from './profileStore';

export interface ExerciseClearRecord {
  exerciseId: string;
  playerId: string;
  initials: string;
  avatar: string;
  level: number;
  rank: Rank;
  xp: number;
  highestRung: number;
  completedAt: string;
  courseId: 'javascript' | 'python';
  isYou?: boolean;
}

interface LeaderboardStoreState {
  /** Map of exerciseId -> Map of playerId -> ExerciseClearRecord */
  userExerciseRecords: Record<string, Record<string, ExerciseClearRecord>>;

  /** Record a completed exercise by a player */
  recordExerciseCompletion: (record: ExerciseClearRecord) => void;

  /** Fetch sorted leaderboard for a specific exercise */
  getExerciseLeaderboard: (exerciseId: string, currentUserId?: string) => ExerciseLeaderboardEntry[];

  /** Fetch sorted course/language leaderboard */
  getCourseLeaderboard: (params: {
    courseId?: 'javascript' | 'python' | 'all';
    tab?: 'xp' | 'independence' | 'sRank';
    period?: 'all' | 'week';
    track?: 'mine' | 'all';
    playerId?: string;
  }) => LeaderboardEntry[];
}

export const useLeaderboardStore = create<LeaderboardStoreState>()(
  persist(
    (set, get) => ({
      userExerciseRecords: {},

      recordExerciseCompletion: (record) => {
        set((state) => {
          const exMap = state.userExerciseRecords[record.exerciseId] || {};
          const existing = exMap[record.playerId];

          // Keep best attempt (higher XP, or same XP with lower rung)
          const shouldUpdate =
            !existing ||
            record.xp > existing.xp ||
            (record.xp === existing.xp && record.highestRung < existing.highestRung);

          if (!shouldUpdate) return state;

          return {
            userExerciseRecords: {
              ...state.userExerciseRecords,
              [record.exerciseId]: {
                ...exMap,
                [record.playerId]: record,
              },
            },
          };
        });
      },

      getExerciseLeaderboard: (exerciseId, currentUserId) => {
        const state = get();
        const profile = useProfileStore.getState();
        const auth = useAuthStore.getState();

        const activePlayerId = currentUserId || profile.playerId;

        // 1. Gather CPU participants for this exercise
        const cpuData = CPU_EXERCISE_DATA[exerciseId] || CPU_EXERCISE_DATA['default'] || [];
        const entries: Omit<ExerciseLeaderboardEntry, 'rank'>[] = cpuData.map((cpu) => ({
          playerId: cpu.playerId,
          initials: cpu.initials,
          avatar: cpu.avatar,
          level: cpu.level,
          exerciseRank: cpu.rank,
          highestRung: cpu.highestRung,
          xpEarned: cpu.xp,
          completedAt: cpu.completedAt || new Date(Date.now() - 3600000 * 4).toISOString(),
          isDemo: true,
          isYou: false,
        }));

        // 2. Add real players from userExerciseRecords
        const exRecords = state.userExerciseRecords[exerciseId] || {};
        const recordedPlayerIds = new Set<string>();

        Object.values(exRecords).forEach((rec) => {
          recordedPlayerIds.add(rec.playerId);
          const isYou = rec.playerId === activePlayerId;
          entries.push({
            playerId: rec.playerId,
            initials: rec.initials,
            avatar: rec.avatar,
            level: rec.level,
            exerciseRank: rec.rank,
            highestRung: rec.highestRung,
            xpEarned: rec.xp,
            completedAt: rec.completedAt,
            isDemo: false,
            isYou,
          });
        });

        // 3. Check if active user has completed this exercise in profileStore but not yet in userExerciseRecords
        if (
          !recordedPlayerIds.has(activePlayerId) &&
          profile.completedExercises &&
          profile.completedExercises[exerciseId]
        ) {
          const profEx = profile.completedExercises[exerciseId];
          recordedPlayerIds.add(activePlayerId);
          entries.push({
            playerId: activePlayerId,
            initials: profile.initials || 'YOU',
            avatar: profile.avatar || 'avatar-hero',
            level: Math.max(1, 1 + Math.floor(profile.xp / 200)),
            exerciseRank: profEx.rank,
            highestRung: profEx.highestRung,
            xpEarned: profEx.xp,
            completedAt: profEx.completedAt || new Date().toISOString(),
            isDemo: false,
            isYou: true,
          });
        }

        // 4. Check registered accounts from authStore
        if (auth.accounts) {
          Object.values(auth.accounts).forEach((acc) => {
            if (acc.profile && acc.profile.completedExercises) {
              const comp = acc.profile.completedExercises[exerciseId];
              if (comp && !recordedPlayerIds.has(acc.id) && acc.profile.showOnLeaderboard !== false) {
                recordedPlayerIds.add(acc.id);
                entries.push({
                  playerId: acc.id,
                  initials: acc.profile.initials || 'USR',
                  avatar: acc.profile.avatar || 'avatar-wizard',
                  level: Math.max(1, 1 + Math.floor(acc.profile.xp / 200)),
                  exerciseRank: comp.rank,
                  highestRung: comp.highestRung,
                  xpEarned: comp.xp,
                  completedAt: comp.completedAt || acc.lastLoginAt || new Date().toISOString(),
                  isDemo: false,
                  isYou: acc.id === activePlayerId,
                });
              }
            }
          });
        }

        // 5. Sort: Highest XP first, then lowest rung used, then earliest date
        entries.sort((a, b) => {
          if (b.xpEarned !== a.xpEarned) {
            return b.xpEarned - a.xpEarned;
          }
          if (a.highestRung !== b.highestRung) {
            return a.highestRung - b.highestRung;
          }
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        });

        // 6. Assign ranks
        return entries.map((e, idx) => ({
          ...e,
          rank: idx + 1,
        }));
      },

      getCourseLeaderboard: (params) => {
        const state = get();
        const profile = useProfileStore.getState();
        const auth = useAuthStore.getState();

        const activePlayerId = params.playerId || profile.playerId;
        const courseFilter = params.courseId || 'javascript';
        const tab = params.tab || 'xp';

        // Base CPU participants
        const list: Omit<LeaderboardEntry, 'rank'>[] = CPU_PLAYERS.map((cpu) => ({
          ...cpu,
          isDemo: true,
          isYou: false,
        }));

        // Real active player
        if (profile && profile.initials && profile.showOnLeaderboard !== false) {
          // Calculate stats from profile
          const completedList = Object.values(profile.completedExercises || {});
          const sCount = completedList.filter((e) => e.rank === 'S').length;
          
          let independence = 100;
          if (completedList.length > 0) {
            const sumIndep = completedList.reduce((acc, curr) => {
              const r = curr.highestRung;
              const ind = r === 0 ? 100 : r === 1 ? 88 : r === 2 ? 72 : r === 3 ? 55 : r === 4 ? 35 : 15;
              return acc + ind;
            }, 0);
            independence = Math.round(sumIndep / completedList.length);
          } else {
            independence = profile.xp > 0 ? 85 : 0;
          }

          list.push({
            playerId: activePlayerId,
            initials: profile.initials,
            avatar: profile.avatar,
            level: Math.max(1, 1 + Math.floor(profile.xp / 200)),
            xp: profile.xp,
            sRankCount: sCount,
            independencePercent: independence,
            isDemo: false,
            isYou: true,
          });
        }

        // Add other registered accounts from authStore
        if (auth.accounts) {
          Object.values(auth.accounts).forEach((acc) => {
            if (acc.id !== activePlayerId && acc.profile && acc.profile.showOnLeaderboard !== false) {
              const compList = Object.values(acc.profile.completedExercises || {});
              const sCount = compList.filter((e) => e.rank === 'S').length;
              let independence = 90;
              if (compList.length > 0) {
                const sumIndep = compList.reduce((acc, curr) => {
                  const r = curr.highestRung;
                  const ind = r === 0 ? 100 : r === 1 ? 88 : r === 2 ? 72 : r === 3 ? 55 : r === 4 ? 35 : 15;
                  return acc + ind;
                }, 0);
                independence = Math.round(sumIndep / compList.length);
              }

              list.push({
                playerId: acc.id,
                initials: acc.profile.initials || 'USR',
                avatar: acc.profile.avatar || 'avatar-wizard',
                level: Math.max(1, 1 + Math.floor(acc.profile.xp / 200)),
                xp: acc.profile.xp || 0,
                sRankCount: sCount,
                independencePercent: independence,
                isDemo: false,
                isYou: false,
              });
            }
          });
        }

        // Filter by track if requested
        let filtered = list;
        if (params.track === 'mine' && activePlayerId) {
          filtered = list.filter((p) => p.isYou || p.playerId === activePlayerId);
        }

        // Sort by tab
        if (tab === 'xp') {
          filtered.sort((a, b) => b.xp - a.xp || b.independencePercent - a.independencePercent);
        } else if (tab === 'independence') {
          filtered.sort((a, b) => b.independencePercent - a.independencePercent || b.xp - a.xp);
        } else if (tab === 'sRank') {
          filtered.sort((a, b) => b.sRankCount - a.sRankCount || b.xp - a.xp);
        }

        return filtered.map((e, idx) => ({
          ...e,
          rank: idx + 1,
        }));
      },
    }),
    {
      name: 'thinkcode-leaderboard-v1',
    },
  ),
);
