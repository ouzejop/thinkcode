import fs from 'fs';
import path from 'path';
import vm from 'vm';
import ts from 'typescript';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    passed++;
  }
}

const moduleCache = new Map();

function requireTs(filePath) {
  const absolutePath = path.resolve(filePath.endsWith('.ts') ? filePath : `${filePath}.ts`);
  if (moduleCache.has(absolutePath)) {
    return moduleCache.get(absolutePath).exports;
  }

  const source = fs.readFileSync(absolutePath, 'utf-8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const moduleObj = { exports: {} };
  moduleCache.set(absolutePath, moduleObj);

  const localRequire = (id) => {
    if (id.startsWith('.')) {
      const target = path.resolve(path.dirname(absolutePath), id);
      return requireTs(target);
    }
    return import(id);
  };

  const context = vm.createContext({
    module: moduleObj,
    exports: moduleObj.exports,
    require: localRequire,
    console,
    Buffer,
    setTimeout,
    clearTimeout,
    crypto,
    Map,
    Set,
    Object,
    Array,
    String,
    Number,
    Math,
    Error,
    TypeError,
    JSON,
    RegExp,
  });

  const fn = vm.runInContext(`(function(module, exports, require) {\n${transpiled.outputText}\n})`, context);
  fn(moduleObj, moduleObj.exports, localRequire);

  return moduleObj.exports;
}

console.log('--- THINKCODE TEST & INTEGRITY VERIFICATION ---');

// 1. Contrast Test
console.log('\n[1/7] Testing Theme Contrast Ratios...');
const themesCss = fs.readFileSync('src/styles/themes.css', 'utf-8');
const lin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}
function contrast(a, b) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function parseTokens(theme) {
  const block = new RegExp(`\\[data-theme='${theme}'\\][^{]*\\{([^}]*)\\}`).exec(themesCss)?.[1] ?? '';
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]])
  );
}

const RULES = [
  ['ink', 'bg', 7],
  ['ink', 'surface', 7],
  ['ink-soft', 'bg', 4.5],
  ['ink-soft', 'surface', 4.5],
  ['ink-soft', 'surface-sunken', 4.5],
  ['primary', 'surface', 4.5],
  ['primary', 'surface-sunken', 4.5],
  ['on-primary', 'primary', 4.5],
  ['on-xp', 'xp', 7],
  ['pass', 'surface', 4.5],
  ['pass', 'surface-sunken', 4.5],
  ['fail', 'surface', 4.5],
  ['fail', 'surface-sunken', 4.5],
  ['on-status', 'pass', 4.5],
  ['on-status', 'fail', 4.5],
  ['border-control', 'surface', 3],
];

for (const theme of ['lavender', 'night']) {
  const t = parseTokens(theme);
  for (const [fg, bg, min] of RULES) {
    const ratio = contrast(t[fg], t[bg]);
    assert(
      ratio >= min,
      `${theme} ${fg} on ${bg} ratio ${ratio.toFixed(2)} must be >= ${min}:1`
    );
  }
}
console.log(`✓ All 30 theme contrast pairs satisfy strict accessibility thresholds.`);

// 2. Retro Style Levels Test
console.log('\n[2/7] Testing Retro Style CSS Rules...');
const retroCss = fs.readFileSync('src/styles/retro.css', 'utf-8');
const pixelVars = (level) => {
  const block = new RegExp(`\\[data-retro='${level}'\\]\\s*\\{([^}]*)\\}`).exec(retroCss)?.[1] ?? '';
  return [...block.matchAll(/(--font-[\w-]+):\s*([^;]+);/g)]
    .filter((m) => /pixel|press start/i.test(m[2] ?? ''))
    .map((m) => m[1])
    .sort();
};

assert(pixelVars('clean').length === 0, 'Clean style must have no pixel font variables');
const balancedVars = pixelVars('balanced');
assert(
  balancedVars.length === 2 && balancedVars.includes('--font-logo') && balancedVars.includes('--font-rank'),
  'Balanced style must only use pixel font for logo and rank badge'
);
assert(pixelVars('arcade').length > 2, 'Arcade style must allow pixel fonts across headers/labels/buttons');
console.log(`✓ Retro styles (Clean, Balanced, Arcade) strictly conform to specification.`);

// 3. Leaderboard Generation Test
console.log('\n[3/7] Testing Leaderboard Generation...');
const { buildLeaderboard } = requireTs('./src/api/mock/leaderboard.ts');
const list = buildLeaderboard({ tab: 'xp', period: 'all', track: 'all', player: null });
assert(list.length === 12, 'Leaderboard must contain 12 CPU players by default');
assert(list.every((e) => e.isDemo), 'All initial players must have isDemo: true');
assert(list[0].rank === 1 && list[0].xp >= list[1].xp, 'Leaderboard must be sorted descending by XP');

const withYou = buildLeaderboard({
  tab: 'xp',
  period: 'all',
  track: 'all',
  player: {
    playerId: 'usr-ada',
    initials: 'ADA',
    avatar: 'avatar-hero',
    level: 2,
    xp: 250,
    sRankCount: 2,
    independencePercent: 95,
    showOnLeaderboard: true,
  },
});
assert(withYou.length === 13, 'Leaderboard with player must have 13 entries');
const you = withYou.find((e) => e.isYou);
assert(you && you.initials === 'ADA' && !you.isDemo, 'YOU entry must be identified with isYou: true');
console.log(`✓ Leaderboard sorting and YOU entry placement verified.`);

// 4. Placement Evaluation Test
console.log('\n[4/7] Testing Placement Quiz Evaluation...');
const { evaluatePlacement } = requireTs('./src/api/mock/placement.ts');
assert(evaluatePlacement({}) === 'newcomer', '0 correct answers must evaluate to newcomer');
assert(evaluatePlacement({ 'pq-1': 'opt-a' }) === 'basics', '1 correct answer must evaluate to basics');
assert(
  evaluatePlacement({ 'pq-1': 'opt-a', 'pq-2': 'opt-b', 'pq-3': 'opt-b' }) === 'confident',
  '3 correct answers must evaluate to confident'
);
console.log(`✓ Placement evaluation logic verified.`);

// 5. Runner Core Execution Test
console.log('\n[5/7] Testing Pure Code Runner Core...');
const { executeTests } = requireTs('./src/engine/runner.core.ts');
const runCode = (code) => {
  const res = [];
  executeTests(code, 'f', [{ id: 't1', label: 't1', args: [5], expected: 10 }], (r) => res.push(r));
  return res[0];
};

assert(runCode('function f(x) { return x * 2; }').status === 'pass', 'Correct function must pass');
assert(runCode('function f(x) { return x + 1; }').status === 'fail', 'Incorrect function must fail');
assert(runCode('function f() { throw new Error("crash"); }').status === 'error', 'Runtime error must be caught');
assert(runCode('function f() { return typeof fetch; }').actual === 'undefined', 'fetch must be masked in runner');
console.log(`✓ Code execution sandbox and test assertions verified.`);

// 6. Ladder Reducer Test
console.log('\n[6/7] Testing Hint Ladder Reducer...');
const { ladderReducer, initialLadder, rungState } = requireTs('./src/features/workstation/ladder/ladderReducer.ts');
const step1 = ladderReducer(initialLadder, {
  type: 'help',
  res: {
    rung: 1,
    message: 'Think question',
    ladder: { highest: 1, next: 2, xpTable: [90, 75, 55, 40, 15], bonus: 90 },
  },
});
assert(step1.ladder.highest === 1, 'Ladder highest must be 1');
assert(rungState(step1, 1) === 'current', 'Rung 1 must be current');
assert(rungState(step1, 2) === 'next', 'Rung 2 must be next');
assert(rungState(step1, 3) === 'locked', 'Rung 3 must be locked');
console.log(`✓ Ladder state reducer and rung transitions verified.`);

// 7. Mock API Contract Compliance
console.log('\n[7/7] Testing mockApi Contract Compliance...');
const { mockApi } = requireTs('./src/api/mock/index.ts');

mockApi.getExercises().then(async (exercises) => {
  assert(exercises.length >= 6, 'Must provide at least 6 exercises');
  assert(!JSON.stringify(exercises).includes('a + b'), 'Solution must never leak in exercise list');

  const showcase = exercises.find((e) => e.title === 'Count the vowels');
  assert(showcase, 'Showcase exercise "Count the vowels" must be present');
  assert(showcase.tests.length === 4, '"Count the vowels" must contain 4 tests');

  const session = await mockApi.startSession(exercises[0].id, 'ADA');
  assert(session.ladder.highest === 0, 'New session must start at rung 0');

  // Test COOLDOWN when spammed
  let cooldownCaught = false;
  try {
    await mockApi.requestHelp(session.id, { code: '', testResults: [] });
    await mockApi.requestHelp(session.id, { code: '', testResults: [] });
  } catch (err) {
    if (err.code === 'COOLDOWN') cooldownCaught = true;
  }
  assert(cooldownCaught, 'COOLDOWN error must be thrown when asking help too rapidly');

  // Wait past cooldown to climb cleanly
  const waitCooldown = () => new Promise((res) => setTimeout(res, 550));
  await waitCooldown();

  // Step through remaining rungs 2-4
  for (let r = 2; r <= 4; r++) {
    await waitCooldown();
    const help = await mockApi.requestHelp(session.id, { code: '', testResults: [] });
    assert(help.rung === r, `Must reach rung ${r}`);
    assert(!help.codeBlock || r === 4, 'Codeblock must not contain solution before reveal');
  }

  await waitCooldown();
  // Attempt reveal without confirmReveal
  let revealError = null;
  try {
    await mockApi.requestHelp(session.id, { code: '', testResults: [] });
  } catch (err) {
    revealError = err;
  }
  assert(revealError && revealError.code === 'REVEAL_NOT_CONFIRMED', 'Reveal must require confirmation');

  // Confirmed reveal
  await waitCooldown();
  const reveal = await mockApi.requestHelp(session.id, { code: '', testResults: [], confirmReveal: true });
  assert(reveal.rung === 5, 'Rung 5 Reveal must succeed with confirmation');
  assert(reveal.codeBlock, 'Reveal must provide solution code block');

  const completion = await mockApi.complete(session.id, []);
  assert(completion.rank === 'D', 'Completion with Reveal must yield Rank D');
  assert(completion.rematchRequired === true, 'Completion with Reveal must enforce rematchRequired');
  console.log(`✓ mockApi strictly complies with the ThinkCode contract.`);

  console.log(`\n🎉 ALL 7/7 TEST SUITES PASSED (${passed} assertions, 0 failures)!`);
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ Uncaught error during verification:', err);
  process.exit(1);
});
