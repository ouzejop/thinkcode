import type { TestResult } from '../api/types';
import type { RunRequest, WorkerIn, WorkerOut } from './protocol';

interface Options { perTestMs?: number; totalMs?: number; onResult?: (r: TestResult) => void }

/**
 * A synchronous infinite loop cannot be interrupted from inside the worker, so the watchdog lives
 * here: no result within perTestMs (or totalMs overall) -> terminate(); unfinished tests = timeout.
 * Each run uses a fresh worker, so a killed one never needs repairing.
 */
export function runTests(req: RunRequest, opts: Options = {}): Promise<TestResult[]> {
  const { perTestMs = 2000, totalMs = 5000, onResult } = opts;
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
    const results: TestResult[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cap: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(cap);
      worker.terminate();
      for (const t of req.tests.slice(results.length)) {
        const r: TestResult = {
          id: t.id, label: t.label, status: 'timeout', expected: t.expected,
          message: 'Timed out (2 s). Is there an infinite loop?', logs: [],
        };
        results.push(r);
        onResult?.(r);
      }
      resolve(results);
    };
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(finish, perTestMs);
    };

    cap = setTimeout(finish, totalMs);
    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      if (e.data.type === 'done') return finish();
      results.push(e.data.result);
      onResult?.(e.data.result);
      arm();
    };
    worker.onerror = finish;
    arm();
    worker.postMessage({ type: 'run', ...req } satisfies WorkerIn);
  });
}
