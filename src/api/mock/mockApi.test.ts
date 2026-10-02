import { describe, expect, it } from 'vitest';
import { ApiError } from '../types';
import { mockApi } from './index';

describe('mockApi contract', () => {
  it('never leaks the solution before a confirmed Reveal and enforces the Ladder', async () => {
    const list = await mockApi.getExercises();
    expect(JSON.stringify(list)).not.toContain('a + b');
    const s = await mockApi.startSession(list[0]!.id, 'AAA');
    const body = { code: '', testResults: [] };
    for (const rung of [1, 2, 3, 4]) {
      const res = await mockApi.requestHelp(s.id, body);
      expect(res.rung).toBe(rung);
      expect(res.codeBlock).toBeUndefined();
    }
    await expect(mockApi.requestHelp(s.id, body)).rejects.toMatchObject({
      code: 'REVEAL_NOT_CONFIRMED',
    });
    const reveal = await mockApi.requestHelp(s.id, { ...body, confirmReveal: true });
    expect(reveal.codeBlock).toContain('a + b');
    expect((await mockApi.getSession(s.id)).coachLog).toHaveLength(5);
    await expect(mockApi.complete(s.id, [])).resolves.toMatchObject({ rank: 'D', rematchRequired: true });
    await expect(mockApi.getSession('nope')).rejects.toBeInstanceOf(ApiError);
  });
});
