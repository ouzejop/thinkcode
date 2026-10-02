import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Panel } from '../../ui';

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="zone-arcade min-h-screen pb-16">
      {/* Top Header */}
      <header className="border-b border-soft bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <span className="t-logo text-base sm:text-lg text-primary font-bold">
              Why ThinkCode?
            </span>
          </div>
          <Button onClick={() => navigate(-1)}>← Back</Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 sm:p-6 grid gap-6">
        {/* Manifesto Panel */}
        <Panel title="The ThinkCode Manifesto" zone="work">
          <div className="space-y-4 text-sm sm:text-base text-ink leading-relaxed">
            <p className="font-bold text-lg text-primary">
              AI assistants that dump full solutions are actively hurting beginners.
            </p>
            <p>
              When a new programmer gets stuck on an off-by-one loop boundary or an operator precedence error,
              copy-pasting a complete generated answer gives immediate relief at the expense of long-term learning.
              The student feels like they solved it, but hasn't exercised the neural pathways required to build mental models.
            </p>
            <p>
              <strong>ThinkCode is the machine that makes you think.</strong> Inspired by the Socratic method and 8-bit arcade machines,
              our coach refuses to hand you code until you have climbed a structured 5-step ladder.
              Every step demands cognitive engagement:
            </p>
            <ul className="list-disc pl-6 space-y-1 font-medium">
              <li><strong>Think:</strong> Interactive reasoning question targeting the mental block.</li>
              <li><strong>Hint:</strong> A conceptual nudge without line numbers or spoilers.</li>
              <li><strong>Explain:</strong> The overarching pattern and syntax rules.</li>
              <li><strong>Example:</strong> A similar solved problem that you must adapt.</li>
              <li><strong>Reveal:</strong> The full solution—only after strict confirmation and requiring a mandatory rematch variant.</li>
            </ul>
          </div>
        </Panel>

        {/* Side-by-Side Comparison Table */}
        <Panel title="Typical AI Assistant vs. ThinkCode" zone="work">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-line bg-sunken text-xs font-bold uppercase text-soft">
                  <th scope="col" className="p-3 w-1/4">Aspect</th>
                  <th scope="col" className="p-3 w-3/8 text-fail">Typical AI Assistant</th>
                  <th scope="col" className="p-3 w-3/8 text-pass">ThinkCode Coach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft">
                <tr>
                  <td className="p-3 font-bold text-ink">Assistance model</td>
                  <td className="p-3 text-soft">Dumps full code solution immediately on prompt.</td>
                  <td className="p-3 font-bold text-ink">5-rung Hint Ladder enforcing active reasoning.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-ink">Incentives & Scoring</td>
                  <td className="p-3 text-soft">Rewards speed; zero penalty for using auto-complete.</td>
                  <td className="p-3 font-bold text-ink">Rewards Autonomy and S-ranks; no timers.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-ink">Cognitive Load</td>
                  <td className="p-3 text-soft">Passive consumption; illusion of competence.</td>
                  <td className="p-3 font-bold text-ink">Productive struggle with Socrates' dialogue.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-ink">Reveal Handling</td>
                  <td className="p-3 text-soft">No friction; solution is instant.</td>
                  <td className="p-3 font-bold text-ink">Penalty XP and mandatory Rematch challenge.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-ink">Execution Safety</td>
                  <td className="p-3 text-soft">Often requires pasting arbitrary snippets.</td>
                  <td className="p-3 font-bold text-ink">Isolated Worker sandbox with watchdog timeouts.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Hackathon Note */}
        <div className="rounded-[var(--radius)] border border-line bg-surface p-4 text-xs text-soft text-center shadow-sm">
          Built for the <strong>Beginner's Paradise – FirstCommit Hackathon</strong>. Focused on Learning & Growth,
          Accessibility, and Technical Precision.
        </div>
      </main>
    </div>
  );
};

export default About;
