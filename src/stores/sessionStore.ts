import { create } from 'zustand';
import type { Exercise, Session, TestResult } from '../api/types';
import {
  initialLadder,
  ladderReducer,
  type LadderAction,
  type LadderView,
} from '../features/workstation/ladder/ladderReducer';

interface SessionState {
  sessionId: string | null;
  exerciseId: string | null;
  exercise: Exercise | null;
  userCode: string;
  predictChoice: string;
  ladder: LadderView;
  testResults: TestResult[];
  consoleLogs: string[];
  isRunning: boolean;
  isCompleted: boolean;
  selectedRungReview: number | null; // when user clicks a previously used rung to review message

  // Actions
  start: (s: Session, ex: Exercise) => void;
  setUserCode: (code: string) => void;
  setPredictChoice: (choice: string) => void;
  dispatchLadder: (a: LadderAction) => void;
  setTestResults: (r: TestResult[]) => void;
  appendLogs: (logs: string[]) => void;
  setIsRunning: (running: boolean) => void;
  setIsCompleted: (completed: boolean) => void;
  setSelectedRungReview: (rung: number | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessionId: null,
  exerciseId: null,
  exercise: null,
  userCode: '',
  predictChoice: '',
  ladder: initialLadder,
  testResults: [],
  consoleLogs: [],
  isRunning: false,
  isCompleted: false,
  selectedRungReview: null,

  start: (s, ex) =>
    set({
      sessionId: s.id,
      exerciseId: s.exerciseId,
      exercise: ex,
      userCode: ex.starterCode,
      predictChoice: '',
      testResults: [],
      consoleLogs: ['Session started. Press F1 or Run to evaluate your code.'],
      isRunning: false,
      isCompleted: false,
      selectedRungReview: null,
      ladder: ladderReducer(initialLadder, { type: 'sync', session: s }),
    }),

  setUserCode: (userCode) => set({ userCode }),
  setPredictChoice: (predictChoice) => set({ predictChoice }),
  dispatchLadder: (a) => set((st) => ({ ladder: ladderReducer(st.ladder, a) })),
  setTestResults: (testResults) => set({ testResults }),
  appendLogs: (newLogs) => set((st) => ({ consoleLogs: [...st.consoleLogs, ...newLogs] })),
  setIsRunning: (isRunning) => set({ isRunning }),
  setIsCompleted: (isCompleted) => set({ isCompleted }),
  setSelectedRungReview: (selectedRungReview) => set({ selectedRungReview }),
  reset: () =>
    set({
      sessionId: null,
      exerciseId: null,
      exercise: null,
      userCode: '',
      predictChoice: '',
      ladder: initialLadder,
      testResults: [],
      consoleLogs: [],
      isRunning: false,
      isCompleted: false,
      selectedRungReview: null,
    }),
}));
