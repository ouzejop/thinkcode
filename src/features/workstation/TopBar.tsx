import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Rank } from '../../api/types';
import type { SpriteName } from '../../sprites/matrices';
import { useLeaderboardStore } from '../../stores/leaderboardStore';
import { getLevelProgress, getPlayerLevel, useProfileStore } from '../../stores/profileStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Avatar, IconGear, IconTrophy, PixelSprite, ThinkCodeTitle } from '../../ui';

interface TopBarProps {
  onOpenSettings: () => void;
  onToggleLeaderboard?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, onToggleLeaderboard }) => {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const ladder = useSessionStore((s) => s.ladder.ladder);
  const getCourseLeaderboard = useLeaderboardStore((s) => s.getCourseLeaderboard);


  const level = getPlayerLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);

  // Compute potential rank from highest rung used:
  // 0: S, 1: A, 2: B, 3-4: C, 5: D
  const getPotentialRank = (highest: number): Rank => {
    if (highest === 0) return 'S';
    if (highest === 1) return 'A';
    if (highest === 2) return 'B';
    if (highest <= 4) return 'C';
    return 'D';
  };

  const potentialRank = getPotentialRank(ladder.highest);

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

  const courseRank = React.useMemo(() => {
    try {
      const list = getCourseLeaderboard({ playerId: profile.playerId });
      const entry = list.find((e) => e.isYou || e.playerId === profile.playerId);
      return entry ? `#${entry.rank}` : '#13';
    } catch {
      // Fallback calculation from XP against CPUs
      if (profile.xp >= 2450) return '#1';
      if (profile.xp >= 2180) return '#2';
      if (profile.xp >= 1940) return '#3';
      if (profile.xp >= 1720) return '#4';
      if (profile.xp >= 1530) return '#5';
      if (profile.xp >= 1390) return '#6';
      if (profile.xp >= 1240) return '#7';
      if (profile.xp >= 1110) return '#8';
      if (profile.xp >= 980) return '#9';
      if (profile.xp >= 850) return '#10';
      if (profile.xp >= 720) return '#11';
      if (profile.xp >= 560) return '#12';
      return '#13';
    }
  }, [profile.xp, profile.playerId, getCourseLeaderboard]);


  return (
    <header className="zone-touch border-b border-soft bg-surface px-4 py-2 flex-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Logo and Back */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/shelf')}
            className="flex items-center hover:opacity-80 transition-opacity w-[110px] flex-none text-left"
            title="Return to Cartridge Shelf"
          >
            <ThinkCodeTitle size="sm" as="span" />
          </button>
        </div>

        {/* Player Stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          {/* Avatar and Initials */}
          <div className="flex items-center gap-1.5 rounded bg-sunken px-2 py-1 border border-soft">
            <Avatar seed={profile.avatar} size={20} />
            <span className="t-logo text-ink font-bold">{profile.initials}</span>
          </div>

          {/* Level and XP progress */}
          <div className="hidden sm:flex flex-col gap-0.5 w-24">
            <div className="flex justify-between text-[10px] font-bold">
              <span>LV {level}</span>
              <span className="text-soft">{profile.xp} XP</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-sunken overflow-hidden border border-soft">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>

          {/* Leaderboard Rank Pill */}
          <button
            type="button"
            onClick={() => {
              if (onToggleLeaderboard) {
                onToggleLeaderboard();
              } else {
                navigate('/scores');
              }
            }}
            className="flex items-center gap-1 rounded bg-sunken px-2 py-1 font-mono font-bold border border-soft hover:bg-surface hover:border-primary/50 transition-colors shadow-sm cursor-pointer"
            title="View Exercise & Course Leaderboards"
          >
            <IconTrophy size={14} className="text-primary" />
            <span className="text-primary font-bold">{courseRank}</span>
          </button>


          {/* BONUS Pill (Yellow) */}
          <div
            className="flex items-center gap-1.5 rounded bg-xp px-2.5 py-1 text-on-xp font-bold shadow-sm"
            title="Bonus XP awarded if solved right now"
          >
            <span className="text-[10px] uppercase tracking-wide">Bonus</span>
            <span className="t-num font-mono">{ladder.bonus}</span>
          </div>

          {/* Potential Rank Badge */}
          <div
            className="flex items-center gap-1 rounded bg-surface px-2 py-0.5 border border-line shadow-sm"
            title={`Current potential completion rank: ${potentialRank}`}
          >
            <PixelSprite name={getRankSprite(potentialRank)} size={18} />
            <span className="t-rank font-bold text-ink">{potentialRank}</span>
          </div>

          {/* Settings button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded p-1.5 hover:bg-sunken text-soft hover:text-ink transition-colors flex items-center justify-center"
            title="Settings (F6)"
            aria-label="Settings"
          >
            <IconGear size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
