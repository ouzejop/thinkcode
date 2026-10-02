import { describe, expect, it } from 'vitest';
import { buildLeaderboard } from '../../api/mock/leaderboard';

describe('leaderboard ranking logic', () => {
  it('generates 12 CPU entries with isDemo true', () => {
    const list = buildLeaderboard({
      tab: 'xp',
      period: 'all',
      track: 'all',
      player: null,
    });
    expect(list).toHaveLength(12);
    expect(list.every((e) => e.isDemo)).toBe(true);
    expect(list[0]!.rank).toBe(1);
    expect(list[0]!.xp).toBeGreaterThan(list[1]!.xp);
  });

  it('includes and ranks the player when showOnLeaderboard is true', () => {
    const list = buildLeaderboard({
      tab: 'xp',
      period: 'all',
      track: 'all',
      player: {
        playerId: 'usr-1',
        initials: 'YOU',
        avatar: 'avatar-hero',
        level: 1,
        xp: 100,
        sRankCount: 1,
        independencePercent: 90,
        showOnLeaderboard: true,
      },
    });

    expect(list).toHaveLength(13);
    const you = list.find((e) => e.isYou);
    expect(you).toBeDefined();
    expect(you!.isDemo).toBe(false);
    expect(you!.rank).toBe(13); // ranked after 12 CPUs who have > 100 XP
  });

  it('sorts by independence when independence tab is selected', () => {
    const list = buildLeaderboard({
      tab: 'independence',
      period: 'all',
      track: 'all',
      player: null,
    });

    for (let i = 0; i < list.length - 1; i++) {
      expect(list[i]!.independencePercent).toBeGreaterThanOrEqual(
        list[i + 1]!.independencePercent,
      );
    }
  });

  it('excludes the player when showOnLeaderboard is false', () => {
    const list = buildLeaderboard({
      tab: 'xp',
      period: 'all',
      track: 'all',
      player: {
        playerId: 'usr-hidden',
        initials: 'HID',
        avatar: 'avatar-ghost',
        level: 5,
        xp: 2000,
        sRankCount: 3,
        independencePercent: 80,
        showOnLeaderboard: false,
      },
    });

    expect(list.some((e) => e.playerId === 'usr-hidden')).toBe(false);
  });
});
