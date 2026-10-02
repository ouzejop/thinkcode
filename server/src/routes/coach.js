import { Router } from 'express';
import { generateCoachResponse, generateChatResponse } from '../groqClient.js';
import { getExerciseSecrets } from '../exerciseSecrets.js';
import { supabase } from '../supabase.js';

const router = Router();

/**
 * POST /api/sessions/:id/help
 * Rung-based coaching endpoint WITH guardrails.
 * The solution and coach data are loaded SERVER-SIDE from exerciseSecrets.
 */
router.post('/sessions/:id/help', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      testResults,
      userReply,
      exerciseContext,
      currentRung,
      conversationHistory,
    } = req.body;

    if (!exerciseContext) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'exerciseContext is required',
      });
    }

    // Load secrets SERVER-SIDE (never trust the frontend for this)
    const secrets = getExerciseSecrets(exerciseContext.id);

    const formattedTests = Array.isArray(testResults)
      ? testResults
          .map(
            (t) =>
              `- ${t.label}: ${t.status}${t.status === 'fail' ? ` (attendu: ${JSON.stringify(t.expected)}, reçu: ${JSON.stringify(t.actual)})` : ''}`,
          )
          .join('\n')
      : 'Aucun test exécuté';

    const context = {
      exerciseTitle: exerciseContext.title,
      concept: exerciseContext.concept,
      kind: exerciseContext.kind,
      brief: exerciseContext.brief,
      starterCode: exerciseContext.starterCode,
      studentCode: code || '',
      testResults: formattedTests,
      currentRung: currentRung || 1,
      conversationHistory: conversationHistory || [],
      // Guardrail data — loaded server-side, NEVER from frontend
      solution: secrets?.solution || null,
      coachData: secrets?.coach || null,
    };

    const result = await generateCoachResponse(context, userReply);

    const rung = currentRung || 1;
    const xpTable = [90, 75, 55, 40, 15];
    const xp = xpTable[rung - 1] || 0;

    if (supabase) {
      try {
        await supabase.from('coach_logs').insert({
          session_id: id,
          rung,
          message: result.message,
          code_block: result.codeBlock || null,
          student_code: code || null,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('[supabase] Failed to log:', dbErr.message);
      }
    }

    res.json({
      rung,
      message: result.message,
      codeBlock: result.codeBlock,
      ladder: {
        highest: rung,
        next: rung < 5 ? rung + 1 : null,
        xpTable,
        bonus: xp,
      },
    });
  } catch (err) {
    console.error('[/sessions/:id/help] Error:', err);
    res.status(500).json({ code: 'SERVER', message: 'Internal server error' });
  }
});

/**
 * POST /api/chat
 * Free-form chat with guardrails.
 * Solution is loaded server-side from exerciseSecrets.
 */
router.post('/chat', async (req, res) => {
  try {
    const {
      message,
      exerciseContext,
      currentRung,
      conversationHistory,
      studentCode,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'message is required',
      });
    }

    // Load secrets server-side
    const secrets = getExerciseSecrets(exerciseContext?.id);

    const context = {
      exerciseTitle: exerciseContext?.title || 'Inconnu',
      concept: exerciseContext?.concept || 'Inconnu',
      kind: exerciseContext?.kind || 'Inconnu',
      brief: exerciseContext?.brief || '',
      starterCode: exerciseContext?.starterCode || '',
      studentCode: studentCode || '',
      currentRung: currentRung || 0,
      conversationHistory: conversationHistory || [],
      solution: secrets?.solution || null,
      coachData: secrets?.coach || null,
    };

    const result = await generateChatResponse(context, message);

    res.json({
      sender: 'socrates',
      message: result.message,
      codeBlock: result.codeBlock,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[/chat] Error:', err);
    res.status(500).json({ code: 'SERVER', message: 'Internal server error' });
  }
});

/**
 * GET /api/health
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    ai: !!process.env.OPENROUTER_API_KEY,
    supabase: !!supabase,
    guardrails: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;
