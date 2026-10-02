# THINKCODE 🕹️ — The Machine That Makes You Think

> An AI coding coach for beginners that refuses to give solutions too easily. Built for the **Beginner's Paradise – FirstCommit Hackathon**.

---

### Reasonable Choices Made (10 lines max)
1. **Self-Contained Editor**: Built a high-contrast accessible code editor (gutter line numbers, active & reveal line highlight, Tab indentation, status bar) with zero external network dependencies to ensure instantaneous offline booting.
2. **State Decoupling**: Hint Ladder state machine is strictly server/mock-owned (persisted only on server/mock, never localStorage) and synchronized via session endpoints.
3. **Pure Worker Execution**: JavaScript runs in isolated Web Workers with a strict 2s timeout and runtime shadowing of `fetch`/`XMLHttpRequest`/`importScripts`.
4. **Zero-Audio File Synth**: Procedural WebAudio synthesizer with 8-bit retro sound waves, muted by default with persistent settings.
5. **Autonomy-Driven Leaderboard**: 12 simulated CPU players + YOU row pinned at bottom; sorted strictly by autonomy & S-ranks, never by completion speed.
6. **Double API Layer**: Unified `Api` interface with `mockApi` (default) and `httpApi`, switched via `VITE_API_MODE`.
7. **Predict & Rematch Challenges**: Full support for `predict` multiple-choice questions and mandatory rematch variant after a confirmed Reveal.
8. **Scalable Vector Sprites**: Custom 12x12 and 16x16 `<PixelSprite>` matrices rendered via crisp SVG, guaranteeing zero pixel distortion and theme integration.
9. **Accessible Staggered Feedback**: Test LEDs light with an 80ms staggered delay, pairing square glyphs (✓/✗/○) with text so color is never the sole indicator.
10. **Strict Contrast Compliance**: Automatic verification script guarantees theme contrast ratios strictly satisfy minimum accessibility thresholds.

---

### Setup & Scripts

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (mock mode by default)
npm run dev

# 3. Run full verification test suite (contrast, retro levels, runner, mock API contract)
npm test

# 4. Typecheck
npm run typecheck
```

- `VITE_API_MODE=mock` (default): full offline simulation with 7 handcrafted exercises across Variables, Conditions, Loops (including showcase *"Count the vowels"* and rematch variant), placement check, and 12 CPU players.
- `VITE_API_MODE=http`: connects to backend at `VITE_API_URL` (default: `/api`).

---

### Architecture & Project Structure

```text
src/
├── api/             # API layer: types.ts, client.ts, httpApi.ts, mock/
├── app/             # Router, layout & App entry
├── engine/          # LanguageRunner, runner.core.ts, runner.worker.ts, runTests.ts
├── features/
│   ├── title/       # Boot sequence (<=1.5s), Press Start, Continue, New Game
│   ├── onboarding/  # 5-step stepper (Identity, Track, Level/Check, Coach, Ready)
│   ├── shelf/       # Visual cartridge shelves by concept, insert animation, mini scores
│   ├── workstation/ # 3-col/2-col/tabbed IDE, Mission, Tests, Editor, Console, Ladder, Coach
│   ├── scores/      # Full accessible High Scores table, tabs, filters, YOU row
│   ├── report/      # Progression save file, rank distribution, SVG independence chart
│   ├── about/       # Manifesto & typical AI assistant vs ThinkCode comparison
│   ├── styleguide/  # Interactive component showcase, 2 themes x 3 style levels, zone toggle
│   └── settings/    # Settings modal (theme, retro style, sound, font size, typewriter, motion, profile)
├── lib/             # WebAudio sfx.ts, keyboard.ts, i18n.ts, contrast.ts
├── sprites/         # 12x12 & 16x16 matrices (Socrates, climber, chest, bug, cartridge, ranks, avatars, trophies)
├── stores/          # Zustand stores: profileStore, settingsStore, sessionStore, onboardingStore
├── styles/          # tokens.css, themes.css (Lavender & Night), retro.css (3 levels), zones.css
└── ui/              # Design system: Button, Panel, Led, Modal, Stepper, ChoiceCard, Tabs, DataTable, CodeEditor, Typewriter, PixelSprite, FunctionBar, ZoneDebug
```

---

### Rule of the 3 Zones (`.zone-work`, `.zone-arcade`, `.zone-touch`)

- **ZONE WORK** (80% of screen time): Mission brief, test suite, code editor, terminal console, Socrates speech bubbles, settings forms, save file report text.
  - Background: `--surface`, text: `--ink`.
  - Atkinson Hyperlegible (16px minimum, line-height 1.5).
  - **Rule**: Never any pixel font or decorative distorting filters.
- **ZONE ARCADE**: Hint Ladder, Cartridge Shelf, Stage Clear, High Scores, Title screen, Onboarding cards.
  - Background: `--surface-sunken`, pixel sprites, step animations, retro sounds. Text over 2 lines stays in Atkinson.
- **ZONE TOUCH**: Logo, Socrates portrait sprite, square test LEDs, potential rank badge, function bar keys.
- **Zone Debug Overlay**: Toggle with query parameter `?zones=1` or in `/styleguide` to reveal colored dashed bounding boxes (`WORK`: blue, `ARCADE`: orange, `TOUCH`: pink).

---

### Retro Style Levels (`data-retro="clean|balanced|arcade"`)

Persistent setting in `settingsStore.retroLevel` driving CSS custom variables in `src/styles/retro.css`:

1. **Clean**: `--radius: 10px`, `--border-w: 1px`, no hard shadow. Zero pixel fonts anywhere; all labels, logo, rank badges, numbers, and rung headers rendered in Atkinson Hyperlegible 700.
2. **Balanced** *(default)*: `--radius: 6px`, `--border-w: 1px`, no hard shadow. Pixel font (`Press Start 2P`) loaded on-demand and used **only** for the logo (11px uppercase) and rank badge letters (12px). All numbers and rung labels remain Atkinson 700. Buttons use standard case.
3. **Arcade**: `--radius: 0`, `--border-w: 2px`, hard shadow `--shadow-hard: 3px 3px 0 var(--line)`. Pixel font enabled for labels, logo, rank, numbers, and rungs. Buttons use uppercase with 2px pressed translation. Network errors switch to Commodore BASIC style (`?DEVICE NOT PRESENT ERROR`).

---

### Color Themes & Accessibility

- **Lavender** (Default light theme): Background `#EFEDF5`, Surface `#FBFAFD`, Sunken `#E4E0EF`, Ink `#1F1B2E`, Primary `#5B4FC9`, XP `#FFD23F`, Pass `#176B3F`, Fail `#B42318`.
- **Night** (Dark theme): Background `#1B1826`, Surface `#25213A`, Sunken `#14111E`, Ink `#ECE9F5`, Primary `#A79BFF`, XP `#FFD23F`, Pass `#4ADE80`, Fail `#FF8A80`.
- **Guaranteed Contrast Ratios**:
  - `ink` on `bg` / `surface` ≥ 7:1
  - `ink-soft` on `bg` / `surface` / `surface-sunken` ≥ 4.5:1
  - `primary` on `surface` / `surface-sunken` ≥ 4.5:1
  - `on-primary` on `primary` ≥ 4.5:1
  - `on-xp` on `xp` ≥ 7:1
  - `pass` / `fail` on `surface` / `surface-sunken` ≥ 4.5:1
  - `border-control` on `surface` ≥ 3:1
