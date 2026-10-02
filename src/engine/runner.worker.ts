import type { WorkerIn, WorkerOut } from './protocol';
import { executeTests } from './runner.core';

// UX guard, not a security sandbox.
for (const k of ['fetch', 'XMLHttpRequest', 'importScripts']) {
  try {
    Object.defineProperty(self, k, { value: undefined, configurable: true });
  } catch {
    /* non-configurable: the shadowing inside executeTests still applies */
  }
}

const post = (m: WorkerOut) => self.postMessage(m);

self.onmessage = (e: MessageEvent<WorkerIn>) => {
  const { code, entryPoint, tests } = e.data;
  executeTests(code, entryPoint, tests, (result) => post({ type: 'result', result }));
  post({ type: 'done' });
};
