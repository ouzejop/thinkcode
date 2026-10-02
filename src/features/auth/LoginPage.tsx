import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sfx } from '../../lib/sfx';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import {
  Avatar,
  Button,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconUser,
} from '../../ui';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthStore();
  const profile = useProfileStore();

  // Determine initial mode from query string or default to 'login'
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const res = auth.login(email, password);
      if (!res.success) {
        sfx.play('fail');
        setError(res.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }

      sfx.play('pass');
      setSuccessMsg('Login successful! Loading your session…');

      // If user had a saved profile in their account, restore it
      if (res.profile) {
        profile.loadSavedProfile(res.profile);
      }
      profile.setAuthInfo('authenticated', email.trim().toLowerCase());

      setTimeout(() => {
        navigate('/shelf');
      }, 500);
    } else {
      // Inscription (Sign up)
      if (password !== confirmPassword) {
        sfx.play('fail');
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      if (password.length < 4) {
        sfx.play('fail');
        setError('Password must be at least 4 characters.');
        setLoading(false);
        return;
      }

      // Snapshot current profile info to attach to new account
      const profileSnapshot = {
        initials: profile.initials,
        avatar: profile.avatar,
        courseId: profile.courseId,
        selfLevel: profile.selfLevel,
        coachLang: profile.coachLang,
        showOnLeaderboard: profile.showOnLeaderboard,
        xp: profile.xp,
        completedExercises: profile.completedExercises,
        rematchQueue: profile.rematchQueue,
      };

      const res = auth.register(email, password, profileSnapshot);
      if (!res.success) {
        sfx.play('fail');
        setError(res.error || 'Unable to register account.');
        setLoading(false);
        return;
      }

      sfx.play('clear');
      setSuccessMsg('Account created successfully! Your data is saved.');
      profile.setAuthInfo('authenticated', email.trim().toLowerCase());

      setTimeout(() => {
        navigate('/shelf');
      }, 500);
    }
  };

  const handleContinueAsGuest = () => {
    sfx.play('click');
    auth.continueAsGuest();
    profile.setAuthInfo('guest');
    navigate('/shelf');
  };

  return (
    <main className="zone-arcade min-h-screen py-10 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border-2 border-line bg-surface/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(91,79,201,0.25)] relative overflow-hidden">
        {/* Subtle decorative cyber corners */}
        <div aria-hidden="true" className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
          <div className="relative inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-tr from-primary/15 via-xp/10 to-primary/25 border-2 border-primary/30 shadow-[0_0_15px_rgba(91,79,201,0.3)]">
            <IconLock size={28} className="text-primary" />
          </div>
          <h1 className="t-logo text-2xl text-primary font-black">
            {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
          </h1>
          <p className="text-xs text-soft">
            {mode === 'login'
              ? 'Log in to sync your progress'
              : 'Create your account to save your data'}
          </p>
        </div>

        {/* Toggle Tabs: Connexion vs Inscription */}
        <div className="flex rounded-lg bg-sunken p-1 border border-soft mb-6">
          <button
            type="button"
            onClick={() => {
              sfx.play('click');
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              mode === 'login'
                ? 'bg-surface text-primary shadow-xs border border-line'
                : 'text-soft hover:text-ink'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.play('click');
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              mode === 'register'
                ? 'bg-surface text-primary shadow-xs border border-line'
                : 'text-soft hover:text-ink'
            }`}
          >
            Create account
          </button>
        </div>

        {/* Current Player Preview if configured */}
        {profile.hasStarted && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-sunken border border-soft text-xs mb-5">
            <div className="flex items-center gap-2">
              <Avatar seed={profile.avatar} size={24} />
              <span className="font-mono font-bold text-ink">{profile.initials}</span>
              <span className="text-soft font-mono">({profile.courseId.toUpperCase()})</span>
            </div>
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-mono font-bold">
              Active profile
            </span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 rounded-lg border border-fail/40 bg-fail/10 p-3 text-xs text-fail font-medium flex items-center gap-2">
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs text-primary font-bold flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email input */}
          <div>
            <label htmlFor="auth-email" className="t-label block mb-1 text-xs">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-soft pointer-events-none">
                <IconMail size={16} />
              </span>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@thinkcode.dev"
                className="w-full rounded-[var(--radius)] border border-control bg-surface py-2.5 pl-9 pr-3 text-xs font-mono text-ink placeholder:text-soft focus-visible:outline-primary transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="auth-password" className="t-label block mb-1 text-xs">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-soft pointer-events-none">
                <IconLock size={16} />
              </span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[var(--radius)] border border-control bg-surface py-2.5 pl-9 pr-9 text-xs font-mono text-ink placeholder:text-soft focus-visible:outline-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-soft hover:text-ink transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password input (only in register mode) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-confirm-password" className="t-label block mb-1 text-xs">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-soft pointer-events-none">
                  <IconLock size={16} />
                </span>
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-[var(--radius)] border bg-surface py-2.5 pl-9 pr-9 text-xs font-mono text-ink placeholder:text-soft focus-visible:outline-primary transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-fail'
                      : 'border-control'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-soft hover:text-ink transition-colors"
                  title={showConfirmPassword ? 'Hide' : 'Show'}
                >
                  {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-fail mt-1">Passwords do not match.</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-2.5 text-xs font-bold mt-2 shadow-sm"
          >
            {loading ? (
              <span className="animate-spin inline-block">⏳</span>
            ) : mode === 'login' ? (
              'Log in'
            ) : (
              'Create my account'
            )}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-soft" />
          </div>
          <span className="relative bg-surface px-2 text-[10px] uppercase font-bold text-soft">
            OR
          </span>
        </div>

        {/* Continue as Guest Button */}
        <button
          type="button"
          onClick={handleContinueAsGuest}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-soft bg-sunken hover:bg-surface text-soft hover:text-ink text-xs font-medium transition-all"
        >
          <IconUser size={14} />
          <span>Continue as guest (local browser save)</span>
        </button>

        {/* Back Link */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => navigate('/auth/choice')}
            className="text-xs text-soft hover:text-ink underline transition-colors"
          >
            ← Back to save choice
          </button>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
