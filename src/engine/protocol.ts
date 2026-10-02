import type { TestCase, TestResult } from '../api/types';

export interface RunRequest { code: string; entryPoint: string; tests: TestCase[] }
export type WorkerIn = { type: 'run' } & RunRequest;
export type WorkerOut = { type: 'result'; result: TestResult } | { type: 'done' };
