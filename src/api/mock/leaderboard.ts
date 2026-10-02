import type { ExerciseLeaderboardEntry, LeaderboardEntry, Rank } from '../types';

export const CPU_PLAYERS: Omit<LeaderboardEntry, 'rank'>[] = [
  {
    playerId: 'cpu-ada',
    initials: 'ADA',
    avatar: 'avatar-wizard',
    level: 12,
    xp: 2450,
    sRankCount: 9,
    independencePercent: 92,
    isDemo: true,
  },
  {
    playerId: 'cpu-neo',
    initials: 'NEO',
    avatar: 'avatar-hero',
    level: 11,
    xp: 2180,
    sRankCount: 8,
    independencePercent: 88,
    isDemo: true,
  },
  {
    playerId: 'cpu-lin',
    initials: 'LIN',
    avatar: 'avatar-cat',
    level: 10,
    xp: 1940,
    sRankCount: 7,
    independencePercent: 85,
    isDemo: true,
  },
  {
    playerId: 'cpu-bob',
    initials: 'BOB',
    avatar: 'avatar-robot',
    level: 9,
    xp: 1720,
    sRankCount: 6,
    independencePercent: 81,
    isDemo: true,
  },
  {
    playerId: 'cpu-sam',
    initials: 'SAM',
    avatar: 'avatar-knight',
    level: 8,
    xp: 1530,
    sRankCount: 5,
    independencePercent: 78,
    isDemo: true,
  },
  {
    playerId: 'cpu-joy',
    initials: 'JOY',
    avatar: 'avatar-ghost',
    level: 7,
    xp: 1390,
    sRankCount: 4,
    independencePercent: 74,
    isDemo: true,
  },
  {
    playerId: 'cpu-ken',
    initials: 'KEN',
    avatar: 'avatar-hero',
    level: 7,
    xp: 1240,
    sRankCount: 4,
    independencePercent: 70,
    isDemo: true,
  },
  {
    playerId: 'cpu-val',
    initials: 'VAL',
    avatar: 'avatar-wizard',
    level: 6,
    xp: 1110,
    sRankCount: 3,
    independencePercent: 67,
    isDemo: true,
  },
  {
    playerId: 'cpu-ray',
    initials: 'RAY',
    avatar: 'avatar-cat',
    level: 5,
    xp: 980,
    sRankCount: 3,
    independencePercent: 64,
    isDemo: true,
  },
  {
    playerId: 'cpu-kai',
    initials: 'KAI',
    avatar: 'avatar-robot',
    level: 5,
    xp: 850,
    sRankCount: 2,
    independencePercent: 60,
    isDemo: true,
  },
  {
    playerId: 'cpu-mia',
    initials: 'MIA',
    avatar: 'avatar-knight',
    level: 4,
    xp: 720,
    sRankCount: 2,
    independencePercent: 55,
    isDemo: true,
  },
  {
    playerId: 'cpu-lea',
    initials: 'LEA',
    avatar: 'avatar-ghost',
    level: 3,
    xp: 560,
    sRankCount: 1,
    independencePercent: 50,
    isDemo: true,
  },
];

export interface CpuExerciseRecord {
  playerId: string;
  initials: string;
  avatar: string;
  level: number;
  rank: Rank;
  highestRung: number;
  xp: number;
  completedAt?: string;
}

/** Pre-seeded CPU completions for each cartridge in ThinkCode */
export const CPU_EXERCISE_DATA: Record<string, CpuExerciseRecord[]> = {
  'vars-sum': [
    { playerId: 'cpu-ada', initials: 'ADA', avatar: 'avatar-wizard', level: 12, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-neo', initials: 'NEO', avatar: 'avatar-hero', level: 11, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-lin', initials: 'LIN', avatar: 'avatar-cat', level: 10, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-bob', initials: 'BOB', avatar: 'avatar-robot', level: 9, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-sam', initials: 'SAM', avatar: 'avatar-knight', level: 8, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-joy', initials: 'JOY', avatar: 'avatar-ghost', level: 7, rank: 'C', highestRung: 3, xp: 55 },
    { playerId: 'cpu-ken', initials: 'KEN', avatar: 'avatar-hero', level: 7, rank: 'C', highestRung: 4, xp: 40 },
    { playerId: 'cpu-val', initials: 'VAL', avatar: 'avatar-wizard', level: 6, rank: 'D', highestRung: 5, xp: 15 },
  ],
  'vars-greet': [
    { playerId: 'cpu-neo', initials: 'NEO', avatar: 'avatar-hero', level: 11, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-ada', initials: 'ADA', avatar: 'avatar-wizard', level: 12, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-lin', initials: 'LIN', avatar: 'avatar-cat', level: 10, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-sam', initials: 'SAM', avatar: 'avatar-knight', level: 8, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-bob', initials: 'BOB', avatar: 'avatar-robot', level: 9, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-ray', initials: 'RAY', avatar: 'avatar-cat', level: 5, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-joy', initials: 'JOY', avatar: 'avatar-ghost', level: 7, rank: 'C', highestRung: 3, xp: 55 },
    { playerId: 'cpu-kai', initials: 'KAI', avatar: 'avatar-robot', level: 5, rank: 'D', highestRung: 5, xp: 15 },
  ],
  'cond-pass': [
    { playerId: 'cpu-ada', initials: 'ADA', avatar: 'avatar-wizard', level: 12, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-lin', initials: 'LIN', avatar: 'avatar-cat', level: 10, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-neo', initials: 'NEO', avatar: 'avatar-hero', level: 11, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-bob', initials: 'BOB', avatar: 'avatar-robot', level: 9, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-ken', initials: 'KEN', avatar: 'avatar-hero', level: 7, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-val', initials: 'VAL', avatar: 'avatar-wizard', level: 6, rank: 'C', highestRung: 3, xp: 55 },
    { playerId: 'cpu-mia', initials: 'MIA', avatar: 'avatar-knight', level: 4, rank: 'D', highestRung: 5, xp: 15 },
  ],
  'cond-fizz': [
    { playerId: 'cpu-ada', initials: 'ADA', avatar: 'avatar-wizard', level: 12, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-neo', initials: 'NEO', avatar: 'avatar-hero', level: 11, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-lin', initials: 'LIN', avatar: 'avatar-cat', level: 10, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-sam', initials: 'SAM', avatar: 'avatar-knight', level: 8, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-ray', initials: 'RAY', avatar: 'avatar-cat', level: 5, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-joy', initials: 'JOY', avatar: 'avatar-ghost', level: 7, rank: 'C', highestRung: 3, xp: 55 },
    { playerId: 'cpu-lea', initials: 'LEA', avatar: 'avatar-ghost', level: 3, rank: 'D', highestRung: 5, xp: 15 },
  ],
  'loops-vowels': [
    { playerId: 'cpu-ada', initials: 'ADA', avatar: 'avatar-wizard', level: 12, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-neo', initials: 'NEO', avatar: 'avatar-hero', level: 11, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-lin', initials: 'LIN', avatar: 'avatar-cat', level: 10, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-bob', initials: 'BOB', avatar: 'avatar-robot', level: 9, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-ken', initials: 'KEN', avatar: 'avatar-hero', level: 7, rank: 'C', highestRung: 3, xp: 55 },
    { playerId: 'cpu-sam', initials: 'SAM', avatar: 'avatar-knight', level: 8, rank: 'C', highestRung: 4, xp: 40 },
    { playerId: 'cpu-val', initials: 'VAL', avatar: 'avatar-wizard', level: 6, rank: 'D', highestRung: 5, xp: 15 },
  ],
  'loops-double': [
    { playerId: 'cpu-neo', initials: 'NEO', avatar: 'avatar-hero', level: 11, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-ada', initials: 'ADA', avatar: 'avatar-wizard', level: 12, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-sam', initials: 'SAM', avatar: 'avatar-knight', level: 8, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-lin', initials: 'LIN', avatar: 'avatar-cat', level: 10, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-ray', initials: 'RAY', avatar: 'avatar-cat', level: 5, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-joy', initials: 'JOY', avatar: 'avatar-ghost', level: 7, rank: 'C', highestRung: 3, xp: 55 },
  ],
  'loops-rematch': [
    { playerId: 'cpu-ada', initials: 'ADA', avatar: 'avatar-wizard', level: 12, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-neo', initials: 'NEO', avatar: 'avatar-hero', level: 11, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-lin', initials: 'LIN', avatar: 'avatar-cat', level: 10, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-bob', initials: 'BOB', avatar: 'avatar-robot', level: 9, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-ken', initials: 'KEN', avatar: 'avatar-hero', level: 7, rank: 'C', highestRung: 3, xp: 55 },
  ],
  default: [
    { playerId: 'cpu-ada', initials: 'ADA', avatar: 'avatar-wizard', level: 12, rank: 'S', highestRung: 0, xp: 100 },
    { playerId: 'cpu-neo', initials: 'NEO', avatar: 'avatar-hero', level: 11, rank: 'A', highestRung: 1, xp: 90 },
    { playerId: 'cpu-lin', initials: 'LIN', avatar: 'avatar-cat', level: 10, rank: 'B', highestRung: 2, xp: 75 },
    { playerId: 'cpu-bob', initials: 'BOB', avatar: 'avatar-robot', level: 9, rank: 'C', highestRung: 3, xp: 55 },
    { playerId: 'cpu-sam', initials: 'SAM', avatar: 'avatar-knight', level: 8, rank: 'D', highestRung: 5, xp: 15 },
  ],
};

export interface PlayerScoreInfo {
  playerId: string;
  initials: string;
  avatar: string;
  level: number;
  xp: number;
  sRankCount: number;
  independencePercent: number;
  showOnLeaderboard: boolean;
}

export function buildLeaderboard(
  params: {
    courseId?: 'javascript' | 'python' | 'all';
    tab: 'xp' | 'independence' | 'sRank';
    period: 'all' | 'week';
    track: 'mine' | 'all';
    player?: PlayerScoreInfo | null;
  },
): LeaderboardEntry[] {
  const allList: Omit<LeaderboardEntry, 'rank'>[] = [...CPU_PLAYERS];

  if (params.player && params.player.showOnLeaderboard && params.player.initials) {
    allList.push({
      playerId: params.player.playerId,
      initials: params.player.initials,
      avatar: params.player.avatar,
      level: params.player.level,
      xp: params.player.xp,
      sRankCount: params.player.sRankCount,
      independencePercent: params.player.independencePercent,
      isDemo: false,
      isYou: true,
    });
  }

  // Sort according to tab
  if (params.tab === 'xp') {
    allList.sort((a, b) => b.xp - a.xp || b.independencePercent - a.independencePercent);
  } else if (params.tab === 'sRank') {
    allList.sort((a, b) => b.sRankCount - a.sRankCount || b.xp - a.xp);
  } else {
    allList.sort((a, b) => b.independencePercent - a.independencePercent || b.xp - a.xp);
  }

  return allList.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}

export function buildExerciseLeaderboard(
  exerciseId: string,
  player?: {
    playerId: string;
    initials: string;
    avatar: string;
    level: number;
    rank: Rank;
    highestRung: number;
    xp: number;
    completedAt?: string;
  } | null,
): ExerciseLeaderboardEntry[] {
  const cpuList = CPU_EXERCISE_DATA[exerciseId] || CPU_EXERCISE_DATA.default || [];
  const entries: Omit<ExerciseLeaderboardEntry, 'rank'>[] = cpuList.map((c) => ({
    playerId: c.playerId,
    initials: c.initials,
    avatar: c.avatar,
    level: c.level,
    exerciseRank: c.rank,
    highestRung: c.highestRung,
    xpEarned: c.xp,
    completedAt: c.completedAt || new Date(Date.now() - 3600000 * 3).toISOString(),
    isDemo: true,
    isYou: false,
  }));

  if (player) {
    entries.push({
      playerId: player.playerId,
      initials: player.initials,
      avatar: player.avatar,
      level: player.level,
      exerciseRank: player.rank,
      highestRung: player.highestRung,
      xpEarned: player.xp,
      completedAt: player.completedAt || new Date().toISOString(),
      isDemo: false,
      isYou: true,
    });
  }

  entries.sort((a, b) => {
    if (b.xpEarned !== a.xpEarned) {
      return b.xpEarned - a.xpEarned;
    }
    if (a.highestRung !== b.highestRung) {
      return a.highestRung - b.highestRung;
    }
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });

  return entries.map((e, idx) => ({
    ...e,
    rank: idx + 1,
  }));
}
