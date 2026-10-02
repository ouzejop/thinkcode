import type { CourseInfo } from '../types';

export const COURSES: CourseInfo[] = [
  {
    id: 'javascript',
    title: 'JavaScript Fundamentals',
    tagline: 'Master variables, conditions, and loops with interactive problem-solving.',
    exerciseCount: 6,
    available: true,
    language: 'javascript',
  },
  {
    id: 'python',
    title: 'Python Core',
    tagline: 'Learn Python syntax, list comprehensions, and functional idioms.',
    exerciseCount: 8,
    available: false, // Coming soon
    language: 'python',
  },
];
