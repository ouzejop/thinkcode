import type { TestCase, TestResult } from '../api/types';

const msg = (e: unknown) => (e instanceof Error ? `${e.name}: ${e.message}` : String(e));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const plain = (v: unknown) => (typeof v === 'function' ? String(v) : v);

/** Pure runner (worker-agnostic, so Vitest can drive it). fetch/XHR/importScripts are shadowed. */
export function executeTests(
  code: string,
  entryPoint: string,
  tests: TestCase[],
  emit: (r: TestResult) => void,
): void {
  const logs: string[] = [];
  const con = { log: (...a: unknown[]) => void logs.push(a.map(String).join(' ')) };
  let fn: unknown;
  let failure: string | undefined;
  try {
    if (!/^[A-Za-z_$][\w$]*$/.test(entryPoint)) throw new Error('Invalid entry point');
    fn = new Function(
      'console', 'fetch', 'XMLHttpRequest', 'importScripts',
      `"use strict";\n${code}\n;return typeof ${entryPoint} === 'function' ? ${entryPoint} : undefined;`,
    )(con, undefined, undefined, undefined);
    if (typeof fn !== 'function') failure = `${entryPoint} is not defined`;
  } catch (e) {
    failure = msg(e);
  }
  for (const t of tests) {
    const base = { id: t.id, label: t.label, expected: t.expected };
    if (failure !== undefined) {
      emit({ ...base, status: 'error', message: failure, logs: [] });
      continue;
    }
    logs.length = 0;
    try {
      const actual = plain((fn as (...a: unknown[]) => unknown)(...t.args));
      emit({ ...base, status: same(actual, t.expected) ? 'pass' : 'fail', actual, logs: [...logs] });
    } catch (e) {
      emit({ ...base, status: 'error', message: msg(e), logs: [...logs] });
    }
  }
}
