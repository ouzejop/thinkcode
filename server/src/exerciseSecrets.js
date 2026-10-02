/**
 * Exercise data store — server-side only.
 * Contains solutions and coaching data that MUST NEVER be sent to the frontend.
 *
 * This mirrors the exercise definitions from the frontend mock,
 * but only the parts needed for guardrails (solution + coach).
 */

const EXERCISE_SECRETS = {
  'vars-sum': {
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
      },
    },
  },

  'vars-greet': {
    solution: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\n`,
    coach: {
      think: {
        question: 'How do you combine a fixed text like "Hello, " with a dynamic variable in JavaScript?',
        followUp: 'Good. You can either use string concatenation with `+` or backticks with template expressions `${}`.',
      },
      hint: "You need a return statement with a string. Don't forget the comma, space, and exclamation mark!",
      explain: 'Template literals enclosed by backtick characters (`` ` ``) allow embedded expressions using `${expression}`. Alternatively, string concatenation with `+` joins string values.',
      example: {
        message: 'Here is a function that says goodbye using template literals:',
        codeBlock: `// Example: Template literal greeting\nfunction farewell(user) {\n  return \`Farewell, \${user}.\`;\n}`,
      },
      reveal: {
        message: 'Here is the complete solution using template literals for readability.',
        codeBlock: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}`,
      },
    },
  },

  'cond-pass': {
    solution: `function checkGrade(score) {\n  if (score >= 80) {\n    return "Distinction";\n  } else if (score >= 50) {\n    return "Pass";\n  } else {\n    return "Retry";\n  }\n}\n`,
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

  'cond-fizz': {
    solution: `function fizzBuzzLite(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}\n`,
    coach: {
      think: {
        question: 'What happens if you check `n % 3 === 0` before checking both 3 and 5 for a number like 15?',
        followUp: 'Exactly! 15 is divisible by 3, so checking 3 first would return "Fizz" prematurely.',
      },
      hint: 'The modulo operator `%` gives the remainder. When `n % 3 === 0`, `n` is divisible by 3. Check the most restrictive case first!',
      explain: 'In branching logic where one condition is a subset of another (divisible by both 3 and 5), the compound condition must be evaluated first.',
      example: {
        message: 'Checking divisibility by multiple factors:',
        codeBlock: `function classify(n) {\n  if (n % 2 === 0 && n % 3 === 0) return "both";\n  if (n % 2 === 0) return "two";\n  return "none";\n}`,
      },
      reveal: {
        message: 'Here is the complete conditional ladder checking 15 first.',
        codeBlock: `function fizzBuzzLite(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}`,
      },
    },
  },

  'loops-vowels': {
    solution: `function countVowels(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}\n`,
    coach: {
      think: {
        question: 'Notice that "apple" returns 1 instead of 2, but "sky" passes. What character in "apple" is being missed?',
        followUp: 'Spot on! The first character "a" is skipped. What is the index of the first character of a string in JavaScript?',
      },
      hint: 'Inspect how the loop counter variable is initialized in the for loop declaration.',
      explain: 'JavaScript arrays and strings are zero-indexed. The very first character is located at index 0, not index 1.',
      example: {
        message: 'Here is how to iterate across every character of a string from start to finish:',
        codeBlock: `// Correct string iteration starting at index 0\nfunction logAllChars(str) {\n  for (let i = 0; i < str.length; i++) {\n    console.log(str[i]);\n  }\n}`,
      },
      reveal: {
        message: 'The loop started at `i = 1`, skipping the first letter. Changing it to `i = 0` fixes the bug.',
        codeBlock: `function countVowels(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}`,
      },
    },
  },

  'loops-double': {
    solution: `function doubleAll(nums) {\n  const out = [];\n  for (const n of nums) {\n    out.push(n * 2);\n  }\n  return out;\n}\n`,
    coach: {
      think: {
        question: 'How would you visit each number once? Which loop constructs in JavaScript do you know?',
        followUp: 'Good choices. Both `for...of` and standard `for (let i = 0; i < ...)` work well.',
      },
      hint: 'You need to read every element from `nums` and append its doubled value into `out` using `.push()`.',
      explain: 'A `for...of` loop creates a loop iterating over iterable objects.',
      example: {
        message: 'Here is an example building an uppercase array:',
        codeBlock: `function uppercaseAll(words) {\n  const out = [];\n  for (const w of words) {\n    out.push(w.toUpperCase());\n  }\n  return out;\n}`,
      },
      reveal: {
        message: 'Iterate through `nums` using `for...of` and push `n * 2` into `out`.',
        codeBlock: `function doubleAll(nums) {\n  const out = [];\n  for (const n of nums) {\n    out.push(n * 2);\n  }\n  return out;\n}`,
      },
    },
  },

  'loops-rematch': {
    solution: `function countConsonants(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (!vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}\n`,
    coach: {
      think: {
        question: 'Look at the test for "think". It returned 3 instead of 4. Which character was skipped?',
        followUp: 'The last letter "k" was skipped! Why did the loop stop before reaching the end?',
      },
      hint: 'Check the condition in the loop header: `i < str.length - 1`. Does that reach the final character?',
      explain: 'If a string has length 5, its indices are 0-4. `i < 5 - 1` means `i < 4`, stopping at index 3.',
      example: {
        message: 'Proper boundary for a string loop:',
        codeBlock: `for (let i = 0; i < str.length; i++) {\n  // visits indices 0 through str.length - 1\n}`,
      },
      reveal: {
        message: 'Replace `i < str.length - 1` with `i < str.length` to include the last letter.',
        codeBlock: `function countConsonants(str) {\n  const vowels = "aeiou";\n  let count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (!vowels.includes(str[i])) {\n      count++;\n    }\n  }\n  return count;\n}`,
      },
    },
  },
};

/**
 * Get the secret data (solution + coach) for an exercise.
 * Returns null if the exercise is not found.
 */
export function getExerciseSecrets(exerciseId) {
  return EXERCISE_SECRETS[exerciseId] || null;
}

export { EXERCISE_SECRETS };
