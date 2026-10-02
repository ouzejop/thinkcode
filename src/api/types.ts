export type Rung = 1 | 2 | 3 | 4 | 5; // 1: THINK, 2: HINT, 3: EXPLAIN, 4: EXAMPLE, 5: REVEAL
export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

export type ExerciseKind = 'fix_bug' | 'complete' | 'predict' | 'fix';

export interface TestCase {
  id: string;
  label: string;
  args: unknown[];
  expected: unknown;
}

export interface TestResult {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'error' | 'timeout';
  expected: unknown;
  actual?: unknown;
  message?: string;
  logs: string[];
}

export interface Exercise {
  id: string;
  title: string;
  concept: string;
  kind: ExerciseKind;
  difficulty: 1 | 2 | 3;
  brief: string;
  starterCode: string;
  entryPoint: string;
  tests: TestCase[];
  predictOptions?: string[];
  predictAnswer?: string;
  rematchVariantId?: string;
}

export interface CourseInfo {
  id: 'javascript' | 'python';
  title: string;
  tagline: string;
  exerciseCount: number;
  available: boolean;
  language: 'javascript' | 'python';
}

/** Server-owned. The front displays it and never decides it. xpTable[i] = XP left if rung i+1 is used. */
export interface Ladder {
  highest: 0 | Rung;
  next: Rung | null;
  xpTable: number[];
  bonus: number;
}

export interface CoachMessage {
  rung: Rung;
  message: string;
  codeBlock?: string;
}

export interface Session {
  id: string;
  exerciseId: string;
  ladder: Ladder;
  coachLog: CoachMessage[];
}

export interface HelpRequest {
  code: string;
  testResults: TestResult[];
  userReply?: string;
  confirmReveal?: boolean;
}

export interface HelpResponse extends CoachMessage {
  ladder: Ladder;
}

export interface Completion {
  rank: Rank;
  xp: number;
  rematchRequired: boolean;
  leaderboard: {
    rankBefore: number;
    rankAfter: number;
  };
  unlockedExercises: string[];
}

export interface PlacementQuestion {
  id: string;
  prompt: string;
  codeSnippet: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  initials: string;
  avatar: string;
  level: number;
  xp: number;
  sRankCount: number;
  independencePercent: number;
  isDemo: boolean;
  isYou?: boolean;
}

export interface ExerciseLeaderboardEntry {
  rank: number;
  playerId: string;
  initials: string;
  avatar: string;
  level: number;
  exerciseRank: Rank;
  highestRung: number;
  xpEarned: number;
  completedAt: string;
  isDemo: boolean;
  isYou?: boolean;
}

export interface ProgressReport {
  player: {
    initials: string;
    avatar: string;
    level: number;
    totalXp: number;
  };
  rankDistribution: Record<Rank, number>;
  conceptIndependence: {
    concept: string;
    exercisesCleared: number;
    maxRungs: number[];
    avgIndependence: number;
  }[];
  coachInsight: string;
}

export type ApiErrorCode =
  | 'NETWORK'
  | 'COOLDOWN'
  | 'REVEAL_NOT_CONFIRMED'
  | 'TESTS_FAILING'
  | 'NOT_FOUND'
  | 'SERVER';

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly retryAfterMs?: number,
  ) {
    super(message);
  }
}

export interface Api {
  getCatalog(): Promise<CourseInfo[]>;
  getExercises(courseId?: string): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise>;
  getPlacement(): Promise<PlacementQuestion[]>;
  calculatePlacement(answers: Record<string, string>): Promise<'newcomer' | 'basics' | 'confident'>;
  startSession(exerciseId: string, player: string): Promise<Session>;
  getSession(id: string): Promise<Session>;
  requestHelp(id: string, body: HelpRequest): Promise<HelpResponse>;
  complete(id: string, results: TestResult[]): Promise<Completion>;
  getLeaderboard(params: {
    courseId?: 'javascript' | 'python' | 'all';
    tab: 'xp' | 'independence' | 'sRank';
    period: 'all' | 'week';
    track: 'mine' | 'all';
    playerId?: string;
  }): Promise<LeaderboardEntry[]>;
  getExerciseLeaderboard(exerciseId: string, playerId?: string): Promise<ExerciseLeaderboardEntry[]>;
  getReport(playerId: string): Promise<ProgressReport>;
}

