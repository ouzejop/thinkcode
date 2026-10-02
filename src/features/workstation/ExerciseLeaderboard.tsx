import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi } from '../../api/client';
import type { Exercise, ExerciseLeaderboardEntry, Rank } from '../../api/types';
import { sfx } from '../../lib/sfx';
import { useProfileStore } from '../../stores/profileStore';
import { Avatar, IconTrophy, PixelSprite } from '../../ui';

interface ExerciseLeaderboardProps {
  exercise: Exercise;
  className?: string;
  onClose?: () => void;
}

export const ExerciseLeaderboard: React.FC<ExerciseLeaderboardProps> = ({
  exercise,
  className = '',
}) => {
  const navigate = useNavigate();
  const profile = useProfileStore();

  const [entries, setEntries] = useState<ExerciseLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'humans'>('all');

  const fetchExerciseScores = async () => {
    setLoading(true);
    try {
      const api = await getApi();
      const list = await api.getExerciseLeaderboard(exercise.id, profile.playerId);
      setEntries(list);
    } catch (err) {
      console.error('Failed to load exercise leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchExerciseScores();
  }, [exercise.id, profile.playerId, profile.xp]);

  const userAttempt = profile.completedExercises[exercise.id];
  const userEntry = entries.find((e) => e.isYou || e.playerId === profile.playerId);

  const displayedEntries = filterMode === 'humans' ? entries.filter((e) => !e.isDemo) : entries;

  const renderTrophy = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center text-xp animate-pulse" title="1st Place (Gold)">
          <IconTrophy size={16} />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center text-slate-300" title="2nd Place (Silver)">
          <IconTrophy size={15} />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center text-amber-600" title="3rd Place (Bronze)">
          <IconTrophy size={14} />
        </span>
      );
    }
    return <span className="font-mono text-[11px] text-soft">#{rank}</span>;
  };

  const getRankSprite = (rank: Rank) => {
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
      default:
        return 'rank-d';
    }
  };

  const formatRungAutonomy = (highestRung: number) => {
    switch (highestRung) {
      case 0:
        return <span className="text-pass font-bold">Pure (0 Rungs)</span>;
      case 1:
        return <span className="text-ink">Think (R1)</span>;
      case 2:
        return <span className="text-ink">Hint (R2)</span>;
      case 3:
        return <span className="text-soft">Explain (R3)</span>;
      case 4:
        return <span className="text-soft">Example (R4)</span>;
      case 5:
      default:
        return <span className="text-fail">Reveal (R5)</span>;
    }
  };

  return (
    <div className={`flex flex-col gap-3 h-full min-h-0 ${className}`}>
      {/* Sub-header info & Filter bar */}
      <div className="flex items-center justify-between gap-2 border-b border-soft pb-2">
        <div className="flex items-center gap-1.5">
          <span className="t-label text-xs uppercase text-soft font-bold flex items-center gap-1">
            <IconTrophy size={14} className="text-primary" />
            <span>Cartridge Standings</span>
          </span>
          <span className="rounded bg-sunken px-1.5 py-0.5 text-[10px] font-mono text-soft border border-soft">
            {entries.length} Climbers
          </span>
        </div>

        {/* Filter Toggle: All vs Humans */}
        <div className="flex rounded bg-sunken p-0.5 border border-soft text-[10px]">
          <button
            type="button"
            onClick={() => {
              sfx.play('click');
              setFilterMode('all');
            }}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              filterMode === 'all' ? 'bg-surface text-ink shadow-sm' : 'text-soft hover:text-ink'
            }`}
          >
            All (with CPU)
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.play('click');
              setFilterMode('humans');
            }}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              filterMode === 'humans' ? 'bg-surface text-ink shadow-sm' : 'text-soft hover:text-ink'
            }`}
          >
            Humans Only
          </button>
        </div>
      </div>

      {/* User's Cartridge Standing Banner */}
      <div
        className={`p-2.5 rounded-[var(--radius)] border text-xs transition-all ${
          userAttempt
            ? 'border-primary/50 bg-primary/10 shadow-[0_0_12px_rgba(245,166,35,0.12)]'
            : 'border-dashed border-soft bg-sunken/50'
        }`}
      >
        {userAttempt ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PixelSprite name={getRankSprite(userAttempt.rank)} size={24} />
              <div>
                <div className="font-bold text-ink flex items-center gap-1.5">
                  <span>Your Record: Rank {userAttempt.rank}</span>
                  <span className="text-[10px] text-pass font-mono">+{userAttempt.xp} XP</span>
                </div>
                <div className="text-[11px] text-soft">
                  {userAttempt.highestRung === 0
                    ? '100% Autonomy (No hints used)'
                    : `Solved with ${userAttempt.highestRung} rungs used`}
                  {userEntry && (
                    <span className="ml-1 font-bold text-primary font-mono">
                      (Standing #{userEntry.rank} of {entries.length})
                    </span>
                  )}
                </div>
              </div>
            </div>
            {userAttempt.rank !== 'S' && (
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/20 px-1.5 py-0.5 rounded">
                Can Rematch
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-soft">
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">🎯</span>
              <div>
                <p className="font-bold text-ink text-[11px]">You haven't solved this cartridge yet</p>
                <p className="text-[10px]">Pass all tests without hints to grab Rank S (#1 Gold)!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded border border-soft bg-surface">
        {loading ? (
          <div className="p-6 text-center text-xs text-soft flex flex-col items-center gap-2">
            <span className="animate-spin text-lg" aria-hidden="true">⏳</span>
            <span>Fetching cartridge high scores…</span>
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="p-6 text-center text-xs text-soft">
            <span>No entries match this filter.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-soft bg-sunken text-[10px] font-bold text-soft uppercase tracking-wider sticky top-0 z-10">
                <th scope="col" className="py-1.5 px-2 text-center w-10">#</th>
                <th scope="col" className="py-1.5 px-2">Climber</th>
                <th scope="col" className="py-1.5 px-2 text-center w-12">Grade</th>
                <th scope="col" className="py-1.5 px-2 text-left hidden sm:table-cell">Autonomy</th>
                <th scope="col" className="py-1.5 px-2 text-right w-16">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft">
              {displayedEntries.map((entry) => {
                const isYou = entry.isYou || entry.playerId === profile.playerId;
                return (
                  <tr
                    key={entry.playerId}
                    className={`transition-colors ${
                      isYou
                        ? 'bg-primary/15 font-bold shadow-sm'
                        : entry.rank <= 3
                        ? 'hover:bg-sunken/60'
                        : 'hover:bg-sunken/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center">
                        {renderTrophy(entry.rank)}
                      </div>
                    </td>

                    {/* Climber (Avatar + Name + Badges) */}
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar seed={entry.avatar || entry.initials} size={18} />
                        <span className="font-mono text-ink font-bold tracking-tight">
                          {entry.initials}
                        </span>
                        {entry.isDemo && (
                          <span
                            className="rounded bg-sunken border border-soft px-1 text-[9px] text-soft font-mono"
                            title="Simulated CPU Climber"
                          >
                            CPU
                          </span>
                        )}
                        {isYou && (
                          <span className="rounded bg-primary px-1 text-[9px] font-bold text-on-primary font-mono shadow-sm">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Grade Badge */}
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <PixelSprite name={getRankSprite(entry.exerciseRank)} size={16} />
                        <span className="font-mono font-bold text-ink">
                          {entry.exerciseRank}
                        </span>
                      </div>
                    </td>

                    {/* Autonomy / Rungs */}
                    <td className="py-1.5 px-2 text-left text-[11px] hidden sm:table-cell font-mono">
                      {formatRungAutonomy(entry.highestRung)}
                    </td>

                    {/* XP Gained */}
                    <td className="py-1.5 px-2 text-right">
                      <span className="font-mono font-bold text-primary">
                        +{entry.xpEarned}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Navigation Link */}
      <div className="flex items-center justify-between gap-2 border-t border-soft pt-2 text-xs">
        <button
          type="button"
          onClick={() => {
            sfx.play('click');
            void fetchExerciseScores();
          }}
          className="text-soft hover:text-ink flex items-center gap-1 text-[11px] font-bold"
          title="Refresh cartridge standings"
        >
          <span>↻ Refresh</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sfx.play('click');
            navigate('/scores');
          }}
          className="text-primary hover:underline font-bold flex items-center gap-1 text-[11px]"
          title="View overall language leaderboard"
        >
          <span>View JavaScript League →</span>
        </button>
      </div>
    </div>
  );
};
