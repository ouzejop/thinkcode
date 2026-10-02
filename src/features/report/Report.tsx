import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi } from '../../api/client';
import type { ProgressReport, Rank } from '../../api/types';
import type { SpriteName } from '../../sprites/matrices';
import { getLevelProgress, getPlayerLevel, useProfileStore } from '../../stores/profileStore';
import { Avatar, Button, IconThink, Panel, PixelSprite } from '../../ui';

export const Report: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfileStore();

  const [report, setReport] = useState<ProgressReport | null>(null);

  const level = getPlayerLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = await getApi();
        const data = await api.getReport(profile.playerId);
        if (mounted) {
          setReport(data);
        }
      } catch {
        // silent fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, [profile.playerId]);

  // Compute live rank distribution from profile completed exercises
  const liveRanks: Record<Rank, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  Object.values(profile.completedExercises).forEach((item) => {
    liveRanks[item.rank] = (liveRanks[item.rank] || 0) + 1;
  });

  const getRankSprite = (rank: Rank): SpriteName => {
    switch (rank) {
      case 'S':
        return 'rank-s';
      case 'A':
        return 'rank-a';
      case 'B':
        return 'rank-b';
      case 'C':
        return 'rank-c';
      case 'D':
        return 'rank-d';
    }
  };

  const totalCleared = Object.keys(profile.completedExercises).length;

  return (
    <div className="zone-arcade min-h-screen pb-16">
      {/* Header */}
      <header className="border-b border-soft bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/shelf')}
          >
            <span className="t-logo text-base sm:text-lg text-primary font-bold">
              ThinkCode Save File
            </span>
          </div>
          <Button onClick={() => navigate('/shelf')}>← Cartridge Shelf</Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 sm:p-6 grid gap-6">
        {/* Save File Header Banner */}
        <div className="rounded-[var(--radius)] border-2 border-line bg-surface p-6 shadow-[var(--shadow-hard)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full border-2 border-line bg-sunken flex items-center justify-center shadow-inner overflow-hidden">
                <Avatar seed={profile.avatar} size={48} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="t-logo text-2xl text-ink font-bold">{profile.initials}</h1>
                  <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-on-primary uppercase">
                    LV {level}
                  </span>
                </div>
                <p className="text-xs text-soft font-mono mt-1">
                  Track: {profile.courseId.toUpperCase()} · {totalCleared} cartridges cleared
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:text-right">
              <span className="text-xs text-soft uppercase font-bold">Total Experience</span>
              <span className="t-num text-2xl font-bold text-primary">{profile.xp} XP</span>
              <span className="text-[11px] text-soft font-mono">
                {progress.current} / {progress.max} XP to LV {level + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Rank Distribution Cards */}
        <Panel title="Rank Distribution" zone="arcade">
          <p className="text-xs text-soft mb-3">
            Ranks are stamped according to the maximum help rung climbed during each exercise.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['S', 'A', 'B', 'C', 'D'] as Rank[]).map((r) => (
              <div
                key={r}
                className="flex flex-col items-center justify-center p-3 rounded-[var(--radius)] border border-soft bg-surface text-center shadow-sm"
              >
                <PixelSprite name={getRankSprite(r)} size={32} />
                <span className="t-rank font-bold text-base mt-1">Rank {r}</span>
                <span className="t-num text-lg font-bold text-primary mt-0.5">
                  {liveRanks[r]}
                </span>
                <span className="text-[10px] text-soft">
                  {r === 'S'
                    ? 'No help'
                    : r === 'A'
                    ? 'Think'
                    : r === 'B'
                    ? 'Hint'
                    : r === 'C'
                    ? 'Explain'
                    : 'Reveal'}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Independence Breakdown by Concept (Custom SVG Chart) */}
        <Panel title="Concept Independence Breakdown" zone="work">
          <p className="text-xs text-soft mb-4">
            Independence measures how often you solved cartridges without reaching the higher rungs
            (Explain, Example, Reveal).
          </p>

          <div className="grid gap-4">
            {report?.conceptIndependence.map((c) => {
              return (
                <div key={c.concept} className="grid gap-1.5 bg-sunken/40 p-3 rounded border border-soft">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-ink">{c.concept}</span>
                    <span className={c.avgIndependence >= 75 ? 'text-pass' : 'text-primary'}>
                      {c.avgIndependence}% Autonomy
                    </span>
                  </div>

                  {/* SVG Bar Chart for Independence */}
                  <div className="relative h-4 w-full rounded bg-sunken overflow-hidden border border-soft">
                    <div
                      className={`h-full transition-all duration-500 ${
                        c.avgIndependence >= 75
                          ? 'bg-pass'
                          : c.avgIndependence >= 60
                          ? 'bg-primary'
                          : 'bg-xp'
                      }`}
                      style={{ width: `${c.avgIndependence}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-soft font-mono">
                    <span>{c.exercisesCleared} exercises analyzed</span>
                    <span>Max rungs climbed: [{c.maxRungs.join(', ')}]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Coach Socrates Analysis & Insight */}
        <Panel title="Socrates Analysis & Insight" zone="work">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center flex-none">
              <IconThink size={24} className="text-primary" />
            </div>

            <div className="flex-1 text-sm leading-relaxed text-ink space-y-2">
              <p className="font-bold text-primary">Socrates' Assessment:</p>
              <p className="text-soft">
                {report?.coachInsight ||
                  'Continue your journey across the Cartridge Shelf. The more you reason before asking for hints, the sharper your programmer intuition becomes.'}
              </p>
            </div>
          </div>
        </Panel>
      </main>
    </div>
  );
};

export default Report;
