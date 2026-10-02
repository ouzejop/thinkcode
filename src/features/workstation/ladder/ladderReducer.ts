import type { ApiError, CoachMessage, HelpResponse, Ladder, Rung, Session } from '../../../api/types';

/** Mirrors the server response. Never persisted: on reload, GET /sessions/:id then `sync`. */
export interface LadderView {
  ladder: Ladder;
  messages: Partial<Record<Rung, CoachMessage>>;
  status: 'idle' | 'loading' | 'error';
  cooldownUntil: number | null;
  error: string | null;
}

export const initialLadder: LadderView = {
  ladder: { highest: 0, next: 1, xpTable: [], bonus: 0 },
  messages: {},
  status: 'idle',
  cooldownUntil: null,
  error: null,
};

export type LadderAction =
  | { type: 'request' }
  | { type: 'sync'; session: Session }
  | { type: 'help'; res: HelpResponse }
  | { type: 'fail'; error: ApiError; now: number };

const byRung = (log: CoachMessage[]) =>
  Object.fromEntries(log.map((m) => [m.rung, m])) as Partial<Record<Rung, CoachMessage>>;

export function ladderReducer(s: LadderView, a: LadderAction): LadderView {
  switch (a.type) {
    case 'request':
      return { ...s, status: 'loading', error: null };
    case 'sync':
      return { ...initialLadder, ladder: a.session.ladder, messages: byRung(a.session.coachLog) };
    case 'help': {
      const { ladder, ...message } = a.res;
      return { ...s, ladder, messages: { ...s.messages, [message.rung]: message }, status: 'idle', error: null, cooldownUntil: null };
    }
    case 'fail':
      return {
        ...s,
        status: 'error',
        error: a.error.message,
        cooldownUntil:
          a.error.code === 'COOLDOWN' && a.error.retryAfterMs ? a.now + a.error.retryAfterMs : null,
      };
  }
}

export type RungState = 'used' | 'current' | 'next' | 'locked';

/** Only the rung the server calls `next` is actionable: the UI cannot skip. */
export function rungState(s: LadderView, r: Rung): RungState {
  const { highest, next } = s.ladder;
  return r === highest ? 'current' : r < highest ? 'used' : r === next ? 'next' : 'locked';
}
