import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi } from '../../api/client';
import type { CourseInfo, Exercise, LeaderboardEntry, Rank } from '../../api/types';
import { sfx } from '../../lib/sfx';
import type { SpriteName } from '../../sprites/matrices';
import { getLevelProgress, getPlayerLevel, useProfileStore } from '../../stores/profileStore';
import { useAuthStore } from '../../stores/authStore';
import { Avatar, Button, IconBug, IconCartridge, IconStar, IconTrophy, Panel, PixelSprite, ThinkCodeTitle } from '../../ui';

export const CartridgeShelf: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const auth = useAuthStore();

  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [insertingId, setInsertingId] = useState<string | null>(null);

  const level = getPlayerLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = await getApi();
        const [cat, exList, lb] = await Promise.all([
          api.getCatalog(),
          api.getExercises(profile.courseId),
          api.getLeaderboard({
            tab: 'xp',
            period: 'all',
            track: 'all',
            playerId: profile.playerId,
          }),
        ]);
        if (mounted) {
          setCourses(cat);
          setExercises(exList);
          setLeaderboard(lb);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [profile.courseId, profile.playerId]);

  // Group exercises by concept
  const concepts = Array.from(new Set(exercises.map((e) => e.concept)));

  // Find first uncompleted exercise to mark as "Start here"
  const startHereId = exercises.find((e) => !profile.completedExercises[e.id])?.id;

  const handleSelectCartridge = (id: string) => {
    sfx.play('step');
    setInsertingId(id);
    setTimeout(() => {
      navigate(`/play/${id}`);
    }, 450);
  };

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
      default:
        return 'rank-d';
    }
  };

  // Find user's rank in leaderboard
  const userRankEntry = leaderboard.find((e) => e.isYou || e.playerId === profile.playerId);
  const userRank = userRankEntry ? `#${userRankEntry.rank}` : '#--';

  return (
    <div className="zone-arcade min-h-screen pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-soft bg-surface/95 backdrop-blur px-4 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Logo & Track Selector */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity w-[110px] flex-none"
              onClick={() => navigate('/')}
            >
              <ThinkCodeTitle size="sm" as="span" />
            </div>

            <div className="h-5 w-[1px] bg-soft hidden sm:block flex-none" />

            {/* Course Selector Dropdown */}
            <div className="hidden sm:flex items-center gap-1.5 bg-sunken rounded-[var(--radius)] px-2.5 py-1 border border-soft text-xs flex-none">
              <PixelSprite
                name={profile.courseId === 'javascript' ? 'logo-js' : 'logo-py'}
                size={16}
              />
              <select
                aria-label="Select course track"
                value={profile.courseId}
                onChange={(e) => {
                  const val = e.target.value as 'javascript' | 'python';
                  profile.updateProfile({ courseId: val });
                }}
                className="bg-transparent font-bold text-ink outline-none cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id} disabled={!c.available}>
                    {c.title} {!c.available ? '(Soon)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Bar: Level, XP, Rank */}
          <div className="flex items-center gap-3 text-xs">
            {/* Player Card */}
            <div className="flex items-center gap-2 rounded bg-sunken border border-soft px-2.5 py-1">
              <Avatar seed={profile.avatar} size={20} />
              <span className="t-logo text-ink font-bold">{profile.initials}</span>
            </div>

            {/* Auth / Guest Status Badge */}
            {auth.isAuthenticated && auth.currentUser ? (
              <div
                className="hidden lg:flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-2.5 py-1 text-[11px] font-mono text-primary font-bold"
                title={`Logged in as ${auth.currentUser.email}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-pass" />
                <span className="truncate max-w-[130px]">{auth.currentUser.email}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="hidden lg:flex items-center gap-1.5 rounded-full bg-sunken border border-soft hover:border-primary/50 px-2.5 py-1 text-[11px] font-mono text-soft hover:text-ink transition-colors"
                title="Guest mode (saved in this browser). Click to log in."
              >
                <span>🎮 Guest (Browser)</span>
                <span className="text-primary font-bold underline">Login</span>
              </button>
            )}

            {/* Level & XP Bar */}
            <div className="hidden md:flex flex-col gap-0.5 w-28">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="t-label">LV {level}</span>
                <span className="t-num text-soft">{profile.xp} XP</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-sunken overflow-hidden border border-soft">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>

            {/* Rank Position */}
            <div
              className="flex items-center gap-1 rounded bg-sunken border border-soft px-2 py-1 font-mono font-bold cursor-pointer hover:bg-surface"
              onClick={() => navigate('/scores')}
              title="View Leaderboard"
            >
              <IconTrophy size={14} className="text-primary" />
              <span className="text-primary">{userRank}</span>
            </div>

            {/* Navigation Shortcuts */}
            <Button onClick={() => navigate('/scores')} className="text-xs px-2.5 py-1">
              Scores
            </Button>
            <Button onClick={() => navigate('/report')} className="text-xs px-2.5 py-1">
              Save File
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content: Shelf Grid + Mini High Scores */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Cartridges Shelves */}
        <div className="grid gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink">Cartridge Shelf</h1>
              <p className="text-sm text-soft">
                Select an exercise cartridge to boot up in your Workstation.
              </p>
            </div>
            {profile.rematchQueue.length > 0 && (
              <div className="flex items-center gap-2 rounded bg-fail/10 border border-fail px-3 py-1.5 text-xs font-bold text-fail">
                <IconBug size={16} className="text-fail flex-none" />
                <span>{profile.rematchQueue.length} Rematch Required</span>
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-soft">Loading shelf…</p>
          ) : (
            concepts.map((concept) => {
              const conceptExercises = exercises.filter((e) => e.concept === concept);

              return (
                <div key={concept} className="grid gap-3">
                  <div className="flex items-center justify-between border-b-2 border-line pb-1.5">
                    <span className="t-label text-sm uppercase tracking-wider text-ink font-bold">
                      {concept} Shelf
                    </span>
                    <span className="text-xs text-soft font-mono">
                      {conceptExercises.filter((e) => profile.completedExercises[e.id]).length} /{' '}
                      {conceptExercises.length} Cleared
                    </span>
                  </div>

                  {/* Retro Cartridge Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {conceptExercises.map((ex) => {
                      const completed = profile.completedExercises[ex.id];
                      const isStartHere = ex.id === startHereId && !completed;
                      const isRematch = profile.rematchQueue.includes(ex.id);
                      const isInserting = insertingId === ex.id;

                      return (
                        <div
                          key={ex.id}
                          onClick={() => handleSelectCartridge(ex.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              handleSelectCartridge(ex.id);
                            }
                          }}
                          className={`group relative flex flex-col justify-between rounded-xl border-2 bg-surface p-3.5 transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-1.5 hover:shadow-xl ${
                            isInserting
                              ? 'scale-95 opacity-80 ring-4 ring-primary'
                              : 'hover:border-primary'
                          } ${
                            isRematch
                              ? 'border-fail bg-fail/5'
                              : isStartHere
                              ? 'border-primary ring-2 ring-primary/30'
                              : 'border-line'
                          }`}
                        >
                          {/* Cartridge Grip Notch (Top) */}
                          <div aria-hidden="true" className="h-2 rounded-t bg-sunken/80 border-b border-soft/60 flex items-center justify-center gap-1.5 -mt-1 -mx-1 mb-2.5">
                            <span className="w-3 h-0.5 rounded-full bg-soft/40" />
                            <span className="w-3 h-0.5 rounded-full bg-soft/40" />
                            <span className="w-3 h-0.5 rounded-full bg-soft/40" />
                          </div>

                          {/* Cartridge Artwork Foil Label */}
                          <div className="flex-1 rounded-lg bg-surface-sunken/50 border border-soft/60 p-3 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                                  {ex.kind === 'fix_bug'
                                    ? 'Fix Bug'
                                    : ex.kind === 'predict'
                                    ? 'Predict'
                                    : 'Complete'}
                                </span>

                                {completed ? (
                                  <div className="flex items-center gap-1 rounded bg-sunken border border-soft px-1.5 py-0.5 shadow-xs">
                                    <PixelSprite name={getRankSprite(completed.rank)} size={16} />
                                    <span className="text-xs font-bold text-ink">
                                      {completed.rank} Rank
                                    </span>
                                  </div>
                                ) : isRematch ? (
                                  <span className="rounded bg-fail px-2 py-0.5 text-[10px] font-bold text-white uppercase shadow-xs">
                                    Rematch!
                                  </span>
                                ) : isStartHere ? (
                                  <span className="rounded bg-xp px-2 py-0.5 text-[10px] font-bold text-on-xp uppercase shadow-xs animate-pulse">
                                    Start Here
                                  </span>
                                ) : (
                                  <span className="rounded bg-sunken px-2 py-0.5 border border-soft flex items-center gap-0.5" title={`Difficulté : ${ex.difficulty}/3`}>
                                    <IconStar size={10} filled={ex.difficulty >= 1} className={ex.difficulty >= 1 ? 'text-xp' : 'text-soft opacity-30'} />
                                    <IconStar size={10} filled={ex.difficulty >= 2} className={ex.difficulty >= 2 ? 'text-xp' : 'text-soft opacity-30'} />
                                    <IconStar size={10} filled={ex.difficulty >= 3} className={ex.difficulty >= 3 ? 'text-xp' : 'text-soft opacity-30'} />
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-ink text-base line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                {ex.title}
                              </h3>
                              <p className="text-xs text-soft line-clamp-2 leading-relaxed">
                                {ex.brief}
                              </p>
                            </div>

                            {/* Cartridge Info Bar */}
                            <div className="mt-3 flex items-center justify-between border-t border-soft/60 pt-2 text-xs font-mono text-soft">
                              <span className="flex items-center gap-1.5">
                                <IconCartridge size={14} className="text-soft flex-none" />
                                {ex.tests.length} tests
                              </span>
                              <span className="text-primary font-bold">
                                {completed ? `+${completed.xp} XP` : 'Up to 100 XP'}
                              </span>
                            </div>
                          </div>

                          {/* Gold Pin Connectors (Bottom) */}
                          <div aria-hidden="true" className="mt-2.5 h-1.5 rounded-b bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Mini High Scores Sidebar */}
        <aside className="grid gap-4">
          <Panel title="Mini High Scores" zone="arcade">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-soft font-bold">Top Players</span>
              <button
                type="button"
                onClick={() => navigate('/scores')}
                className="text-primary hover:underline font-bold"
              >
                View All →
              </button>
            </div>

            <div className="grid gap-2">
              {leaderboard.slice(0, 5).map((entry) => {
                const isYou = entry.isYou || entry.playerId === profile.playerId;
                return (
                  <div
                    key={entry.playerId}
                    className={`flex items-center justify-between p-2 rounded text-xs border ${
                      isYou
                        ? 'border-primary bg-primary/10 font-bold'
                        : 'border-soft bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-bold text-soft">
                        #{entry.rank}
                      </span>
                      <Avatar seed={entry.avatar} size={20} />
                      <span className="t-logo text-ink">{entry.initials}</span>
                      {entry.isDemo && (
                        <span className="rounded bg-sunken px-1 text-[9px] text-soft">
                          CPU
                        </span>
                      )}
                    </div>
                    <span className="t-num text-ink">{entry.xp} XP</span>
                  </div>
                );
              })}
            </div>

            {/* Pinned YOU row if outside top 5 */}
            {userRankEntry && userRankEntry.rank > 5 && (
              <div className="mt-3 border-t border-soft pt-2">
                <span className="t-label block mb-1 text-[10px]">Your Standing</span>
                <div className="flex items-center justify-between p-2 rounded text-xs border-2 border-primary bg-primary/10 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-primary">
                      #{userRankEntry.rank}
                    </span>
                    <Avatar seed={userRankEntry.avatar} size={20} />
                    <span className="t-logo text-ink">{userRankEntry.initials}</span>
                    <span className="rounded bg-primary px-1 text-[9px] text-on-primary">
                      YOU
                    </span>
                  </div>
                  <span className="t-num text-ink">{userRankEntry.xp} XP</span>
                </div>
              </div>
            )}
          </Panel>

          {/* Quick Coach Wisdom Box */}
          <div className="rounded-[var(--radius)] border border-soft bg-surface p-4 text-xs text-soft leading-relaxed shadow-sm">
            <div className="flex items-center gap-2 mb-2 font-bold text-ink">
              <span>Socrates' Rule</span>
            </div>
            <p>
              "The wise climber requests hints only when stuck, for true mastery is born from productive struggle."
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CartridgeShelf;
