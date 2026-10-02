import { describe, expect, it } from 'vitest';
import { ApiError, type Ladder } from '../../../api/types';
import { initialLadder, ladderReducer, rungState } from './ladderReducer';

const ladder = (highest: Ladder['highest'], next: Ladder['next']): Ladder => ({
  highest, next, xpTable: [90, 75, 55, 40, 15], bonus: 90,
});

describe('ladderReducer', () => {
  it('only exposes the server-provided next rung', () => {
    const s = ladderReducer(initialLadder, {
      type: 'help',
      res: { rung: 2, message: 'hint', ladder: ladder(2, 3) },
    });
    expect([1, 2, 3, 4, 5].map((r) => rungState(s, r as 1))).toEqual([
      'used', 'current', 'next', 'locked', 'locked',
    ]);
  });
  it('stays on THINK when the server says so', () => {
    const s = ladderReducer(initialLadder, {
      type: 'help',
      res: { rung: 1, message: 'q', ladder: ladder(1, 2) },
    });
    expect(rungState(s, 1)).toBe('current');
    expect(rungState(s, 2)).toBe('next');
  });
  it('turns COOLDOWN into a deadline', () => {
    const s = ladderReducer(initialLadder, {
      type: 'fail', now: 1000, error: new ApiError('COOLDOWN', 'wait', 3000),
    });
    expect(s.cooldownUntil).toBe(4000);
  });
});
