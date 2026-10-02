export type LedState = 'pass' | 'fail' | 'off';

// 5x5 glyphs (check, cross, ring): the state never relies on colour alone.
const GLYPHS: Record<LedState, [number, number][]> = {
  pass: [[0, 2], [1, 3], [2, 2], [3, 1], [4, 0]],
  fail: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [4, 0], [3, 1], [1, 3], [0, 4]],
  off: [[1, 0], [2, 0], [3, 0], [0, 1], [4, 1], [0, 2], [4, 2], [0, 3], [4, 3], [1, 4], [2, 4], [3, 4]],
};
const NAME: Record<LedState, string> = { pass: 'passed', fail: 'failed', off: 'not run' };

export function Led({ state, label }: { state: LedState; label: string }) {
  return (
    <span role="img" aria-label={`${label}: ${NAME[state]}`} className={`led led-${state} zone-touch`}>
      <svg viewBox="0 0 5 5" width="16" height="16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
        {GLYPHS[state].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
        ))}
      </svg>
    </span>
  );
}
