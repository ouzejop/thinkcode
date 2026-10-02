import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SpriteName } from '../../sprites/matrices';
import { useSettingsStore, type RetroLevel, type Theme } from '../../stores/settingsStore';
import {
  Button,
  ChoiceCard,
  CodeEditor,
  DialogBox,
  FunctionBar,
  Led,
  Modal,
  Panel,
  PixelSprite,
  Stepper,
  Tabs,
  Typewriter,
  ZoneDebug,
  type FnKey,
} from '../../ui';

const THEMES: Theme[] = ['lavender', 'night'];
const LEVELS: RetroLevel[] = ['clean', 'balanced', 'arcade'];

const SPRITE_SHOWCASE: SpriteName[] = [
  'hero',
  'climber',
  'chest',
  'padlock',
  'bug',
  'cartridge',
  'rank-s',
  'rank-a',
  'rank-b',
  'rank-c',
  'rank-d',
  'avatar-hero',
  'avatar-wizard',
  'avatar-robot',
  'avatar-cat',
  'avatar-ghost',
  'avatar-knight',
  'trophy-gold',
  'trophy-silver',
  'trophy-bronze',
  'cpu',
  'logo-js',
  'logo-py',
];

const SAMPLE_CODE = `function countVowels(str) {
  const vowels = "aeiou";
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (vowels.includes(str[i])) {
      count++;
    }
  }
  return count;
}`;

export const Styleguide: React.FC = () => {
  const navigate = useNavigate();
  const { theme, retroLevel, setTheme, setRetroLevel } = useSettingsStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editorVal, setEditorVal] = useState(SAMPLE_CODE);
  const [activeTab, setActiveTab] = useState('one');

  const keys: FnKey[] = [
    { label: 'Run', onClick: () => {} },
    { label: 'Ask', onClick: () => setModalOpen(true) },
    { label: 'Review', onClick: () => {} },
    { label: 'Reset', onClick: () => setEditorVal(SAMPLE_CODE) },
    { label: 'Shelf', onClick: () => navigate('/shelf') },
    { label: 'Settings', onClick: () => setModalOpen(true) },
  ];

  return (
    <main className="mx-auto max-w-5xl grid gap-6 p-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-soft pb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">ThinkCode Design System Styleguide</h1>
          <p className="text-sm text-soft">
            Live preview of all components across Lavender & Night themes, and 3 Retro styles.
          </p>
        </div>
        <Button onClick={() => navigate('/shelf')}>← Cartridge Shelf</Button>
      </div>

      {/* Theme & Retro Atmosphere Controls */}
      <Panel title="Atmosphere & Zone Debugger" zone="arcade">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface rounded p-1 border border-soft">
            <span className="text-xs font-bold text-soft mr-1">Theme:</span>
            {THEMES.map((t) => (
              <Button
                key={t}
                aria-pressed={theme === t}
                variant={theme === t ? 'primary' : 'secondary'}
                onClick={() => setTheme(t)}
                className="text-xs px-2.5 py-1 capitalize"
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-surface rounded p-1 border border-soft">
            <span className="text-xs font-bold text-soft mr-1">Retro:</span>
            {LEVELS.map((l) => (
              <Button
                key={l}
                aria-pressed={retroLevel === l}
                variant={retroLevel === l ? 'primary' : 'secondary'}
                onClick={() => setRetroLevel(l)}
                className="text-xs px-2.5 py-1 capitalize"
              >
                {l}
              </Button>
            ))}
          </div>

          <ZoneDebug />
        </div>
      </Panel>

      {/* 3 Zones Demonstration */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* WORK ZONE */}
        <Panel title="Zone Work (High Readability · Atkinson Hyperlegible)" zone="work">
          <h3 className="text-xl font-bold text-ink mb-1">Broken Adder</h3>
          <p className="text-sm text-ink mb-3">
            Zone Work contains the mission brief, code editor, test list, console, and coach explanations.
            No pixel fonts, maximum accessibility, clear contrast.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded bg-sunken">
              <Led state="pass" label="Test 1" />
              <code className="text-xs font-mono font-bold">add(2, 3) = 5</code>
              <span className="text-xs text-pass font-bold ml-auto">Passed</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-sunken">
              <Led state="fail" label="Test 2" />
              <code className="text-xs font-mono font-bold">add(-1, 1) = 0</code>
              <span className="text-xs text-fail font-bold ml-auto">Expected 0, got -2</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-sunken">
              <Led state="off" label="Test 3" />
              <code className="text-xs font-mono font-bold">add(0, 0) = 0</code>
              <span className="text-xs text-soft font-bold ml-auto">Not run</span>
            </div>
          </div>
        </Panel>

        {/* ARCADE ZONE */}
        <Panel title="Zone Arcade (Sunken Stage · Sprites & Steps)" zone="arcade">
          <div className="flex items-center gap-3 mb-4">
            <span className="t-logo text-primary text-base">THINKCODE</span>
            <span className="t-rank flex h-7 w-7 items-center justify-center bg-primary text-on-primary rounded">
              S
            </span>
            <span className="t-num rounded bg-xp px-2 py-0.5 text-on-xp font-bold">
              Bonus 100
            </span>
          </div>

          <p className="text-xs text-soft mb-3">
            Zone Arcade houses the Hint Ladder, cartridge shelves, stage clear, and high scores.
          </p>

          <div className="grid gap-2">
            <ChoiceCard
              title="Selectable Arcade Card"
              subtitle="Accessible choice card with radio semantics"
              selected={true}
              badge="Active"
            />
            <Stepper currentStep={3} totalSteps={5} labels={['One', 'Two', 'Three', 'Four', 'Five']} />
          </div>
        </Panel>
      </div>

      {/* Sprites Matrix Gallery */}
      <Panel title="PixelSprite Matrix Gallery (No external images)" zone="arcade">
        <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 gap-3 text-center">
          {SPRITE_SHOWCASE.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center justify-center p-2 rounded border border-soft bg-surface shadow-sm"
            >
              <PixelSprite name={name} size={32} />
              <span className="text-[10px] text-soft font-mono mt-1 truncate max-w-full">
                {name}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Code Editor Preview */}
      <Panel title="CodeEditor Component with Line Gutter & Status Bar" zone="work">
        <CodeEditor
          value={editorVal}
          onChange={setEditorVal}
          highlightLine={4}
          language="javascript"
          fileName="vowels.js"
          onRun={() => alert('Run triggered!')}
        />
      </Panel>

      {/* Coach Speech Bubble & Typewriter */}
      <Panel title="Coach Speech Bubble with Typewriter" zone="work">
        <DialogBox speaker="Socrates.exe" subtitle="Rung 2 of 5: Hint">
          <Typewriter text="Inspect the initialization of the for loop counter variable. Arrays in JavaScript begin at index 0!" />
        </DialogBox>
      </Panel>

      {/* Tabs */}
      <Panel title="Accessible Tabs Navigation" zone="work">
        <Tabs
          tabs={[
            { id: 'one', label: 'Overview', count: 12 },
            { id: 'two', label: 'Specifications' },
            { id: 'three', label: 'History' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <div className="p-3 text-sm text-ink bg-sunken rounded mt-2">
          Active tab content for: <strong>{activeTab}</strong>
        </div>
      </Panel>

      {/* Function Keys Bar */}
      <Panel title="Retro Function Bar (Fixed on desktop, compact on mobile)" zone="touch">
        <FunctionBar keys={keys} />
      </Panel>

      {/* Modal Dialog */}
      <Modal open={modalOpen} title="Sample Modal" onClose={() => setModalOpen(false)}>
        <p className="text-sm text-soft mb-4">
          Accessible native HTML5 dialog element with automated focus trapping and Escape key support.
        </p>
        <div className="flex justify-end gap-2">
          <Button data-autofocus variant="primary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </main>
  );
};

export default Styleguide;
