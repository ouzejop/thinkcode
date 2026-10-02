import { describe, expect, it } from 'vitest';
import { evaluatePlacement } from '../../api/mock/placement';
import { useOnboardingStore } from '../../stores/onboardingStore';

describe('onboarding flow', () => {
  it('starts at step 1 and validates initials', () => {
    const s = useOnboardingStore.getState();
    s.resetOnboarding();
    expect(useOnboardingStore.getState().step).toBe(1);

    useOnboardingStore.getState().setInitials('abc45!');
    expect(useOnboardingStore.getState().initials).toBe('ABC');
  });

  it('steps through 1 to 5', () => {
    const s = useOnboardingStore.getState();
    s.resetOnboarding();
    s.setInitials('ADA');
    s.nextStep();
    expect(useOnboardingStore.getState().step).toBe(2);

    s.setCourseId('javascript');
    s.nextStep();
    expect(useOnboardingStore.getState().step).toBe(3);

    s.setSelfLevel('basics');
    s.nextStep();
    expect(useOnboardingStore.getState().step).toBe(4);

    s.nextStep();
    expect(useOnboardingStore.getState().step).toBe(5);
  });

  it('evaluates placement test accurately', () => {
    // 0 correct -> newcomer
    expect(evaluatePlacement({})).toBe('newcomer');

    // 1-2 correct -> basics
    expect(evaluatePlacement({ 'pq-1': 'opt-a' })).toBe('basics');
    expect(evaluatePlacement({ 'pq-1': 'opt-a', 'pq-2': 'opt-b' })).toBe('basics');

    // 3 correct -> confident
    expect(
      evaluatePlacement({
        'pq-1': 'opt-a',
        'pq-2': 'opt-b',
        'pq-3': 'opt-b',
      }),
    ).toBe('confident');
  });
});
