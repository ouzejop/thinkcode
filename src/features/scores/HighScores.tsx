import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApi } from '../../api/client';
import type { Exercise, ExerciseLeaderboardEntry, LeaderboardEntry } from '../../api/types';
import { sfx } from '../../lib/sfx';
import { useProfileStore } from '../../stores/profileStore';
import { Avatar, Button, DataTable, IconLock, IconTrophy, Panel, PixelSprite, Tabs, type TabItem } from '../../ui';

export const HighScores: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const profile = useProfileStore();

  const [leaderboardScope, setLeaderboardScope] = useState<'language' | 'exercise'>(
    (searchParams.get('scope') as 'language' | 'exercise') || 'language',
  );
  const [courseId, setCourseId] = useState<'javascript' | 'python'>('javascript');
  const [tab, setTab] = useState<'xp' | 'independence' | 'sRank'>('xp');
  const [period, setPeriod] = useState<'all' | 'week'>('all');
  const [trackFilter, setTrackFilter] = useState<'mine' | 'all'>('all');
  
  // Exercise-specific leaderboard state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    searchParams.get('exerciseId') || 'vars-sum',
  );
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseLeaderboardEntry[]>([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);

  // Language leaderboard state
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exercises list
  useEffect(() => {
    (async () => {
      try {
        const api = await getApi();
        const list = await api.getExercises(courseId);
        setExercises(list);
        if (list.length > 0 && list[0] && !searchParams.get('exerciseId')) {
          setSelectedExerciseId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load exercises for leaderboard', err);
      }
    })();
  }, [courseId]);

  // Fetch language leaderboard scores
  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = await getApi();
      const list = await api.getLeaderboard({
        courseId,
        tab,
        period,
        track: trackFilter,
        playerId: profile.playerId,
      });
      setEntries(list);
    } catch {
      setError("Can't reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch exercise leaderboard scores
  const fetchExerciseScores = async (exId: string) => {
    setExerciseLoading(true);
    try {
      const api = await getApi();
      const list = await api.getExerciseLeaderboard(exId, profile.playerId);
      setExerciseEntries(list);
    } catch (err) {
      console.error('Failed to load exercise scores', err);
    } finally {
      setExerciseLoading(false);
    }
  };

  useEffect(() => {
    if (leaderboardScope === 'language') {
      void fetchScores();
    } else {
      void fetchExerciseScores(selectedExerciseId);
    }
  }, [leaderboardScope, courseId, tab, period, trackFilter, selectedExerciseId]);

  const scoreTabs: TabItem[] = [
    { id: 'xp', label: 'Total XP' },
    { id: 'independence', label: 'Independence %' },
    { id: 'sRank', label: 'S-Rank Masteries' },
  ];

  const userEntry = entries.find((e) => e.isYou || e.playerId === profile.playerId);
  const currentSelectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  return (
    <div className="zone-arcade min-h-screen pb-16">
      {/* Top Header */}
      <header className="border-b border-soft bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity gap-2"
            onClick={() => navigate('/shelf')}
          >
            <span className="t-logo text-base sm:text-lg text-primary font-bold">
              ThinkCode Leaderboards
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Button onClick={() => navigate('/shelf')}>← Cartridge Shelf</Button>
            <Button
              onClick={() => {
                sfx.play('click');
                if (leaderboardScope === 'language') {
                  void fetchScores();
                } else {
                  void fetchExerciseScores(selectedExerciseId);
                }
              }}
              title="Refresh leaderboard scores"
            >
              ↻ Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 grid gap-6">
        {/* Banner if user opted out of leaderboard */}
        {!profile.showOnLeaderboard && (
          <div className="rounded-[var(--radius)] border-2 border-line bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[var(--shadow-hard)]">
            <div className="flex items-center gap-3">
              <IconLock size={20} className="text-soft flex-none" />
              <div>
                <p className="font-bold text-sm text-ink">You are hidden from the leaderboard</p>
                <p className="text-xs text-soft">
                  Your scores are tracked privately. You can join the rankings at any time.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                sfx.play('click');
                profile.updateProfile({ showOnLeaderboard: true });
                void fetchScores();
              }}
              className="text-xs"
            >
              Show Me on Leaderboard
            </Button>
          </div>
        )}

        {/* Dual Leaderboard Scope Switcher: Language vs Exercise */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface p-2.5 rounded-[var(--radius)] border border-soft shadow-sm">
          <div className="flex rounded bg-sunken p-1 border border-soft w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                sfx.play('click');
                setLeaderboardScope('language');
                setSearchParams({});
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                leaderboardScope === 'language'
                  ? 'bg-surface text-primary shadow-sm border border-line'
                  : 'text-soft hover:text-ink'
              }`}
            >
              <IconTrophy size={14} />
              <span>Language Leaderboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.play('click');
                setLeaderboardScope('exercise');
                setSearchParams({ scope: 'exercise', exerciseId: selectedExerciseId });
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                leaderboardScope === 'exercise'
                  ? 'bg-surface text-primary shadow-sm border border-line'
                  : 'text-soft hover:text-ink'
              }`}
            >
              <span>🎯 Exercise Leaderboard</span>
            </button>
          </div>

          {/* Language Selector (JavaScript / Python) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
            <span className="text-soft font-bold hidden sm:inline">Track:</span>
            <div className="flex rounded bg-sunken p-0.5 border border-soft">
              <button
                type="button"
                onClick={() => {
                  sfx.play('click');
                  setCourseId('javascript');
                }}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  courseId === 'javascript'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-soft hover:text-ink'
                }`}
              >
                ⚡ JavaScript
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play('click');
                  setCourseId('python');
                }}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  courseId === 'python'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-soft hover:text-ink opacity-70'
                }`}
                title="Python Core Track (Coming soon)"
              >
                🐍 Python
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: LANGUAGE LEADERBOARD */}
        {leaderboardScope === 'language' && (
          <Panel
            title={`Language League — ${courseId === 'javascript' ? 'JavaScript Fundamentals' : 'Python Core'}`}
            zone="arcade"
          >
            {/* Tabs and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <Tabs
                tabs={scoreTabs}
                activeTab={tab}
                onChange={(id) => {
                  sfx.play('click');
                  setTab(id as any);
                }}
                ariaLabel="Leaderboard Ranking Metric"
              />

              {/* Filter pills: Period and Track */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex rounded bg-sunken p-0.5 border border-soft">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.play('click');
                      setPeriod('all');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      period === 'all'
                        ? 'bg-surface text-ink shadow-sm'
                        : 'text-soft hover:text-ink'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.play('click');
                      setPeriod('week');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      period === 'week'
                        ? 'bg-surface text-ink shadow-sm'
                        : 'text-soft hover:text-ink'
                    }`}
                  >
                    This Week
                  </button>
                </div>

                <div className="flex rounded bg-sunken p-0.5 border border-soft">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.play('click');
                      setTrackFilter('all');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      trackFilter === 'all'
                        ? 'bg-surface text-ink shadow-sm'
                        : 'text-soft hover:text-ink'
                    }`}
                  >
                    All Climbers
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.play('click');
                      setTrackFilter('mine');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      trackFilter === 'mine'
                        ? 'bg-surface text-ink shadow-sm'
                        : 'text-soft hover:text-ink'
                    }`}
                  >
                    My Standing
                  </button>
                </div>
              </div>
            </div>

            {/* Autonomy Principle Note with Independence Tooltip */}
            <div className="rounded bg-surface p-3 mb-4 text-xs text-soft border border-soft flex items-start gap-2">
              <span aria-hidden="true" className="text-primary font-bold text-sm">ℹ</span>
              <div className="leading-relaxed">
                <strong className="text-ink">Real Rankings: </strong>
                Climbers are ranked by actual exercise solutions and autonomy ratings.
                Both real community learners and retro CPU rivals compete for top honors.
              </div>
            </div>

            {/* Accessible Data Table */}
            <DataTable
              entries={entries}
              loading={loading}
              error={error}
              onRetry={fetchScores}
              userEntry={userEntry}
              caption={`${courseId.toUpperCase()} League Leaderboard`}
            />
          </Panel>
        )}

        {/* VIEW 2: EXERCISE-SPECIFIC LEADERBOARD */}
        {leaderboardScope === 'exercise' && (
          <Panel title="Cartridge High Scores" zone="arcade">
            {/* Cartridge Selection Bar */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-soft mb-2 uppercase">
                Select Cartridge:
              </label>
              <div className="flex flex-wrap gap-2">
                {exercises.map((ex) => {
                  const isSelected = ex.id === selectedExerciseId;
                  const isCleared = Boolean(profile.completedExercises[ex.id]);
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => {
                        sfx.play('click');
                        setSelectedExerciseId(ex.id);
                        setSearchParams({ scope: 'exercise', exerciseId: ex.id });
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'border-primary bg-primary text-on-primary shadow-sm'
                          : isCleared
                          ? 'border-pass/40 bg-pass/10 text-ink hover:border-pass'
                          : 'border-soft bg-surface text-soft hover:text-ink hover:border-line'
                      }`}
                    >
                      <span>{ex.title}</span>
                      {isCleared && (
                        <span className="text-[10px] font-mono opacity-80">
                          ({profile.completedExercises[ex.id]?.rank})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Cartridge Brief Header */}
            {currentSelectedExercise && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-sunken rounded border border-soft mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-soft font-bold uppercase">
                      {currentSelectedExercise.concept}
                    </span>
                    <span className="text-soft">·</span>
                    <h3 className="font-bold text-ink text-sm">
                      {currentSelectedExercise.title}
                    </h3>
                  </div>
                  <p className="text-xs text-soft mt-0.5 line-clamp-1">
                    {currentSelectedExercise.brief}
                  </p>
                </div>

                <Button
                  variant="primary"
                  onClick={() => navigate(`/play/${currentSelectedExercise.id}`)}
                  className="text-xs flex-none"
                >
                  Play Cartridge →
                </Button>
              </div>
            )}

            {/* Exercise Leaderboard Table */}
            {exerciseLoading ? (
              <div className="p-8 text-center text-xs text-soft flex flex-col items-center gap-2">
                <span className="animate-spin text-xl" aria-hidden="true">⏳</span>
                <span>Loading scores for this cartridge…</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded border border-soft bg-surface">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-line bg-sunken text-xs font-bold text-soft uppercase tracking-wider">
                      <th scope="col" className="py-2.5 px-3 text-center w-16">Rank</th>
                      <th scope="col" className="py-2.5 px-3">Climber</th>
                      <th scope="col" className="py-2.5 px-3 text-center w-20">Grade</th>
                      <th scope="col" className="py-2.5 px-3 text-left w-36">Autonomy</th>
                      <th scope="col" className="py-2.5 px-3 text-right w-28">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soft">
                    {exerciseEntries.map((entry) => {
                      const isYou = entry.isYou || entry.playerId === profile.playerId;
                      return (
                        <tr
                          key={entry.playerId}
                          className={`transition-colors ${
                            isYou
                              ? 'bg-primary/15 font-bold shadow-sm'
                              : 'hover:bg-sunken/40'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-mono">
                            {entry.rank === 1 ? (
                              <span className="text-xp font-bold">🥇 #1</span>
                            ) : entry.rank === 2 ? (
                              <span className="text-slate-400 font-bold">🥈 #2</span>
                            ) : entry.rank === 3 ? (
                              <span className="text-amber-600 font-bold">🥉 #3</span>
                            ) : (
                              <span>#{entry.rank}</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <Avatar seed={entry.avatar || entry.initials} size={20} />
                              <span className="font-mono text-ink font-bold">
                                {entry.initials}
                              </span>
                              {entry.isDemo && (
                                <span className="rounded bg-sunken border border-soft px-1 text-[9px] text-soft">
                                  CPU
                                </span>
                              )}
                              {isYou && (
                                <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-on-primary">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <PixelSprite
                                name={
                                  entry.exerciseRank === 'S'
                                    ? 'rank-s'
                                    : entry.exerciseRank === 'A'
                                    ? 'rank-a'
                                    : entry.exerciseRank === 'B'
                                    ? 'rank-b'
                                    : entry.exerciseRank === 'C'
                                    ? 'rank-c'
                                    : 'rank-d'
                                }
                                size={18}
                              />
                              <span className="font-mono font-bold text-ink">
                                {entry.exerciseRank}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            {entry.highestRung === 0 ? (
                              <span className="text-pass font-bold">Pure (0 Rungs)</span>
                            ) : (
                              <span className="text-soft">
                                {entry.highestRung} Rung{entry.highestRung > 1 ? 's' : ''} used
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                            +{entry.xpEarned} XP
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        )}
      </main>
    </div>
  );
};

export default HighScores;
