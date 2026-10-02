# 🕹️ THINKCODE — The Machine That Makes You Think

<div align="center">

> *"I cannot teach anybody anything. I can only make them think."* — Socrates

[![FirstCommit Hackathon](https://img.shields.io/badge/FirstCommit-Hackathon_2026-6366F1?style=for-the-badge&logo=devpost&logoColor=white)](https://firstcommit.devpost.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests Passing](https://img.shields.io/badge/Tests-68%2F68_Passing-22C55E?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/ouzejop/thinkcode)
[![Accessibility](https://img.shields.io/badge/WCAG-AAA_Compliant-F59E0B?style=for-the-badge&logo=w3c&logoColor=white)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License MIT](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

**An autonomous retro-arcade Socratic AI coding coach for beginners that refuses to give solutions away.**  
*Teaching computational thinking through guided inquiry, adaptive hint ladders, sandboxed execution, and autonomy scoring.*

[🎮 Live Demo](https://thinkcode-omega.vercel.app/) • [📋 Devpost Submission](https://firstcommit.devpost.com/) • [✨ Features](#-key-features) • [⚡ Quick Start](#-quick-start-for-judges) • [🏛️ Socratic Philosophy](#-the-socratic-philosophy)

</div>

---

## ⚡ Quick Start for Judges (Runs in 60s)

ThinkCode runs **100% offline out-of-the-box** using an integrated mock backend, procedural WebAudio synth, and in-browser Web Worker execution engine. **No API keys or external services required!**

```bash
# 1. Clone the repository
git clone https://github.com/ouzejop/thinkcode.git
cd thinkcode

# 2. Install dependencies
npm install

# 3. Start the application
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Run Test & Integrity Suite (Automated Verification)
```bash
# Runs contrast verification, retro style validation, pure code runner, and mockApi contract tests
npm test

# Typecheck with TypeScript
npm run typecheck
```

---

## 💡 The Problem: The Generative AI Trap

When beginners learn to code today, traditional AI assistants (ChatGPT, Copilot) provide complete, copy-pasteable solutions to every syntax error or logic challenge.

```text
❌ TRADITIONAL AI (Passive Consumption):
   Beginner gets stuck ──> AI generates 50 lines ──> Copy & Paste ──> Zero Learning

✅ THINKCODE (Active Deduction):
   Beginner gets stuck ──> Socrates asks targeted questions ──> Adaptive Hint Ladder ──> Genuine Understanding!
```

This creates a dangerous illusion of competence: learners feel productive, but cannot write five lines of code when staring at a blank file.

**ThinkCode fixes this.** It acts as **Socrates**—a wise, encouraging retro-arcade mentor that diagnoses errors, asks guiding questions, and rewards **autonomy and independence**.

---

## ✨ Key Features

### 1. 🏛️ Socratic AI Coach ("Socrates")
- Analyzes broken code and test failures without ever writing the answer for the learner.
- Asks targeted questions to prompt reflection: *"What does your accumulator variable contain after the first loop pass?"*
- Embedded directly in the IDE terminal and the **Hint Ladder** drawer.

### 2. 🪜 4-Rung Adaptive Hint Ladder & Mandatory Rematch
1. **Rung 1 — Concept**: Explains the theoretical concept behind the problem (e.g. accumulator pattern, boundary indices).
2. **Rung 2 — Socratic Question**: Pinpoints the logical discrepancy in the user's specific attempt.
3. **Rung 3 — Algorithm / Pseudocode**: Provides structured logic steps without language syntax.
4. **Rung 4 — Solution Reveal (with penalty)**: Unlocks the full solution, but **triggers a mandatory Rematch variant** with altered constraints to prove genuine mastery!

### 3. ⚡ Sandboxed Client-Side Execution Engine
- Pure JavaScript execution inside dedicated **Web Workers** (`runner.worker.ts`).
- **Watchdog Timeout**: Strict 2-second timeout preventing infinite loops (`while(true)`) from freezing the browser UI.
- **Security Shadowing**: Shadowed globals (`fetch`, `XMLHttpRequest`, `importScripts`) ensure safe, leak-free execution.
- Real-time ANSI terminal logging and automated test assertion runners.

### 4. 🏆 Autonomy-Based Dual Leaderboards
- Unlike standard platforms that rank by typing speed (encouraging AI copy-pasting), ThinkCode ranks players by **Autonomy Score**, **Zero-Reveal clears**, and **S-Ranks**!
- Dual views: **Course-wide ranking** & **Per-exercise leaderboard**.
- Real-time player placement against 12 simulated CPU peers + personal pinned record.

### 5. 🎨 Neo-Arcade Aesthetics & WCAG AAA Accessibility
- **Rule of the 3 Zones**:
  - `ZONE WORK` (80% screen): Clean, accessible **Atkinson Hyperlegible** typography with maximum contrast.
  - `ZONE ARCADE`: Cartridge shelf, hint ladder, stage clears, and retro sounds.
  - `ZONE TOUCH`: Retro badges, status indicators, and SVG pixel sprites.
- **3 Retro Style Levels**: Switch between `Clean` (modern soft), `Balanced` (subtle arcade), and `Arcade` (full 8-bit styling) via settings.
- **WebAudio Procedural Synthesizer**: Generates authentic 8-bit chimes and fanfare on-the-fly with zero audio asset downloads.
- **Automated Contrast Compliance**: 30/30 color pairs verified to satisfy strict WCAG AAA contrast ratios (≥ 7:1 for text).

---

## 🏗️ Architecture & Project Structure

```text
thinkcode/
├── src/
│   ├── api/             # Unified API layer (types.ts, client.ts, mockApi, httpApi)
│   ├── app/             # Application entry, layout & router
│   ├── engine/          # Web Worker sandbox, LanguageRunner, runner.core.ts
│   ├── features/
│   │   ├── title/       # Neo-arcade boot sequence & title screen
│   │   ├── onboarding/  # 5-step interactive onboarding & diagnostic placement
│   │   ├── shelf/       # Interactive cartridge shelves (Variables, Conditions, Loops)
│   │   ├── workstation/ # 3-column accessible IDE (Mission, Tests, Editor, Console, Ladder)
│   │   ├── scores/      # Accessible Dual High Scores table with CPU peers & filters
│   │   ├── report/      # Progression save file, rank radar & independence metrics
│   │   ├── about/       # Pedagogical manifesto (Typical AI vs ThinkCode)
│   │   └── settings/    # Theme switcher, retro levels, audio synth & profile controls
│   ├── lib/             # Procedural WebAudio synth (sfx.ts), contrast checker, shortcuts
│   ├── sprites/         # Custom 12x12 & 16x16 scalable SVG pixel matrices
│   ├── stores/          # Zustand stores (profile, settings, session, leaderboard)
│   ├── styles/          # Design tokens, themes (Lavender/Night), retro levels, 3-zone styles
│   └── ui/              # Accessible design system (CodeEditor, Panel, Led, Stepper, Modal)
├── server/              # Optional Express + OpenRouter AI microservice
├── scripts/             # verifyAll.mjs (Contrast, Retro CSS, Runner & Contract tests)
└── README.md
```

---

## 🧪 Verification & Test Suite

ThinkCode includes an automated test verification harness (`verifyAll.mjs`) ensuring zero regressions and strict compliance:

```text
--- THINKCODE TEST & INTEGRITY VERIFICATION ---

[1/7] Testing Theme Contrast Ratios...
✓ All 30 theme contrast pairs satisfy strict accessibility thresholds (≥ 7:1).
[2/7] Testing Retro Style CSS Rules...
✓ Retro styles (Clean, Balanced, Arcade) strictly conform to specification.
[3/7] Testing Leaderboard Generation...
✓ Leaderboard sorting and YOU entry placement verified.
[4/7] Testing Placement Quiz Evaluation...
✓ Placement evaluation logic verified.
[5/7] Testing Pure Code Runner Core...
✓ Code execution sandbox and test assertions verified.
[6/7] Testing Hint Ladder Reducer...
✓ Ladder state reducer and rung transitions verified.
[7/7] Testing mockApi Contract Compliance...
✓ mockApi strictly complies with the ThinkCode contract.

🎉 ALL 7/7 TEST SUITES PASSED (68 assertions, 0 failures)!
```

---

## 🤖 AI Usage Disclosure (FirstCommit Hackathon)

In compliance with the **Beginner's Paradise – FirstCommit** hackathon rules:
- **AI Tools Used**: Google Antigravity & LLM models were utilized as an agile brainstorming partner, pair programmer, and code reviewer.
- **Human Work & Authorship**: All architectural blueprints, Socratic pedagogical guardrails, custom Web Worker sandboxing, WebAudio synthesis algorithms, design tokens, and comprehensive verification test suites were engineered, integrated, and validated specifically for this hackathon.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for the <strong>Beginner's Paradise – FirstCommit Hackathon 2026</strong>.</sub>
</div>
