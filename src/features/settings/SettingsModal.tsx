import React from 'react';
import { useNavigate } from 'react-router-dom';
import { sfx } from '../../lib/sfx';
import type { SpriteName } from '../../sprites/matrices';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import {
  useSettingsStore,
  type FontSize,
  type MotionPreference,
  type RetroLevel,
  type Theme,
} from '../../stores/settingsStore';
import { Avatar, Button, Modal } from '../../ui';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const AVATARS: SpriteName[] = [
  'avatar-hero',
  'avatar-wizard',
  'avatar-robot',
  'avatar-cat',
  'avatar-ghost',
  'avatar-knight',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const profile = useProfileStore();
  const auth = useAuthStore();

  const handleSoundToggle = (sound: boolean) => {
    settings.setSound(sound);
    if (sound) sfx.play('pass');
  };

  return (
    <Modal open={open} title="Settings & Profile" onClose={onClose}>
      <div className="zone-work grid gap-5 max-h-[75vh] overflow-y-auto pr-1 text-sm">
        {/* Visual Theme */}
        <div>
          <span className="t-label block mb-2">Color Theme</span>
          <div className="flex gap-2">
            {(['lavender', 'night'] as Theme[]).map((t) => (
              <Button
                key={t}
                aria-pressed={settings.theme === t}
                variant={settings.theme === t ? 'primary' : 'secondary'}
                onClick={() => {
                  sfx.play('click');
                  settings.setTheme(t);
                }}
                className="flex-1 capitalize text-xs"
              >
                {t} {t === 'lavender' ? '(Light)' : '(Dark)'}
              </Button>
            ))}
          </div>
        </div>

        {/* Retro Style Level */}
        <div>
          <span className="t-label block mb-2">Retro Style Atmosphere</span>
          <div className="grid grid-cols-3 gap-2">
            {(['clean', 'balanced', 'arcade'] as RetroLevel[]).map((lvl) => (
              <Button
                key={lvl}
                aria-pressed={settings.retroLevel === lvl}
                variant={settings.retroLevel === lvl ? 'primary' : 'secondary'}
                onClick={() => {
                  sfx.play('click');
                  settings.setRetroLevel(lvl);
                }}
                className="capitalize text-xs p-2"
              >
                {lvl}
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-soft mt-1.5">
            Clean = modern fonts only · Balanced = pixel logo & rank · Arcade = full retro styling.
          </p>
        </div>

        {/* Sound & Audio Synth */}
        <div className="flex items-center justify-between border-t border-soft pt-3">
          <div>
            <span className="font-bold text-ink">WebAudio Retro Synth</span>
            <p className="text-xs text-soft">Play sound effects for rungs and milestones.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => handleSoundToggle(e.target.checked)}
            className="h-4 w-4 rounded border-control text-primary focus:ring-primary"
          />
        </div>

        {/* Typewriter Effect */}
        <div className="flex items-center justify-between border-t border-soft pt-3">
          <div>
            <span className="font-bold text-ink">Typewriter Animation</span>
            <p className="text-xs text-soft">Stream coach messages letter by letter.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.typewriter}
            onChange={(e) => settings.setTypewriter(e.target.checked)}
            className="h-4 w-4 rounded border-control text-primary focus:ring-primary"
          />
        </div>

        {/* Font Size */}
        <div className="border-t border-soft pt-3">
          <span className="t-label block mb-2">Reading Font Size</span>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'xlarge'] as FontSize[]).map((f) => (
              <Button
                key={f}
                aria-pressed={settings.fontSize === f}
                variant={settings.fontSize === f ? 'primary' : 'secondary'}
                onClick={() => {
                  sfx.play('click');
                  settings.setFontSize(f);
                }}
                className="capitalize text-xs"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Motion Preference */}
        <div className="border-t border-soft pt-3">
          <span className="t-label block mb-2">Motion Preference</span>
          <div className="grid grid-cols-3 gap-2">
            {(['auto', 'reduce', 'no-preference'] as MotionPreference[]).map((m) => (
              <Button
                key={m}
                aria-pressed={settings.reducedMotion === m}
                variant={settings.reducedMotion === m ? 'primary' : 'secondary'}
                onClick={() => {
                  sfx.play('click');
                  settings.setReducedMotion(m);
                }}
                className="capitalize text-[11px]"
              >
                {m === 'auto' ? 'System' : m === 'reduce' ? 'Reduced' : 'Full'}
              </Button>
            ))}
          </div>
        </div>

        {/* Profile & Track Settings (Change without losing XP!) */}
        <div className="border-t border-soft pt-3 grid gap-3">
          <span className="t-label block font-bold text-primary">
            Profile & Track (XP Preserved)
          </span>

          {/* Initials & Avatar */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-initials" className="text-xs font-bold text-soft block mb-1">
                Initials
              </label>
              <input
                id="settings-initials"
                type="text"
                maxLength={3}
                value={profile.initials}
                onChange={(e) =>
                  profile.updateProfile({
                    initials: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3),
                  })
                }
                className="w-full rounded border border-control bg-surface p-2 font-mono text-sm font-bold uppercase"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-soft block mb-1">Avatar</span>
              <div className="flex gap-1">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      sfx.play('click');
                      profile.updateProfile({ avatar: av });
                    }}
                    className={`p-1 rounded border ${
                      profile.avatar === av
                        ? 'border-primary bg-primary/10'
                        : 'border-soft bg-surface'
                    }`}
                  >
                    <Avatar seed={av} size={24} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coach Language */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-soft">Coach Language</span>
            <div className="flex gap-1 text-xs">
              <Button
                variant={profile.coachLang === 'en' ? 'primary' : 'secondary'}
                onClick={() => profile.updateProfile({ coachLang: 'en' })}
                className="px-2.5 py-1 text-xs"
              >
                English
              </Button>
              <Button
                variant={profile.coachLang === 'fr' ? 'primary' : 'secondary'}
                onClick={() => profile.updateProfile({ coachLang: 'fr' })}
                className="px-2.5 py-1 text-xs"
              >
                Français
              </Button>
            </div>
          </div>

          {/* Show on Leaderboard */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-ink">Show on Leaderboard</span>
              <p className="text-[11px] text-soft">Only initials & avatar are shown publicly.</p>
            </div>
            <input
              type="checkbox"
              checked={profile.showOnLeaderboard}
              onChange={(e) => profile.updateProfile({ showOnLeaderboard: e.target.checked })}
              className="h-4 w-4 rounded border-control text-primary focus:ring-primary"
            />
          </div>
        </div>

        {/* Compte & Authentification Section */}
        <div className="rounded-[var(--radius)] border border-soft bg-surface-sunken p-3.5 flex flex-col gap-2">
          <span className="t-label block">Compte & Sauvegarde</span>
          {auth.isAuthenticated && auth.currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-ink block">
                  Logged in: {auth.currentUser.email}
                </span>
                <span className="text-[11px] text-soft">
                  Progress linked to account (cloud & local)
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  sfx.play('click');
                  auth.logout();
                  profile.setAuthInfo('guest');
                }}
                className="text-xs py-1 px-2.5 border-fail/40 text-fail hover:bg-fail/10"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-ink block">
                  🎮 Guest Mode (Local Browser)
                </span>
                <span className="text-[11px] text-soft">
                  Your scores are saved in this browser.
                </span>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  sfx.play('click');
                  onClose();
                  navigate('/login');
                }}
                className="text-xs py-1 px-3 whitespace-nowrap"
              >
                Create account / Login
              </Button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-soft">
          <Button data-autofocus variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
