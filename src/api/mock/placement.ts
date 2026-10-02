import type { PlacementQuestion } from '../types';

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'pq-1',
    prompt: 'What does this function return when called with `getGreeting("Ada")`?',
    codeSnippet: `function getGreeting(name) {
  const prefix = "Hello, ";
  return prefix + name + "!";
}`,
    options: [
      { id: 'opt-a', text: '"Hello, Ada!"' },
      { id: 'opt-b', text: '"Hello, name!"' },
      { id: 'opt-c', text: 'undefined' },
      { id: 'opt-d', text: '"prefixAda!"' },
    ],
    correctOptionId: 'opt-a',
  },
  {
    id: 'pq-2',
    prompt: 'What is the output of `isAdult(17)`?',
    codeSnippet: `function isAdult(age) {
  if (age >= 18) {
    return true;
  } else {
    return false;
  }
}`,
    options: [
      { id: 'opt-a', text: 'true' },
      { id: 'opt-b', text: 'false' },
      { id: 'opt-c', text: '17' },
      { id: 'opt-d', text: 'TypeError' },
    ],
    correctOptionId: 'opt-b',
  },
  {
    id: 'pq-3',
    prompt: 'What will `sumArray([2, 4, 6])` return?',
    codeSnippet: `function sumArray(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}`,
    options: [
      { id: 'opt-a', text: '6' },
      { id: 'opt-b', text: '12' },
      { id: 'opt-c', text: '246' },
      { id: 'opt-d', text: '[2, 4, 6]' },
    ],
    correctOptionId: 'opt-b',
  },
];

export function evaluatePlacement(answers: Record<string, string>): 'newcomer' | 'basics' | 'confident' {
  let score = 0;
  for (const q of PLACEMENT_QUESTIONS) {
    if (answers[q.id] === q.correctOptionId) {
      score++;
    }
  }

  if (score === 0) return 'newcomer';
  if (score <= 2) return 'basics';
  return 'confident';
}
