import { describe, expect, it } from 'vitest';
import type { TestResult } from '../api/types';
import { executeTests } from './runner.core';

const run = (code: string): TestResult => {
  const out: TestResult[] = [];
  executeTests(code, 'f', [{ id: 't', label: 't', args: [2], expected: 4 }], (r) => out.push(r));
  return out[0]!;
};

describe('executeTests', () => {
  it('passes and captures console.log', () => {
    const r = run('function f(x) { console.log("hi", x); return x * 2; }');
    expect(r.status).toBe('pass');
    expect(r.logs).toEqual(['hi 2']);
  });
  it('fails with actual vs expected', () => {
    const r = run('function f(x) { return x + 1; }');
    expect(r).toMatchObject({ status: 'fail', actual: 3, expected: 4 });
  });
  it('reports runtime errors', () => {
    expect(run('function f() { throw new TypeError("boom"); }')).toMatchObject({ status: 'error' });
  });
  it('reports syntax errors and missing entry point', () => {
    expect(run('function f( {').status).toBe('error');
    expect(run('const g = 1;').message).toContain('not defined');
  });
  it('masks fetch', () => {
    expect(run('function f() { return typeof fetch; }').actual).toBe('undefined');
  });
  // The infinite-loop case needs a real Worker: covered by the runTests watchdog (browser).
});
