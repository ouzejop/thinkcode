/**
 * AI Client — OpenRouter with Pedagogical Guardrails
 */

import { buildGuardrailedPrompt, filterResponse } from './guardrails.js';

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

if (!apiKey) {
  console.error('[ai] OPENROUTER_API_KEY is not set. AI features will not work.');
} else {
  console.log(`[ai] OpenRouter key loaded: ${apiKey.slice(0, 12)}...`);
}

/**
 * Call OpenRouter's chat completions endpoint.
 */
async function callOpenRouter(messages, options = {}) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://thinkcode.app',
      'X-Title': 'ThinkCode',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      top_p: options.topP ?? 0.9,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.error?.message || `OpenRouter HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Parse AI response: extract code blocks and clean message text.
 */
function parseResponse(raw) {
  const codeBlockMatch = raw.match(/```[\w]*\n([\s\S]*?)```/);
  const codeBlock = codeBlockMatch ? codeBlockMatch[1].trim() : undefined;
  const message = raw.replace(/```[\w]*\n[\s\S]*?```/g, '').trim();
  return { message: message || raw, codeBlock };
}

/**
 * Generate a coaching response (rung-based) WITH guardrails.
 */
export async function generateCoachResponse(context, userMessage) {
  if (!apiKey) {
    return {
      message: 'La connexion IA n\'est pas configurée. Vérifie ta clé OPENROUTER_API_KEY dans le fichier .env du serveur.',
    };
  }

  // Build guardrailed system prompt
  const systemPrompt = buildGuardrailedPrompt(context);
  const messages = [{ role: 'system', content: systemPrompt }];

  // Add conversation history
  if (context.conversationHistory?.length > 0) {
    for (const msg of context.conversationHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    }
  }

  const userContent = userMessage
    ? userMessage
    : `L'élève demande de l'aide au Palier ${context.currentRung}. Génère une réponse appropriée pour ce palier.`;

  messages.push({ role: 'user', content: userContent });

  try {
    const raw = await callOpenRouter(messages);

    // Apply post-filter guardrails
    const { filtered, safe, reason } = filterResponse(
      raw,
      context.solution,
      context.currentRung || 0,
    );

    if (!safe) {
      console.warn(`[guardrails] Response filtered: ${reason}`);
    }

    return parseResponse(filtered);
  } catch (err) {
    console.error('[ai] Coach error:', err);
    if (err?.status === 429) {
      return {
        message: 'Trop de requêtes. Attends quelques secondes avant de réessayer.',
        retryAfterMs: 5000,
      };
    }
    return { message: 'Une erreur est survenue avec l\'IA. Réessaie dans un instant.' };
  }
}

/**
 * Generate a free chat response WITH guardrails.
 */
export async function generateChatResponse(context, userMessage) {
  if (!apiKey) {
    return { message: 'La connexion IA n\'est pas configurée. Vérifie ta clé OPENROUTER_API_KEY.' };
  }

  // Use guardrailed prompt even for free chat
  const systemPrompt = buildGuardrailedPrompt({
    ...context,
    currentRung: context.currentRung || 0,
  });

  const messages = [{ role: 'system', content: systemPrompt }];

  if (context.conversationHistory?.length > 0) {
    for (const msg of context.conversationHistory.slice(-10)) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  try {
    const raw = await callOpenRouter(messages, { temperature: 0.8, maxTokens: 512 });

    // Apply post-filter
    const { filtered, safe, reason } = filterResponse(
      raw,
      context.solution,
      context.currentRung || 0,
    );

    if (!safe) {
      console.warn(`[guardrails] Chat response filtered: ${reason}`);
    }

    return parseResponse(filtered);
  } catch (err) {
    console.error('[ai] Chat error:', err);
    return { message: 'Erreur de connexion avec l\'IA. Réessaie dans un instant.' };
  }
}
