import type { Exercise } from '../types';

export interface ExerciseData extends Exercise {
  solution: string;
  coach: {
    think: {
      question: string;
      followUp: string;
    };
    hint: string;
    explain: string;
    example: {
      message: string;
      codeBlock: string;
    };
    reveal: {
      message: string;
      codeBlock: string;
      faultyLineNumber?: number;
    };
  };
}

export const EXERCISES: ExerciseData[] = [
  // 1. Variables - fix_bug
  {
    id: 'vars-sum',
    title: 'Broken adder',
    concept: 'Variables',
    kind: 'fix_bug',
    difficulty: 1,
    brief: 'The function `add(a, b)` should return the sum of its two parameters. Run the tests to see what is failing.',
    starterCode: `function add(a, b) {\n  return a - b;\n}\n`,
    entryPoint: 'add',
    tests: [
      { id: 't1', label: 'add(2, 3) = 5', args: [2, 3], expected: 5 },
      { id: 't2', label: 'add(-1, 1) = 0', args: [-1, 1], expected: 0 },
      { id: 't3', label: 'add(0, 0) = 0', args: [0, 0], expected: 0 },
      { id: 't4', label: 'add(10, -5) = 5', args: [10, -5], expected: 5 },
    ],
    solution: `function add(a, b) {\n  return a + b;\n}\n`,
    coach: {
      think: {
        question: 'When you run `add(2, 3)`, what does it return right now, and what mathematical operation was performed?',
        followUp: 'Exactly. Think about which operator in JavaScript produces addition instead.',
      },
      hint: 'Look closely at the arithmetic operator on the return line. Does minus add values together?',
      explain: 'In JavaScript, arithmetic operators dictate how numerical variables combine. The `+` operator adds operands together, whereas `-` calculates the difference.',
      example: {
        message: 'Here is a multiplication helper function showing how arithmetic operators operate on parameters:',
        codeBlock: `// Example: Multiplying two numbers\nfunction multiply(x, y) {\n  return x * y;\n}`,
      },
      reveal: {
        message: 'The `-` operator was used instead of `+`. Replacing it yields the correct addition.',
        codeBlock: `function add(a, b) {\n  return a + b;\n}`,
        faultyLineNumber: 2,
      },
    },
  },

  // 2. Variables - complete
  {
    id: 'vars-greet',
    title: 'Polite greeter',
    concept: 'Variables',
    kind: 'complete',
    difficulty: 1,
    brief: 'Implement `greet(name)` to return a personalized greeting string: `"Hello, " + name + "!"` (or using a template literal).',
    starterCode: `function greet(name) {\n  // Return "Hello, <name>!"\n}\n`,
    entryPoint: 'greet',
    tests: [
      { id: 't1', label: 'greet("Ada") = "Hello, Ada!"', args: ['Ada'], expected: 'Hello, Ada!' },
      { id: 't2', label: 'greet("World") = "Hello, World!"', args: ['World'], expected: 'Hello, World!' },
      { id: 't3', label: 'greet("ThinkCode") = "Hello, ThinkCode!"', args: ['ThinkCode'], expected: 'Hello, ThinkCode!' },
    ],
    solution: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\n`,
    coach: {
      think: {
        question: 'How do you combine a fixed text like "Hello, " with a dynamic variable in JavaScript?',
        followUp: 'Good. You can either use string concatenation with `+` or backticks with template expressions `${}`.',
      },
      hint: 'You need a return statement with a string. Don’t forget the comma, space, and exclamation mark!',
      explain: 'Template literals enclosed by backtick characters (`` ` ``) allow embedded expressions using `${expression}`. Alternatively, string concatenation with `+` joins string values.',
      example: {
        message: 'Here is a function that says goodbye using template literals:',
        codeBlock: `// Example: Template literal greeting\nfunction farewell(user) {\n  return \`Farewell, \${user}.\`;\n}`,
      },
      reveal: {
        message: 'Here is the complete solution using template literals for readability.',
        codeBlock: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}`,
        faultyLineNumber: 2,
      },
    },
  },

  // 3. Conditions - predict
  {
    id: 'cond-pass',
    title: 'Grade check',
    concept: 'Conditions',
    kind: 'predict',
    difficulty: 1,
    brief: 'Analyze the code below. What does `checkGrade(55)` return? Predict the exact string output without running it first.',
    starterCode: `function checkGrade(score) {\n  if (score >= 80) {\n    return "Distinction";\n  } else if (score >= 50) {\n    return "Pass";\n  } else {\n    return "Retry";\n  }\n}\n`,
    entryPoint: 'checkGrade',
    predictOptions: ['"Distinction"', '"Pass"', '"Retry"', 'undefined'],
    predictAnswer: 'Pass',
    tests: [
      { id: 't1', label: 'checkGrade(55) = "Pass"', args: [55], expected: 'Pass' },
      { id: 't2', label: 'checkGrade(90) = "Distinction"', args: [90], expected: 'Distinction' },
      { id: 't3', label: 'checkGrade(30) = "Retry"', args: [30], expected: 'Retry' },
    ],
    solution: `function checkGrade(score) {\n  if (score >= 80) {\n    return "Pass";\n  } else if (score >= 50) {\n    return "Pass";\n  } else {\n    return "Retry";\n  }\n}\n`,
    coach: {
      think: {
        question: 'When score is 55, is `55 >= 80` true or false? Where does the execution flow go next?',
        followUp: 'Right on. It skips the first branch and checks the `else if (score >= 50)`.',
      },
      hint: 'Trace the condition branches sequentially from top to bottom. The first condition that evaluates to true executes its return statement.',
      explain: 'An `if...else if...else` chain evaluates conditions sequentially. As soon as a branch tests truthy, its block executes and the chain terminates.',
      example: {
        message: 'Here is how a speed check branch behaves:',
        codeBlock: `function checkSpeed(speed) {\n  if (speed > 100) return "Fast";\n  if (speed > 50) return "Normal";\n  return "Slow";\n}`,
      },
      reveal: {
        message: 'Since 55 is not >= 80, but 55 >= 50 is true, the function returns "Pass".',
        codeBlock: `// Evaluates 55 >= 50 -> returns "Pass"\ncheckGrade(55) === "Pass"`,
      },
    },
  },

  // 4. Conditions - complete
  {
    id: 'cond-fizz',
    title: 'FizzBuzz Lite',
    concept: 'Conditions',
    kind: 'complete',
    difficulty: 2,
    brief: 'Write `fizzBuzzLite(n)`. If `n` is divisible by 3 and 5, return `"FizzBuzz"`. If only by 3, return `"Fizz"`. If only by 5, return `"Buzz"`. Otherwise return `String(n)`.',
    starterCode: `function fizzBuzzLite(n) {\n  // Your conditional logic here\n}\n`,
    entryPoint: 'fizzBuzzLite',
    tests: [
      { id: 't1', label: 'fizzBuzzLite(15) = "FizzBuzz"', args: [15], expected: 'FizzBuzz' },
      { id: 't2', label: 'fizzBuzzLite(9) = "Fizz"', args: [9], expected: 'Fizz' },
      { id: 't3', label: 'fizzBuzzLite(10) = "Buzz"', args: [10], expected: 'Buzz' },
      { id: 't4', label: 'fizzBuzzLite(7) = "7"', args: [7], expected: '7' },
    ],
    solution: `function fizzBuzzLite(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}\n`,
    coach: {
      think: {
        question: 'What happens if you check `n % 3 === 0` before checking both 3 and 5 for a number like 15?',
        followUp: 'Exactly! 15 is divisible by 3, so checking 3 first would return "Fizz" prematurely.',
      },
      hint: 'The modulo operator `%` gives the remainder. When `n % 3 === 0`, `n` is divisible by 3. Check the most restrictive case first!',
      explain: 'In branching logic where one condition is a subset of another (divisible by both 3 and 5), the compound condition must be evaluated first or combined.',
      example: {
        message: 'Checking divisibility by multiple factors:',
        codeBlock: `function classify(n) {\n  if (n % 2 === 0 && n % 3 === 0) return "both";\n  if (n % 2 === 0) return "two";\n  return "none";\n}`,
      },
      reveal: {
        message: 'Here is the complete conditional ladder checking 15 first.',
        codeBlock: `function fizzBuzzLite(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}`,
        faultyLineNumber: 2,
      },
    },
  },

  // 5. Loops - fix_bug (THE SHOWCASE EXERCISE)
  {
    id: 'loops-vowels',
    title: 'Count the vowels',
    concept: 'Loops',
    kind: 'fix_bug',
    difficulty: 2,
    brief: '`countVowels(str)` should count the lowercase vowels (a, e, i, o, u) in a string. But words starting with a vowel seem to be undercounted!',
    starterCode: `function countVowels(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 1; i < str.length; i++) {\n    if (vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}\n`,
    entryPoint: 'countVowels',
    rematchVariantId: 'loops-rematch',
    tests: [
      { id: 't1', label: 'countVowels("sky") = 0', args: ['sky'], expected: 0 },
      { id: 't2', label: 'countVowels("apple") = 2', args: ['apple'], expected: 2 },
      { id: 't3', label: 'countVowels("queue") = 4', args: ['queue'], expected: 4 },
      { id: 't4', label: 'countVowels("audio") = 4', args: ['audio'], expected: 4 },
    ],
    solution: `function countVowels(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}\n`,
    coach: {
      think: {
        question: 'Notice that "apple" returns 1 instead of 2, but "sky" passes. What character in "apple" is being missed?',
        followUp: 'Spot on! The first character "a" is skipped. What is the index of the first character of a string in JavaScript?',
      },
      hint: 'Inspect how the loop counter variable is initialized in the for loop declaration.',
      explain: 'JavaScript arrays and strings are zero-indexed. The very first character is located at index 0, not index 1. Initializing `let i = 1` skips the initial character.',
      example: {
        message: 'Here is how to iterate across every character of a string from start to finish:',
        codeBlock: `// Correct string iteration starting at index 0\nfunction logAllChars(str) {\n  for (let i = 0; i < str.length; i++) {\n    console.log(str[i]);\n  }\n}`,
      },
      reveal: {
        message: 'The loop started at `i = 1`, skipping the first letter of every string. Changing it to `i = 0` fixes the bug.',
        codeBlock: `function countVowels(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}`,
        faultyLineNumber: 4,
      },
    },
  },

  // 6. Loops - complete
  {
    id: 'loops-double',
    title: 'Double trouble',
    concept: 'Loops',
    kind: 'complete',
    difficulty: 1,
    brief: 'Fill in the loop so `doubleAll(nums)` returns a new array with every number doubled. Do not mutate the original array.',
    starterCode: `function doubleAll(nums) {\n  const out = [];\n  // your loop here\n  return out;\n}\n`,
    entryPoint: 'doubleAll',
    tests: [
      { id: 't1', label: '[1, 2, 3] -> [2, 4, 6]', args: [[1, 2, 3]], expected: [2, 4, 6] },
      { id: 't2', label: '[] -> []', args: [[]], expected: [] },
      { id: 't3', label: '[0, -5, 10] -> [0, -10, 20]', args: [[0, -5, 10]], expected: [0, -10, 20] },
    ],
    solution: `function doubleAll(nums) {\n  const out = [];\n  for (const n of nums) {\n    out.push(n * 2);\n  }\n  return out;\n}\n`,
    coach: {
      think: {
        question: 'How would you visit each number once? Which loop constructs in JavaScript do you know?',
        followUp: 'Good choices. Both `for...of` and standard `for (let i = 0; i < ...)` work well.',
      },
      hint: 'You need to read every element from `nums` and append its doubled value into `out` using `.push()`.',
      explain: 'A `for...of` loop creates a loop iterating over iterable objects, invoking a custom iteration hook with statements to be executed for the value of each distinct property.',
      example: {
        message: 'Here is an example building an uppercase array using a for...of loop:',
        codeBlock: `function uppercaseAll(words) {\n  const out = [];\n  for (const w of words) {\n    out.push(w.toUpperCase());\n  }\n  return out;\n}`,
      },
      reveal: {
        message: 'Iterate through `nums` using `for...of` and push `n * 2` into `out`.',
        codeBlock: `function doubleAll(nums) {\n  const out = [];\n  for (const n of nums) {\n    out.push(n * 2);\n  }\n  return out;\n}`,
        faultyLineNumber: 3,
      },
    },
  },

  // 7. Rematch Variant for loops-vowels
  {
    id: 'loops-rematch',
    title: 'Rematch: Count the consonants',
    concept: 'Loops',
    kind: 'fix_bug',
    difficulty: 2,
    brief: 'Rematch challenge! Fix `countConsonants(str)` so it counts non-vowel letters correctly in lowercase words. Pay attention to loop boundaries!',
    starterCode: `function countConsonants(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length - 1; i++) {\n    if (!vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}\n`,
    entryPoint: 'countConsonants',
    tests: [
      { id: 't1', label: 'countConsonants("code") = 2', args: ['code'], expected: 2 },
      { id: 't2', label: 'countConsonants("think") = 4', args: ['think'], expected: 4 },
      { id: 't3', label: 'countConsonants("arcade") = 3', args: ['arcade'], expected: 3 },
    ],
    solution: `function countConsonants(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (!vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}\n`,
    coach: {
      think: {
        question: 'Look at the test for "think". It returned 3 instead of 4. Which character was skipped?',
        followUp: 'The last letter "k" was skipped! Why did the loop stop before reaching the end of the string?',
      },
      hint: 'Check the condition in the loop header: `i < str.length - 1`. Does that reach the final character?',
      explain: 'If a string has length 5, its indices are 0, 1, 2, 3, 4. The condition `i < 5 - 1` means `i < 4`, which stops at index 3, skipping the last character.',
      example: {
        message: 'Proper boundary for a string loop:',
        codeBlock: `for (let i = 0; i < str.length; i++) {\n  // visits indices 0 through str.length - 1\n}`,
      },
      reveal: {
        message: 'Replace `i < str.length - 1` with `i < str.length` to include the last letter.',
        codeBlock: `function countConsonants(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (!vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}`,
        faultyLineNumber: 4,
      },
    },
  },
];
