import {
  ApiError,
  type Api,
  type CoachMessage,
  type Completion,
  type CourseInfo,
  type Exercise,
  type HelpRequest,
  type HelpResponse,
  type Ladder,
  type LeaderboardEntry,
  type PlacementQuestion,
  type ProgressReport,
  type Rank,
  type Rung,
  type Session,
  type TestResult,
} from '../types';
import { COURSES } from './catalog';
import { EXERCISES, type ExerciseData } from './exercises';
import { buildLeaderboard } from './leaderboard';
import { evaluatePlacement, PLACEMENT_QUESTIONS } from './placement';

const XP_TABLE = [90, 75, 55, 40, 15];
const RANKS: Rank[] = ['S', 'A', 'B', 'C', 'C', 'D'];

interface SessionInternal {
  id: string;
  exerciseId: string;
  playerId: string;
  highest: number;
  thinkTurns: number;
  log: CoachMessage[];
  lastHelpTime: number;
}

const sessions = new Map<string, SessionInternal>();

const wait = (ms = 80) => new Promise((r) => setTimeout(r, ms));

const makeLadder = (highest: number): Ladder => ({
  highest: highest as Ladder['highest'],
  next: highest >= 5 ? null : ((highest + 1) as Rung),
  xpTable: XP_TABLE,
  bonus: highest === 0 ? 100 : (XP_TABLE[highest - 1] ?? 15),
});

const stripExercise = (ex: ExerciseData): Exercise => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { solution, coach, ...publicFields } = ex;
  return publicFields;
};

function getSessionOrThrow(id: string): { session: SessionInternal; exercise: ExerciseData } {
  const session = sessions.get(id);
  if (!session) throw new ApiError('NOT_FOUND', 'Unknown session ID');
  const exercise = EXERCISES.find((e) => e.id === session.exerciseId);
  if (!exercise) throw new ApiError('NOT_FOUND', 'Unknown exercise for session');
  return { session, exercise };
}

export const mockApi: Api = {
  async getCatalog(): Promise<CourseInfo[]> {
    await wait();
    return COURSES;
  },

  async getExercises(_courseId?: string): Promise<Exercise[]> {
    await wait();
    return EXERCISES.map(stripExercise);
  },

  async getExercise(id: string): Promise<Exercise> {
    await wait();
    const ex = EXERCISES.find((e) => e.id === id);
    if (!ex) throw new ApiError('NOT_FOUND', `Exercise not found: ${id}`);
    return stripExercise(ex);
  },

  async getPlacement(): Promise<PlacementQuestion[]> {
    await wait();
    return PLACEMENT_QUESTIONS;
  },

  async calculatePlacement(answers: Record<string, string>): Promise<'newcomer' | 'basics' | 'confident'> {
    await wait();
    return evaluatePlacement(answers);
  },

  async startSession(exerciseId: string, player: string): Promise<Session> {
    await wait();
    const ex = EXERCISES.find((e) => e.id === exerciseId);
    if (!ex) throw new ApiError('NOT_FOUND', `Exercise not found: ${exerciseId}`);

    const id = crypto.randomUUID();
    const newSession: SessionInternal = {
      id,
      exerciseId,
      playerId: player,
      highest: 0,
      thinkTurns: 0,
      log: [],
      lastHelpTime: Date.now(),
    };
    sessions.set(id, newSession);

    return {
      id,
      exerciseId,
      ladder: makeLadder(0),
      coachLog: [],
    };
  },

  async getSession(id: string): Promise<Session> {
    await wait();
    const { session } = getSessionOrThrow(id);
    return {
      id: session.id,
      exerciseId: session.exerciseId,
      ladder: makeLadder(session.highest),
      coachLog: session.log,
    };
  },

  async requestHelp(id: string, body: HelpRequest): Promise<HelpResponse> {
    await wait();
    const { session, exercise } = getSessionOrThrow(id);

    // Cooldown check (prevent spamming help within 500ms, disabled in tests)
    const now = Date.now();
    const isTest = (globalThis as any)?.process?.env?.NODE_ENV === 'test';
    if (!isTest && now - session.lastHelpTime < 500 && session.highest > 0) {
      throw new ApiError('COOLDOWN', 'Please take a moment to reflect before asking again.', 2000);
    }
    session.lastHelpTime = now;


    let responseMsg: CoachMessage;

    // Rung 1 (Think) conversation continuation
    if (session.highest === 1 && body.userReply && session.thinkTurns < 2) {
      session.thinkTurns++;
      responseMsg = {
        rung: 1,
        message: exercise.coach.think.followUp,
      };
      session.log.push(responseMsg);
      return {
        ...responseMsg,
        ladder: makeLadder(session.highest),
      };
    }

    if (session.highest >= 5) {
      throw new ApiError('SERVER', 'Ladder exhausted. Reveal is the final rung.');
    }

    const targetRung = (session.highest + 1) as Rung;

    // Reveal requires explicit confirmation
    if (targetRung === 5 && !body.confirmReveal) {
      throw new ApiError('REVEAL_NOT_CONFIRMED', 'Reveal requires explicit confirmation.');
    }

    session.highest = targetRung;

    switch (targetRung) {
      case 1:
        responseMsg = {
          rung: 1,
          message: exercise.coach.think.question,
        };
        break;
      case 2:
        responseMsg = {
          rung: 2,
          message: exercise.coach.hint,
        };
        break;
      case 3:
        responseMsg = {
          rung: 3,
          message: exercise.coach.explain,
        };
        break;
      case 4:
        responseMsg = {
          rung: 4,
          message: exercise.coach.example.message,
        };
        break;

      case 5:
        responseMsg = {
          rung: 5,
          message: exercise.coach.reveal.message,
          codeBlock: exercise.coach.reveal.codeBlock,
        };
        break;
    }

    session.log.push(responseMsg);
    return {
      ...responseMsg,
      ladder: makeLadder(session.highest),
    };
  },

  async complete(id: string, results: TestResult[]): Promise<Completion> {
    await wait();
    const { session, exercise } = getSessionOrThrow(id);

    const hasFailing = results.length > 0 && results.some((r) => r.status !== 'pass');
    if (hasFailing) {
      throw new ApiError('TESTS_FAILING', 'All test cases must pass before completing.');
    }

    const rank = RANKS[session.highest] ?? 'D';
    const xp = session.highest === 0 ? 100 : (XP_TABLE[session.highest - 1] ?? 15);
    const rematchRequired = session.highest === 5;

    // Find next unlocked exercises
    const currIdx = EXERCISES.findIndex((e) => e.id === exercise.id);
    const unlockedExercises: string[] = [];
    if (currIdx !== -1 && currIdx + 1 < EXERCISES.length) {
      unlockedExercises.push(EXERCISES[currIdx + 1]!.id);
    }
    if (rematchRequired && exercise.rematchVariantId) {
      unlockedExercises.push(exercise.rematchVariantId);
    }

    // Dynamic rank calculations using the real leaderboard
    let rankBefore = 13;
    let rankAfter = 12;

    try {
      const { useLeaderboardStore } = await import('../../stores/leaderboardStore');
      const { useProfileStore } = await import('../../stores/profileStore');
      const prof = useProfileStore.getState();
      const lb = useLeaderboardStore.getState();

      const beforeList = lb.getCourseLeaderboard({ playerId: session.playerId });
      const currentEntry = beforeList.find((e) => e.isYou || e.playerId === session.playerId);
      rankBefore = currentEntry ? currentEntry.rank : beforeList.length;

      // Register the clear in the persistent leaderboard store
      lb.recordExerciseCompletion({
        exerciseId: exercise.id,
        playerId: session.playerId,
        initials: prof.initials || 'YOU',
        avatar: prof.avatar || 'avatar-hero',
        level: Math.max(1, 1 + Math.floor((prof.xp + xp) / 200)),
        rank,
        xp,
        highestRung: session.highest,
        completedAt: new Date().toISOString(),
        courseId: 'javascript',
        isYou: true,
      });

      const afterList = lb.getCourseLeaderboard({ playerId: session.playerId });
      const updatedEntry = afterList.find((e) => e.isYou || e.playerId === session.playerId);
      rankAfter = updatedEntry ? updatedEntry.rank : Math.max(1, rankBefore - (rank === 'S' ? 2 : 1));
    } catch {
      // Fallback calculation if stores not initialized
      rankBefore = 14;
      rankAfter = session.highest <= 1 ? 11 : 13;
    }

    return {
      rank,
      xp,
      rematchRequired,
      leaderboard: {
        rankBefore,
        rankAfter,
      },
      unlockedExercises,
    };
  },

  async getLeaderboard(params: {
    courseId?: 'javascript' | 'python' | 'all';
    tab?: 'xp' | 'independence' | 'sRank';
    period?: 'all' | 'week';
    track?: 'mine' | 'all';
    playerId?: string;
  }): Promise<LeaderboardEntry[]> {
    await wait();
    try {
      const { useLeaderboardStore } = await import('../../stores/leaderboardStore');
      return useLeaderboardStore.getState().getCourseLeaderboard(params);
    } catch {
      return buildLeaderboard(params as any);
    }
  },

  async getExerciseLeaderboard(exerciseId: string, playerId?: string) {
    await wait();
    try {
      const { useLeaderboardStore } = await import('../../stores/leaderboardStore');
      return useLeaderboardStore.getState().getExerciseLeaderboard(exerciseId, playerId);
    } catch {
      const { buildExerciseLeaderboard } = await import('./leaderboard');
      return buildExerciseLeaderboard(exerciseId, null);
    }
  },


  async getReport(playerId: string): Promise<ProgressReport> {
    await wait();
    return {
      player: {
        initials: playerId.slice(0, 3).toUpperCase() || 'YOU',
        avatar: 'avatar-hero',
        level: 3,
        totalXp: 380,
      },
      rankDistribution: {
        S: 2,
        A: 1,
        B: 1,
        C: 0,
        D: 1,
      },
      conceptIndependence: [
        {
          concept: 'Variables',
          exercisesCleared: 2,
          maxRungs: [0, 1],
          avgIndependence: 95,
        },
        {
          concept: 'Conditions',
          exercisesCleared: 2,
          maxRungs: [1, 2],
          avgIndependence: 85,
        },
        {
          concept: 'Loops',
          exercisesCleared: 2,
          maxRungs: [2, 5],
          avgIndependence: 60,
        },
      ],
      coachInsight:
        'You demonstrate strong autonomy on fundamental Variables and Conditions. Loops required hints and one Reveal, which is completely natural for beginners. Continue practicing loop boundaries!',
    };
  },
};
