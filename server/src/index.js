import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import coachRoutes from './routes/coach.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ── Middleware ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '1mb' }));

// ── Request logger (dev) ───────────────────────────────────────────
app.use((req, _res, next) => {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api', coachRoutes);

// ── 404 ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' });
});

// ── Error handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ code: 'SERVER', message: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ┌──────────────────────────────────────┐`);
  console.log(`  │  ThinkCode Server                     │`);
  console.log(`  │  http://localhost:${PORT}               │`);
  console.log(`  │  CORS: ${CORS_ORIGIN}     │`);
  console.log(`  │  AI: ${process.env.OPENROUTER_API_KEY ? '✓ OpenRouter' : '✗ no key'}            │`);
  console.log(`  └──────────────────────────────────────┘\n`);
});
