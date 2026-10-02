import React from 'react';
import type { LeaderboardEntry } from '../api/types';
import { Avatar } from './Avatar';
import { IconTrophy } from './Icons';
import { PixelSprite } from './PixelSprite';

interface DataTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  userEntry?: LeaderboardEntry | null;
  caption: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  entries,
  loading = false,
  error = null,
  onRetry,
  userEntry,
  caption,
}) => {
  if (loading) {
    return (
      <div className="grid gap-2 p-6" role="status" aria-label="Loading scores">
        <p className="text-center font-bold text-soft">Loading scores…</p>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded bg-sunken" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="font-bold text-fail">Can't reach the server</p>
        <p className="text-sm text-soft">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn btn-primary mt-2">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="font-bold text-soft">No scores yet. Be the first.</p>
      </div>
    );
  }

  // Check if current user is in the displayed list
  const isUserInList = userEntry ? entries.some((e) => e.playerId === userEntry.playerId) : false;

  const renderTrophy = (rank: number) => {
    if (rank === 1) return <IconTrophy size={18} className="text-xp" title="1st Place Gold Trophy" />;
    if (rank === 2) return <IconTrophy size={18} className="text-soft opacity-85" title="2nd Place Silver Trophy" />;
    if (rank === 3) return <IconTrophy size={18} className="text-amber-600" title="3rd Place Bronze Trophy" />;
    return null;
  };

  const renderRow = (entry: LeaderboardEntry, isSticky = false) => {
    const isYou = entry.isYou || (userEntry && entry.playerId === userEntry.playerId);

    return (
      <tr
        key={entry.playerId}
        className={`border-b border-soft transition-colors ${
          isYou ? 'bg-primary/10 font-bold' : isSticky ? 'bg-surface shadow-md' : 'hover:bg-sunken/40'
        }`}
      >
        <td className="py-2.5 px-3 text-center t-num">
          <div className="flex items-center justify-center gap-1.5">
            {renderTrophy(entry.rank)}
            <span>#{entry.rank}</span>
          </div>
        </td>

        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2">
            <Avatar seed={entry.avatar || entry.initials} size={24} />
            <span className="t-logo text-ink">{entry.initials}</span>
            {entry.isDemo && (
              <span className="rounded bg-sunken border border-soft px-1.5 py-0.5 text-[10px] font-bold text-soft" title="Simulated CPU Player">
                CPU
              </span>
            )}
            {isYou && (
              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-on-primary">
                YOU
              </span>
            )}
          </div>
        </td>

        <td className="py-2.5 px-3 text-center t-num">
          LV {entry.level}
        </td>

        <td className="py-2.5 px-3 text-right t-num">
          <span className="rounded bg-xp/20 px-1.5 py-0.5 text-on-xp font-bold">
            {entry.xp.toLocaleString()} XP
          </span>
        </td>

        <td className="py-2.5 px-3 text-center t-num">
          <div className="flex items-center justify-center gap-1">
            <PixelSprite name="rank-s" size={16} />
            <span>{entry.sRankCount}</span>
          </div>
        </td>

        <td className="py-2.5 px-3 text-right t-num">
          <span className={entry.independencePercent >= 75 ? 'text-pass font-bold' : 'text-ink'}>
            {entry.independencePercent}%
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-line bg-sunken text-xs font-bold text-soft uppercase tracking-wider">
            <th scope="col" className="py-2 px-3 text-center w-16">Rank</th>
            <th scope="col" className="py-2 px-3">Player</th>
            <th scope="col" className="py-2 px-3 text-center w-16">Level</th>
            <th scope="col" className="py-2 px-3 text-right">Total XP</th>
            <th scope="col" className="py-2 px-3 text-center w-20">S Ranks</th>
            <th scope="col" className="py-2 px-3 text-right w-28">Independence</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => renderRow(entry))}
        </tbody>
        {!isUserInList && userEntry && (
          <tfoot>
            <tr className="border-t-2 border-primary bg-primary/10">
              <td colSpan={6} className="p-0">
                <table className="w-full text-left border-collapse text-sm">
                  <tbody>{renderRow(userEntry, true)}</tbody>
                </table>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
