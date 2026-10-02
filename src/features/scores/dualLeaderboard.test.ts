import { describe, expect, it, beforeEach } from 'vitest';
import { useLeaderboardStore } from '../../stores/leaderboardStore';
import { useProfileStore } from '../../stores/profileStore';
import { mockApi } from '../../api/mock';

describe('Dual Leaderboard System (Language + Exercise)', () => {
  beforeEach(() => {
    // Reset stores
    useProfileStore.getState().resetAll();
  });

  it('provides an exercise leaderboard containing both CPU participants and the real player', async () => {
    const list = await mockApi.getExerciseLeaderboard('vars-sum', 'player-test');
    expect(list.length).toBeGreaterThanOrEqual(8);

    // Verify CPU players are present
    const cpus = list.filter((e) => e.isDemo);
    expect(cpus.length).toBeGreaterThan(0);
    expect(cpus.some((c) => c.initials === 'ADA')).toBe(true);
    expect(cpus.some((c) => c.initials === 'NEO')).toBe(true);

    // Verify ordering: Rank 1 has high XP and few rungs
    expect(list[0].rank).toBe(1);
    expect(list[0].xpEarned).toBeGreaterThanOrEqual(list[1].xpEarned);
  });

  it('records real player completion and places them accurately on the exercise leaderboard', () => {
    const store = useLeaderboardStore.getState();

    // User solves vars-sum with pure autonomy (0 rungs, 100 XP)
    store.recordExerciseCompletion({
      exerciseId: 'vars-sum',
      playerId: 'usr-ace',
      initials: 'ACE',
      avatar: 'avatar-hero',
      level: 2,
      rank: 'S',
      xp: 100,
      highestRung: 0,
      completedAt: new Date().toISOString(),
      courseId: 'javascript',
      isYou: true,
    });

    const leaderboard = store.getExerciseLeaderboard('vars-sum', 'usr-ace');
    const aceEntry = leaderboard.find((e) => e.playerId === 'usr-ace');

    expect(aceEntry).toBeDefined();
    expect(aceEntry!.exerciseRank).toBe('S');
    expect(aceEntry!.xpEarned).toBe(100);
    expect(aceEntry!.isDemo).toBe(false);
    expect(aceEntry!.rank).toBeLessThanOrEqual(3); // Tied with ADA & NEO for top spot
  });

  it('handles lower rung / hint usage in exercise rankings properly', () => {
    const store = useLeaderboardStore.getState();

    // User solves vars-sum with 3 rungs used (Rank C, 55 XP)
    store.recordExerciseCompletion({
      exerciseId: 'vars-sum',
      playerId: 'usr-struggling',
      initials: 'STR',
      avatar: 'avatar-robot',
      level: 1,
      rank: 'C',
      xp: 55,
      highestRung: 3,
      completedAt: new Date().toISOString(),
      courseId: 'javascript',
    });

    const leaderboard = store.getExerciseLeaderboard('vars-sum', 'usr-struggling');
    const strEntry = leaderboard.find((e) => e.playerId === 'usr-struggling');

    expect(strEntry).toBeDefined();
    expect(strEntry!.exerciseRank).toBe('C');
    // Behind Rank S (100 XP), Rank A (90 XP), Rank B (75 XP)
    expect(strEntry!.rank).toBeGreaterThan(4);
  });

  it('updates course leaderboard when user earns XP across exercises', () => {
    const profile = useProfileStore.getState();
    profile.createProfile({
      initials: 'MAX',
      avatar: 'avatar-wizard',
      courseId: 'javascript',
      selfLevel: 'confident',
      coachLang: 'en',
      showOnLeaderboard: true,
    });

    profile.recordCompletion('vars-sum', 'S', 100, 0, false);
    profile.recordCompletion('vars-greet', 'S', 100, 0, false);

    const store = useLeaderboardStore.getState();
    const courseBoard = store.getCourseLeaderboard({
      courseId: 'javascript',
      tab: 'xp',
      playerId: profile.playerId,
    });

    const userInBoard = courseBoard.find((e) => e.playerId === profile.playerId || e.isYou);
    expect(userInBoard).toBeDefined();
    expect(userInBoard!.xp).toBe(200);
    expect(userInBoard!.sRankCount).toBe(2);
    expect(userInBoard!.independencePercent).toBe(100);
  });
});
