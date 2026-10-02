/**
 * Guardrails — Pedagogical safety layer for Socrate.
 *
 * Prevents the AI from leaking solutions at inappropriate rung levels.
 * Three defense layers:
 *   1. Prompt injection: tells the AI exactly what NOT to reveal
 *   2. Guided responses: injects the pre-written coach hints as "golden answers"
 *   3. Post-filter: scans AI output for solution code and censors it
 */

// ── 1. RUNG RULES ──────────────────────────────────────────────────

const RUNG_RULES = {
  0: {
    label: 'No help requested',
    allowCode: false,
    allowSolution: false,
    maxSimilarity: 0.3,
    instruction: `The student has NOT requested help via rungs. You can answer their question in a general manner, but DO NOT GIVE ANY CODE that solves the exercise. Ask questions to guide their reasoning.`,
  },
  1: {
    label: 'Reflection',
    allowCode: false,
    allowSolution: false,
    maxSimilarity: 0.3,
    instruction: `RUNG 1 — REFLECTION ONLY.
You must ask ONE open-ended question to guide reasoning.
FORBIDDEN: providing code, giving a direct hint, mentioning the exact operator/method/line of the bug.
Limit yourself to ONE 1-2 sentence question.`,
  },
  2: {
    label: 'Hint',
    allowCode: false,
    allowSolution: false,
    maxSimilarity: 0.4,
    instruction: `RUNG 2 — CONCEPTUAL HINT.
You can give a hint about the underlying CONCEPT.
FORBIDDEN: showing code, giving the solution, naming the exact line or operator to change.
Explain the concept in 2-3 sentences max.`,
  },
  3: {
    label: 'Explanation',
    allowCode: false,
    allowSolution: false,
    maxSimilarity: 0.5,
    instruction: `RUNG 3 — EXPLANATION.
You can explain the principle, syntax, and expected logic.
You may mention method names or operators in general.
FORBIDDEN: showing the complete solution, giving the exact code to write.`,
  },
  4: {
    label: 'Example',
    allowCode: true,
    allowSolution: false,
    maxSimilarity: 0.6,
    instruction: `RUNG 4 — SIMILAR EXAMPLE.
You can show a code example illustrating the SAME PATTERN but for a DIFFERENT exercise.
FORBIDDEN: giving the exact solution for the current exercise.
The example must be different enough that the student has to adapt the logic.`,
  },
  5: {
    label: 'Solution',
    allowCode: true,
    allowSolution: true,
    maxSimilarity: 1.0,
    instruction: `RUNG 5 — FULL SOLUTION.
You can now provide the complete, commented solution.
Explain every important line to maximize learning.`,
  },
};

// ── 2. PROMPT BUILDER ───────────────────────────────────────────────

/**
 * Build guardrail-enhanced system prompt.
 * Injects:
 *  - The solution as "forbidden knowledge" (unless rung 5)
 *  - The pre-written coach guidance as the "golden answer" to follow
 *  - Strict rung-specific rules
 */
export function buildGuardrailedPrompt(context) {
  const rung = context.currentRung || 0;
  const rules = RUNG_RULES[rung] || RUNG_RULES[0];
  const coachData = context.coachData;

  let solutionBlock = '';
  if (context.solution && rung < 5) {
    solutionBlock = `
⛔ EXERCISE SOLUTION (CONFIDENTIAL — NEVER REVEAL BEFORE RUNG 5):
\`\`\`
${context.solution}
\`\`\`
You have access to this solution ONLY to understand the exercise.
You must NEVER show it, paraphrase it into code, or provide code identical or near-identical to this solution.
If the student directly asks for the solution, politely decline and encourage them to move to the next rung.`;
  } else if (context.solution && rung === 5) {
    solutionBlock = `
✅ EXERCISE SOLUTION (RUNG 5 — REVEAL ALLOWED):
\`\`\`
${context.solution}
\`\`\`
You may now share this solution with the student and explain it clearly.`;
  }

  // Inject the golden answer from the coach data
  let goldenAnswer = '';
  if (coachData) {
    const rungKey = { 1: 'think', 2: 'hint', 3: 'explain', 4: 'example', 5: 'reveal' }[rung];
    if (rungKey && coachData[rungKey]) {
      const data = coachData[rungKey];
      if (typeof data === 'string') {
        goldenAnswer = `\n📋 REFERENCE ANSWER FOR THIS RUNG (take inspiration from this):\n${data}`;
      } else if (data.question) {
        goldenAnswer = `\n📋 REFERENCE ANSWER FOR THIS RUNG:\nQuestion to ask: "${data.question}"\nIf student answers: "${data.followUp}"`;
      } else if (data.message) {
        goldenAnswer = `\n📋 REFERENCE ANSWER FOR THIS RUNG:\n${data.message}`;
        if (data.codeBlock && rules.allowCode) {
          goldenAnswer += `\nExample code to show:\n\`\`\`\n${data.codeBlock}\n\`\`\``;
        }
      }
    }
  }

  return `You are Socrates, a compassionate programming coach on ThinkCode.

═══════════════════════════════════════════
RULES FOR RUNG ${rung} — ${rules.label}
═══════════════════════════════════════════
${rules.instruction}

EXERCISE CONTEXT:
- Title: ${context.exerciseTitle || 'Unknown'}
- Concept: ${context.concept || 'Unknown'}
- Type: ${context.kind || 'Unknown'}
- Statement: ${context.brief || 'No statement'}
- Starter code:
\`\`\`
${context.starterCode || '// No starter code'}
\`\`\`

STUDENT'S CURRENT CODE:
\`\`\`
${context.studentCode || '// No code submitted'}
\`\`\`

TEST RESULTS:
${context.testResults || 'No tests run'}
${solutionBlock}
${goldenAnswer}

GENERAL INSTRUCTIONS:
- ALWAYS respond in English.
- Be concise: 2-4 sentences max (except rungs 4-5 with code).
- Be encouraging without being patronizing.
- NEVER mention rungs, the hint system, or that you have access to the solution.
- Act as a natural tutor guiding the student.`;
}

// ── 3. POST-FILTER ──────────────────────────────────────────────────

/**
 * Normalize code for comparison: strip whitespace, comments, and case.
 */
function normalizeCode(code) {
  return code
    .replace(/\/\/.*$/gm, '')        // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ')            // Collapse whitespace
    .trim()
    .toLowerCase();
}

/**
 * Calculate rough similarity between two code strings.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
function codeSimilarity(a, b) {
  const na = normalizeCode(a);
  const nb = normalizeCode(b);

  if (na === nb) return 1;
  if (!na || !nb) return 0;

  // Longest Common Subsequence ratio
  const m = na.length;
  const n = nb.length;

  // For performance, use a simplified approach for long strings
  if (m > 500 || n > 500) {
    // Token-based comparison
    const tokensA = new Set(na.split(/\s+/));
    const tokensB = new Set(nb.split(/\s+/));
    let overlap = 0;
    for (const t of tokensA) {
      if (tokensB.has(t)) overlap++;
    }
    return overlap / Math.max(tokensA.size, tokensB.size);
  }

  // LCS for shorter strings
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = na[i - 1] === nb[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const lcsLen = dp[m][n];
  return (2 * lcsLen) / (m + n);
}

/**
 * Extract all code blocks from an AI response.
 */
function extractCodeBlocks(text) {
  const blocks = [];
  const regex = /```[\w]*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/**
 * Filter an AI response to prevent solution leakage.
 * Returns { safe: boolean, filtered: string, reason?: string }
 */
export function filterResponse(response, solution, rung) {
  const rules = RUNG_RULES[rung] || RUNG_RULES[0];

  // If solution is allowed (rung 5), no filtering needed
  if (rules.allowSolution) {
    return { safe: true, filtered: response };
  }

  let filtered = response;
  let reason = null;

  // Check code blocks against solution
  if (solution) {
    const codeBlocks = extractCodeBlocks(response);

    for (const block of codeBlocks) {
      const sim = codeSimilarity(block, solution);

      if (sim > rules.maxSimilarity) {
        // Replace the code block with a censored version
        filtered = filtered.replace(
          block,
          `[Code censuré — trop proche de la solution. Passe au palier suivant pour plus d'aide !]`,
        );
        reason = `Code similarity ${(sim * 100).toFixed(0)}% exceeds threshold ${(rules.maxSimilarity * 100).toFixed(0)}% for rung ${rung}`;
      }
    }

    // Also check inline code that looks like a complete solution
    if (!rules.allowCode) {
      // Strip all code blocks from response
      const inlineCodeRegex = /```[\w]*\n[\s\S]*?```/g;
      if (inlineCodeRegex.test(filtered)) {
        filtered = filtered.replace(inlineCodeRegex, '\n_[Je ne peux pas te montrer de code à ce palier. Continue à réfléchir ou passe au palier suivant !]_\n');
        reason = reason || `Code blocks not allowed at rung ${rung}`;
      }
    }
  }

  return {
    safe: reason === null,
    filtered,
    reason,
  };
}

// ── 4. EXPORTS ──────────────────────────────────────────────────────

export { RUNG_RULES };
