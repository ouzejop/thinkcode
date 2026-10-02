import {
  ApiError,
  type Api,
  type ApiErrorCode,
  type CourseInfo,
  type Exercise,
  type LeaderboardEntry,
  type PlacementQuestion,
  type ProgressReport,
} from './types';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

async function call<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('NETWORK', '?DEVICE NOT PRESENT ERROR');
  }
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as {
      code?: ApiErrorCode;
      message?: string;
      retryAfterMs?: number;
    };
    throw new ApiError(b.code ?? 'SERVER', b.message ?? res.statusText, b.retryAfterMs);
  }
  return (await res.json()) as T;
}

export const httpApi: Api = {
  getCatalog: () => call<CourseInfo[]>('/catalog'),
  getExercises: (courseId?: string) => call<Exercise[]>(courseId ? `/exercises?course=${courseId}` : '/exercises'),
  getExercise: (id: string) => call<Exercise>(`/exercises/${id}`),
  getPlacement: () => call<PlacementQuestion[]>('/placement'),
  calculatePlacement: (answers) => call<'newcomer' | 'basics' | 'confident'>('/placement/calculate', { answers }),
  startSession: (exerciseId, player) => call('/sessions', { exerciseId, player }),
  getSession: (id) => call(`/sessions/${id}`),
  requestHelp: (id, body) => call(`/sessions/${id}/help`, body),
  complete: (id, results) => call(`/sessions/${id}/complete`, { results }),
  getLeaderboard: (params) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return call<LeaderboardEntry[]>(`/leaderboard?${query}`);
  },
  getExerciseLeaderboard: (exerciseId, playerId) => {
    const query = playerId ? `?playerId=${encodeURIComponent(playerId)}` : '';
    return call<any>(`/leaderboard/exercise/${encodeURIComponent(exerciseId)}${query}`);
  },
  getReport: (playerId) => call<ProgressReport>(`/reports/${playerId}`),
};

