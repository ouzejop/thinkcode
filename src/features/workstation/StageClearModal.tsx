import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Completion, Rank } from '../../api/types';
import { sfx } from '../../lib/sfx';
import type { SpriteName } from '../../sprites/matrices';
import { Button, IconWarning, Modal, PixelSprite } from '../../ui';

interface StageClearModalProps {
  open: boolean;
  completion: Completion;
  exerciseTitle: string;
  onClose: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  open,
  completion,
  exerciseTitle,
  onClose,
}) => {
  const navigate = useNavigate();
  const [displayedXp, setDisplayedXp] = useState(0);

  // Play clear fanfare and animate XP count-up
  useEffect(() => {
    if (!open) {
      setDisplayedXp(0);
      return;
    }

    sfx.play('clear');
    const targetXp = completion.xp;
    const duration = 800; // ms
    const steps = 20;
    const increment = targetXp / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetXp) {
        setDisplayedXp(targetXp);
        clearInterval(timer);
      } else {
        setDisplayedXp(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [open, completion.xp]);

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

  const handleNextCartridge = () => {
    sfx.play('click');
    onClose();
    if (completion.rematchRequired && completion.unlockedExercises[1]) {
      navigate(`/play/${completion.unlockedExercises[1]}`);
    } else if (completion.unlockedExercises[0]) {
      navigate(`/play/${completion.unlockedExercises[0]}`);
    } else {
      navigate('/shelf');
    }
  };

  const handleBackToShelf = () => {
    sfx.play('click');
    onClose();
    navigate('/shelf');
  };

  const beforeRank = completion.leaderboard.rankBefore;
  const afterRank = completion.leaderboard.rankAfter;
  const rankImproved = afterRank < beforeRank;

  return (
    <Modal open={open} title="STAGE CLEAR!" onClose={handleBackToShelf}>
      <div className="zone-arcade grid gap-5 p-2 text-center">
        {/* Title and Exercise */}
        <div>
          <span className="t-label text-xs uppercase text-soft block">
            Cartridge Solved
          </span>
          <h3 className="text-xl font-bold text-ink">{exerciseTitle}</h3>
        </div>

        {/* Stamped Rank Badge */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative transform hover:scale-105 transition-transform duration-200">
            <PixelSprite name={getRankSprite(completion.rank)} size={64} />
          </div>
          <div className="t-rank text-2xl font-bold text-ink">
            RANK {completion.rank}
          </div>
          <p className="text-xs text-soft">
            {completion.rank === 'S'
              ? 'Flawless execution! Solved with 100% autonomy.'
              : completion.rank === 'A'
              ? 'Great autonomy! Solved with only a Think nudge.'
              : completion.rank === 'B'
              ? 'Solid work! Solved using a conceptual hint.'
              : completion.rank === 'C'
              ? 'Good persistence! Solved with explanation and example.'
              : 'Completed with full Reveal.'}
          </p>
        </div>

        {/* Stats Grid: XP Count-Up + Leaderboard Position Diff */}
        <div className="grid grid-cols-2 gap-3 bg-sunken p-3 rounded-[var(--radius)] border border-soft text-left">
          {/* XP Gained */}
          <div className="flex flex-col">
            <span className="text-[11px] text-soft uppercase font-bold">XP Awarded</span>
            <span className="t-num text-xl font-bold text-primary font-mono">
              +{displayedXp} XP
            </span>
          </div>

          {/* Leaderboard diff animation */}
          <div className="flex flex-col">
            <span className="text-[11px] text-soft uppercase font-bold">Leaderboard</span>
            <span className="t-num text-xl font-bold text-ink font-mono">
              {rankImproved ? (
                <span className="text-pass">
                  #{beforeRank} → #{afterRank} ↑
                </span>
              ) : (
                <span>#{beforeRank}</span>
              )}
            </span>
          </div>
        </div>

        {/* Mandatory Rematch Notice if Reveal was used */}
        {completion.rematchRequired && (
          <div className="rounded bg-fail/10 border border-fail p-3 text-left grid gap-1">
            <div className="flex items-center gap-1.5 font-bold text-fail text-xs uppercase">
              <IconWarning size={14} className="text-fail" />
              <span>Rematch Required by Socrates</span>
            </div>
            <p className="text-xs text-ink leading-relaxed">
              Because you used the Reveal rung, Socrates requires you to solve the variant challenge
              to cement your understanding!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-soft">
          <Button onClick={handleBackToShelf}>
            Back to Shelf
          </Button>

          <Button
            variant="primary"
            onClick={handleNextCartridge}
            className="shadow-[var(--shadow-hard)]"
          >
            {completion.rematchRequired ? 'Start Rematch Variant →' : 'Next Cartridge →'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
