import React from 'react';
import { useNavigate } from 'react-router-dom';
import { sfx } from '../../lib/sfx';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import { Avatar, Button, IconCartridge, IconCheck, IconLock, IconUser } from '../../ui';

export const AuthChoice: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const auth = useAuthStore();

  const handleGuest = () => {
    sfx.play('clear');
    auth.continueAsGuest();
    profile.setAuthInfo('guest');
    navigate('/shelf');
  };

  const handleAuth = () => {
    sfx.play('click');
    navigate('/login');
  };

  return (
    <main className="zone-arcade min-h-screen py-10 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-line bg-surface/95 backdrop-blur-xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(91,79,201,0.25)] text-center relative overflow-hidden">
        {/* Subtle decorative cyber corners */}
        <div aria-hidden="true" className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <div className="relative inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-tr from-primary/15 via-xp/10 to-primary/25 border-2 border-primary/30 shadow-[0_0_20px_rgba(91,79,201,0.3)] animate-float">
            <IconCartridge size={36} className="text-primary" />
          </div>
          <div>
            <h1 className="t-logo text-2xl sm:text-3xl text-primary font-black mb-1">
              PROFILE CREATED SUCCESSFULLY!
            </h1>
            <p className="text-sm text-soft font-medium max-w-md mx-auto">
              Welcome recruit <span className="font-bold text-ink">{profile.initials}</span>.
              Choose how you want to save your progress.
            </p>
          </div>
        </div>

        {/* Mini Player Profile Recap Card */}
        <div className="flex items-center justify-between gap-4 p-3.5 mb-8 rounded-xl bg-sunken border border-soft text-left max-w-md mx-auto shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-surface border border-line shadow-xs">
              <Avatar seed={profile.avatar} size={36} />
            </div>
            <div>
              <span className="t-logo text-base text-ink font-bold block">{profile.initials}</span>
              <span className="text-[11px] text-soft font-mono uppercase">
                {profile.courseId} · {profile.selfLevel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary font-mono font-bold bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <IconCartridge size={14} />
            <span>0 XP</span>
          </div>
        </div>

        {/* Choice Grid: 2 Distinct Options on One Page */}
        <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
          {/* Option 1: Login / Sign Up */}
          <div
            onClick={handleAuth}
            className="group relative cursor-pointer rounded-xl border-2 border-primary/40 bg-surface hover:border-primary p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="absolute -top-3 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black text-on-primary tracking-wider uppercase shadow-xs">
              RECOMMENDED
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <IconLock size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-ink leading-tight">
                    Login / Sign Up
                  </h2>
                  <span className="text-[11px] text-soft">ThinkCode Account</span>
                </div>
              </div>

              <p className="text-xs text-soft leading-relaxed mb-4">
                Link your data to your account. Access your cartridges, XP and progress
                from any device.
              </p>

              <ul className="text-[11px] text-soft flex flex-col gap-1.5 mb-5 font-medium">
                <li className="flex items-center gap-2">
                  <IconCheck size={12} className="text-primary flex-none" />
                  <span>Account sync and cloud backup</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck size={12} className="text-primary flex-none" />
                  <span>History and trophy preservation</span>
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              onClick={handleAuth}
              className="w-full text-xs font-bold py-2.5 shadow-sm group-hover:shadow-primary/30"
            >
              Log in / Sign up →
            </Button>
          </div>

          {/* Option 2: Continue as Guest */}
          <div
            onClick={handleGuest}
            className="group relative cursor-pointer rounded-xl border-2 border-soft bg-surface-sunken hover:border-control p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="absolute -top-3 right-4 rounded-full bg-soft px-2.5 py-0.5 text-[10px] font-black text-on-primary tracking-wider uppercase shadow-xs">
              NO ACCOUNT
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-surface text-ink border border-soft group-hover:border-primary/50 transition-colors">
                  <IconUser size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-ink leading-tight">
                    Continue as Guest
                  </h2>
                  <span className="text-[11px] text-soft">Local browser</span>
                </div>
              </div>

              <p className="text-xs text-soft leading-relaxed mb-4">
                Access exercises directly without signing up. All your information stays
                saved in this browser.
              </p>

              <ul className="text-[11px] text-soft flex flex-col gap-1.5 mb-5 font-medium">
                <li className="flex items-center gap-2">
                  <IconCheck size={12} className="text-soft flex-none" />
                  <span>Instant access, no password needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck size={12} className="text-soft flex-none" />
                  <span>Local save (browser only)</span>
                </li>
              </ul>
            </div>

            <Button
              variant="secondary"
              onClick={handleGuest}
              className="w-full text-xs font-bold py-2.5"
            >
              Continue as guest →
            </Button>
          </div>
        </div>

        {/* Information note */}
        <p className="text-xs text-soft">
          💡 You can link an account or change your profile at any time from Settings.
        </p>
      </div>
    </main>
  );
};

export default AuthChoice;
