import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../stores/profileStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { sfx } from '../../lib/sfx';
import { Button, IconCartridge, IconStar, IconThink, Modal, ThinkCodeTitle } from '../../ui';

export const TitleScreen: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  const [booting, setBooting] = useState<boolean>(() => {
    // Only show boot on first visit in the current session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('booted')) {
      return false;
    }
    return reducedMotion !== 'reduce';
  });
  const [bootProgress, setBootProgress] = useState(0);
  const [confirmNewGame, setConfirmNewGame] = useState(false);

  useEffect(() => {
    if (!booting) return;

    sfx.play('boot');
    const interval = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBooting(false);
          sessionStorage.setItem('booted', 'true');
          return 100;
        }
        return prev + 20;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [booting]);

  const skipBoot = () => {
    setBooting(false);
    sessionStorage.setItem('booted', 'true');
  };

  const handleStart = () => {
    sfx.play('click');
    if (profile.hasStarted) {
      navigate('/shelf');
    } else {
      navigate('/onboarding');
    }
  };

  const handleNewGame = () => {
    sfx.play('click');
    profile.resetAll();
    setConfirmNewGame(false);
    navigate('/onboarding');
  };

  // Boot sequence screen
  if (booting) {
    return (
      <main
        onClick={skipBoot}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && skipBoot()}
        tabIndex={0}
        role="region"
        aria-label="Booting ThinkCode"
        className="zone-arcade flex min-h-screen flex-col items-center justify-center p-6 text-center select-none cursor-pointer"
      >
        <div className="w-full max-w-sm rounded-[var(--radius)] border-2 border-line bg-surface p-6 shadow-[var(--shadow-hard)]">
          <div className="flex items-center justify-center mb-4">
            <ThinkCodeTitle size="lg" />
          </div>
          <p className="text-sm font-mono text-soft mb-4">
            BOOT ROM v2.4 ... MEM CHECK OK
          </p>
          <div
            role="progressbar"
            aria-valuenow={bootProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-3 w-full overflow-hidden rounded bg-sunken border border-soft p-0.5 mb-2"
          >
            <div
              className="h-full bg-primary transition-all duration-150"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
          <p className="text-xs text-soft mt-3">Click or press Space to skip</p>
        </div>
      </main>
    );
  }

  return (
    <main className="zone-arcade flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="w-full max-w-lg rounded-2xl border-2 border-line bg-surface/95 backdrop-blur-xl p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(91,79,201,0.25)] text-center relative overflow-hidden">
        {/* Subtle decorative cyber corners */}
        <div aria-hidden="true" className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary pointer-events-none" />

        {/* Arcade Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex justify-center mb-2">
            <ThinkCodeTitle size="hero" />
          </div>
          <p className="text-sm text-soft font-medium max-w-sm mx-auto leading-relaxed">
            The AI coach that refuses to give you the answer too easily.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-bold text-soft">
          <span className="flex items-center gap-1.5 rounded-full bg-sunken/80 backdrop-blur px-3 py-1 border border-soft hover:border-primary transition-all shadow-xs">
            <IconThink size={14} className="text-primary flex-none" />
            5-Rung Hint Ladder
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-sunken/80 backdrop-blur px-3 py-1 border border-soft hover:border-primary transition-all shadow-xs">
            <IconStar size={14} className="text-xp flex-none" />
            Autonomy Rewards
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-sunken/80 backdrop-blur px-3 py-1 border border-soft hover:border-primary transition-all shadow-xs">
            <IconCartridge size={14} className="text-primary flex-none" />
            Retro Cartridges
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {profile.hasStarted ? (
            <>
              <Button
                variant="primary"
                onClick={handleStart}
                className="w-full py-3.5 text-base font-bold shadow-lg hover:shadow-primary/40 transform hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex flex-col items-center justify-center"
              >
                <span>CONTINUE GAME</span>
                <span className="text-xs opacity-90 font-mono">
                  ({profile.initials} · {profile.courseId.toUpperCase()})
                </span>
              </Button>
              <Button
                onClick={() => setConfirmNewGame(true)}
                className="w-full text-sm py-2.5"
              >
                NEW GAME
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={handleStart}
              className="w-full py-3.5 text-base font-bold tracking-wider rounded-xl shadow-lg hover:shadow-primary/40 transform hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              <span className="inline-block transform group-hover:translate-x-1 transition-transform">▶</span>
              <span>PRESS START</span>
            </Button>
          )}

          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary hover:text-ink font-bold underline transition-colors"
            >
              Login
            </button>
            <span className="text-soft">·</span>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="text-soft hover:text-ink underline transition-colors"
            >
              Why ThinkCode?
            </button>
            <span className="text-soft">·</span>
            <button
              type="button"
              onClick={() => navigate('/scores')}
              className="text-soft hover:text-ink underline transition-colors"
            >
              High Scores
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for New Game */}
      <Modal
        open={confirmNewGame}
        title="Start a New Game?"
        onClose={() => setConfirmNewGame(false)}
      >
        <p className="text-sm text-soft mb-4">
          This will reset your current progress, earned XP ({profile.xp} XP), and unlocked cartridges. Are you sure you want to start fresh?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            data-autofocus
            variant="primary"
            onClick={() => setConfirmNewGame(false)}
          >
            No, Keep My Progress
          </Button>
          <Button onClick={handleNewGame} className="border-fail text-fail">
            Yes, Reset
          </Button>
        </div>
      </Modal>
    </main>
  );
};

export default TitleScreen;
